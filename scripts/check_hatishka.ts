import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    where: {
      nickname: {
        contains: 'hatishka',
        mode: 'insensitive'
      }
    },
    orderBy: {
      createdAt: 'asc'
    },
    select: {
      id: true,
      nickname: true,
      email: true,
      createdAt: true
    }
  });
  
  console.log("=== HATISHKA KULLANICILARI ===");
  console.log(JSON.stringify(users, null, 2));
  
  await prisma.$disconnect();
}

checkUsers().catch(console.error);
