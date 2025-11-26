const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function extractHashtags(content) {
  if (!content) return [];
  const hashtagRegex = /#[\p{L}\p{N}_]+/gu;
  const matches = content.match(hashtagRegex);
  if (!matches) return [];
  return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))];
}

async function main() {
  const posts = await prisma.post.findMany({
    select: { id: true, content: true }
  });
  
  console.log('Toplam post:', posts.length);
  
  for (const post of posts) {
    const hashtags = extractHashtags(post.content);
    if (hashtags.length > 0) {
      console.log('Post', post.id.toString(), '- Hashtags:', hashtags);
      
      for (const name of hashtags) {
        await prisma.hashtag.upsert({
          where: { name },
          create: { name },
          update: {},
        });
      }
      
      await prisma.post.update({
        where: { id: post.id },
        data: {
          hashtags: {
            connect: hashtags.map(name => ({ name })),
          },
        },
      });
    }
  }
  
  console.log('Tamamlandı!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
