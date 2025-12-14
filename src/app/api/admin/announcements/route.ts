import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1] ?? "";
        const payload = await verifyToken(token);

        if (!payload || payload.role !== "ADMIN") {
            return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
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
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.split(" ")[1] ?? "";
        const payload = await verifyToken(token);

        if (!payload || payload.role !== "ADMIN") {
            return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
        }

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
                authorId: payload.userId,
            },
        });

        return NextResponse.json(announcement);
    } catch (error) {
        console.error("Duyuru oluşturulurken hata:", error);
        return NextResponse.json({ error: "Duyuru oluşturulamadı" }, { status: 500 });
    }
}
