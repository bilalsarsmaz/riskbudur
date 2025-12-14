
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Verifying Prisma Client and Database Schema...");

    try {
        // 1. Try to fetch one post with all fields that were causing issues
        console.log("Fetching one post...");
        const post = await prisma.post.findFirst({
            take: 1,
            include: {
                author: true,
            }
        });

        console.log("Post fetch successful!");
        if (post) {
            console.log("Post ID:", post.id.toString());
            console.log("LinkPreview field exists:", 'linkPreview' in post);
            console.log("ParentPostId field exists:", 'parentPostId' in post);
        } else {
            console.log("No posts found in database (this is not an error, just empty DB).");
        }

        // 2. Try to fetch popular posts query
        console.log("Testing popular posts query...");
        const popularPosts = await prisma.post.findMany({
            take: 5,
            include: {
                author: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    }
                }
            },
            orderBy: [
                {
                    likes: {
                        _count: 'desc'
                    }
                }
            ]
        });
        console.log("Popular posts query successful!", popularPosts.length, "posts found.");

    } catch (error) {
        console.error("Verification FAILED:");
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
