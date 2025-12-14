import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET çevre değişkeni tanımlanmamış!");
      return NextResponse.json(
        { message: "Sunucu yapılandırma hatası" },
        { status: 500 }
      );
    }

    const { email, password } = await req.json();

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Şifreyi kontrol et
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "Geçersiz şifre" },
        { status: 401 }
      );
    }

    // Kullanıcı banlı mı kontrol et
    if (user.isBanned) {
      return NextResponse.json(
        { message: "Hesabınız banlanmış durumda" },
        { status: 403 }
      );
    }

    // JWT token oluştur (365 gün geçerli)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    // Response oluştur
    const response = NextResponse.json({
      message: "Giriş başarılı",
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        hasBlueTick: user.hasBlueTick,
        fullName: user.fullName,
        profileImage: user.profileImage,
      },
    });

    // Cookie'ye token'ı kaydet (365 gün - sadece logout ile silinir)
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Giriş hatası:", error);
    return NextResponse.json(
      { message: "Giriş sırasında bir hata oluştu", error: String(error) },
      { status: 500 }
    );
  }
}
