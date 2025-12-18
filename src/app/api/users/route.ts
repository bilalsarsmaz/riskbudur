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

        const search = searchParams.get("search");

        const where: any = {};

        if (search) {
            where.OR = [
                { nickname: { contains: search, mode: "insensitive" } },
                { fullName: { contains: search, mode: "insensitive" } }
            ];
        } else {
            // If no search, maybe prioritize active users or just most followed?
            // User asked for "highest interaction" -> Followers is a good proxy.
            // Also maybe only active ones?
            // Let's keep it simple: all users, sorted by followers.
        }

        const users = await prisma.user.findMany({
            take: limit,
            where,
            orderBy: search ? undefined : [
                { followers: { _count: "desc" } },
                { lastSeen: "desc" }
            ],
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
