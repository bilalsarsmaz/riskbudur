
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

// Mention'lari cikar (Utility function matching standard post route)
function extractMentions(content: string): string[] {
    const mentionRegex = /@[\w_]+/g;
    const matches = content.match(mentionRegex);
    if (!matches) return [];
    return [...new Set(matches.map(tag => tag.slice(1)))];
}

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Admin check logic - replicated from other admin routes
        const token = req.headers.get("authorization")?.replace("Bearer ", "");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string };
            // Verify admin role
            const adminUser = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { role: true }
            });

            const allowedRoles = ['ADMIN', 'MODERATOR', 'ROOTADMIN'];
            if (!adminUser || !adminUser.role || !allowedRoles.includes(adminUser.role)) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        } catch (e) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Parameters
        const { searchParams } = new URL(req.url);
        const skip = parseInt(searchParams.get("skip") || "0");
        const take = parseInt(searchParams.get("take") || "20");
        const username = params.id;

        const user = await prisma.user.findFirst({
            where: {
                nickname: {
                    equals: username,
                    mode: "insensitive"
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { message: "Kullanici bulunamadi" },
                { status: 404 }
            );
        }

        // Fetch ONLY censored posts
        const posts = await prisma.post.findMany({
            where: {
                authorId: user.id,
                isCensored: true, // Only censored
            },
            skip,
            take,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                author: {
                    select: {
                        id: true,
                        nickname: true,
                        hasBlueTick: true,
                        verificationTier: true,
                        profileImage: true,
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
                        votes: true // Fetch all votes to count, though specific user context is less relevant for admin view generic display
                    }
                },
            },
        });

        // We don't need complex interaction states (liked, bookmarked etc) for admin view of hidden posts usually,
        // but we need to format it to match EnrichedPost structure for PostItem component.

        const formattedPosts = posts.map((post) => {
            // Mock current user interaction as false for admin view simplicity
            return {
                id: post.id.toString(),
                content: post.content,
                createdAt: post.createdAt.toISOString(),
                mediaUrl: post.mediaUrl,
                imageUrl: post.imageUrl,
                linkPreview: post.linkPreview,
                isAnonymous: post.isAnonymous,
                isCensored: post.isCensored, // Crucial
                author: {
                    id: post.author.id,
                    nickname: post.author.nickname,
                    hasBlueTick: post.author.hasBlueTick,
                    verificationTier: post.author.verificationTier,
                    profileImage: post.author.profileImage,
                    fullName: post.author.fullName,
                    role: post.author.role,
                },
                _count: {
                    likes: post._count.likes,
                    comments: post._count.comments + post._count.replies,
                    quotes: post._count.quotes || 0,
                },
                isThread: false, // Simplification
                threadRepliesCount: 0,
                mentionedUsers: [], // Simplification
                isLiked: false,
                isCommented: false,
                isQuoted: false,
                isBookmarked: false,
                // Poll formatting if needed
                poll: post.poll ? {
                    id: post.poll.id,
                    options: post.poll.options.map(opt => ({
                        id: opt.id,
                        text: opt.text,
                        voteCount: opt.voteCount,
                        isVoted: false
                    })),
                    expiresAt: post.poll.expiresAt,
                    totalVotes: post.poll.options.reduce((acc, curr) => acc + curr.voteCount, 0),
                    isVoted: false
                } : null,
            };
        });

        return NextResponse.json({
            posts: formattedPosts,
        });
    } catch (error) {
        console.error("Admin hidden posts error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
