import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/auth";

// GET: Fetch messages for a conversation (ADMIN ONLY - READ ONLY)
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        if (!adminUser || (adminUser.role !== 'SUPERADMIN' && adminUser.role !== 'ADMIN')) {
            return NextResponse.json({
                message: `Forbidden: Access denied. Role 'SUPERADMIN' or 'ADMIN' required. You are: ${adminUser?.role}`
            }, { status: 403 });
        }

        const { id } = await params;
        const conversationId = id;

        // Fetch messages directly (No participant check needed for Super Admin, they can see all)
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

        // CRITICAL: Do NOT mark as read. This is a shadow view.

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Error fetching admin messages:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
