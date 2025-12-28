import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { hasPermission, Permission, Role, canManageRole } from "@/lib/permissions";

export const dynamic = 'force-dynamic';

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ message: "Yetkilendirme gerekli" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: "Geçersiz token" }, { status: 401 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true }
        });

        if (!currentUser) {
            return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        let targetUser = await prisma.user.findFirst({ where: { id: params.id } });
        if (!targetUser) {
            targetUser = await prisma.user.findFirst({
                where: { nickname: { equals: params.id, mode: "insensitive" } }
            });
        }

        if (!targetUser) {
            return NextResponse.json({ message: "Hedef kullanıcı bulunamadı" }, { status: 404 });
        }

        if (currentUser.id !== targetUser.id) {
            const canManage = hasPermission(currentUser.role as Role, Permission.MANAGE_USER_COVER);
            const isHigher = canManageRole(currentUser.role as Role, targetUser.role as Role);

            if (!canManage || !isHigher) {
                return NextResponse.json({ message: "Yetkisiz işlem" }, { status: 403 });
            }
        }

        const formData = await req.formData();
        const image = formData.get("image") as File;

        if (!image) {
            return NextResponse.json({ message: "Görsel gerekli" }, { status: 400 });
        }

        if (image.size > 15 * 1024 * 1024) {
            return NextResponse.json({ message: "Dosya boyutu çok büyük (max 15MB)" }, { status: 400 });
        }

        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'covers');
        await mkdir(uploadDir, { recursive: true });

        const userId = String(targetUser.id);
        const fileName = `${userId}-${Date.now()}${path.extname(image.name)}`;
        const filePath = path.join(uploadDir, fileName);

        await writeFile(filePath, buffer);

        const imageUrl = `/uploads/covers/${fileName}`;

        await prisma.user.update({
            where: { id: targetUser.id },
            data: { coverImage: imageUrl },
        });

        return NextResponse.json({ imageUrl });
    } catch (error) {
        console.error("Kapak fotoğrafı yükleme hatası:", error);
        return NextResponse.json({
            message: "Bir hata oluştu",
            error: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
