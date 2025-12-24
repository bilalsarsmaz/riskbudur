import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromToken } from "@/lib/auth";

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const username = params.id;
        const visitorId = await getUserIdFromToken(request);

        if (!visitorId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const visitedUser = await prisma.user.findFirst({
            where: {
                nickname: {
                    equals: username,
                    mode: 'insensitive'
                }
            },
            select: { id: true }
        });

        if (!visitedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (visitedUser.id === visitorId) {
            return NextResponse.json({ message: "Self visit ignored" });
        }

        // Upsert visit record (update visitedAt if exists)
        await prisma.profileVisit.upsert({
            where: {
                visitorId_visitedId: {
                    visitorId,
                    visitedId: visitedUser.id
                }
            },
            update: {
                visitedAt: new Date()
            },
            create: {
                visitorId,
                visitedId: visitedUser.id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error recording profile visit:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
