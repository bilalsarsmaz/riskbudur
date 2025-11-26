import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const post = await prisma.post.findUnique({
      where: { id: BigInt(id) },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            hasBlueTick: true,
            hasOrangeTick: true,
            profileImage: true,
            fullName: true,
          },
        },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
                hasBlueTick: true,
                profileImage: true,
                fullName: true,
              },
            },
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Post bulunamadı" },
        { status: 404 }
      );
    }

    // Bu post'un alıntı yaptığı postu bul (Quote tablosundan)
    const quote = await prisma.quote.findFirst({
      where: {
        authorId: post.authorId,
        content: post.content,
        createdAt: {
          gte: new Date(post.createdAt.getTime() - 1000), // 1 saniye tolerans
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
                fullName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    // BigInt alanlarını string'e çevir
    const formattedComments = post.comments.map((comment) => ({
      ...comment,
      id: comment.id.toString(),
      postId: comment.postId.toString(),
    }));

    const formattedPost = {
      ...post,
      id: post.id.toString(),
      comments: formattedComments,
      quotedPost: quote && quote.quotedPost ? {
        id: quote.quotedPost.id.toString(),
        content: quote.quotedPost.content,
        createdAt: quote.quotedPost.createdAt,
        imageUrl: quote.quotedPost.imageUrl,
        mediaUrl: quote.quotedPost.mediaUrl,
        isAnonymous: quote.quotedPost.isAnonymous,
        author: quote.quotedPost.author,
      } : null,
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error("Post getirme hatası:", error);
    return NextResponse.json(
      { message: "Post getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Post silme
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    
    // Token kontrolü
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    // Token'dan userId çıkar
    let userId: string;
    try {
      const jwt = await import("jsonwebtoken");
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
    } catch (e) {
      return NextResponse.json(
        { message: "Geçersiz token" },
        { status: 401 }
      );
    }
    
    // Post'u bul
    const post = await prisma.post.findUnique({
      where: { id: BigInt(id) },
      select: { authorId: true }
    });
    
    if (!post) {
      return NextResponse.json(
        { message: "Post bulunamadı" },
        { status: 404 }
      );
    }
    
    // Sadece post sahibi silebilir
    if (post.authorId !== userId) {
      return NextResponse.json(
        { message: "Bu gönderiyi silme yetkiniz yok" },
        { status: 403 }
      );
    }
    
    // İlişkili verileri sil (likes, comments, quotes, bookmarks)
    await prisma.like.deleteMany({ where: { postId: BigInt(id) } });
    await prisma.comment.deleteMany({ where: { postId: BigInt(id) } });
    await prisma.quote.deleteMany({ where: { quotedPostId: BigInt(id) } });
    await prisma.bookmark.deleteMany({ where: { postId: BigInt(id) } });
    
    // Post'u sil
    await prisma.post.delete({
      where: { id: BigInt(id) }
    });
    
    return NextResponse.json({ message: "Gönderi silindi" });
  } catch (error) {
    console.error("Post silme hatası:", error);
    return NextResponse.json(
      { message: "Post silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
