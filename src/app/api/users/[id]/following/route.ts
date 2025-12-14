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

        // Get following list with pagination
        const [following, totalCount] = await Promise.all([
            prisma.follow.findMany({
                where: {
                    followerId: targetUser.id,
                },
                select: {
                    following: {
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
            prisma.follow.count({
                where: { followerId: targetUser.id },
            }),
        ]);

        // Check if current user also follows these people
        let followingIds: string[] = [];
        if (currentUserId) {
            const currentUserFollowing = await prisma.follow.findMany({
                where: {
                    followerId: currentUserId,
                    followingId: {
                        in: following.map((f) => f.following.id),
                    },
                },
                select: { followingId: true },
            });
            followingIds = currentUserFollowing.map((f) => f.followingId);
        }

        // Map following with isFollowing flag
        const followingData = following.map((f) => ({
            ...f.following,
            isFollowing: followingIds.includes(f.following.id),
        }));

        return NextResponse.json({
            following: followingData,
            totalCount,
            hasMore: skip + limit < totalCount,
        });
    } catch (error) {
        console.error("Error fetching following:", error);
        return NextResponse.json(
            { error: "Failed to fetch following" },
            { status: 500 }
        );
    }
}
