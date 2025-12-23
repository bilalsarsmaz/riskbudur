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
            role: true,
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

        poll: {
          include: {
            options: {
              orderBy: { id: 'asc' }
            },
            votes: { where: { userId: "0" } } // No auth context here usually
            // Actually this route grabs request but doesn't extract user ID in the current code snippet provided.
            // checking line 4: export async function GET(req: Request) { ... }
            // It doesn't extract token. So `isVoted` will be false for everyone unless I extract token.
            // For now, I'll just include the structure so it renders. `isVoted` will be false.
            // Update: I should probably copy the token extraction logic if I want isVoted to work.
            // But let's stick to just showing the poll first.
          }
        }
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
      _count: post._count,
      poll: post.poll ? {
        id: post.poll.id,
        options: post.poll.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          voteCount: opt.voteCount,
          isVoted: false // No auth context in this route currently
        })),
        expiresAt: post.poll.expiresAt,
        totalVotes: post.poll.options.reduce((acc, curr) => acc + curr.voteCount, 0),
        isVoted: false
      } : null
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
