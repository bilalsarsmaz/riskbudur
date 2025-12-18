import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyTokenAndUpdateActivity } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    const decoded = await verifyTokenAndUpdateActivity(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Geçersiz token" },
        { status: 401 }
      );
    }

    // lastSeen is now automatically updated by verifyTokenAndUpdateActivity
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        fullName: true,
        bio: true,
        website: true,
        profileImage: true,
        coverImage: true,
        id: true,
        email: true,
        nickname: true,
        gender: true,
        birthday: true,
        hasBlueTick: true,
        verificationTier: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        isSetupComplete: true,
        isApproved: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...user,
      active: true // Kullanıcı aktif
    });
  } catch (error) {
    console.error("Kullanıcı bilgisi getirme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Kullanıcı bilgilerini güncelle
export async function PUT(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    const decoded = await verifyTokenAndUpdateActivity(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Geçersiz token" },
        { status: 401 }
      );
    }

    const { nickname: rawNickname, fullName, bio, website, email, currentPassword, newPassword, profileImage, coverImage, gender, birthday } = await req.json();
    const nickname = rawNickname ? rawNickname.trim() : undefined;

    // Nickname validasyonu
    if (nickname) {
      if (nickname.length > 15) {
        return NextResponse.json({ error: "Kullanıcı adı en fazla 15 karakter olabilir" }, { status: 400 });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
        return NextResponse.json({ error: "Kullanıcı adı geçersiz karakterler içeriyor" }, { status: 400 });
      }
      const lowerNickname = nickname.toLowerCase();
      if (lowerNickname.includes("admin") || lowerNickname.includes("riskbudur")) {
        return NextResponse.json({ error: "Bu kullanıcı adı alınamaz" }, { status: 400 });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // Şifre hashleme
    let hashedPassword;
    if (currentPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password || "");
      if (!isValidPassword) {
        return NextResponse.json({ message: "Mevcut şifre yanlış" }, { status: 400 });
      }
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    // Benzersizlik Kontrolleri
    if (nickname && nickname !== user.nickname) {
      const existingUser = await prisma.user.findFirst({
        where: { nickname: { equals: nickname, mode: "insensitive" } }
      });
      if (existingUser) {
        return NextResponse.json({ message: "Bu kullanıcı adı kullanımda" }, { status: 400 });
      }
    }

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ message: "Bu e-posta kullanımda" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ...(nickname && { nickname }),
        ...(fullName !== undefined && { fullName }),
        ...(bio !== undefined && { bio }),
        ...(website !== undefined && { website }),
        ...(email && { email }),
        ...(gender !== undefined && { gender }),
        ...(birthday !== undefined && { birthday: birthday ? new Date(birthday) : null }),
        ...(profileImage !== undefined && { profileImage }), // Allow null to delete
        ...(coverImage !== undefined && { coverImage }), // Allow null to delete
        ...(hashedPassword && { password: hashedPassword }),
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        bio: true,
        website: true,
        profileImage: true,
        coverImage: true,
        gender: true,
        birthday: true,
        role: true,
        hasBlueTick: true,
        verificationTier: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Kullanıcı güncelleme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST için PUT'u kullan (uyumluluk için)
export async function POST(req: Request) {
  return PUT(req);
}
