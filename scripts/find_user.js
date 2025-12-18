const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUser() {
    const nickname = process.argv[2];
    if (!nickname) {
        console.log("Usage: node find_user.js <nickname>");
        return;
    }

    const user = await prisma.user.findFirst({
        where: { nickname: { equals: nickname, mode: 'insensitive' } }
    });

    if (user) {
        console.log(`FOUND: ${user.email}`);
    } else {
        console.log("User not found");
    }
}

findUser();
