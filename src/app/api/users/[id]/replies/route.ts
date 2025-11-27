import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Thread root'unu bul (recursive)
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
          profileImage: true,
        },
      },
    },
  });
  
  if (!post) return null;
  
  // Eger parentPostId yoksa bu root'tur
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
  
  // Yoksa parent'a git
  return findThreadRoot(post.parentPostId);
}

// Iki post arasindaki post sayisini bul
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
    },
  });
  return posts.length;
}

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const username = context.params.id;

    const user = await prisma.user.findUnique({
      where: { nickname: username },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Kullanici bulunamadi" },
        { status: 404 }
      );
    }

    // Kullanicinin yanitlarini getir
    const replies = await prisma.post.findMany({
      where: { 
        authorId: user.id,
        parentPostId: { not: null }
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            fullName: true,
            hasBlueTick: true,
            hasOrangeTick: true,
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
      // Thread root'unu bul
      const threadRoot = await findThreadRoot(reply.parentPostId!);
      
      // Root ile yanit arasindaki post sayisi
      let middlePostsCount = 0;
      if (threadRoot && reply.parentPostId) {
        middlePostsCount = await countPostsBetween(BigInt(threadRoot.id), reply.id);
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
        threadRoot: threadRoot,
        middlePostsCount: middlePostsCount,
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
