import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET(request: Request) {
    try {
        // Admin yetki kontrolü
        const authResult = await verifyAdmin(request);
        if (authResult.error) {
            return authResult.error;
        }

        const announcements = await prisma.announcement.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                author: {
                    select: {
                        fullName: true,
                        nickname: true,
                    }
                }
            }
        });

        return NextResponse.json(announcements);
    } catch (error) {
        console.error("Duyurular listelenirken hata:", error);
        return NextResponse.json({ error: "Duyurular yüklenemedi" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        // Admin yetki kontrolü
        const authResult = await verifyAdmin(request);
        if (authResult.error) {
            return authResult.error;
        }
        const userId = authResult.user!.id;

        const { content, isActive } = await request.json();

        if (!content) {
            return NextResponse.json({ error: "İçerik gerekli" }, { status: 400 });
        }

        // Eğer yeni duyuru aktifse, diğer tüm duyuruları pasif yap
        if (isActive) {
            await prisma.announcement.updateMany({
                where: { isActive: true },
                data: { isActive: false },
            });
        }

        const announcement = await prisma.announcement.create({
            data: {
                content,
                isActive: isActive || false,
                authorId: userId,
            },
        });

        return NextResponse.json(announcement);
    } catch (error) {
        console.error("Duyuru oluşturulurken hata:", error);
        return NextResponse.json({ error: "Duyuru oluşturulamadı" }, { status: 500 });
    }
}
