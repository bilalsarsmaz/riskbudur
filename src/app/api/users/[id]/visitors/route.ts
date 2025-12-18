import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const username = params.id;

        const user = await prisma.user.findUnique({
            where: { nickname: username },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const visitors = await prisma.profileVisit.findMany({
            where: { visitedId: user.id },
            orderBy: { visitedAt: "desc" },
            take: 12,
            include: {
                visitor: {
                    select: {
                        nickname: true,
                        fullName: true,
                        profileImage: true
                    }
                }
            }
        });

        return NextResponse.json({ visitors: visitors.map((v: any) => v.visitor) });
    } catch (error) {
        console.error("Error fetching profile visitors:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
