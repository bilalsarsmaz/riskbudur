
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
        const postSelect = {
            id: true,
            content: true,
            mediaUrl: true,
            imageUrl: true,
            linkPreview: true,
            isAnonymous: true,
            createdAt: true,
            authorId: true,
            parentPostId: true,
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
            poll: {
                include: {
                    options: true,
                    votes: { where: { userId: decodedUserId || "0" } }
                }
            }
        };

        // 1. Fetch Main Post
        const mainPost = await prisma.post.findUnique({
            where: { id: BigInt(postId) },
            select: postSelect
        });

        if (!mainPost) {
            return NextResponse.json({ error: "Post bulunamadi" }, { status: 404 });
        }

        console.log(`[DEBUG] Post ${postId} fetched:`, {
            contentLength: mainPost.content?.length,
            hasMedia: !!mainPost.mediaUrl,
            hasImage: !!mainPost.imageUrl
        });

        // 2. Fetch Ancestors (Recursive)
        const ancestors: any[] = [];
        let currentParentId = mainPost.parentPostId;
        const visitedIds = new Set<string>();
        visitedIds.add(postId);

        while (currentParentId) {
            const parentIdStr = currentParentId.toString();
            if (visitedIds.has(parentIdStr)) break;
            visitedIds.add(parentIdStr);

            const parent = await prisma.post.findUnique({
                where: { id: currentParentId },
                select: postSelect
            });

            if (parent) {
                ancestors.unshift(parent);
                currentParentId = parent.parentPostId;
            } else {
                break;
            }
        }

        // Helper function for quotes
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
                            author: { select: { id: true, nickname: true, fullName: true, profileImage: true, hasBlueTick: true, verificationTier: true } },
                            _count: { select: { likes: true, comments: true, quotes: true, replies: true } }
                        }
                    }
                }
            });
            return quote?.quotedPost ? { ...post, quotedPost: quote.quotedPost } : post;
        };

        // Format helper
        const formatPost = (post: any) => {
            if (!post) return null;
            const userId = decodedUserId;

            return {
                id: post.id.toString(),
                content: post.content || "",
                createdAt: post.createdAt,
                mediaUrl: post.mediaUrl || null,
                imageUrl: post.imageUrl || null,
                linkPreview: post.linkPreview,
                isAnonymous: post.isAnonymous || false,
                author: post.author,
                isLiked: userId ? post.likes?.some((l: any) => l.userId === userId) : false,
                isBookmarked: userId ? post.bookmarks?.some((b: any) => b.userId === userId) : false,
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
                comments: post.comments || [],
                poll: post.poll ? {
                    id: post.poll.id,
                    options: post.poll.options.map((opt: any) => ({
                        id: opt.id,
                        text: opt.text,
                        voteCount: opt.voteCount,
                        isVoted: post.poll.votes?.some((v: any) => v.optionId === opt.id) || false
                    })),
                    expiresAt: post.poll.expiresAt,
                    totalVotes: post.poll.options.reduce((acc: number, curr: any) => acc + curr.voteCount, 0),
                    isVoted: post.poll.votes?.length > 0
                } : null
            };
        };

        // 3. Fetch Replies recursively
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
                    poll: {
                        include: {
                            options: true,
                            votes: { where: { userId: decodedUserId || "0" } }
                        }
                    }
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

        const finalMainPost = formatPost(mainPostWithQuote);
        console.log(`[DEBUG] finalMainPost:`, {
            id: finalMainPost?.id,
            content: finalMainPost?.content,
            mediaUrl: finalMainPost?.mediaUrl
        });

        return NextResponse.json(toJson({
            mainPost: finalMainPost,
            ancestors: ancestorsWithQuotes.map(formatPost),
            replies: replies
        }));

    } catch (error) {
        console.error("Conversation fetch error:", error);
        return NextResponse.json({ error: "Sunucu hatasi" }, { status: 500 });
    }
}
