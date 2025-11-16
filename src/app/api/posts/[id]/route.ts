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

    // Bu post'un alıntı yaptığı postu bul (Quote tablosundan)
    const quote = await prisma.quote.findFirst({
      where: {
        authorId: post.authorId,
        content: post.content,
        createdAt: {
          gte: new Date(post.createdAt.getTime() - 1000), // 1 saniye tolerans
          lte: new Date(post.createdAt.getTime() + 1000),
        },
      },
      include: {
        quotedPost: {
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                hasBlueTick: true,
                fullName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    // BigInt alanlarını string'e çevir
    const formattedComments = post.comments.map((comment) => ({
      ...comment,
      id: comment.id.toString(),
      postId: comment.postId.toString(),
    }));

    const formattedPost = {
      ...post,
      id: post.id.toString(),
      comments: formattedComments,
      quotedPost: quote && quote.quotedPost ? {
        id: quote.quotedPost.id.toString(),
        content: quote.quotedPost.content,
        createdAt: quote.quotedPost.createdAt,
        imageUrl: quote.quotedPost.imageUrl,
        mediaUrl: quote.quotedPost.mediaUrl,
        isAnonymous: quote.quotedPost.isAnonymous,
        author: quote.quotedPost.author,
      } : null,
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error("Post getirme hatası:", error);
    return NextResponse.json(
      { message: "Post getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
