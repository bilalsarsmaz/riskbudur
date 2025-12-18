import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/auth";

// GET: Fetch messages for a conversation
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const conversationId = id;

        // Verify user is participant
        const isParticipant = await prisma.conversationParticipant.findUnique({
            where: {
                userId_conversationId: {
                    userId,
                    conversationId,
                },
            },
        });

        if (!isParticipant) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId,
            },
            orderBy: {
                createdAt: "asc",
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        nickname: true,
                        profileImage: true,
                    },
                },
            },
        });

        // Mark messages as read for this user
        await prisma.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Send a message
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const conversationId = id;
        const { content, imageUrl } = await req.json();

        if ((!content || !content.trim()) && !imageUrl) {
            return NextResponse.json({ message: "Content or image required" }, { status: 400 });
        }

        // Verify user is participant
        const isParticipant = await prisma.conversationParticipant.findUnique({
            where: {
                userId_conversationId: {
                    userId,
                    conversationId,
                },
            },
        });

        if (!isParticipant) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                content: content || "",
                imageUrl,
                conversationId,
                senderId: userId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        nickname: true,
                        profileImage: true,
                    },
                },
            },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                updatedAt: new Date(),
                lastMessageAt: new Date(),
            },
        });

        return NextResponse.json({ message });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
