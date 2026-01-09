import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        const validRoles = ['ADMIN', 'ROOTADMIN', 'MODERATOR'];
        if (!decoded || !decoded.role || !validRoles.includes(decoded.role as string)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const [totalUsers, totalPosts, activeUsers, pendingVerificationRequests, pendingApprovals] = await Promise.all([
            prisma.user.count(),
            prisma.post.count(),
            prisma.user.count({
                where: {
                    lastSeen: {
                        gte: yesterday
                    }
                }
            }),
            prisma.verificationRequest.count({
                where: {
                    status: "PENDING"
                }
            }),
            prisma.user.count({
                where: {
                    isApproved: false
                }
            })
        ]);

        return NextResponse.json({
            totalUsers,
            totalPosts,
            totalReports: 0,
            activeUsers,
            pendingUsers: pendingApprovals,
            pendingBadges: pendingVerificationRequests
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
