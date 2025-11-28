import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateNickname() {
  try {
    // Eski nickname ile kullanıcıyı bul
    const user = await prisma.user.findFirst({
      where: {
        nickname: {
          equals: "kapanmayangöz",
          mode: "insensitive"
        }
      }
    });

    if (!user) {
      console.log("❌ Kullanıcı bulunamadı: kapanmayangöz");
      return;
    }

    console.log(`✅ Kullanıcı bulundu: ID=${user.id}, Nickname=${user.nickname}`);

    // Yeni nickname'in kullanılabilir olup olmadığını kontrol et
    const existingUser = await prisma.user.findFirst({
      where: {
        nickname: {
          equals: "kapanmayangoz",
          mode: "insensitive"
        }
      }
    });

    if (existingUser && existingUser.id !== user.id) {
      console.log("❌ Yeni nickname zaten kullanılıyor: kapanmayangoz");
      return;
    }

    // Nickname'i güncelle
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        nickname: "kapanmayangoz"
      }
    });

    console.log(`✅ Kullanıcı adı güncellendi: ${user.nickname} -> ${updatedUser.nickname}`);
  } catch (error) {
    console.error("❌ Hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateNickname();
