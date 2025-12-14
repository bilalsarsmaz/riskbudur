import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "20");

    const username = params.id;

    const user = await prisma.user.findFirst({
      where: {
        nickname: {
          equals: username,
          mode: "insensitive"
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const likes = await prisma.like.findMany({
      where: {
        userId: user.id,
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                hasBlueTick: true,
                verificationTier: true,
                profileImage: true,
                fullName: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                quotes: true,
              },
            },
          },
        },
      },
    });

    const formattedPosts = await Promise.all(likes.map(async (like) => {
      const post = like.post;

      const quote = await prisma.quote.findFirst({
        where: {
          authorId: post.authorId,
          content: post.content,
          createdAt: {
            gte: new Date(post.createdAt.getTime() - 1000),
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
                  verificationTier: true,
                  fullName: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      });

      const basePost = {
        id: post.id.toString(),
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        mediaUrl: post.mediaUrl,
        imageUrl: post.imageUrl,
        linkPreview: post.linkPreview,
        isAnonymous: post.isAnonymous,
        isLiked: true,
        author: {
          id: post.author.id,
          nickname: post.author.nickname,
          hasBlueTick: post.author.hasBlueTick,
          verificationTier: post.author.verificationTier,
          profileImage: post.author.profileImage,
          fullName: post.author.fullName,
        },
        _count: {
          likes: post._count.likes,
          comments: post._count.comments,
          quotes: post._count.quotes || 0,
        }
      };

      if (quote && quote.quotedPost) {
        return {
          ...basePost,
          quotedPost: {
            id: quote.quotedPost.id.toString(),
            content: quote.quotedPost.content,
            createdAt: quote.quotedPost.createdAt,
            imageUrl: quote.quotedPost.imageUrl,
            mediaUrl: quote.quotedPost.mediaUrl,
            linkPreview: quote.quotedPost.linkPreview,
            isAnonymous: quote.quotedPost.isAnonymous,
            author: quote.quotedPost.author,
          }
        };
      }

      return basePost;
    }));

    return NextResponse.json({
      posts: formattedPosts,
    });
  } catch (error) {
    console.error("Kullanıcı beğenileri getirme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
