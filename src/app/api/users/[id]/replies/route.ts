import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

async function findThreadRoot(postId: bigint): Promise<any> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
          fullName: true,
          hasBlueTick: true,
          verificationTier: true,
          profileImage: true,
        },
      },
    },
  });

  if (!post) return null;

  if (!post.parentPostId) {
    return {
      id: post.id.toString(),
      content: post.content,
      createdAt: post.createdAt,
      mediaUrl: post.mediaUrl,
      imageUrl: post.imageUrl,
      author: post.author,
    };
  }

  return findThreadRoot(post.parentPostId);
}

async function countPostsBetween(rootId: bigint, replyId: bigint): Promise<number> {
  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { threadRootId: rootId },
        { parentPostId: rootId },
      ],
      createdAt: {
        lt: (await prisma.post.findUnique({ where: { id: replyId } }))?.createdAt,
      }
    }
  });
  return posts.length;
}

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const take = parseInt(searchParams.get("take") || "20");

    const params = await props.params;
    const username = params.id;

    // Auth check for interaction states
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    let userId: string | null = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        userId = decoded.userId;
      } catch (e) { }
    }

    const user = await prisma.user.findFirst({
      where: {
        nickname: {
          equals: username,
          mode: "insensitive"
        }
      },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Kullanici bulunamadi" },
        { status: 404 }
      );
    }

    const replies = await prisma.post.findMany({
      where: {
        authorId: user.id,
        parentPostId: { not: null }
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
            hasBlueTick: true,
            verificationTier: true,
            profileImage: true,
          },
        },
        parentPost: {
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                fullName: true,
                hasBlueTick: true,
                verificationTier: true,
                profileImage: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
            quotes: true,
          },
        },
      },
    });

    const formattedReplies = await Promise.all(replies.map(async (reply) => {
      const threadRoot = await findThreadRoot(reply.parentPostId!);

      let middlePostsCount = 0;
      let threadRepliesCount = 0;
      if (threadRoot && reply.parentPostId) {
        middlePostsCount = await countPostsBetween(BigInt(threadRoot.id), reply.id);
        threadRepliesCount = await prisma.post.count({
          where: {
            threadRootId: BigInt(threadRoot.id),
          },
        });
      }

      // Interaction checks
      let isLiked = false;
      let isBookmarked = false;
      if (userId) {
        const like = await prisma.like.findFirst({
          where: { userId, postId: reply.id }
        });
        isLiked = !!like;

        const bookmark = await prisma.bookmark.findFirst({
          where: { userId, postId: reply.id }
        });
        isBookmarked = !!bookmark;
      }

      const baseReply = {
        id: reply.id.toString(),
        content: reply.content,
        createdAt: reply.createdAt.toISOString(),
        mediaUrl: reply.mediaUrl,
        imageUrl: reply.imageUrl,
        linkPreview: reply.linkPreview,
        isAnonymous: reply.isAnonymous,
        author: reply.author,
        isLiked: isLiked,
        isBookmarked: isBookmarked,
        threadRoot: threadRoot,
        middlePostsCount: middlePostsCount,
        threadRepliesCount: threadRepliesCount,
        _count: {
          likes: reply._count.likes,
          comments: reply._count.replies,
          quotes: reply._count.quotes || 0,
        },
      };

      return baseReply;
    }));

    return NextResponse.json({ posts: formattedReplies });
  } catch (error) {
    console.error("Replies getirme hatasi:", error);
    return NextResponse.json(
      { message: "Bir hata olustu" },
      { status: 500 }
    );
  }
}
