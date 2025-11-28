import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPost65() {
  // Post 65'in kendisini kontrol et
  const post65 = await prisma.post.findUnique({
    where: { id: 65 },
    select: {
      id: true,
      threadRootId: true,
      parentPostId: true,
      content: true,
    },
  });

  console.log('Post 65:', post65);

  // Post 65'in yanıtlarını kontrol et
  const replies = await prisma.post.findMany({
    where: {
      OR: [
        { threadRootId: 65 },
        { parentPostId: 65 },
      ],
    },
    select: {
      id: true,
      parentPostId: true,
      threadRootId: true,
      content: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`\nPost 65'in yanıtları (${replies.length} adet):`);
  replies.forEach(reply => {
    console.log(`  Post ${reply.id}: parentPostId=${reply.parentPostId}, threadRootId=${reply.threadRootId}`);
  });

  // threadRootId = 65 olanları say
  const countByThreadRoot = await prisma.post.count({
    where: { threadRootId: 65 },
  });

  // parentPostId = 65 olanları say
  const countByParent = await prisma.post.count({
    where: { parentPostId: 65 },
  });

  console.log(`\nthreadRootId = 65 olan yanıtlar: ${countByThreadRoot}`);
  console.log(`parentPostId = 65 olan yanıtlar: ${countByParent}`);
}

checkPost65()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
