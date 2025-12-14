import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// Kullanıcıyı takip et
export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Geçersiz token" },
        { status: 401 }
      );
    }

    const { followingId } = await req.json();

    // Kendini takip edemezsin
    if (decoded.userId === followingId) {
      return NextResponse.json(
        { message: "Kendinizi takip edemezsiniz" },
        { status: 400 }
      );
    }

    // Takip edilecek kullanıcının var olup olmadığını kontrol et
    const followingUser = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!followingUser) {
      return NextResponse.json(
        { message: "Takip edilecek kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Zaten takip edilip edilmediğini kontrol et
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: decoded.userId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { message: "Bu kullanıcıyı zaten takip ediyorsunuz" },
        { status: 400 }
      );
    }

    // Takip oluştur
    const follow = await prisma.follow.create({
      data: {
        followerId: decoded.userId,
        followingId,
      },
    });

    // Bildirim oluştur
    await prisma.notification.create({
      data: {
        type: 'FOLLOW',
        actorId: decoded.userId,
        recipientId: followingId,
      },
    });

    return NextResponse.json(follow, { status: 201 });
  } catch (error) {
    console.error("Takip etme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Takibi bırak
export async function DELETE(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Geçersiz token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const followingId = searchParams.get("followingId");

    if (!followingId) {
      return NextResponse.json(
        { message: "Takip edilen kullanıcı ID'si gerekli" },
        { status: 400 }
      );
    }

    // Takibi bul
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: decoded.userId,
          followingId,
        },
      },
    });

    if (!follow) {
      return NextResponse.json(
        { message: "Takip bulunamadı" },
        { status: 404 }
      );
    }

    // Bildirimi kaldır (varsa)
    await prisma.notification.deleteMany({
      where: {
        type: 'FOLLOW',
        actorId: decoded.userId,
        recipientId: followingId,
      },
    });

    // Takibi kaldır
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: decoded.userId,
          followingId,
        },
      },
    });

    return NextResponse.json(
      { message: "Takip başarıyla kaldırıldı" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Takip kaldırma hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
} 