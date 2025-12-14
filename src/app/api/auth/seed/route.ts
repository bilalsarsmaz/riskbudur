import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {

    // Test kullanıcısı oluştur
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Önce kullanıcının var olup olmadığını kontrol et
    let user = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "test@example.com",
          password: hashedPassword,
          nickname: "testuser",
          role: "USER",
          hasBlueTick: true,
          posts: {
            create: [
              {
                content: "Merhaba! Bu bir test postudur. #test #merhaba",
                isAnonymous: false
              },
              {
                content: "Nown platformuna hoş geldiniz! #nown",
                isAnonymous: false
              },
              {
                content: "Bu bir anonim post örneğidir.",
                isAnonymous: true
              }
            ]
          }
        },
      });
    }

    // Örnek postlar oluştur

    const posts = await Promise.all([
      prisma.post.create({
        data: {
          content: "Merhaba! Bu bir test postudur. #test #merhaba",
          authorId: user.id,
          isAnonymous: false
        },
      }),
      prisma.post.create({
        data: {
          content: "Nown platformuna hoş geldiniz! Burada düşüncelerinizi özgürce paylaşabilirsiniz. #nown #hoşgeldiniz",
          authorId: user.id,
          isAnonymous: false
        },
      }),
      prisma.post.create({
        data: {
          content: "Bu bir anonim post örneğidir.",
          authorId: user.id,
          isAnonymous: true
        },
      }),
      prisma.post.create({
        data: {
          content: "Yazılım geliştirme hakkında düşüncelerimi paylaşıyorum. Clean code önemlidir! #yazılım #cleancode",
          authorId: user.id,
          isAnonymous: false
        },
      }),
      prisma.post.create({
        data: {
          content: "Yapay zeka teknolojileri hakkında ne düşünüyorsunuz? #ai #teknoloji",
          authorId: user.id,
          isAnonymous: false
        },
      })
    ]);

    return NextResponse.json({
      message: "Test verileri başarıyla oluşturuldu",
      user: {
        email: user.email,
        nickname: user.nickname,
      },
      posts: posts.length
    });
  } catch (error) {
    console.error("Seed hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu", error: String(error) },
      { status: 500 }
    );
  }
} 