import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: announcementId } = await params;

        // Admin yetki kontrolü
        const authResult = await verifyAdmin(request);
        if (authResult.error) {
            return authResult.error;
        }

        const { isActive, content } = await request.json();

        // Eğer bu duyuru aktif yapılıyorsa, diğerlerini pasif yap
        if (isActive) {
            await prisma.announcement.updateMany({
                where: {
                    isActive: true,
                    NOT: { id: announcementId }
                },
                data: { isActive: false },
            });
        }

        const announcement = await prisma.announcement.update({
            where: { id: announcementId },
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
        const { id: announcementId } = await params;

        // Admin yetki kontrolü
        const authResult = await verifyAdmin(request);
        if (authResult.error) {
            return authResult.error;
        }

        await prisma.announcement.delete({
            where: { id: announcementId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Duyuru silinirken hata:", error);
        return NextResponse.json({ error: "Duyuru silinemedi" }, { status: 500 });
    }
}
