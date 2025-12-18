import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyTokenAndUpdateActivity } from "@/lib/auth";

const NOTIFICATIONS_PER_PAGE = 20;

// BigInt serialization helper
function serializeBigInt(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (typeof obj === 'bigint') {
        return obj.toString();
    }
    if (obj instanceof Date) {
        return obj.toISOString();
    }
    if (Array.isArray(obj)) {
        return obj.map(serializeBigInt);
    }
    if (typeof obj === 'object') {
        const serialized: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                serialized[key] = serializeBigInt(obj[key]);
            }
        }
        return serialized;
    }
    return obj;
}

export async function GET(req: Request) {
    try {
        const token = req.headers.get("authorization")?.replace("Bearer ", "");
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyTokenAndUpdateActivity(token);
        if (!decoded) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const userId = decoded.userId;

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const skip = (page - 1) * NOTIFICATIONS_PER_PAGE;

        const notifications = await prisma.notification.findMany({
            where: {
                recipientId: userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: NOTIFICATIONS_PER_PAGE,
            include: {
                actor: {
                    select: {
                        id: true,
                        nickname: true,
                        fullName: true,
                        profileImage: true,
                        hasBlueTick: true,
                        verificationTier: true,
                    },
                },
                post: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        imageUrl: true,
                        mediaUrl: true,
                        isAnonymous: true,
                        linkPreview: true,
                        parentPostId: true,
                        threadRootId: true,
                        author: {
                            select: {
                                id: true,
                                nickname: true,
                                fullName: true,
                                profileImage: true,
                                hasBlueTick: true,
                                verificationTier: true,
                            }
                        },
                        _count: {
                            select: {
                                likes: true,
                                replies: true,
                                quotes: true
                            }
                        },
                        // Note: We can't easily get isLiked/isBookmarked here without more complex queries or a separate mapping step.
                        // For now, we will pass basic data. PostItem might need to fetch its own interaction state or we accept defaults.
                    },
                },
            },
        });

        // BigInt serialization
        const serializedNotifications = serializeBigInt(notifications);

        return NextResponse.json({ notifications: serializedNotifications });
    } catch (error) {
        console.error("Notifications fetch error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
