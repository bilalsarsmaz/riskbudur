import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { nickname: params.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: user.id,
        OR: [
          { mediaUrl: { not: null } },
          { imageUrl: { not: null } }
        ]
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            hasBlueTick: true,
            profileImage: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    const formattedPosts = posts.map(post => ({
      id: post.id.toString(),
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      mediaUrl: post.mediaUrl,
      imageUrl: post.imageUrl,
      isAnonymous: post.isAnonymous,
      author: {
        id: post.author.id,
        nickname: post.author.nickname,
        hasBlueTick: post.author.hasBlueTick,
        profileImage: post.author.profileImage
      },
      _count: {
        likes: post._count.likes,
        comments: post._count.comments
      }
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error("Kullanıcı medya postları getirme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
