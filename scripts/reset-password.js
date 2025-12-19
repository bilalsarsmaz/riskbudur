
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetPassword(email, newPassword) {
    try {
        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Kullanıcıyı güncelle
        const updatedUser = await prisma.user.update({
            where: { email: email },
            data: { password: hashedPassword },
        });

        console.log(`✅ Başarılı! Kullanıcı: ${updatedUser.email} şifresi güncellendi.`);
    } catch (error) {
        if (error.code === 'P2025') {
            console.error(`❌ Hata: '${email}' e-posta adresine sahip kullanıcı bulunamadı.`);
        } else {
            console.error('❌ Beklenmeyen bir hata oluştu:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Kullanım: node reset-password.js <email> <yeni_sifre>
const args = process.argv.slice(2);
const email = args[0] || 'choice@riskbudur.net';
const password = args[1] || '123456'; // Varsayılan şifre

console.log(`🔄 Şifre sıfırlama başlatılıyor...`);
console.log(`👤 Kullanıcı: ${email}`);
console.log(`🔑 Yeni Şifre: ${password}`);

resetPassword(email, password);
