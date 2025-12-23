import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { hasPermission, Permission, Role } from "@/lib/permissions";

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token) as { userId: string, role: string };
        if (!decoded) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // APPROVE_USER permission check
        // Assuming verifyToken returns role. 
        if (!hasPermission(decoded.role as Role, Permission.APPROVE_USER)) {
            return NextResponse.json({ error: "Forbidden: No approve permission" }, { status: 403 });
        }

        const pendingUsers = await prisma.user.findMany({
            where: {
                isApproved: false,
                // Optional: Only show users who completed setup? 
                // OR show everyone. Let's show everyone so we can catch spammers early.
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                nickname: true,
                email: true,
                fullName: true,
                profileImage: true,
                createdAt: true,
                isSetupComplete: true
            }
        });

        return NextResponse.json(pendingUsers);
    } catch (error) {
        console.error("Error fetching approvals:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token) as { userId: string, role: string };
        if (!decoded) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!hasPermission(decoded.role as Role, Permission.APPROVE_USER)) {
            return NextResponse.json({ error: "Forbidden: No approve permission" }, { status: 403 });
        }

        const { userId, action } = await req.json();

        if (!userId || !['APPROVE', 'REJECT'].includes(action)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        if (action === 'APPROVE') {
            await prisma.user.update({
                where: { id: userId },
                data: { isApproved: true }
            });
            return NextResponse.json({ message: "User approved" });
        } else {
            // REJECT -> Delete user
            await prisma.user.delete({
                where: { id: userId }
            });
            return NextResponse.json({ message: "User rejected and deleted" });
        }

    } catch (error) {
        console.error("Error processing approval:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
