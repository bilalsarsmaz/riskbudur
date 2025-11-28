// Migration: Eski yanıtların threadRootId değerlerini düzelt
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixThreadRootIds() {
  // Tüm yanıtları al (parentPostId'si olan postlar)
  const replies = await prisma.post.findMany({
    where: {
      parentPostId: { not: null },
      threadRootId: null, // threadRootId olmayan yanıtlar
    },
    select: {
      id: true,
      parentPostId: true,
    },
  });

  console.log(`Bulunan ${replies.length} yanıt threadRootId düzeltilecek`);

  for (const reply of replies) {
    if (!reply.parentPostId) continue;

    // Parent post'u bul
    const parent = await prisma.post.findUnique({
      where: { id: reply.parentPostId },
      select: { threadRootId: true, id: true },
    });

    if (parent) {
      // Parent'ın threadRootId'si varsa onu kullan, yoksa parent'ın kendi ID'sini kullan
      const threadRootId = parent.threadRootId || parent.id;

      await prisma.post.update({
        where: { id: reply.id },
        data: { threadRootId },
      });

      console.log(`Post ${reply.id}: threadRootId = ${threadRootId}`);
    }
  }

  console.log('Tamamlandı!');
}

fixThreadRootIds()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
