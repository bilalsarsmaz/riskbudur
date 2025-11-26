import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const hashtags = await prisma.hashtag.findMany({
      take: 5,
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
