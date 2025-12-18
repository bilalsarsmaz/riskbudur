
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

        // 3. Fetch ALL Replies (Recursive - get entire thread)
        const fetchRepliesRecursive = async (parentId: bigint): Promise<any[]> => {
            const directReplies = await prisma.post.findMany({
                where: {
                    parentPostId: parentId
                },
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
                    }
                }
            });

            // For each reply, recursively fetch its replies
            const repliesWithNested = await Promise.all(
                directReplies.map(async (reply) => {
                    const nestedReplies = await fetchRepliesRecursive(reply.id);
                    const userId = decodedUserId;

                    // Recursive like/bookmark check
                    const userLikes = userId ? await prisma.like.findMany({
                        where: { userId, postId: reply.id }
                    }) : [];

                    const isLiked = userLikes.length > 0;

                    return {
                        id: reply.id.toString(),
                        content: reply.content,
                        createdAt: reply.createdAt,
                        mediaUrl: reply.mediaUrl,
                        imageUrl: reply.imageUrl,
                        linkPreview: reply.linkPreview,
                        isAnonymous: reply.isAnonymous,
                        author: reply.author,
                        isLiked: isLiked,
                        _count: {
                            likes: reply._count.likes,
                            comments: reply._count.replies,
                            quotes: reply._count.quotes,
                            replies: reply._count.replies,
                        },
                        comments: nestedReplies // Attach nested replies
                    };
                })
            );

            return repliesWithNested;
        };


        const replies = await fetchRepliesRecursive(BigInt(postId));

        // Helper function to fetch quoted post for a post
        const fetchQuotedPost = async (post: any) => {
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
                                },
                            },
                        },
                    },
                },
            });

            if (quote && quote.quotedPost) {
                return {
                    ...post,
                    quotedPost: {
                        id: quote.quotedPost.id.toString(),
                        content: quote.quotedPost.content,
                        createdAt: quote.quotedPost.createdAt,
                        imageUrl: quote.quotedPost.imageUrl,
                        mediaUrl: quote.quotedPost.mediaUrl,
                        linkPreview: quote.quotedPost.linkPreview,
                        isAnonymous: quote.quotedPost.isAnonymous,
                        author: quote.quotedPost.author,
                        _count: quote.quotedPost._count,
                    },
                };
            }
            return post;
        };

        // Fetch quoted posts for main post, ancestors, and replies
        const mainPostWithQuote = await fetchQuotedPost(mainPost);
        const ancestorsWithQuotes = await Promise.all(ancestors.map(fetchQuotedPost));

        // Recursively add quoted posts to replies
        const addQuotedPostToReplies = async (replies: any[]): Promise<any[]> => {
            return Promise.all(
                replies.map(async (reply) => {
                    const replyWithQuote = await fetchQuotedPost(reply);
                    if (reply.comments && reply.comments.length > 0) {
                        replyWithQuote.comments = await addQuotedPostToReplies(reply.comments);
                    }
                    return replyWithQuote;
                })
            );
        };

        const repliesWithQuotes = await addQuotedPostToReplies(replies);

        // Format helper to ensure fields are explicitly included
        const formatPost = (post: any) => {
            const userId = decodedUserId; // Use outer scope decodedUserId
            return {
                id: post.id.toString(),
                content: post.content,
                createdAt: post.createdAt,
                mediaUrl: post.mediaUrl,
                imageUrl: post.imageUrl,
                linkPreview: post.linkPreview,
                isAnonymous: post.isAnonymous,
                author: post.author,
                isLiked: userId ? post.likes?.some((l: any) => l.userId === userId) : false,
                isBookmarked: userId ? post.bookmarks?.some((b: any) => b.userId === userId) : false,
                _count: {
                    likes: post._count.likes,
                    comments: post._count.comments + post._count.replies,
                    quotes: post._count.quotes,
                    replies: post._count.replies,
                },
                quotedPost: post.quotedPost ? {
                    id: post.quotedPost.id.toString(),
                    content: post.quotedPost.content,
                    createdAt: post.quotedPost.createdAt,
                    imageUrl: post.quotedPost.imageUrl,
                    mediaUrl: post.quotedPost.mediaUrl,
                    linkPreview: post.quotedPost.linkPreview,
                    isAnonymous: post.quotedPost.isAnonymous,
                    author: post.quotedPost.author,
                    _count: post.quotedPost._count,
                } : null,
            };
        };

        return NextResponse.json(toJson({
            mainPost: formatPost(mainPostWithQuote),
            ancestors: ancestorsWithQuotes.map(formatPost),
            replies: repliesWithQuotes
        }));

    } catch (error) {
        console.error("Conversation fetch error:", error);
        return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
    }
}
