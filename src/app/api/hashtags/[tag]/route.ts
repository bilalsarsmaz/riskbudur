import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
  req: Request,
  props: { params: Promise<{ tag: string }> }
) {
  const params = await props.params;
  try {
    const tag = decodeURIComponent(params.tag);
    let userId: string | null = null;

    // Authorization header'dan token'ı al
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const payload = await verifyToken(token);
        if (payload) {
          userId = payload.userId as string;
        }
      } catch (e) {
        console.error("Token doğrulama hatası:", e);
      }
    }

    const hashtag = await prisma.hashtag.findUnique({
      where: { name: tag },
      include: {
        posts: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                fullName: true,
                hasBlueTick: true,
                verificationTier: true,
                profileImage: true
              }
            },
            _count: {
              select: {
                likes: true,
                comments: true
              }
            },
            likes: userId ? {
              where: { userId: userId },
              select: { userId: true }
            } : false,
            bookmarks: userId ? {
              where: { userId: userId },
              select: { userId: true }
            } : false
          }
        }
      }
    });

    if (!hashtag) {
      return NextResponse.json(
        { message: "Hashtag bulunamadı" },
        { status: 404 }
      );
    }

    const formattedPosts = hashtag.posts.map(post => ({
      id: post.id.toString(),
      content: post.content,
      mediaUrl: post.mediaUrl,
      createdAt: post.createdAt.toISOString(),
      isAnonymous: post.isAnonymous,
      isLiked: post.likes && post.likes.length > 0,
      isBookmarked: post.bookmarks && post.bookmarks.length > 0,
      author: {
        id: post.author.id,
        nickname: post.author.nickname,
        fullName: post.author.fullName,
        hasBlueTick: post.author.hasBlueTick,
        verificationTier: post.author.verificationTier,
        profileImage: post.author.profileImage
      },
      _count: {
        likes: post._count.likes,
        comments: post._count.comments
      }
    }));

    return NextResponse.json({
      hashtag: {
        name: hashtag.name,
        count: hashtag.posts.length
      },
      posts: formattedPosts
    });
  } catch (error) {
    console.error("Hashtag detay hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
