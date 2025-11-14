import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { tag: string } }
) {
  try {
    const tag = params.tag;

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
                profileImage: true
              }
            },
            _count: {
              select: {
                likes: true,
                comments: true
              }
            }
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
      author: {
        id: post.author.id,
        nickname: post.author.nickname,
        fullName: post.author.fullName,
        hasBlueTick: post.author.hasBlueTick,
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
