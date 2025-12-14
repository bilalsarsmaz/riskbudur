import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const user = await prisma.user.findFirst({
      where: {
        nickname: {
          equals: params.id,
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
        verificationTier: true,
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


    // Token varsa takip durumunu kontrol et
    let isFollowing = false;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      const { verifyToken } = await import("@/lib/auth");
      const decoded: any = await verifyToken(token);

      if (decoded) {
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: decoded.userId,
              followingId: user.id
            }
          }
        });
        isFollowing = !!follow;
      }
    }

    const joinDate = new Date(user.createdAt || new Date()).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return NextResponse.json({
      id: user.id, // Add ID
      username: user.nickname,
      fullName: user.fullName || user.nickname,
      bio: user.bio,
      website: user.website,
      joinDate,
      following: user._count.following,
      followers: user._count.followers,
      postsCount: user._count.posts,
      hasBlueTick: user.hasBlueTick,
      verificationTier: user.verificationTier,
      coverImage: user.coverImage,
      profileImage: user.profileImage,
      isFollowing // Add isFollowing
    });
  } catch (error) {
    console.error("Kullanıcı bilgisi getirme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
