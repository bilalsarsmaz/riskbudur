import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

// Hashtag'leri cikar
function extractHashtags(content: string): string[] {
  const hashtagRegex = /#[\p{L}\p{N}_]+/gu;
  const matches = content.match(hashtagRegex);
  if (!matches) return [];
  return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))];
}

// Mention'lari cikar
function extractMentions(content: string): string[] {
  const mentionRegex = /@[\w_]+/g;
  const matches = content.match(mentionRegex);
  if (!matches) return [];
  return [...new Set(matches.map(tag => tag.slice(1)))];
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    let userId: string | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        userId = decoded.userId;
        // lastSeen is now automatically updated via verifyTokenAndUpdateActivity in other endpoints
      } catch (error) {
        // Token gecersiz, devam et
      }
    }

    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "20");
    const timeline = searchParams.get("timeline"); // "following" or null

    // Where clause for timeline filtering
    const whereClause: any = {
      parentPostId: null, // Sadece root post'lar
    };

    // If timeline is "following", only show posts from followed users
    if (timeline === "following" && userId) {
      // Get list of followed user IDs
      const followedUsers = await prisma.follow.findMany({
        where: {
          followerId: userId
        },
        select: {
          followingId: true
        }
      });

      const followedUserIds = followedUsers.map(f => f.followingId);

      // Exclude user's own ID from the list (user shouldn't see their own posts in Following)
      const filteredFollowedUserIds = followedUserIds.filter(id => id !== userId);

      // Add author filter
      whereClause.authorId = {
        in: filteredFollowedUserIds
      };
    }

    // ONEMLI: Sadece root post'lari getir (parentPostId = null)
    // Yanitlar timeline'da gosterilmez, sadece post detayinda gosterilir
    const posts = await prisma.post.findMany({
      where: whereClause,
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
            verificationTier: true,
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

    // Mention validasyonu
    const allMentions = new Set<string>();
    posts.forEach(p => {
      extractMentions(p.content).forEach(m => allMentions.add(m));
    });

    const mentionList = Array.from(allMentions);
    let validMentions = new Set<string>();

    if (mentionList.length > 0) {
      const existingUsers = await prisma.user.findMany({
        where: { nickname: { in: mentionList } },
        select: { nickname: true }
      });
      existingUsers.forEach(u => validMentions.add(u.nickname));
    }

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
            select: {
              id: true,
              content: true,
              createdAt: true,
              imageUrl: true,
              mediaUrl: true,
              linkPreview: true,
              isAnonymous: true,
              author: {
                select: {
                  id: true,
                  nickname: true,
                  fullName: true,
                  profileImage: true,
                  hasBlueTick: true,
                  verificationTier: true,
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
        mentionedUsers: extractMentions(post.content).filter(m => validMentions.has(m)),
      };

      // Eger alinti varsa, alintilanan postu ekle
      if (quote && quote.quotedPost) {
        return {
          ...basePost,
          quotedPostId: quote.quotedPost.id.toString(), // Added explicit ID field
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

    if ((!content || content.trim().length === 0) && !imageUrl && !mediaUrl) {
      return NextResponse.json(
        { message: "Post içeriği veya görsel boş olamaz" },
        { status: 400 }
      );
    }

    // Hashtag'leri cikar
    const hashtagNames = extractHashtags(content);

    // Mevcut hashtaglerin updatedAt tarihini guncelle (Aktiflik takibi icin)
    if (hashtagNames.length > 0) {
      await prisma.hashtag.updateMany({
        where: {
          name: { in: hashtagNames }
        },
        data: {
          updatedAt: new Date()
        }
      });
    }

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
            verificationTier: true,
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
      quotedPostId: null, // Default
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
