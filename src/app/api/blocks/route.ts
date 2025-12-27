
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        if (userId === payload.userId) {
            return NextResponse.json({ error: "You cannot block yourself" }, { status: 400 });
        }

        // Check if block already exists
        const existingBlock = await prisma.block.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId: payload.userId,
                    blockedId: userId,
                },
            },
        });

        if (existingBlock) {
            return NextResponse.json({ success: true, message: "User already blocked" });
        }

        // Create block
        await prisma.block.create({
            data: {
                blockerId: payload.userId,
                blockedId: userId,
            },
        });

        // Also make sure to unfollow if following exists (bidirectional)

        // 1. Current user unfollows the blocked user
        const follow1 = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: payload.userId,
                    followingId: userId
                }
            }
        });

        if (follow1) {
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: payload.userId,
                        followingId: userId
                    }
                }
            });


        }

        // 2. Blocked user unfollows current user (force unfollow)
        const follow2 = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: payload.userId
                }
            }
        });

        if (follow2) {
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: payload.userId
                    }
                }
            });


        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Block error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        let userId = request.nextUrl.searchParams.get("userId");

        if (!userId) {
            try {
                const body = await request.json();
                userId = body.userId;
            } catch (e) {
                // Body parse error, ignore
            }
        }

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        await prisma.block.delete({
            where: {
                blockerId_blockedId: {
                    blockerId: payload.userId,
                    blockedId: userId,
                },
            },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        if ((error as any).code === 'P2025') {
            // Record not found
            return NextResponse.json({ success: true }); // Treat as success
        }
        console.error("Unblock error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
