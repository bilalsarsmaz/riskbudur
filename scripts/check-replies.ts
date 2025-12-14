
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const username = "burak"; // Replace with the username from the screenshot if known, or just search for any user with replies

    console.log("Checking for replies in database...");

    // 1. Find a user (or the user from the context if possible, but hardcoding 'burak' or checking all is easier)
    const users = await prisma.user.findMany({ take: 5 });

    for (const user of users) {
        console.log(`Checking user: ${user.nickname} (${user.id})`);

        // Count total posts
        const totalPosts = await prisma.post.count({
            where: { authorId: user.id }
        });

        // Count replies (parentPostId is not null)
        const replies = await prisma.post.count({
            where: {
                authorId: user.id,
                parentPostId: { not: null }
            }
        });

        console.log(`- Total Posts: ${totalPosts}`);
        console.log(`- Replies (parentPostId != null): ${replies}`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
