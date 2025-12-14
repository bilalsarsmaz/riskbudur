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



// Beğeni ekle
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

    // Kullanıcının daha önce beğenip beğenmediğini kontrol et
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: decoded.userId,
          postId: BigInt(postId),
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { message: "Bu postu zaten beğendiniz" },
        { status: 400 }
      );
    }

    // Beğeni oluştur
    const like = await prisma.like.create({
      data: {
        userId: decoded.userId,
        postId: BigInt(postId),
      },
    });

    // Bildirim oluştur (Eğer kendi postu değilse)
    if (post.authorId !== decoded.userId) {
      await prisma.notification.create({
        data: {
          type: "LIKE",
          recipientId: post.authorId,
          actorId: decoded.userId,
          postId: BigInt(postId),
        },
      });
    }

    // BigInt değerlerini string'e çevir
    const serializedLike = serializeBigInt(like);

    return NextResponse.json(serializedLike, { status: 201 });
  } catch (error) {
    console.error("Beğeni ekleme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Beğeniyi kaldır
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

    // Beğeniyi bul
    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: decoded.userId,
          postId: BigInt(postId),
        },
      },
    });

    if (!like) {
      return NextResponse.json(
        { message: "Beğeni bulunamadı" },
        { status: 404 }
      );
    }

    // Bildirimi kaldır (varsa)
    await prisma.notification.deleteMany({
      where: {
        type: "LIKE",
        actorId: decoded.userId,
        postId: BigInt(postId),
      },
    });

    // Beğeniyi kaldır
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: decoded.userId,
          postId: BigInt(postId),
        },
      },
    });

    return NextResponse.json(
      { message: "Beğeni başarıyla kaldırıldı" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Beğeni kaldırma hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
} 