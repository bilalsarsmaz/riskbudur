import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const searchParams = new URL(req.url).searchParams;
        const search = searchParams.get("search");
        const limit = parseInt(searchParams.get("limit") || "10");

        if (!search) {
            // If no search, return trending or recent?
            // User asked for "highest interaction" -> Trending is good.
            // We can reuse the trending logic or just sorting by usage count if we had it.
            // Hashtag model has `posts` relation.

            // Only show hashtags that have at least one post
            const trending = await prisma.hashtag.findMany({
                take: limit,
                where: {
                    posts: {
                        some: {}
                    }
                },
                orderBy: {
                    posts: {
                        _count: "desc"
                    }
                },
                include: {
                    _count: {
                        select: { posts: true }
                    }
                }
            });
            return NextResponse.json({ hashtags: trending });
        }

        const hashtags = await prisma.hashtag.findMany({
            take: limit,
            where: {
                name: {
                    contains: search,
                    mode: "insensitive"
                },
                posts: {
                    some: {}
                }
            },
            orderBy: {
                posts: {
                    _count: "desc"
                }
            },
            include: {
                _count: {
                    select: { posts: true }
                }
            }
        });

        return NextResponse.json({ hashtags });
    } catch (error) {
        console.error("Hashtags fetch error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
