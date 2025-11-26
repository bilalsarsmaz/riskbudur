import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
// Hashtag'leri çıkar
function extractHashtags(content: string): string[] {
  const hashtagRegex = /#[\p{L}\p{N}_]+/gu;
  const matches = content.match(hashtagRegex);
  if (!matches) return [];
  return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))];
}


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
            quotes: true,
          },
        },

      },
    });

    // Kullanıcının beğendiği postları ayrı sorgu ile al
    let likedPostIds: string[] = [];
    let commentedPostIds: string[] = [];
    let quotedPostIds: string[] = [];
    let bookmarkedPostIds: string[] = [];
    
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
      
      try {
        const userComments = await prisma.comment.findMany({
          where: {
            authorId: userId,
            postId: {
              in: posts.map(p => p.id.toString()),
            },
          },
          select: {
            postId: true,
          },
        });
        commentedPostIds = userComments.map(comment => comment.postId.toString());
      } catch (commentError) {
        console.error("Comments fetch error:", commentError);
        // Comments hatası olsa bile devam et
      }
      
      try {
        const userQuotes = await prisma.quote.findMany({
          where: {
            authorId: userId,
            quotedPostId: {
              in: posts.map(p => p.id.toString()),
            },
          },
          select: {
            quotedPostId: true,
          },
        });
        quotedPostIds = userQuotes.map(quote => quote.quotedPostId.toString());
      } catch (quoteError) {
        console.error("Quotes fetch error:", quoteError);
        // Quotes hatası olsa bile devam et
      }
      
      try {
        const userBookmarks = await prisma.bookmark.findMany({
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
        bookmarkedPostIds = userBookmarks.map(bookmark => bookmark.postId.toString());
      } catch (bookmarkError) {
        console.error("Bookmarks fetch error:", bookmarkError);
        // Bookmarks hatası olsa bile devam et
      }
    }

    // Her post için alıntı bilgisini çek
    const formattedPosts = await Promise.all(posts.map(async (post) => {
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
                  fullName: true,
                  profileImage: true,
                  hasBlueTick: true,
                },
              },
            },
          },
        },
      });

      const basePost = {
        id: post.id.toString(),
        content: post.content,
        createdAt: post.createdAt,
        imageUrl: post.imageUrl,
        mediaUrl: post.mediaUrl,
        linkPreview: post.linkPreview,
        isAnonymous: post.isAnonymous,
        author: post.author,
        isLiked: userId ? likedPostIds.includes(post.id.toString()) : false,
        isCommented: userId ? commentedPostIds.includes(post.id.toString()) : false,
        isQuoted: userId ? quotedPostIds.includes(post.id.toString()) : false,
        isBookmarked: userId ? bookmarkedPostIds.includes(post.id.toString()) : false,
        _count: {
          ...post._count,
          quotes: post._count?.quotes || 0,
        },
        isPopular: (post._count?.likes || 0) > 30 || (post._count?.comments || 0) > 10,
      };

      // Eğer alıntı varsa, alıntılanan postu ekle
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
          },
        };
      }

      return basePost;
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Posts fetch error:", error);
    return NextResponse.json({ error: "Posts yüklenirken hata oluştu" }, { status: 500 });
  }
}

// Post oluştur
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { message: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    const body = await req.json();
    const { content, imageUrl, mediaUrl, isAnonymous, linkPreview } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { message: "Post içeriği boş olamaz" },
        { status: 400 }
      );
    }

    // Hashtag'leri çıkar
    const hashtagNames = extractHashtags(content);

    // Post oluştur
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: userId,
        imageUrl: imageUrl || null,
        mediaUrl: mediaUrl || null,
        isAnonymous: isAnonymous || false,
        linkPreview: linkPreview || null,
        hashtags: {
          connectOrCreate: hashtagNames.map(name => ({
            where: { name },
            create: { name },
          })),
        },
      },
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
            quotes: true,
          },
        },
      },
    });

    // BigInt serialization için
    const formattedPost = {
      id: post.id.toString(),
      content: post.content,
      createdAt: post.createdAt,
      imageUrl: post.imageUrl,
      mediaUrl: post.mediaUrl,
      linkPreview: post.linkPreview,
      isAnonymous: post.isAnonymous,
      author: post.author,
      isLiked: false,
      isCommented: false,
      isQuoted: false,
      isBookmarked: false,
      _count: {
        likes: post._count.likes,
        comments: post._count.comments,
        quotes: post._count.quotes || 0,
      },
      isPopular: false,
    };

    return NextResponse.json(formattedPost, { status: 201 });
  } catch (error) {
    console.error("Post oluşturma hatası:", error);
    return NextResponse.json(
      { message: "Post oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}
