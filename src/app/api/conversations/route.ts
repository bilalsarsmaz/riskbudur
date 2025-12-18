import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/auth";

// GET: Fetch conversations for the current user
export async function GET(req: Request) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

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

        return NextResponse.json({ conversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create a new conversation (or return existing one)
export async function POST(req: Request) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { participantId } = await req.json();

        if (!participantId) {
            return NextResponse.json({ message: "Participant ID required" }, { status: 400 });
        }

        // Check if conversation already exists between these two users
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId: userId } } },
                    { participants: { some: { userId: participantId } } },
                ],
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
            },
        });

        if (existingConversation) {
            return NextResponse.json({ conversation: existingConversation });
        }

        // Create new conversation
        const newConversation = await prisma.conversation.create({
            data: {
                participants: {
                    create: [
                        { userId: userId },
                        { userId: participantId },
                    ],
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
            },
        });

        return NextResponse.json({ conversation: newConversation });
    } catch (error) {
        console.error("Error creating conversation:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
