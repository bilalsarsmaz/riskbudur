import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/auth";

// GET: Fetch conversations for a specific target user (ADMIN ONLY)
export async function GET(req: Request) {
    try {
        const adminId = await getUserIdFromToken(req as any);
        if (!adminId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Verify Admin Role
        const adminUser = await prisma.user.findUnique({
            where: { id: adminId },
            select: { role: true }
        });

        console.log(`Admin Request: ${adminId} Role: ${adminUser?.role}`);

        if (!adminUser || (adminUser.role !== 'ROOTADMIN' && adminUser.role !== 'ADMIN')) {
            return NextResponse.json({
                message: `Forbidden: Access denied. Role 'ROOTADMIN' or 'ADMIN' required. You are: ${adminUser?.role}`
            }, { status: 403 });
        }

        // Get target nickname from query
        const { searchParams } = new URL(req.url);
        let nickname = searchParams.get("nickname");

        if (!nickname) {
            return NextResponse.json({ message: "Nickname required" }, { status: 400 });
        }

        // Clean nickname (remove @ if present)
        nickname = nickname.replace("@", "").trim();
        console.log(`Admin searching for DM shadow: ${nickname}`);

        // Find target user (Case Insensitive)
        const targetUser = await prisma.user.findFirst({
            where: {
                nickname: {
                    equals: nickname,
                    mode: 'insensitive'
                }
            },
            select: { id: true }
        });

        if (!targetUser) {
            console.log("User not found in DB");
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        console.log(`User found: ${targetUser.id}. Fetching conversations...`);
        const userId = targetUser.id;

        // Fetch conversations for the target user
        const conversationsRaw = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: userId,
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                nickname: true,
                                fullName: true,
                                profileImage: true,
                                hasBlueTick: true,
                                verificationTier: true,
                            },
                        },
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        // Add unread count (from the perspective of the target user)
        const conversations = await Promise.all(conversationsRaw.map(async (conv) => {
            const unreadCount = await prisma.message.count({
                where: {
                    conversationId: conv.id,
                    senderId: { not: userId },
                    isRead: false
                }
            });
            return { ...conv, unreadCount };
        }));

        return NextResponse.json({ conversations, targetUserId: userId });
    } catch (error) {
        console.error("Error fetching admin conversations:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
