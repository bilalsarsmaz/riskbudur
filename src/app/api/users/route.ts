import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyTokenAndUpdateActivity } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ message: "Yetkilendirme gerekli" }, { status: 401 });
        }

        const decoded = await verifyTokenAndUpdateActivity(token);
        if (!decoded) {
            return NextResponse.json({ message: "Geçersiz token" }, { status: 401 });
        }

        const searchParams = new URL(req.url).searchParams;
        const limit = parseInt(searchParams.get("limit") || "50");
        const search = searchParams.get("search");

        const mode = searchParams.get("mode"); // "search" or undefined

        // Calculate timestamp for 10 minutes ago
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        const where: any = {};

        // If NOT in search mode, only show active users
        if (mode !== "search") {
            where.lastSeen = {
                gte: tenMinutesAgo
            };
        }

        if (search) {
            // Mention aramasında kendimizi gösterme
            if (mode === "search") {
                where.NOT = {
                    id: decoded.userId
                };
            }

            where.AND = [
                {
                    OR: [
                        { nickname: { contains: search, mode: "insensitive" } },
                        { fullName: { contains: search, mode: "insensitive" } }
                    ]
                }
            ];
        }

        const users = await prisma.user.findMany({
            take: limit,
            where,
            orderBy: [
                { lastSeen: "desc" }, // Most recently active first
                { followers: { _count: "desc" } }
            ],
            select: {
                id: true,
                nickname: true,
                fullName: true,
                profileImage: true,
                verificationTier: true,
                hasBlueTick: true,
                role: true,
                lastSeen: true // Include for debugging if needed
            }
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Users fetch error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
