const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Tüm gönderiler siliniyor...');

    try {
        // 1. İlişkili verileri sil (Post silinince hata vermemesi için)
        // Ancak Prisma'da onDelete: Cascade varsa direkt Post silmek yeterli olabilir.
        // Garanti olsun diye manuel siliyoruz.

        console.log('   - Beğeniler siliniyor...');
        await prisma.like.deleteMany({});

        console.log('   - Kaydedilenler siliniyor...');
        await prisma.bookmark.deleteMany({});

        console.log('   - Alıntılar siliniyor...');
        await prisma.quote.deleteMany({});

        console.log('   - Yorumlar siliniyor...');
        await prisma.comment.deleteMany({});

        console.log('   - Bildirimler (Post ile ilgili) siliniyor...');
        await prisma.notification.deleteMany({
            where: {
                postId: { not: null }
            }
        });

        // 2. Postları sil
        console.log('   - Gönderiler (Post) siliniyor...');
        await prisma.post.deleteMany({});

        console.log('✅ İşlem tamamlandı! Tüm gönderiler temizlendi.');
    } catch (error) {
        console.error('❌ Hata oluştu:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
