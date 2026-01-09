
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/auth";
import { hasPermission, Permission, Role } from "@/lib/permissions";

async function getUser(request: Request) {
    const userId = await getUserIdFromToken(request as NextRequest);
    if (!userId) return null;
    return prisma.user.findUnique({ where: { id: userId } });
}

export async function GET(request: Request) {
    try {
        const user = await getUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Basic permission check - just need to be an admin/mod (dashboard access)
        if (!hasPermission(user.role as Role, Permission.VIEW_DASHBOARD)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Update lastSeen
        await prisma.user.update({
            where: { id: user.id },
            data: { lastSeen: new Date() }
        });

        const messages = await prisma.adminChatMessage.findMany({
            take: 50,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        nickname: true,
                        role: true,
                        hasBlueTick: true,
                        verificationTier: true,
                        profileImage: true
                    }
                }
            }
        });

        // Fetch online admins (active in last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const onlineUsers = await prisma.user.findMany({
            where: {
                role: { in: ['ROOTADMIN', 'ADMIN', 'MODERATOR'] },
                lastSeen: { gt: fiveMinutesAgo }
            },
            select: {
                nickname: true,
                role: true,
                hasBlueTick: true,
                verificationTier: true,
                profileImage: true
            }
        });

        // Return object with both data
        return NextResponse.json({
            messages: messages.reverse(),
            onlineUsers
        });

    } catch (error) {
        console.error("Chat GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!hasPermission(user.role as Role, Permission.VIEW_DASHBOARD)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { content } = await request.json();

        if (!content || typeof content !== 'string' || !content.trim()) {
            return NextResponse.json({ error: "Invalid content" }, { status: 400 });
        }

        const message = await prisma.adminChatMessage.create({
            data: {
                content: content.trim(),
                userId: user.id
            },
            include: {
                user: {
                    select: {
                        nickname: true,
                        role: true,
                        hasBlueTick: true,
                        verificationTier: true
                    }
                }
            }
        });

        return NextResponse.json(message);

    } catch (error) {
        console.error("Chat POST error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
