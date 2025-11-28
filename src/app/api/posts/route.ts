import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

// Hashtag'leri cikar
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
        // Token gecersiz, devam et
      }
    }

    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "20");

    // ONEMLI: Sadece root post'lari getir (parentPostId = null)
    // Yanitlar timeline'da gosterilmez, sadece post detayinda gosterilir
    const posts = await prisma.post.findMany({
      where: {
        parentPostId: null, // Sadece root post'lar
      },
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
            replies: true, // Thread yanitlari
          },
        },
        // Thread'in ilk birkaç yanitini getir (preview icin)
        replies: {
          take: 1,
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
    });

    // Kullanicinin begendigi postlari ayri sorgu ile al
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
              in: posts.map(p => p.id),
            },
          },
          select: {
            postId: true,
          },
        });
        likedPostIds = userLikes.map(like => like.postId.toString());
      } catch (likeError) {
        console.error("Likes fetch error:", likeError);
      }
      
      try {
        const userComments = await prisma.comment.findMany({
          where: {
            authorId: userId,
            postId: {
              in: posts.map(p => p.id),
            },
          },
          select: {
            postId: true,
          },
        });
        commentedPostIds = userComments.map(comment => comment.postId.toString());
      } catch (commentError) {
        console.error("Comments fetch error:", commentError);
      }
      
      try {
        const userQuotes = await prisma.quote.findMany({
          where: {
            authorId: userId,
            quotedPostId: {
              in: posts.map(p => p.id),
            },
          },
          select: {
            quotedPostId: true,
          },
        });
        quotedPostIds = userQuotes.map(quote => quote.quotedPostId.toString());
      } catch (quoteError) {
        console.error("Quotes fetch error:", quoteError);
      }
      
      try {
        const userBookmarks = await prisma.bookmark.findMany({
          where: {
            userId: userId,
            postId: {
              in: posts.map(p => p.id),
            },
          },
          select: {
            postId: true,
          },
        });
        bookmarkedPostIds = userBookmarks.map(bookmark => bookmark.postId.toString());
      } catch (bookmarkError) {
        console.error("Bookmarks fetch error:", bookmarkError);
      }
    }

    // Her post icin alinti bilgisini cek
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
                  fullName: true,
                  profileImage: true,
                  hasBlueTick: true,
                },
              },
            },
          },
        },
      });

      // Thread bilgisi: Ayni yazarin kendi postuna verdigi yanitlar
      const threadRepliesCount = await prisma.post.count({
        where: {
          threadRootId: post.id,
          // Herhangi bir yazarin yanitlari (thread olusturmak icin)
        },
      });

      const isThread = threadRepliesCount >= 4;
      console.log(`Post ${post.id}: threadRepliesCount=${threadRepliesCount}, isThread=${isThread}`);

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
          likes: post._count.likes,
          comments: post._count.comments + post._count.replies, // Toplam yanit
          quotes: post._count?.quotes || 0,
        },
        isPopular: (post._count?.likes || 0) > 30 || (post._count?.comments || 0) > 10,
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
          },
        };
      }

      return basePost;
    }));

    return NextResponse.json(formattedPosts);
  } catch (error) {
    console.error("Posts fetch error:", error);
    return NextResponse.json({ error: "Posts yuklenirken hata olustu" }, { status: 500 });
  }
}

// Post olustur
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
    const { content, imageUrl, mediaUrl, isAnonymous, linkPreview, parentPostId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { message: "Post icerigi bos olamaz" },
        { status: 400 }
      );
    }

    // Hashtag'leri cikar
    const hashtagNames = extractHashtags(content);

    // Thread root ID hesapla
    let threadRootId: bigint | null = null;
    let actualParentPostId: bigint | null = null;

    if (parentPostId) {
      actualParentPostId = BigInt(parentPostId);
      
      // Parent post'u bul
      const parentPost = await prisma.post.findUnique({
        where: { id: actualParentPostId },
        select: { threadRootId: true, authorId: true },
      });

      if (parentPost) {
        // Eger parent post'un threadRootId'si varsa onu kullan, yoksa parent post'un kendi ID'sini kullan
        threadRootId = parentPost.threadRootId || actualParentPostId;
      }
    }

    // Post olustur
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: userId,
        imageUrl: imageUrl || null,
        mediaUrl: mediaUrl || null,
        isAnonymous: isAnonymous || false,
        linkPreview: linkPreview || null,
        parentPostId: actualParentPostId,
        threadRootId: threadRootId,
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
            replies: true,
          },
        },
      },
    });

    // BigInt serialization icin
    const formattedPost = {
      id: post.id.toString(),
      content: post.content,
      createdAt: post.createdAt,
      imageUrl: post.imageUrl,
      mediaUrl: post.mediaUrl,
      linkPreview: post.linkPreview,
      isAnonymous: post.isAnonymous,
      parentPostId: post.parentPostId?.toString() || null,
      threadRootId: post.threadRootId?.toString() || null,
      author: post.author,
      isLiked: false,
      isCommented: false,
      isQuoted: false,
      isBookmarked: false,
      _count: {
        likes: post._count.likes,
        comments: post._count.comments + post._count.replies,
        quotes: post._count.quotes || 0,
      },
      isPopular: false,
      isThread: false,
    };

    return NextResponse.json(formattedPost, { status: 201 });
  } catch (error) {
    console.error("Post olusturma hatasi:", error);
    return NextResponse.json(
      { message: "Post olusturulurken hata olustu" },
      { status: 500 }
    );
  }
}
