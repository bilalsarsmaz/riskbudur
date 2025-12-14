
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Checking for replies in database (Post vs Comment)...");

    // 1. Find the user 'burak' (searching by nickname, or just taking the first user)
    const user = await prisma.user.findFirst({
        where: { nickname: 'burak' } // adjusting based on previous output or assumption
    }) || await prisma.user.findFirst();

    if (!user) {
        console.log("No user found.");
        return;
    }

    console.log(`Checking user: ${user.nickname} (${user.id})`);

    // 1. Check Post table (New system: Replies are Posts with parentPostId)
    const postReplies = await prisma.post.count({
        where: {
            authorId: user.id,
            parentPostId: { not: null }
        }
    });
    console.log(`- Replies in 'Post' table (parentPostId != null): ${postReplies}`);

    // 2. Check Comment table (Old system: Replies are Comments)
    // We need to check if 'Comment' model exists and has entries
    try {
        // @ts-ignore - Ignoring TS error in case Comment model doesn't exist in the generated client yet
        const commentReplies = await prisma.comment.count({
            where: { authorId: user.id }
        });
        console.log(`- Replies in 'Comment' table: ${commentReplies}`);
    } catch (e) {
        console.log("- 'Comment' table inquiry failed (maybe model doesn't exist or different schema):", e.message);
    }

    // 3. Check specific recent posts to see structure
    const recentPosts = await prisma.post.findMany({
        where: { authorId: user.id },
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: { id: true, content: true, parentPostId: true, threadRootId: true }
    });
    console.log("Recent posts from user:", recentPosts);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
