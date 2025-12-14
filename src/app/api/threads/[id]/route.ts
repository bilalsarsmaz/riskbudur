import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

// Thread'in tum postlarini getir
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const threadRootId = BigInt(id);

    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    let userId: string | null = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
        userId = decoded.userId;
      } catch (error) {
        // Token gecersiz
      }
    }

    // Thread root post'u getir
    const rootPost = await prisma.post.findUnique({
      where: { id: threadRootId },
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

    if (!rootPost) {
      return NextResponse.json(
        { message: "Thread bulunamadi" },
        { status: 404 }
      );
    }

    // Thread'deki tum postlari getir (ayni yazarin yanitlari)
    const threadPosts = await prisma.post.findMany({
      where: {
        OR: [
          { id: threadRootId }, // Root post
          {
            threadRootId: threadRootId,
            authorId: rootPost.authorId, // Sadece ayni yazarin yanitlari (thread devami)
          },
        ],
      },
      orderBy: { createdAt: "asc" },
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

    // Kullanicinin etkilesimleri
    let likedPostIds: string[] = [];
    let bookmarkedPostIds: string[] = [];

    if (userId) {
      const postIds = threadPosts.map(p => p.id);

      const userLikes = await prisma.like.findMany({
        where: { userId, postId: { in: postIds } },
        select: { postId: true },
      });
      likedPostIds = userLikes.map(l => l.postId.toString());

      const userBookmarks = await prisma.bookmark.findMany({
        where: { userId, postId: { in: postIds } },
        select: { postId: true },
      });
      bookmarkedPostIds = userBookmarks.map(b => b.postId.toString());
    }

    // Diger kullanicilarin yanitlarini da getir (thread'e katilimlar)
    const otherReplies = await prisma.post.findMany({
      where: {
        threadRootId: threadRootId,
        authorId: { not: rootPost.authorId }, // Farkli yazarlar
      },
      orderBy: { createdAt: "asc" },
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
            replies: true,
          },
        },
      },
    });

    const formattedThreadPosts = threadPosts.map((post, index) => ({
      id: post.id.toString(),
      content: post.content,
      createdAt: post.createdAt,
      imageUrl: post.imageUrl,
      mediaUrl: post.mediaUrl,
      linkPreview: post.linkPreview,
      isAnonymous: post.isAnonymous,
      author: post.author,
      isLiked: likedPostIds.includes(post.id.toString()),
      isBookmarked: bookmarkedPostIds.includes(post.id.toString()),
      _count: {
        likes: post._count.likes,
        comments: post._count.comments + post._count.replies,
        quotes: post._count.quotes || 0,
      },
      isThreadRoot: index === 0,
      threadPosition: index + 1,
    }));

    const formattedOtherReplies = otherReplies.map(reply => ({
      id: reply.id.toString(),
      content: reply.content,
      createdAt: reply.createdAt,
      imageUrl: reply.imageUrl,
      mediaUrl: reply.mediaUrl,
      author: reply.author,
      _count: {
        likes: reply._count.likes,
        comments: reply._count.replies,
      },
    }));

    return NextResponse.json({
      thread: formattedThreadPosts,
      threadLength: formattedThreadPosts.length,
      otherReplies: formattedOtherReplies,
      otherRepliesCount: formattedOtherReplies.length,
    });
  } catch (error) {
    console.error("Thread getirme hatasi:", error);
    return NextResponse.json(
      { message: "Thread getirilirken hata olustu" },
      { status: 500 }
    );
  }
}
