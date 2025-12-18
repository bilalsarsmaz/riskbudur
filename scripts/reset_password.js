const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
    // Usage: node scripts/reset_password.js <email> <new_password>
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Usage: node scripts/reset_password.js <email> <new_password>');
        process.exit(1);
    }

    const email = args[0];
    const newPassword = args[1];

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.error(`❌ User not found with email: ${email}`);
            process.exit(1);
        }

        console.log(`🔐 Hesaplanıyor: ${user.d ? user.d : user.fullName || user.username} (${email})`);

        // Hash password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
            },
        });

        console.log(`✅ Şifre başarıyla güncellendi!`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Yeni Şifre: ${newPassword}`);

    } catch (error) {
        console.error('❌ Hata oluştu:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
