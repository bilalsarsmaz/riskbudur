import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyTokenAndUpdateActivity } from "@/lib/auth";
import { extractMentions } from "@/lib/textUtils";

// Yeni yanit (reply) ekle - artik Post olarak kaydediliyor
export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    const decoded = await verifyTokenAndUpdateActivity(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Gecersiz token" },
        { status: 401 }
      );
    }

    const { content, postId, isAnonymous, linkPreview, imageUrl, mediaUrl } = await req.json();

    // Parent post'un var olup olmadigini kontrol et
    const parentPost = await prisma.post.findUnique({
      where: { id: BigInt(postId) },
      select: {
        id: true,
        authorId: true,
        threadRootId: true,
        parentPostId: true,
        content: true,
        author: {
          select: {
            id: true,
            nickname: true,
          }
        }
      }
    });

    if (!parentPost) {
      return NextResponse.json(
        { message: "Post bulunamadi" },
        { status: 404 }
      );
    }

    // Thread root ID hesapla
    // Eger parent post'un threadRootId'si varsa onu kullan
    // Yoksa parent post'un parentPostId'si yoksa (root post ise) parent post'un ID'sini kullan
    // Yoksa parent post'un parentPostId'sini threadRoot olarak kullan
    let threadRootId: bigint;

    if (parentPost.threadRootId) {
      // Parent zaten bir thread'in parcasi
      threadRootId = parentPost.threadRootId;
    } else if (!parentPost.parentPostId) {
      // Parent bir root post, bu post thread'in root'u olacak
      threadRootId = parentPost.id;
    } else {
      // Parent baska bir posta yanit, onun parent'ini thread root olarak kullan
      threadRootId = parentPost.parentPostId;
    }

    // Yaniti Post olarak olustur (parentPostId ve threadRootId ile)
    const reply = await prisma.post.create({
      data: {
        content,
        isAnonymous: isAnonymous || false,
        authorId: decoded.userId,
        parentPostId: BigInt(postId),
        threadRootId: threadRootId,
        linkPreview: linkPreview || undefined,
        imageUrl: imageUrl || null,
        mediaUrl: mediaUrl || null,
        isCensored: (decoded.isBanned || false), // Banned users' replies are auto-censored
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            fullName: true,
            hasBlueTick: true,
            verificationTier: true,
            profileImage: true,
            isBanned: true,
          },
        },
        parentPost: {
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                verificationTier: true,
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          }
        }
      },
    });

    // Bildirim oluştur (Eğer kendi postuna yanıt vermiyorsa)
    if (parentPost.authorId !== decoded.userId) {
      await prisma.notification.create({
        data: {
          type: "REPLY",
          recipientId: parentPost.authorId,
          actorId: decoded.userId,
          postId: reply.id, // Bildirim yeni oluşturulan yanıta (reply) işaret etmeli
        },
      });
    }

    const formattedReply = {
      id: reply.id.toString(),
      content: reply.content,
      createdAt: reply.createdAt,
      isAnonymous: reply.isAnonymous,
      author: reply.author,
      parentPostId: reply.parentPostId?.toString(),
      threadRootId: reply.threadRootId?.toString(),
      parentPost: reply.parentPost ? {
        id: reply.parentPost.id.toString(),
        author: reply.parentPost.author
      } : null,
      _count: {
        likes: reply._count.likes,
        comments: reply._count.replies,
      },
      isLiked: false,
      imageUrl: reply.imageUrl,
      mediaUrl: reply.mediaUrl,
      linkPreview: reply.linkPreview,
    };

    // Thread root post'u bul ve mentions'lari al (Reply All mantigi)
    let threadParticipants: string[] = [];

    // 1. Parent post icindeki mentionlari al
    const parentMentions = extractMentions(parentPost.content);
    threadParticipants.push(...parentMentions);

    // 2. Eger parent post, root degilse, root post'u da kontrol et
    if (threadRootId && threadRootId !== parentPost.id) {
      const rootPost = await prisma.post.findUnique({
        where: { id: threadRootId },
        select: { content: true, author: { select: { nickname: true } } }
      });
      if (rootPost) {
        const rootMentions = extractMentions(rootPost.content);
        threadParticipants.push(...rootMentions);
        // Root post sahibini de ekle (eger parent post sahibi degilse)
        // Not: Root post sahibi genellikle thread sahibidir.
      }
    }

    // Explicit mention yapanlari ayri tutmustuk, onlari MENTION type ile notify ediyoruz.
    // Burada ise "Thread Participants" yani "Gizli Muhataplar"a REPLY bildirimi gonderecegiz.
    // Kullanici istegi: "Hepsine yanit veriyor olmasi gerekmez mi"

    // Unique participants
    const uniqueParticipants = [...new Set(threadParticipants)];

    if (uniqueParticipants.length > 0) {
      const participantUsers = await prisma.user.findMany({
        where: {
          nickname: { in: uniqueParticipants },
          id: {
            notIn: [decoded.userId, parentPost.authorId] // Kendisi ve Parent Author haric (Parent Author zaten yukarida aldi)
          }
        },
        select: { id: true }
      });

      if (participantUsers.length > 0) {
        // Bu kisilere REPLY bildirimi gonderiyoruz (Sanki onlara da yanit verilmis gibi)
        await prisma.notification.createMany({
          data: participantUsers.map(user => ({
            type: "REPLY", // MENTION yerine REPLY kullaniyoruz ki "Sana yanit verdi" desin
            recipientId: user.id,
            actorId: decoded.userId,
            postId: reply.id,
          }))
        });
      }
    }

    // Mention Bildirimleri (Explicit mentions in YOUR reply)
    // Eger bir kullanici HEM thread'de var HEM de senin mesajinda explicit etiketliyse?
    // Yukarida REPLY gitti. Asagida MENTION gidecek.
    // Iki bildirim gitmesini istemeyebiliriz. 
    // Ama "Sana yanit verdi" ve "Senden bahsetti" farkli seyler. 
    // Twitter'da reply yazarken @user eklerseniz, reply gider. 
    // Simdilik cakismayi onlemeyecegim, cunku kullanici "test ok" yazdi (mention yoktu).
    // Eger mention varsa, "Senden bahsetti" daha baskin olabilir ama "Reply" daha baglayici.
    // Kod karmasiklasmamasi icin birakiyorum, zaten uniqueParticipants current reply'daki mentionlari icermiyor (sadece parent/root'takileri aliyor).

    const mentionedNicknames = extractMentions(content.trim());
    if (mentionedNicknames.length > 0) {
      // valid kullanicilari bul (kendisi ve parent post sahibi haric - ona zaten REPLY gidiyor)
      // Ayrica yukarida REPLY notification gonderdiklerimizi de haric tutalim mi?
      // Kullanici birini thread'den alip explicit etiketlediyse, o kisiye MENTION gitmesi daha dogru sanki.
      // Ama yukarida REPLY attik.
      // Basitlik adina: Simdilik duplicate kontrolu yapmiyorum.

      const mentionedUsers = await prisma.user.findMany({
        where: {
          nickname: { in: mentionedNicknames },
          id: { notIn: [decoded.userId, parentPost.authorId] }
        },
        select: { id: true }
      });

      if (mentionedUsers.length > 0) {
        await prisma.notification.createMany({
          data: mentionedUsers.map(user => ({
            type: "MENTION",
            recipientId: user.id,
            actorId: decoded.userId,
            postId: reply.id,
          }))
        });
      }
    }

    return NextResponse.json(formattedReply, { status: 201 });
  } catch (error) {
    console.error("Yanit ekleme hatasi:", error);
    return NextResponse.json(
      { message: "Bir hata olustu" },
      { status: 500 }
    );
  }
}
