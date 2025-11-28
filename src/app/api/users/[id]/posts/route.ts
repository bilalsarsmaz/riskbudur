import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { nickname: params.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Kullanici bulunamadi" },
        { status: 404 }
      );
    }

    // ONEMLI: Sadece root postlari getir (parentPostId = null)
    // Yanitlar ayri "Yanitlar" sekmesinde gosterilecek
    const posts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        isAnonymous: false,
        parentPostId: null, // Sadece root postlar
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
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
        _count: {
          select: {
            likes: true,
            comments: true,
            quotes: true,
            replies: true,
          },
        },
      },
    });

    // Her post icin alinti ve thread bilgisini cek
    const formattedPosts = await Promise.all(posts.map(async (post) => {
      // Bu post'un alinti yaptigi postu bul (Quote tablosundan)
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
                  fullName: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      });

      // Thread bilgisi: Herhangi bir yazarin yanitlari (thread olusturmak icin)
      const threadRepliesCount = await prisma.post.count({
        where: {
          threadRootId: post.id,
          // Herhangi bir yazarin yanitlari (thread olusturmak icin)
        },
      });
      const isThread = threadRepliesCount >= 4;

      const basePost = {
        id: post.id.toString(),
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        mediaUrl: post.mediaUrl,
        imageUrl: post.imageUrl,
        linkPreview: post.linkPreview,
        isAnonymous: post.isAnonymous,
        author: {
          id: post.author.id,
          nickname: post.author.nickname,
          hasBlueTick: post.author.hasBlueTick,
          profileImage: post.author.profileImage,
          fullName: post.author.fullName,
        },
        _count: {
          likes: post._count.likes,
          comments: post._count.comments + post._count.replies,
          quotes: post._count.quotes || 0,
        },
        isThread: isThread,
        threadRepliesCount: threadRepliesCount,
      };

      // Eger alinti varsa, alintilanan postu ekle
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

    const total = await prisma.post.count({
      where: {
        authorId: user.id,
        isAnonymous: false,
        parentPostId: null,
      },
    });

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Kullanici postlari getirme hatasi:", error);
    return NextResponse.json(
      { message: "Bir hata olustu" },
      { status: 500 }
    );
  }
}
