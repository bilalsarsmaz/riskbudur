import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicateNicknames() {
  const users = await prisma.user.findMany({
    select: { id: true, nickname: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const nicknameGroups: { [key: string]: any[] } = {};
  for (const user of users) {
    const lowerNickname = user.nickname.toLowerCase();
    if (!nicknameGroups[lowerNickname]) {
      nicknameGroups[lowerNickname] = [];
    }
    nicknameGroups[lowerNickname].push(user);
  }

  const duplicates: { [key: string]: any[] } = {};
  for (const [lowerNickname, userList] of Object.entries(nicknameGroups)) {
    if (userList.length > 1) {
      duplicates[lowerNickname] = userList;
    }
  }

  console.log(`Bulunan ${Object.keys(duplicates).length} duplicate nickname grubu:`);
  
  for (const [lowerNickname, userList] of Object.entries(duplicates)) {
    console.log(`\n"${lowerNickname}" için ${userList.length} kullanıcı:`);
    for (const user of userList) {
      console.log(`  - ID: ${user.id}, Nickname: "${user.nickname}", Created: ${user.createdAt}`);
    }
    
    const firstUser = userList[0];
    const keepNickname = firstUser.nickname.toLowerCase();
    
    for (let i = 1; i < userList.length; i++) {
      const user = userList[i];
      const newNickname = keepNickname + `_${i}`;
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { nickname: newNickname },
        });
        console.log(`  ✓ ${user.nickname} -> ${newNickname}`);
      } catch (err) {
        console.error(`  ✗ ${user.nickname} güncellenemedi:`, err);
      }
    }
  }

  console.log('\nTüm nickname\'leri lowercase\'e çeviriliyor...');
  const allUsers = await prisma.user.findMany({
    select: { id: true, nickname: true },
  });
  
  for (const user of allUsers) {
    const lowerNickname = user.nickname.toLowerCase();
    if (user.nickname !== lowerNickname) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { nickname: lowerNickname },
        });
        console.log(`  ✓ ${user.nickname} -> ${lowerNickname}`);
      } catch (err) {
        console.error(`  ✗ ${user.nickname} güncellenemedi:`, err);
      }
    }
  }

  console.log('\nTamamlandı!');
}

fixDuplicateNicknames()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
