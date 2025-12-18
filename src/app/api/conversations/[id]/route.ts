import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/auth";

export async function DELETE(
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

        // Delete conversation (cascade will delete participants and messages)
        await prisma.conversation.delete({
            where: { id: conversationId },
        });

        return NextResponse.json({ message: "Conversation deleted" });
    } catch (error) {
        console.error("Error deleting conversation:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
