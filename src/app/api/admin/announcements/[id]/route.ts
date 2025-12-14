import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1] ?? "";
        const payload = await verifyToken(token);

        if (!payload || payload.role !== "ADMIN") {
            return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
        }

        const { isActive, content } = await request.json();

        // Eğer bu duyuru aktif yapılıyorsa, diğerlerini pasif yap
        if (isActive) {
            await prisma.announcement.updateMany({
                where: {
                    isActive: true,
                    NOT: { id: params.id }
                },
                data: { isActive: false },
            });
        }

        const announcement = await prisma.announcement.update({
            where: { id: params.id },
            data: {
                isActive,
                content
            },
        });

        return NextResponse.json(announcement);
    } catch (error) {
        console.error("Duyuru güncellenirken hata:", error);
        return NextResponse.json({ error: "Duyuru güncellenemedi" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1] ?? "";
        const payload = await verifyToken(token);

        if (!payload || payload.role !== "ADMIN") {
            return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
        }

        await prisma.announcement.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Duyuru silinirken hata:", error);
        return NextResponse.json({ error: "Duyuru silinemedi" }, { status: 500 });
    }
}
