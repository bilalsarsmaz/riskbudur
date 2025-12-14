import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const hashtags = await prisma.hashtag.findMany({
      take: limit,
      where: {
        posts: {
          some: {}
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    const formattedHashtags = hashtags.map(h => ({
      id: h.id,
      name: h.name,
      count: h._count.posts
    }));

    return NextResponse.json({ hashtags: formattedHashtags });
  } catch (error) {
    console.error("Trending hashtag hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
