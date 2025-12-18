const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupHashtags() {
    try {
        console.log('Cleaning up unused hashtags...');

        // Find hashtags with 0 posts
        const unusedHashtags = await prisma.hashtag.findMany({
            where: {
                posts: {
                    none: {}
                }
            },
            select: {
                id: true,
                name: true
            }
        });

        console.log(`Found ${unusedHashtags.length} unused hashtags.`);

        if (unusedHashtags.length > 0) {
            const deleted = await prisma.hashtag.deleteMany({
                where: {
                    id: {
                        in: unusedHashtags.map(h => h.id)
                    }
                }
            });
            console.log(`Deleted ${deleted.count} hashtags.`);
        } else {
            console.log('No unused hashtags found.');
        }

    } catch (error) {
        console.error('Error cleaning up hashtags:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupHashtags();
