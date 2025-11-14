import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";

const prisma = new PrismaClient();

// Yeni yorum ekle
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

    const { content, postId, isAnonymous } = await req.json();

    // Post'un var olup olmadığını kontrol et
    const post = await prisma.post.findUnique({
      where: { id: BigInt(postId) },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post bulunamadı" },
        { status: 404 }
      );
    }

    // Yorumu oluştur
    const comment = await prisma.comment.create({
      data: {
        content,
        isAnonymous: isAnonymous || false,
        authorId: decoded.userId,
        postId: BigInt(postId),
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

    const formattedComment = {
      ...comment,
      postId: comment.postId.toString()
    };
    return NextResponse.json(formattedComment, { status: 201 });
  } catch (error) {
    console.error("Yorum ekleme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
