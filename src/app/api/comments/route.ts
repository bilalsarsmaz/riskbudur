import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

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

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Gecersiz token" },
        { status: 401 }
      );
    }

    const { content, postId, isAnonymous, linkPreview } = await req.json();

    // Parent post'un var olup olmadigini kontrol et
    const parentPost = await prisma.post.findUnique({
      where: { id: BigInt(postId) },
      select: {
        id: true,
        authorId: true,
        threadRootId: true,
        parentPostId: true,
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
    };

    return NextResponse.json(formattedReply, { status: 201 });
  } catch (error) {
    console.error("Yanit ekleme hatasi:", error);
    return NextResponse.json(
      { message: "Bir hata olustu" },
      { status: 500 }
    );
  }
}
