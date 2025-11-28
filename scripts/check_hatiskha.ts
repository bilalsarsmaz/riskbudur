import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findFirst({
    where: {
      nickname: {
        equals: 'hatiskha',
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      nickname: true,
      email: true,
      createdAt: true
    }
  });
  
  console.log("=== HATISKHA KULLANICISI ===");
  console.log(JSON.stringify(user, null, 2));
  
  await prisma.$disconnect();
}

checkUser().catch(console.error);
