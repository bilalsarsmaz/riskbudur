import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET çevre değişkeni tanımlanmamış!");
      return NextResponse.json(
        { message: "Sunucu yapılandırma hatası" },
        { status: 500 }
      );
    }

    const { email, password, nickname } = await req.json();

    // Email kontrolü
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: "Bu e-posta adresi zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Nickname kontrolü
    const existingNickname = await prisma.user.findFirst({
      where: {
        nickname: {
          equals: nickname,
          mode: "insensitive"
        }
      }
    });

    if (existingNickname) {
      return NextResponse.json(
        { message: "Bu kullanıcı adı zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
        fullName: nickname,
      },
    });

    // JWT token oluştur (365 gün geçerli)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    // Response oluştur
    const response = NextResponse.json({
      message: "Kayıt başarılı",
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,

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
    console.error("Kayıt hatası:", error);
    return NextResponse.json(
      { message: "Kayıt sırasında bir hata oluştu", error: String(error) },
      { status: 500 }
    );
  }
}
