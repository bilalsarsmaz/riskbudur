import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// BigInt serialization için yardımcı fonksiyon
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        serialized[key] = serializeBigInt(obj[key]);
      }
    }
    return serialized;
  }
  return obj;
}



// Bookmark ekle
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

    const { postId } = await req.json();

    // Post'un var olup olmadığını kontrol et
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post bulunamadı" },
        { status: 404 }
      );
    }

    // Kullanıcının daha önce bookmarkp beğenmediğini kontrol et
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: decoded.userId,
          postId: BigInt(postId),
        },
      },
    });

    if (existingBookmark) {
      return NextResponse.json(
        { message: "Bu postu zaten bookmark ettiniz" },
        { status: 400 }
      );
    }

    // Bookmark oluştur
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: decoded.userId,
        postId: BigInt(postId),
      },
    });

    // BigInt değerlerini string'e çevir
    const serializedBookmark = serializeBigInt(bookmark);

    return NextResponse.json(serializedBookmark, { status: 201 });
  } catch (error) {
    console.error("Bookmark ekleme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Bookmarkyi kaldır
export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { message: "Post ID gerekli" },
        { status: 400 }
      );
    }

    // Bookmarkyi bul
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: decoded.userId,
          postId: BigInt(postId),
        },
      },
    });

    if (!bookmark) {
      return NextResponse.json(
        { message: "Bookmark bulunamadı" },
        { status: 404 }
      );
    }

    // Bookmarkyi kaldır
    await prisma.bookmark.delete({
      where: {
        userId_postId: {
          userId: decoded.userId,
          postId: BigInt(postId),
        },
      },
    });

    return NextResponse.json(
      { message: "Bookmark başarıyla kaldırıldı" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bookmark kaldırma hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
// Kullanıcının bookmarklarını getir
export async function GET(req: Request) {
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

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
      include: {
        post: {
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
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
            likes: {
              where: { userId: decoded.userId },
              select: { userId: true },
            },
            bookmarks: {
              where: { userId: decoded.userId },
              select: { userId: true },
            },
          },
        },
      },
    });

    // Post formatını düzenle
    const posts = bookmarks.map((bookmark) => {
      const post = bookmark.post;
      return serializeBigInt({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        mediaUrl: post.mediaUrl,
        imageUrl: post.imageUrl,
        linkPreview: post.linkPreview,
        isAnonymous: post.isAnonymous,
        author: post.author,
        _count: post._count,
        isLiked: post.likes.length > 0,
        isBookmarked: true,
      });
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Bookmark listesi hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
