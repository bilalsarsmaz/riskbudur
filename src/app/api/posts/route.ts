import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { verifyTokenAndUpdateActivity } from "@/lib/auth";
import { hasSensitiveContent } from "@/lib/filter";

import { extractHashtags, extractMentions } from "@/lib/textUtils";


export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    let userId: string | null = null;

    if (token) {
      try {
        const decoded = await verifyTokenAndUpdateActivity(token);
        userId = decoded?.userId || null;
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

    // START BLOCK LOGIC
    let excludedUserIds: string[] = [];
    if (userId) {
      const blocks = await prisma.block.findMany({
        where: {
          OR: [
            { blockerId: userId },
            { blockedId: userId }
          ]
        }
      });
      excludedUserIds = blocks.map(b => b.blockerId === userId ? b.blockedId : b.blockerId);
    }
    // END BLOCK LOGIC

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
      // AND exclude blocked users
      const filteredFollowedUserIds = followedUserIds.filter(id => id !== userId && !excludedUserIds.includes(id));

      // Add author filter
      whereClause.authorId = {
        in: filteredFollowedUserIds
      };
    } else if (userId && excludedUserIds.length > 0) {
      // Public feed but excluding blocked users
      whereClause.authorId = {
        notIn: excludedUserIds
      };
    }

    // ONEMLI: Sadece root post'lari getir (parentPostId = null)
    // Yanitlar timeline'da gosterilmez, sadece post detayinda gosterilir
    const posts = await prisma.post.findMany({
      where: whereClause,
      skip,
      take,
      // Consistent ordering for stable pagination
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" }
      ],
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            fullName: true,
            profileImage: true,
            hasBlueTick: true,
            verificationTier: true,
            role: true,
            isBanned: true,
          },
        },
        // Include quotes to eliminate N+1 query
        // quotes removed from include to avoid incorrect relation usage
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
                role: true,
                isBanned: true,
              },
            },
          },
        },
        poll: {
          include: {
            options: {
              orderBy: { id: 'asc' }
            },
            votes: { where: { userId: userId || "0" } }
          }
        }
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

    // ✅ BULK THREAD COUNT QUERY (Instead of N+1)
    const postIds = posts.map(p => p.id);
    const threadCounts = await prisma.post.groupBy({
      by: ['threadRootId'],
      where: {
        threadRootId: { in: postIds },
      },
      _count: { id: true }
    });

    // Create a Map for O(1) lookup
    const threadCountMap = new Map(
      threadCounts.map(tc => [tc.threadRootId?.toString(), tc._count.id])
    );

    // ✅ BULK QUOTE FETCHING (Fix for logic error)
    // The previous logic assumed Post.quotes contained the quote record for the post itself,
    // but it actually contains quotes *of* that post.
    // We need to find "is this post a quote?" by checking the Quote table.

    // 1. Collect potential authors and time ranges
    const postAuthors = posts.map(p => p.authorId);
    // Find min and max dates to optimize query
    const minDate = new Date(Math.min(...posts.map(p => p.createdAt.getTime())) - 2000);
    const maxDate = new Date(Math.max(...posts.map(p => p.createdAt.getTime())) + 2000);

    const relevantQuotes = await prisma.quote.findMany({
      where: {
        authorId: { in: postAuthors },
        createdAt: {
          gte: minDate,
          lte: maxDate
        }
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
                role: true,
                isBanned: true,
              },
            },
          },
        }
      }
    });

    // Create a lookup map/function
    const findQuoteForPost = (post: any) => {
      return relevantQuotes.find(q =>
        q.authorId === post.authorId &&
        Math.abs(q.createdAt.getTime() - post.createdAt.getTime()) < 2000
      );
    };

    // ✅ Format posts using included data (No more N+1 queries!)
    const formattedPosts = posts.map((post) => {
      // Find quote from bulk fetch
      const quote = findQuoteForPost(post);

      // Get thread count from Map
      const threadRepliesCount = threadCountMap.get(post.id.toString()) || 0;
      const isThread = threadRepliesCount >= 4;

      // Filter content removed - using isCensored flag instead
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
        isCensored: (post as any).isCensored || false,
        viewCount: post.viewCount || 0,
        _count: {
          likes: post._count.likes,
          comments: post._count.comments + post._count.replies, // Toplam yanit
          quotes: post._count?.quotes || 0,
        },
        isPopular: (post._count?.likes || 0) > 30 || (post._count?.comments || 0) > 10,
        isThread: isThread,
        threadRepliesCount: threadRepliesCount,
        mentionedUsers: extractMentions(post.content).filter(m => validMentions.has(m)),
        poll: post.poll ? {
          id: post.poll.id,
          options: post.poll.options.map(opt => ({
            id: opt.id,
            text: opt.text,
            voteCount: opt.voteCount,
            isVoted: post.poll?.votes.some(v => v.optionId === opt.id) || false
          })),
          expiresAt: post.poll.expiresAt,
          totalVotes: post.poll.options.reduce((acc, curr) => acc + curr.voteCount, 0),
          isVoted: post.poll.votes.length > 0
        } : null,
      };

      // Eger alinti varsa, alintilanan postu ekle (using included data)
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
    });

    return NextResponse.json(formattedPosts, {
      status: 200,
      headers: {
        // ✅ Smart caching: 30s cache, 60s stale-while-revalidate
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });
  } catch (error) {
    console.error("Posts fetch error:", error);
    return NextResponse.json({ error: "Posts yuklenirken hata olustu", details: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined }, { status: 500 });
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

    const decoded = await verifyTokenAndUpdateActivity(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Geçersiz token" },
        { status: 401 }
      );
    }
    const userId = decoded.userId;

    const body = await req.json();
    const { content, imageUrl, mediaUrl, isAnonymous, linkPreview, parentPostId, pollOptions, pollDuration } = body;

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

    // Alıntı (Quote) tespiti
    let quotedPostId: bigint | null = null;
    const quoteRegex = /(?:https?:\/\/)?(?:www\.)?riskbudur\.net\/(?:[^\/]+\/)?status\/(\d+)/i;
    const quoteMatch = content.match(quoteRegex);
    if (quoteMatch && quoteMatch[1]) {
      quotedPostId = BigInt(quoteMatch[1]);
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
        poll: (pollOptions && Array.isArray(pollOptions) && pollOptions.length >= 2) ? {
          create: {
            expiresAt: new Date(Date.now() + (pollDuration || 1440) * 60 * 1000),
            options: {
              create: pollOptions.map((text: string) => ({ text }))
            }
          }
        } : undefined,
        isCensored: (decoded.isBanned || await hasSensitiveContent(content.trim())),
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
            role: true,
            isBanned: true,
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
        poll: {
          include: {
            options: {
              orderBy: { id: 'asc' }
            },
            votes: true
          }
        },
      },
    });

    // Send notification if censored
    if (post.isCensored) {
      await prisma.notification.create({
        data: {
          type: "POST_CENSORED",
          recipientId: userId,
          actorId: userId, // Self-notification
          postId: post.id, // Link to the specific post
          read: false,
        }
      });
    }

    // Eger alinti varsa Quote tablosuna ekle
    if (quotedPostId) {
      await prisma.quote.create({
        data: {
          content: content.trim(),
          authorId: userId,
          quotedPostId: quotedPostId,
          isAnonymous: isAnonymous || false
        }
      });
    }

    // Mention Bildirimleri
    const mentionedNicknames = extractMentions(content.trim());
    if (mentionedNicknames.length > 0) {
      // Gecerli kullanicilari bul
      const mentionedUsers = await prisma.user.findMany({
        where: {
          nickname: { in: mentionedNicknames },
          id: { not: userId } // Kendini etiketleyenlere bildirim gitmesin
        },
        select: { id: true }
      });

      // Her biri icin bildirim olustur
      if (mentionedUsers.length > 0) {
        await prisma.notification.createMany({
          data: mentionedUsers.map(user => ({
            type: "MENTION",
            recipientId: user.id,
            actorId: userId,
            postId: post.id,
          }))
        });
      }
    }

    // BigInt serialization icin
    const formattedPost: any = {
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
      isCensored: post.isCensored,
      _count: {
        likes: post._count.likes,
        comments: post._count.comments + post._count.replies,
        quotes: post._count.quotes || 0,
      },
      isPopular: false,
      isThread: false,
      quotedPostId: null, // Default
      poll: post.poll ? {
        id: post.poll.id,
        options: post.poll.options.map((opt: any) => ({
          id: opt.id,
          text: opt.text,
          voteCount: opt.voteCount,
          isVoted: false // Yeni oluşturulan ankette henüz oy yok
        })),
        expiresAt: post.poll.expiresAt,
        totalVotes: 0,
        isVoted: false
      } : null,
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
