import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

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
          { isAnonymous: false },
          { isAnonymous: true, authorId: user.id }
        ]
      },
      skip,
      take: limit,
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
            fullName: true,
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
        profileImage: post.author.profileImage,
        fullName: post.author.fullName,
      },
      _count: {
        likes: post._count.likes,
        comments: post._count.comments
      }
    }));

    const total = await prisma.post.count({
      where: {
        authorId: user.id,
        OR: [
          { isAnonymous: false },
          { isAnonymous: true, authorId: user.id }
        ]
      },
    });

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Kullanıcı postları getirme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
