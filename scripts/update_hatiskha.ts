import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateNickname() {
  const userId = "cmi51fn5g00006tl6icl6hkuj";
  const newNickname = "hatishka";
  
  console.log("Kullanıcı ID:", userId);
  console.log("Yeni nickname:", newNickname);
  console.log("Güncelleme işlemi başlıyor...\n");
  
  try {
    // Önce "hatishka" nickname'i başka bir kullanıcıda var mı kontrol et
    const existingUser = await prisma.user.findFirst({
      where: {
        nickname: {
          equals: newNickname,
          mode: 'insensitive'
        },
        NOT: {
          id: userId
        }
      }
    });
    
    if (existingUser) {
      console.error(`❌ Hata: "${newNickname}" nickname'i zaten başka bir kullanıcıda kullanılıyor!`);
      return;
    }
    
    // Nickname'i güncelle
    const user = await prisma.user.update({
      where: { id: userId },
      data: { nickname: newNickname }
    });
    
    console.log(`✓ Nickname güncellendi: "${user.nickname}" -> "${newNickname}"`);
    console.log(`✓ Email: ${user.email}`);
    console.log("\n✅ Güncelleme başarılı!");
    
  } catch (error: any) {
    console.error("❌ Hata:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateNickname().catch(console.error);
