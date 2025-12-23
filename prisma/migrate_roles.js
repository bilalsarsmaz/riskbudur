
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const superAdmins = await prisma.user.updateMany({
        where: { role: 'SUPERADMIN' },
        data: { role: 'ROOTADMIN' }
    });
    console.log(`Updated ${superAdmins.count} SUPERADMIN users to ROOTADMIN.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
