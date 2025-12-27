import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { postId, reason, details } = body;

        if (!postId || !reason) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if post exists
        const post = await prisma.post.findUnique({
            where: { id: BigInt(postId) }
        });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Create report
        const report = await prisma.report.create({
            data: {
                reason,
                details: details || "",
                reporterId: payload.userId,
                reportedPostId: BigInt(postId),
            }
        });

        return NextResponse.json({ success: true, report: { id: report.id } });
    } catch (error) {
        console.error("Report creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
