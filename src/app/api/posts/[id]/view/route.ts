import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyTokenAndUpdateActivity } from "@/lib/auth";

// Track post view
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const postId = BigInt(params.id);

        // Optional: Verify user (but allow anonymous views)
        const token = req.headers.get("authorization")?.replace("Bearer ", "");
        let userId: string | null = null;

        if (token) {
            try {
                const decoded = await verifyTokenAndUpdateActivity(token);
                userId = decoded?.userId || null;
            } catch (error) {
                // Continue without user (anonymous view)
            }
        }

        // Increment view count
        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: {
                viewCount: {
                    increment: 1
                }
            },
            select: {
                viewCount: true
            }
        });

        return NextResponse.json({
            success: true,
            viewCount: updatedPost.viewCount
        });
    } catch (error) {
        console.error("View tracking error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to track view" },
            { status: 500 }
        );
    }
}
