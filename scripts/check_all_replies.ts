import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllReplies() {
  // Post 65 ile ilgili TÜM postları bul (herhangi bir şekilde bağlı olanlar)
  const allPosts = await prisma.post.findMany({
    where: {
      OR: [
        { id: 65 },
        { threadRootId: 65 },
        { parentPostId: 65 },
        { parentPostId: { in: [66, 67, 68] } }, // Post 65'in yanıtlarının yanıtları
      ],
    },
    select: {
      id: true,
      parentPostId: true,
      threadRootId: true,
      content: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`Post 65 ile ilgili tüm postlar (${allPosts.length} adet):`);
  allPosts.forEach(post => {
    console.log(`  Post ${post.id}: parentPostId=${post.parentPostId}, threadRootId=${post.threadRootId}, content="${post.content?.substring(0, 30)}..."`);
  });
}

checkAllReplies()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
