import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const username = params.id;
    const user = await prisma.user.findFirst({
      where: { 
        nickname: { 
          equals: username,
          mode: "insensitive"
        }
      },
      select: {
        id: true,
        nickname: true,
        fullName: true,
        bio: true,
        website: true,
        profileImage: true,
        coverImage: true,
        hasBlueTick: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const joinDate = new Date(user.createdAt).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return NextResponse.json({
      username: user.nickname,
      fullName: user.fullName || user.nickname,
      bio: user.bio,
      website: user.website,
      joinDate,
      following: user._count.following,
      followers: user._count.followers,
      hasBlueTick: user.hasBlueTick,
      coverImage: user.coverImage,
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("Kullanıcı bilgisi getirme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
