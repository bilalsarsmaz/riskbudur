import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "@/lib/auth";

const prisma = new PrismaClient();

// Hashtag extraction fonksiyonu
function extractHashtags(content: string): string[] {
  const hashtagRegex = /#[\p{L}\p{N}_]+/gu;
  const matches = content.match(hashtagRegex);
  if (!matches) return [];
  
  return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))];
}

// Tüm postları getir
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    console.log("Postlar getiriliyor...", { page, limit, skip });

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    console.log("Bulunan post sayısı:", posts.length);

    const formattedPosts = posts.map(post => ({
      id: post.id.toString(),
      content: post.content,
      createdAt: post.createdAt,
      imageUrl: post.imageUrl,
      isAnonymous: post.isAnonymous,
      author: {
        id: post.author.id,
        nickname: post.author.nickname,
        hasBlueTick: post.author.hasBlueTick,
        fullName: post.author.fullName,
        profileImage: post.author.profileImage
      },
      _count: {
        likes: post._count.likes,
        comments: post._count.comments
      }
    }));

    const total = await prisma.post.count();
    console.log("Toplam post sayısı:", total);

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Post getirme hatası:", error);
    return NextResponse.json(
      { message: "Postlar getirilirken bir hata oluştu", error: String(error) },
      { status: 500 }
    );
  }
}

// Yeni post oluştur
export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Yetkilendirme gerekli" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { message: "Geçersiz token" },
        { status: 401 }
      );
    }

    const { content, isAnonymous, imageUrl } = await req.json();

    console.log("Yeni post oluşturuluyor:", { content, isAnonymous, imageUrl, userId: decoded.userId });

    const hashtagNames = extractHashtags(content);
    console.log("Bulunan hashtag'ler:", hashtagNames);

    const post = await prisma.post.create({
      data: {
        content,
        authorId: decoded.userId,
        isAnonymous: isAnonymous || false,
        imageUrl: imageUrl || null,
        hashtags: {
          connectOrCreate: hashtagNames.map(name => ({
            where: { name },
            create: { name }
          }))
        }
      },
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
    });

    console.log("Post oluşturuldu:", post);

    const formattedPost = {
      id: post.id.toString(),
      content: post.content,
      createdAt: post.createdAt,
      imageUrl: post.imageUrl,
      isAnonymous: post.isAnonymous,
      author: {
        id: post.author.id,
        nickname: post.author.nickname,
        hasBlueTick: post.author.hasBlueTick,
        fullName: post.author.fullName,
        profileImage: post.author.profileImage
      },
      _count: {
        likes: 0,
        comments: 0
      }
    };

    return NextResponse.json(formattedPost, { status: 201 });
  } catch (error) {
    console.error("Post oluşturma hatası:", error);
    return NextResponse.json(
      { message: "Post oluşturulurken bir hata oluştu", error: String(error) },
      { status: 500 }
    );
  }
}
