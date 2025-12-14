import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const announcement = await prisma.announcement.findFirst({
            where: {
                isActive: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return NextResponse.json(announcement);
    } catch (error) {
        console.error("Duyuru çekilirken hata:", error);
        return NextResponse.json({ error: "Duyuru yüklenemedi" }, { status: 500 });
    }
}
