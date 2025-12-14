import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function PUT(req: Request) {
    try {
        const token = req.headers.get("authorization")?.replace("Bearer ", "");
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        let userId: string;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            userId = decoded.userId;
        } catch {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const body = await req.json();
        const { notificationIds } = body;

        if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
            return NextResponse.json({ message: "Invalid notification IDs" }, { status: 400 });
        }

        // Verify these notifications belong to the user
        await prisma.notification.updateMany({
            where: {
                id: {
                    in: notificationIds,
                },
                recipientId: userId,
            },
            data: {
                read: true,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Mark as read error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
