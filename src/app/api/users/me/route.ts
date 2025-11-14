import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Kullanıcı bilgilerini getir
export async function GET(req: Request) {
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
        role: true,
        hasBlueTick: true,
        createdAt: true,
        updatedAt: true,
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
        { message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
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

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Geçersiz token" },
        { status: 401 }
      );
    }

    const { nickname, fullName, bio, website, email, currentPassword, newPassword } = await req.json();

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Şifre değişikliği istenmişse
    let hashedPassword;
    if (currentPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { message: "Mevcut şifre yanlış" },
          { status: 400 }
        );
      }
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    // Kullanıcı adı değişikliği istenmişse ve bu kullanıcı adı başkası tarafından kullanılıyorsa
    if (nickname && nickname !== user.nickname) {
      const existingUser = await prisma.user.findUnique({
        where: { nickname },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "Bu kullanıcı adı zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // Email değişikliği istenmişse ve bu email başkası tarafından kullanılıyorsa
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "Bu e-posta zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        ...(nickname && { nickname }),
        ...(fullName !== undefined && { fullName }),
        ...(bio !== undefined && { bio }),
        ...(website !== undefined && { website }),
        ...(email && { email }),
        ...(hashedPassword && { password: hashedPassword }),
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        fullName: true,
        bio: true,
        website: true,
        profileImage: true,
        coverImage: true,
        role: true,
        hasBlueTick: true,
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
