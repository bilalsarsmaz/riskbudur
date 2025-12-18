import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Count all unique conversations that have at least one unread message
        // sent by someone other than the current user
        const count = await prisma.conversation.count({
            where: {
                participants: {
                    some: {
                        userId: userId
                    }
                },
                messages: {
                    some: {
                        senderId: {
                            not: userId
                        },
                        isRead: false
                    }
                }
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Error fetching unread messages count:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
