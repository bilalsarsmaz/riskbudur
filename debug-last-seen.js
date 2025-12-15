const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
    const users = await prisma.user.findMany({
        select: {
            nickname: true,
            lastSeen: true,
            updatedAt: true
        },
        orderBy: {
            lastSeen: 'desc'
        }
    });

    console.log("Current Time:", new Date().toISOString());
    console.log("10 Mins Ago:", new Date(Date.now() - 10 * 60 * 1000).toISOString());
    console.log("\nUsers:");
    users.forEach(u => {
        console.log(`${u.nickname}: LastSeen=${u.lastSeen?.toISOString()} (Diff: ${u.lastSeen ? (Date.now() - u.lastSeen.getTime()) / 60000 : 'N/A'} mins ago)`);
    });
}

checkUsers()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
