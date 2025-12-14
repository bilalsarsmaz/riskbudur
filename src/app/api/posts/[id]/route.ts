import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const post = await prisma.post.findUnique({
      where: { id: BigInt(id) },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            hasBlueTick: true,
            verificationTier: true,
            fullName: true,
            profileImage: true,
          },
        },
        parentPost: {
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                fullName: true,
                verificationTier: true,
              }
            }
          }
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post bulunamadi" },
        { status: 404 }
      );
    }

    const threadRepliesCount = await prisma.post.count({
      where: {
        threadRootId: post.id,
      },
    });

    const directReplies = await prisma.post.findMany({
      where: {
        parentPostId: BigInt(id)
      },
      orderBy: { createdAt: "asc" },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            hasBlueTick: true,
            verificationTier: true,
            profileImage: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          }
        }
      },
    });

    const fetchNestedReplies = async (parentId: bigint): Promise<any[]> => {
      const replies = await prisma.post.findMany({
        where: { parentPostId: parentId },
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              hasBlueTick: true,
              verificationTier: true,
              profileImage: true,
              fullName: true,
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
            }
          }
        },
      });

      const result = [];
      for (const reply of replies) {
        const nestedReplies = await fetchNestedReplies(reply.id);
        result.push({
          id: reply.id.toString(),
          content: reply.content,
          createdAt: reply.createdAt,
          isAnonymous: reply.isAnonymous,
          mediaUrl: reply.mediaUrl,
          imageUrl: reply.imageUrl,
          linkPreview: reply.linkPreview,
          author: reply.author,
          _count: {
            likes: reply._count.likes,
            comments: reply._count.replies,
          },
        });
        result.push(...nestedReplies);
      }
      return result;
    };

    let allReplies: any[] = [];
    for (const reply of directReplies) {
      allReplies.push({
        id: reply.id.toString(),
        content: reply.content,
        createdAt: reply.createdAt,
        isAnonymous: reply.isAnonymous,
        mediaUrl: reply.mediaUrl,
        imageUrl: reply.imageUrl,
        linkPreview: reply.linkPreview,
        author: reply.author,
        _count: {
          likes: reply._count.likes,
          comments: reply._count.replies,
        },
      });
      const nestedReplies = await fetchNestedReplies(reply.id);
      allReplies.push(...nestedReplies);
    }

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
                hasBlueTick: true,
                verificationTier: true,
                fullName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    const formattedPost = {
      id: post.id.toString(),
      content: post.content,
      createdAt: post.createdAt,
      isAnonymous: post.isAnonymous,
      mediaUrl: post.mediaUrl,
      imageUrl: post.imageUrl,
      linkPreview: post.linkPreview,
      author: post.author,
      comments: allReplies,
      parentPost: post.parentPost ? {
        id: post.parentPost.id.toString(),
        content: post.parentPost.content,
        author: post.parentPost.author,
      } : null,
      quotedPost: quote && quote.quotedPost ? {
        id: quote.quotedPost.id.toString(),
        content: quote.quotedPost.content,
        createdAt: quote.quotedPost.createdAt,
        imageUrl: quote.quotedPost.imageUrl,
        mediaUrl: quote.quotedPost.mediaUrl,
        linkPreview: quote.quotedPost.linkPreview,
        isAnonymous: quote.quotedPost.isAnonymous,
        author: quote.quotedPost.author,
      } : null,
      _count: {
        likes: post._count.likes,
        comments: post._count.replies,
      },
      threadRepliesCount: threadRepliesCount,
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error("Post getirme hatasi:", error);
    return NextResponse.json(
      { message: "Post getirilirken bir hata olustu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    let userId: string;
    try {
      const jwt = await import("jsonwebtoken");
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
    } catch (e) {
      return NextResponse.json(
        { message: "Gecersiz token" },
        { status: 401 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: BigInt(id) },
      select: {
        authorId: true,
        content: true,
        createdAt: true,
        hashtags: true
      }
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post bulunamadi" },
        { status: 404 }
      );
    }

    if (post.authorId !== userId) {
      return NextResponse.json(
        { message: "Bu gonderiyi silme yetkiniz yok" },
        { status: 403 }
      );
    }

    // Eger bu post bir alinti ise, ilgili Quote kaydini da bulup silelim.
    // Quote modeli postId tutmadigi icin fuzzy match yapiyoruz (GET metodundaki mantigin aynisi)
    const quoteRecord = await prisma.quote.findFirst({
      where: {
        authorId: post.authorId,
        content: post.content,
        createdAt: {
          gte: new Date(post.createdAt.getTime() - 2000), // 2 saniyelik tolerans
          lte: new Date(post.createdAt.getTime() + 2000),
        },
      }
    });

    if (quoteRecord) {
      // Bu alıntı için oluşturulan bildirimi sil (QUOTE type notification points to the NEW quote post id, wihch is 'id' here)
      // Actually, when a quote is created, the notification has postId = newPost.id (which is this post's id). 
      // So deleting notifications by postId below will handle it.
      await prisma.quote.delete({ where: { id: quoteRecord.id } });
    }

    // Bu post ile ilgili tüm bildirimleri sil (QUOTE, REPLY, MENTION, LIKE vb. bu post ID'sine bağlı olanlar)
    await prisma.notification.deleteMany({ where: { postId: BigInt(id) } });

    await prisma.like.deleteMany({ where: { postId: BigInt(id) } });
    await prisma.comment.deleteMany({ where: { postId: BigInt(id) } });
    await prisma.quote.deleteMany({ where: { quotedPostId: BigInt(id) } });
    await prisma.bookmark.deleteMany({ where: { postId: BigInt(id) } });
    await prisma.post.deleteMany({ where: { parentPostId: BigInt(id) } });

    await prisma.post.delete({
      where: { id: BigInt(id) }
    });

    // Bosalan hashtagleri temizle
    if (post.hashtags && post.hashtags.length > 0) {
      for (const tag of post.hashtags) {
        const remainingPosts = await prisma.post.count({
          where: {
            hashtags: {
              some: {
                id: tag.id
              }
            }
          }
        });

        if (remainingPosts === 0) {
          await prisma.hashtag.delete({
            where: { id: tag.id }
          });
        }
      }
    }

    return NextResponse.json({ message: "Gonderi silindi" });
  } catch (error) {
    console.error("Post silme hatasi:", error);
    return NextResponse.json(
      { message: "Post silinirken bir hata olustu" },
      { status: 500 }
    );
  }
}
