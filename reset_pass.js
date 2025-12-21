const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword() {
    try {
        const email = 'choice@riskbudur.net';
        const newPassword = '123456';

        // Hash the password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Find and update user
        const user = await prisma.user.update({
            where: { email: email },
            data: { password: hashedPassword }
        });

        console.log(`Password for ${user.email} (ID: ${user.id}) has been reset to '${newPassword}'`);
    } catch (error) {
        if (error.code === 'P2025') {
            console.error("Error: User with this email does not exist.");
        } else {
            console.error("Error resetting password:", error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
