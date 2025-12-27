import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
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

        // Fetch reports
        const reports = await prisma.report.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                reporter: {
                    select: {
                        id: true,
                        nickname: true,
                        profileImage: true
                    }
                },
                reportedPost: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                nickname: true,
                                fullName: true,
                                profileImage: true,
                                isBanned: true
                            }
                        }
                    }
                }
            }
        });

        // Serialize BigInt
        const serializedReports = reports.map(report => ({
            ...report,
            reportedPostId: report.reportedPostId.toString(),
            reportedPost: {
                ...report.reportedPost,
                id: report.reportedPost.id.toString(),
                // Handle other BigInts if any in Post
                likes: undefined, // remove or serialize relations if deeply needed
                comments: undefined,
                threadRootId: report.reportedPost.threadRootId?.toString(),
                parentPostId: report.reportedPost.parentPostId?.toString()
            }
        }));

        return NextResponse.json(serializedReports);

    } catch (error) {
        console.error("Fetch reports error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
