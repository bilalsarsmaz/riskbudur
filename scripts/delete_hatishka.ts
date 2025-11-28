import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUser() {
  const userId = "cmhc5bi9u0002roxum9bqezxs";
  
  console.log("Kullanıcı ID:", userId);
  console.log("Silme işlemi başlıyor...\n");
  
  try {
    // 0. Kullanıcının gönderilerini bul
    const userPosts = await prisma.post.findMany({
      where: { authorId: userId },
      select: { id: true }
    });
    
    if (userPosts.length > 0) {
      const postIds = userPosts.map(p => p.id);
      
      // 0.1. Kullanıcının gönderilerine yapılan yorumları sil
      const commentsCount = await prisma.comment.deleteMany({
        where: { postId: { in: postIds } }
      });
      console.log(`✓ ${commentsCount.count} yorum silindi`);
      
      // 0.2. Kullanıcının gönderilerine yapılan beğenileri sil
      const postLikesCount = await prisma.like.deleteMany({
        where: { postId: { in: postIds } }
      });
      console.log(`✓ ${postLikesCount.count} gönderi beğenisi silindi`);
    }
    
    // 1. Kullanıcının gönderilerini sil
    const postsCount = await prisma.post.deleteMany({
      where: { authorId: userId }
    });
    console.log(`✓ ${postsCount.count} gönderi silindi`);
    
    // 2. Kullanıcının beğenilerini sil
    const likesCount = await prisma.like.deleteMany({
      where: { userId: userId }
    });
    console.log(`✓ ${likesCount.count} beğeni silindi`);
    
    // 3. Kullanıcının takip ilişkilerini sil (takip edenler)
    const followingCount = await prisma.follow.deleteMany({
      where: { followerId: userId }
    });
    console.log(`✓ ${followingCount.count} takip edilen silindi`);
    
    // 4. Kullanıcının takipçi ilişkilerini sil (takipçiler)
    const followersCount = await prisma.follow.deleteMany({
      where: { followingId: userId }
    });
    console.log(`✓ ${followersCount.count} takipçi ilişkisi silindi`);
    
    // 5. Kullanıcının bookmark'larını sil
    const bookmarksCount = await prisma.bookmark.deleteMany({
      where: { userId: userId }
    });
    console.log(`✓ ${bookmarksCount.count} bookmark silindi`);
    
    // 6. Son olarak kullanıcıyı sil
    const user = await prisma.user.delete({
      where: { id: userId }
    });
    console.log(`\n✓ Kullanıcı silindi: ${user.nickname} (${user.email})`);
    
    console.log("\n✅ Tüm veriler başarıyla silindi!");
    
  } catch (error: any) {
    console.error("❌ Hata:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser().catch(console.error);
