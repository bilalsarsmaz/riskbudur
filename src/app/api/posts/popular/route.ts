import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5");

    // Fetch posts from last 14 days
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const posts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: fourteenDaysAgo
        }
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            profileImage: true,
            hasBlueTick: true,
            verificationTier: true,
            fullName: true,
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

    // Calculate engagement score with time-decay
    const scoredPosts = posts.map(post => {
      // Calculate days old
      const daysOld = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60 * 24);

      // Time-decay multiplier (newer posts get higher multiplier)
      const decayMultiplier = 1 / (1 + daysOld * 0.3);

      // Engagement score with weights
      const engagementScore =
        (post._count.likes * 1) +      // 1 point per like
        (post._count.replies * 2) +    // 2 points per reply
        (post._count.comments * 3) +   // 3 points per comment
        (post._count.quotes * 5);      // 5 points per quote

      // Final score = engagement × time-decay
      const finalScore = engagementScore * decayMultiplier;

      return {
        post,
        finalScore,
        engagementScore,
        daysOld
      };
    });

    // Sort by final score (descending)
    scoredPosts.sort((a, b) => b.finalScore - a.finalScore);

    // Take top N posts
    const topPosts = scoredPosts.slice(0, limit);

    // Format response
    const formattedPosts = topPosts.map(({ post }) => ({
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
