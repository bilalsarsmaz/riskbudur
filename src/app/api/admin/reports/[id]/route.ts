import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { role: true }
        });

        if (!user || (user.role !== 'ADMIN' && user.role !== 'ROOTADMIN' && user.role !== 'MODERATOR' && user.role !== 'LEAD')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete report
        await prisma.report.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Delete report error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
