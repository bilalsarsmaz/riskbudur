import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// Hashtag extraction fonksiyonu
function extractHashtags(content: string): string[] {
  const hashtagRegex = /#[\p{L}\p{N}_]+/gu;
  const matches = content.match(hashtagRegex);
  if (!matches) return [];

  return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))];
}

// Alıntı post oluştur
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
        { message: "Geçersiz token" },
        { status: 401 }
      );
    }

    const { content, quotedPostId, isAnonymous, imageUrl } = await req.json();

    if (!quotedPostId) {
      return NextResponse.json(
        { message: "Alıntılanan post ID'si gerekli" },
        { status: 400 }
      );
    }

    // Alıntılanan postun var olup olmadığını kontrol et
    const quotedPost = await prisma.post.findUnique({
      where: { id: BigInt(quotedPostId) },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            hasBlueTick: true,
            verificationTier: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    });

    if (!quotedPost) {
      return NextResponse.json(
        { message: "Alıntılanan post bulunamadı" },
        { status: 404 }
      );
    }

    const hashtagNames = extractHashtags(content);

    // Önce normal post oluştur
    const newPost = await prisma.post.create({
      data: {
        content,
        authorId: decoded.userId,
        isAnonymous: isAnonymous || false,
        imageUrl: imageUrl || null,
        hashtags: {
          connectOrCreate: hashtagNames.map(name => ({
            where: { name },
            create: { name }
          }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            hasBlueTick: true,
            verificationTier: true,
            fullName: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Sonra Quote kaydı oluştur
    const quote = await prisma.quote.create({
      data: {
        content,
        authorId: decoded.userId,
        quotedPostId: BigInt(quotedPostId),
        isAnonymous: isAnonymous || false,
      },
      include: {
        quotedPost: {
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                hasBlueTick: true,
                verificationTier: true,
                fullName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    // Kendisi değilse bildirim oluştur
    if (quotedPost.author.id !== decoded.userId) {
      await prisma.notification.create({
        data: {
          type: 'QUOTE',
          actorId: decoded.userId,
          recipientId: quotedPost.author.id,
          postId: newPost.id, // Notification points to the NEW quote post
        },
      });
    }

    // BigInt alanlarını string'e çevir
    const formattedPost = {
      id: newPost.id.toString(),
      content: newPost.content,
      createdAt: newPost.createdAt,
      imageUrl: newPost.imageUrl,
      isAnonymous: newPost.isAnonymous,
      author: {
        id: newPost.author.id,
        nickname: newPost.author.nickname,
        hasBlueTick: newPost.author.hasBlueTick,
        verificationTier: newPost.author.verificationTier,
        fullName: newPost.author.fullName,
        profileImage: newPost.author.profileImage
      },
      quotedPostId: quotedPost.id.toString(), // Added explicit ID field
      quotedPost: {
        id: quotedPost.id.toString(),
        content: quotedPost.content,
        createdAt: quotedPost.createdAt,
        imageUrl: quotedPost.imageUrl,
        mediaUrl: quotedPost.mediaUrl,
        author: quotedPost.author,
      },
      _count: {
        likes: newPost._count.likes,
        comments: newPost._count.comments
      }
    };

    return NextResponse.json(formattedPost, { status: 201 });
  } catch (error) {
    console.error("Alıntı post oluşturma hatası:", error);
    return NextResponse.json(
      { message: "Alıntı post oluşturulurken bir hata oluştu", error: String(error) },
      { status: 500 }
    );
  }
}
