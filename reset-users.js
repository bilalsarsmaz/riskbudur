const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetLastSeen() {
    // Set all to yesterday
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await prisma.user.updateMany({
        data: {
            lastSeen: yesterday
        }
    });

    console.log(`Reset lastSeen for ${result.count} users to ${yesterday.toISOString()}`);
}

resetLastSeen()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
