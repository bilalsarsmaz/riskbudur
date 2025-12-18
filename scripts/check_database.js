const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        const users = await prisma.user.count();
        const posts = await prisma.post.count();
        const comments = await prisma.comment.count();
        const likes = await prisma.like.count();
        const follows = await prisma.follow.count();
        const hashtags = await prisma.hashtag.count();
        const bookmarks = await prisma.bookmark.count();
        const notifications = await prisma.notification.count();
        const quotes = await prisma.quote.count();
        const conversations = await prisma.conversation.count();
        const messages = await prisma.message.count();

        console.log('\n📊 LOCAL DATABASE İSTATİSTİKLERİ:\n');
        console.log('👥 Kullanıcılar:', users);
        console.log('📝 Postlar:', posts);
        console.log('💬 Yorumlar:', comments);
        console.log('❤️  Beğeniler:', likes);
        console.log('👣 Takipler:', follows);
        console.log('#️⃣  Hashtag\'ler:', hashtags);
        console.log('🔖 Kayıtlar:', bookmarks);
        console.log('🔔 Bildirimler:', notifications);
        console.log('🔄 Alıntılar:', quotes);
        console.log('💌 Konuşmalar:', conversations);
        console.log('✉️  Mesajlar:', messages);

        // Admin users
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true, nickname: true, email: true, role: true }
        });

        console.log('\n👑 ADMİN KULLANICILAR:');
        admins.forEach(admin => {
            console.log(`  - ${admin.nickname} (${admin.email}) - ${admin.role}`);
        });

        // Son 5 post
        const recentPosts = await prisma.post.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                content: true,
                createdAt: true,
                author: { select: { nickname: true } }
            }
        });

        console.log('\n📰 SON 5 POST:');
        recentPosts.forEach(post => {
            const preview = post.content.substring(0, 50) + (post.content.length > 50 ? '...' : '');
            console.log(`  - @${post.author.nickname}: "${preview}"`);
        });

    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase();
