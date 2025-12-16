const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveAll() {
  console.log('Approving all existing users...');
  const result = await prisma.user.updateMany({
    data: { isApproved: true }
  });
  console.log(`Updated ${result.count} users to approved status.`);
}

approveAll()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
