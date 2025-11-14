import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";

const prisma = new PrismaClient();

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
          postId,
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
        postId,
      },
    });

    return NextResponse.json(like, { status: 201 });
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
          postId,
        },
      },
    });

    if (!like) {
      return NextResponse.json(
        { message: "Beğeni bulunamadı" },
        { status: 404 }
      );
    }

    // Beğeniyi kaldır
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: decoded.userId,
          postId,
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