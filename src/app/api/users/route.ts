import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];
        // Optional: Protect this route? The request implies "people currently on site", so public or logged-in.
        // Explore page usually requires login in this app.
        if (!token) {
            return NextResponse.json({ message: "Yetkilendirme gerekli" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: "Geçersiz token" }, { status: 401 });
        }

        const searchParams = new URL(req.url).searchParams;
        const limit = parseInt(searchParams.get("limit") || "50");

        // 10 dakika oncesi - Active User Logic
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        const users = await prisma.user.findMany({
            take: limit,
            where: {
                lastSeen: {
                    gte: tenMinutesAgo
                }
            },
            orderBy: {
                lastSeen: "desc",
            },
            select: {
                id: true,
                nickname: true,
                fullName: true,
                profileImage: true,
                verificationTier: true,
                hasBlueTick: true
            }
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Users fetch error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
