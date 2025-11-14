import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const post = await prisma.post.findUnique({
      where: { id: BigInt(id) },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            hasBlueTick: true,
            hasOrangeTick: true,
            profileImage: true,
            fullName: true,
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                hasBlueTick: true,
                profileImage: true,
                fullName: true,
              },
            },
          },
        },
        likes: {
          select: {
            userId: true,
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

    if (!post) {
      return NextResponse.json(
        { message: "Post bulunamadı" },
        { status: 404 }
      );
    }

    // BigInt alanlarını string'e çevir
    const formattedComments = post.comments.map((comment) => ({
      ...comment,
      id: comment.id.toString(),
      postId: comment.postId.toString(),
    }));

    return NextResponse.json({
      ...post,
      id: post.id.toString(),
      comments: formattedComments,
    });
  } catch (error) {
    console.error("Post getirme hatası:", error);
    return NextResponse.json(
      { message: "Post getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
