import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log("Test verileri oluşturuluyor...");

    // Test kullanıcısı oluştur
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    // Önce kullanıcının var olup olmadığını kontrol et
    let user = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });
    
    if (!user) {
      console.log("Test kullanıcısı oluşturuluyor...");
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
      console.log("Test kullanıcısı oluşturuldu:", user);
    }
    
    // Örnek postlar oluştur
    console.log("Örnek postlar oluşturuluyor...");
    
    const posts = await Promise.all([
      prisma.post.create({
        data: {
          content: "Merhaba! Bu bir test postudur. #test #merhaba",
          userId: user.id,
          isAnonymous: false
        },
      }),
      prisma.post.create({
        data: {
          content: "Nown platformuna hoş geldiniz! Burada düşüncelerinizi özgürce paylaşabilirsiniz. #nown #hoşgeldiniz",
          userId: user.id,
          isAnonymous: false
        },
      }),
      prisma.post.create({
        data: {
          content: "Bu bir anonim post örneğidir.",
          userId: user.id,
          isAnonymous: true
        },
      }),
      prisma.post.create({
        data: {
          content: "Yazılım geliştirme hakkında düşüncelerimi paylaşıyorum. Clean code önemlidir! #yazılım #cleancode",
          userId: user.id,
          isAnonymous: false
        },
      }),
      prisma.post.create({
        data: {
          content: "Yapay zeka teknolojileri hakkında ne düşünüyorsunuz? #ai #teknoloji",
          userId: user.id,
          isAnonymous: false
        },
      })
    ]);

    console.log("Örnek postlar oluşturuldu:", posts);
    
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