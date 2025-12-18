
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

import jwt from "jsonwebtoken";

// BigInt serialization helper
function toJson(data: any): any {
    return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id: postId } = await params;

    // Auth check for interaction states
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    let decodedUserId: string | null = null;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            decodedUserId = decoded.userId;
        } catch (e) { }
    }

    if (!postId) {
        return NextResponse.json({ error: "Post ID gerekli" }, { status: 400 });
    }

    try {
        // 1. Fetch Main Post
        const mainPost = await prisma.post.findUnique({
            where: { id: BigInt(postId) },
            include: {
                author: {
                    select: {
                        id: true,
                        nickname: true,
                        fullName: true,
                        profileImage: true,
                        hasBlueTick: true,
                        verificationTier: true,
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        quotes: true,
                        replies: true,
                    }
                },
                likes: { select: { userId: true } },
                bookmarks: { select: { userId: true } },
            }
        });

        if (!mainPost) {
            return NextResponse.json({ error: "Post bulunamadi" }, { status: 404 });
        }

        // 2. Fetch Ancestors (Recursive Backend Loop)
        const ancestors: any[] = [];
        let currentParentId = mainPost.parentPostId;
        const visitedIds = new Set<string>();
        visitedIds.add(postId);

        while (currentParentId) {
            const parentIdStr = currentParentId.toString();
            if (visitedIds.has(parentIdStr)) break; // Cycle prevention
            visitedIds.add(parentIdStr);

            const parent = await prisma.post.findUnique({
                where: { id: currentParentId },
                include: {
                    author: {
                        select: {
                            id: true,
                            nickname: true,
                            fullName: true,
                            profileImage: true,
                            hasBlueTick: true,
                            verificationTier: true,
                        }
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                            quotes: true,
                            replies: true,
                        }
                    }
                }
            });

            if (parent) {
                ancestors.unshift(parent); // Add to beginning (Root -> Parent)
                currentParentId = parent.parentPostId;
            } else {
                break;
            }
        }


        // Helper function to fetch quoted post for a post (with proper BigInt handling)
        const fetchQuotedPost = async (post: any) => {
            if (!post) return null;

            const quote = await prisma.quote.findFirst({
                where: {
                    authorId: post.authorId,
                    content: post.content,
                    createdAt: {
                        gte: new Date(post.createdAt.getTime() - 1000),
                        lte: new Date(post.createdAt.getTime() + 1000),
                    },
                },
                include: {
                    quotedPost: {
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    nickname: true,
                                    fullName: true,
                                    profileImage: true,
                                    hasBlueTick: true,
                                    verificationTier: true,
                                },
                            },
                            _count: {
                                select: {
                                    likes: true,
                                    comments: true,
                                    quotes: true,
                                    replies: true,
                                },
                            },
                        },
                    },
                },
            });

            if (quote && quote.quotedPost) {
                return {
                    ...post,
                    quotedPost: quote.quotedPost
                };
            }
            return post;
        };

        // Format helper to ensure fields are explicitly included and consistent
        const formatPost = (postRaw: any) => {
            if (!postRaw) return null;
            const userId = decodedUserId;

            // Handle if it's already formatted partly or raw prisma
            const post = postRaw;

            return {
                id: post.id.toString(),
                content: post.content || "",
                createdAt: post.createdAt,
                mediaUrl: post.mediaUrl || null,
                imageUrl: post.imageUrl || null,
                linkPreview: post.linkPreview,
                isAnonymous: post.isAnonymous || false,
                author: post.author,
                isLiked: userId ? (post.likes?.some((l: any) => l.userId === userId) || post.isLiked) : (post.isLiked || false),
                isBookmarked: userId ? (post.bookmarks?.some((b: any) => b.userId === userId) || post.isBookmarked) : (post.isBookmarked || false),
                _count: {
                    likes: post._count?.likes || 0,
                    comments: (post._count?.comments || 0) + (post._count?.replies || 0),
                    quotes: post._count?.quotes || 0,
                    replies: post._count?.replies || 0,
                },
                quotedPost: post.quotedPost ? {
                    id: post.quotedPost.id.toString(),
                    content: post.quotedPost.content || "",
                    createdAt: post.quotedPost.createdAt,
                    imageUrl: post.quotedPost.imageUrl || null,
                    mediaUrl: post.quotedPost.mediaUrl || null,
                    linkPreview: post.quotedPost.linkPreview,
                    isAnonymous: post.quotedPost.isAnonymous || false,
                    author: post.quotedPost.author,
                    _count: post.quotedPost._count,
                } : null,
                comments: post.comments || []
            };
        };

        // 3. Fetch ALL Replies (Recursive - get entire thread)
        const fetchRepliesRecursive = async (parentId: bigint): Promise<any[]> => {
            const directReplies = await prisma.post.findMany({
                where: { parentPostId: parentId },
                orderBy: { createdAt: 'asc' },
                include: {
                    author: {
                        select: {
                            id: true,
                            nickname: true,
                            fullName: true,
                            profileImage: true,
                            hasBlueTick: true,
                            verificationTier: true,
                        }
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                            quotes: true,
                            replies: true,
                        }
                    },
                    likes: { select: { userId: true } },
                    bookmarks: { select: { userId: true } },
                }
            });

            return Promise.all(
                directReplies.map(async (reply) => {
                    const nestedReplies = await fetchRepliesRecursive(reply.id);
                    const replyWithQuote = await fetchQuotedPost(reply);
                    const formatted = formatPost(replyWithQuote);
                    if (formatted) {
                        formatted.comments = nestedReplies;
                    }
                    return formatted;
                })
            );
        };

        const replies = await fetchRepliesRecursive(BigInt(postId));
        const mainPostWithQuote = await fetchQuotedPost(mainPost);
        const ancestorsWithQuotes = await Promise.all(ancestors.map(fetchQuotedPost));

        return NextResponse.json(toJson({
            mainPost: formatPost(mainPostWithQuote),
            ancestors: ancestorsWithQuotes.map(formatPost),
            replies: replies
        }));

    } catch (error) {
        console.error("Conversation fetch error:", error);
        return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
    }
}
