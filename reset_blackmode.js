
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
  const nickname = "Blackmode";
  const newPassword = "123456";
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const user = await prisma.user.update({
      where: { nickname: nickname },
      data: { password: hashedPassword },
    });
    console.log(`Password for @${nickname} has been reset to: ${newPassword}`);
  } catch (error) {
    if (error.code === 'P2025') {
       console.log(`User @${nickname} not found.`);
    } else {
       console.error("Error resetting password:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
