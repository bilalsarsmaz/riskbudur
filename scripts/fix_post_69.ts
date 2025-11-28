import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPost69() {
  // Post 69'un threadRootId'sini düzelt
  await prisma.post.update({
    where: { id: 69 },
    data: { threadRootId: 65 },
  });

  console.log('Post 69 düzeltildi: threadRootId = 65');
  
  // Şimdi tüm threadRootId değerlerini kontrol et ve düzelt
  // threadRootId değeri parent'ın threadRootId'si ile eşleşmeyen yanıtları bul
  const allReplies = await prisma.post.findMany({
    where: {
      parentPostId: { not: null },
    },
    select: {
      id: true,
      parentPostId: true,
      threadRootId: true,
    },
  });

  let fixedCount = 0;
  for (const reply of allReplies) {
    if (!reply.parentPostId) continue;

    const parent = await prisma.post.findUnique({
      where: { id: reply.parentPostId },
      select: { threadRootId: true, id: true },
    });

    if (parent) {
      const correctThreadRootId = parent.threadRootId || parent.id;
      
      if (reply.threadRootId !== correctThreadRootId) {
        await prisma.post.update({
          where: { id: reply.id },
          data: { threadRootId: correctThreadRootId },
        });
        console.log(`Post ${reply.id}: threadRootId ${reply.threadRootId} -> ${correctThreadRootId}`);
        fixedCount++;
      }
    }
  }

  console.log(`\nToplam ${fixedCount} post düzeltildi.`);
}

fixPost69()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
