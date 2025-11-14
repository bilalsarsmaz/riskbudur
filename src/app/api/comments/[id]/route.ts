import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";

const prisma = new PrismaClient();

// Yorumu güncelle
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const { content, isAnonymous } = await req.json();

    // Yorumu bul
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
    });

    if (!comment) {
      return NextResponse.json(
        { message: "Yorum bulunamadı" },
        { status: 404 }
      );
    }

    // Yetki kontrolü
    if (comment.authorId !== decoded.userId && decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    // Yorumu güncelle
    const updatedComment = await prisma.comment.update({
      where: { id: params.id },
      data: {
        content,
        isAnonymous,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            hasBlueTick: true,
          },
        },
      },
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("Yorum güncelleme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Yorumu sil
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    // Yorumu bul
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
    });

    if (!comment) {
      return NextResponse.json(
        { message: "Yorum bulunamadı" },
        { status: 404 }
      );
    }

    // Yetki kontrolü (yorum sahibi veya admin ise)
    if (comment.authorId !== decoded.userId && decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    // Yorumu sil
    await prisma.comment.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Yorum başarıyla silindi" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Yorum silme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
} 