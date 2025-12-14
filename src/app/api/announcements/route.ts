import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Sadece aktif duyurulari getir
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Eger hic duyuru yoksa bos dizi don
    // Frontend zaten bunu handle ediyor

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Duyuru getirme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}