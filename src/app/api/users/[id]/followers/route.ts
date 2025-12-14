import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: usernameOrId } = await params;
        const url = new URL(request.url);
        const verified = url.searchParams.get("verified") === "true";
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;

        // Get current user ID if authenticated
        let currentUserId: string | undefined;
        try {
            const token = request.headers.get("authorization")?.split(" ")[1];
            if (token) {
                const decoded = await verifyToken(token);
                if (decoded) {
                    currentUserId = decoded.userId;
                }
            }
        } catch (err) {
            // Not authenticated, continue without currentUserId
        }

        // Find the target user by username or ID
        const targetUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { nickname: usernameOrId },
                    { id: usernameOrId },
                ],
            },
            select: { id: true },
        });

        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Build where clause
        const whereClause: any = {
            followingId: targetUser.id,
        };

        // Handle verification filter
        if (verified) {
            // Only verified followers
            whereClause.follower = {
                OR: [
                    { verificationTier: "GREEN" },
                    { verificationTier: "GOLD" },
                    { verificationTier: "GRAY" },
                    { hasBlueTick: true },
                ],
            };
        } else if (url.searchParams.has("verified") && !verified) {
            // Only non-verified followers (when verified=false is explicitly set)
            whereClause.follower = {
                verificationTier: "NONE",
                hasBlueTick: false,
            };
        }
        // If verified param is not set at all, show all followers

        // Get followers with pagination
        const [followers, totalCount] = await Promise.all([
            prisma.follow.findMany({
                where: whereClause,
                select: {
                    follower: {
                        select: {
                            id: true,
                            nickname: true,
                            fullName: true,
                            profileImage: true,
                            verificationTier: true,
                            hasBlueTick: true,
                            bio: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.follow.count({ where: whereClause }),
        ]);

        // Check if current user follows these followers
        let followingIds: string[] = [];
        if (currentUserId) {
            const currentUserFollowing = await prisma.follow.findMany({
                where: {
                    followerId: currentUserId,
                    followingId: {
                        in: followers.map((f) => f.follower.id),
                    },
                },
                select: { followingId: true },
            });
            followingIds = currentUserFollowing.map((f) => f.followingId);
        }

        // Map followers with isFollowing flag
        const followersData = followers.map((f) => ({
            ...f.follower,
            isFollowing: followingIds.includes(f.follower.id),
        }));

        return NextResponse.json({
            followers: followersData,
            totalCount,
            hasMore: skip + limit < totalCount,
        });
    } catch (error) {
        console.error("Error fetching followers:", error);
        return NextResponse.json(
            { error: "Failed to fetch followers" },
            { status: 500 }
        );
    }
}
