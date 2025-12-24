import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

// Mention'lari cikar
function extractMentions(content: string): string[] {
  const mentionRegex = /@[\w_]+/g;
  const matches = content.match(mentionRegex);
  if (!matches) return [];
  return [...new Set(matches.map(tag => tag.slice(1)))];
}

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

    // Extract current user ID from token (optional - user might not be logged in)
    let currentUserId: string | null = null;
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        currentUserId = decoded.userId;
      } catch {
        // Token invalid or missing, continue without user context
      }
    }

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
        { message: "Kullanici bulunamadi" },
        { status: 404 }
      );
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        isAnonymous: false,
        parentPostId: null,
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        content: true,
        imageUrl: true,
        mediaUrl: true,
        createdAt: true,
        updatedAt: true,
        isAnonymous: true,
        authorId: true,
        linkPreview: true,
        parentPostId: true,
        threadRootId: true,
        isCensored: true,
        author: {
          select: {
            id: true,
            nickname: true,
            hasBlueTick: true,
            verificationTier: true,
            profileImage: true,
            fullName: true,
            role: true,
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
            votes: { where: { userId: currentUserId || "0" } }
          }
        },
      },
    });

    // Fetch user's interactions if logged in
    let likedPostIds: string[] = [];
    let commentedPostIds: string[] = [];
    let quotedPostIds: string[] = [];
    let bookmarkedPostIds: string[] = [];

    if (currentUserId) {
      const postIds = posts.map(p => p.id);

      // Fetch likes
      const userLikes = await prisma.like.findMany({
        where: {
          userId: currentUserId,
          postId: { in: postIds }
        },
        select: { postId: true }
      });
      likedPostIds = userLikes.map(like => like.postId.toString());

      // Fetch comments
      const userComments = await prisma.comment.findMany({
        where: {
          authorId: currentUserId,
          postId: { in: postIds }
        },
        select: { postId: true }
      });
      commentedPostIds = userComments.map(comment => comment.postId.toString());

      // Fetch quotes
      const userQuotes = await prisma.quote.findMany({
        where: {
          authorId: currentUserId,
          quotedPostId: { in: postIds }
        },
        select: { quotedPostId: true }
      });
      quotedPostIds = userQuotes.map(quote => quote.quotedPostId.toString());

      // Fetch bookmarks
      const userBookmarks = await prisma.bookmark.findMany({
        where: {
          userId: currentUserId,
          postId: { in: postIds }
        },
        select: { postId: true }
      });
      bookmarkedPostIds = userBookmarks.map(bookmark => bookmark.postId.toString());
    }

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

    const formattedPosts = await Promise.all(posts.map(async (post) => {
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
                  role: true,
                },
              },
            },
          },
        },
      });

      const threadRepliesCount = await prisma.post.count({
        where: {
          threadRootId: post.id,
        },
      });
      const isThread = threadRepliesCount >= 4;

      const postIdStr = post.id.toString();
      const basePost = {
        id: postIdStr,
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
          verificationTier: post.author.verificationTier,
          profileImage: post.author.profileImage,
          fullName: post.author.fullName,
          role: post.author.role,
        },
        _count: {
          likes: post._count.likes,
          comments: post._count.comments + post._count.replies,
          quotes: post._count.quotes || 0,
        },
        isThread: isThread,
        threadRepliesCount: threadRepliesCount,
        mentionedUsers: extractMentions(post.content).filter(m => validMentions.has(m)),
        // Add interaction states
        isLiked: currentUserId ? likedPostIds.includes(postIdStr) : false,
        isCommented: currentUserId ? commentedPostIds.includes(postIdStr) : false,
        isQuoted: currentUserId ? quotedPostIds.includes(postIdStr) : false,
        isBookmarked: currentUserId ? bookmarkedPostIds.includes(postIdStr) : false,
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
        isCensored: (post as any).isCensored || false,
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
    console.error("Kullanici postlari getirme hatasi:", error);
    return NextResponse.json(
      { message: "Bir hata olustu" },
      { status: 500 }
    );
  }
}
