import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("authorization")?.replace("Bearer ", "");
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const count = await prisma.notification.count({
            where: {
                recipientId: decoded.userId,
                read: false,
            },
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Notification count error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
