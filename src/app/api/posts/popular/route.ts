import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    const posts = await prisma.post.findMany({
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            hasBlueTick: true,
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
      orderBy: [
        {
          likes: {
            _count: 'desc'
          }
        }
      ]
    });

    const formattedPosts = posts.map(post => ({
      id: post.id.toString(),
      content: post.content,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      author: post.author,
      _count: post._count
    }));

    return NextResponse.json({ posts: formattedPosts });
  } catch (error) {
    console.error("Popüler post getirme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
