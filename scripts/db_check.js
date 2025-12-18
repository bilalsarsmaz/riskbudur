const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPost() {
    const id = 124n; // Sizin belirttiğiniz ID
    const post = await prisma.post.findUnique({
        where: { id },
        include: { author: true }
    });

    if (!post) {
        console.log("HATA: Post bulunamadı!");
    } else {
        console.log("POST VERİSİ (DB):", {
            id: post.id.toString(),
            content: post.content,
            mediaUrl: post.mediaUrl,
            imageUrl: post.imageUrl,
            parentPostId: post.parentPostId?.toString(),
            author: post.author.nickname
        });
    }
    await prisma.$disconnect();
}

checkPost();
