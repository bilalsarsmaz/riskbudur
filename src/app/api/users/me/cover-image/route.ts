import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Yetkilendirme gerekli" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Geçersiz token" }, { status: 401 });
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

    const userId = String(decoded.userId);
    const fileName = `${userId}-${Date.now()}${path.extname(image.name)}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/covers/${fileName}`;

    await prisma.user.update({
      where: { id: decoded.userId },
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
