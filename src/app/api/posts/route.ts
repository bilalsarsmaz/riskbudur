import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    let userId: string | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        userId = decoded.userId;
      } catch (error) {
        // Token geçersiz, devam et
      }
    }

    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "20");

    const posts = await prisma.post.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            fullName: true,
            profileImage: true,
            hasBlueTick: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        quotes: {
          include: {
            quotedPost: {
              include: {
                author: {
                  select: {
                    id: true,
                    nickname: true,
                    fullName: true,
                    profileImage: true,
                    hasBlueTick: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Kullanıcının beğendiği postları ayrı sorgu ile al
    let likedPostIds: string[] = [];
    if (userId) {
      try {
        const userLikes = await prisma.like.findMany({
          where: {
            userId: userId,
            postId: {
              in: posts.map(p => p.id.toString()),
            },
          },
          select: {
            postId: true,
          },
        });
        likedPostIds = userLikes.map(like => like.postId.toString());
      } catch (likeError) {
        console.error("Likes fetch error:", likeError);
        // Likes hatası olsa bile devam et
      }
    }

    const formattedPosts = posts.map((post) => {
      // quotes array'inden ilk quote'u al (eğer varsa)
      const quote = post.quotes && post.quotes.length > 0 ? post.quotes[0] : null;
      const basePost = {
        id: post.id.toString(),
        content: post.content,
        createdAt: post.createdAt,
        imageUrl: post.imageUrl,
        mediaUrl: post.mediaUrl,
        isAnonymous: post.isAnonymous,
        author: post.author,
        isLiked: userId ? likedPostIds.includes(post.id.toString()) : false,
        _count: post._count,
        isPopular: (post._count?.likes || 0) > 30 || (post._count?.comments || 0) > 10,
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
            isAnonymous: quote.quotedPost.isAnonymous,
            author: quote.quotedPost.author,
          },
        };
      }

      return basePost;
    });

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Posts fetch error:", error);
    return NextResponse.json({ error: "Posts yüklenirken hata oluştu" }, { status: 500 });
  }
}
