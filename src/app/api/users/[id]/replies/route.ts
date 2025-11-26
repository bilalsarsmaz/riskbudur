import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// BigInt serialization
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
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

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const username = context.params.id;

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { nickname: username },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Kullanıcının yorumlarını getir
    const comments = await prisma.comment.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            fullName: true,
            hasBlueTick: true,
            hasOrangeTick: true,
            profileImage: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                nickname: true,
                fullName: true,
                hasBlueTick: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    const formattedReplies = comments.map((comment) => ({
      id: comment.id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      author: comment.author,
      parentPost: {
        id: comment.post.id.toString(),
        content: comment.post.content,
        createdAt: comment.post.createdAt,
        author: comment.post.author,
      },
    }));

    return NextResponse.json({ replies: serializeBigInt(formattedReplies) });
  } catch (error) {
    console.error("Replies getirme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
