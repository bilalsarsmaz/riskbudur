import { NextResponse } from "next/server";

// Örnek duyurular - gerçek uygulamada veritabanından çekilir
const announcements = [
  {
    id: "1",
    content: "Nown platformuna hoş geldiniz! Burada düşüncelerinizi özgürce paylaşabilirsiniz.",
    createdAt: new Date().toISOString(),
    authorName: "Admin"
  },
  {
    id: "2",
    content: "Yeni özellik: Artık postlarınızı anonim olarak paylaşabilirsiniz!",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
    authorName: "Sistem"
  },
  {
    id: "3",
    content: "Topluluk kurallarımızı güncelledik. Lütfen gözden geçirin.",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 gün önce
    authorName: "Moderatör"
  }
];

export async function GET() {
  try {
    // Gerçek uygulamada veritabanından duyurular çekilir
    // Örneğin:
    // const prisma = new PrismaClient();
    // const announcements = await prisma.announcement.findMany({
    //   orderBy: { createdAt: 'desc' },
    //   take: 5
    // });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Duyuru getirme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
} 