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
        role: true,
        createdAt: true,
        isBanned: true,
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


    // Token varsa takip ve blok durumunu kontrol et
    let isFollowing = false;
    let followsYou = false;
    let isBlocked = false;   // Current user blocked this profile
    let isBlocking = false;  // This profile blocked current user (Renaming to avoid confusion: blockedByTarget)

    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      if (token) {
        try {
          const { verifyToken } = await import("@/lib/auth");
          const decoded: any = await verifyToken(token);

          if (decoded && decoded.userId) {
            const currentUserId = decoded.userId;

            // Oturum açan kullanıcının bu kişiyi takip edip etmediği
            const follow = await prisma.follow.findUnique({
              where: {
                followerId_followingId: {
                  followerId: currentUserId,
                  followingId: user.id
                }
              }
            });
            isFollowing = !!follow;

            // Bu kişinin oturum açan kullanıcıyı takip edip etmediği (Seni takip ediyor)
            if (currentUserId !== user.id) {
              const followsYouResult = await prisma.follow.findUnique({
                where: {
                  followerId_followingId: {
                    followerId: user.id,
                    followingId: currentUserId
                  }
                }
              });
              followsYou = !!followsYouResult;

              // Check if current user blocked this profile
              const block1 = await prisma.block.findUnique({
                where: {
                  blockerId_blockedId: {
                    blockerId: currentUserId,
                    blockedId: user.id
                  }
                }
              });
              isBlocked = !!block1;

              // Check if this profile blocked current user
              const block2 = await prisma.block.findUnique({
                where: {
                  blockerId_blockedId: {
                    blockerId: user.id,
                    blockedId: currentUserId
                  }
                }
              });
              isBlocking = !!block2;
            }

            // --- Record Profile Visit (Dikizleyenler) ---
            if (currentUserId !== user.id) {
              // Update or create visit record
              await prisma.profileVisit.upsert({
                where: {
                  visitorId_visitedId: {
                    visitorId: currentUserId,
                    visitedId: user.id
                  }
                },
                update: {
                  visitedAt: new Date()
                },
                create: {
                  visitorId: currentUserId,
                  visitedId: user.id
                }
              });
            }
          }
        } catch (e) {
          console.error("Token verify error:", e);
        }
      }
    }

    // Fetch recent visitors (Dikizleyenler)
    // Only distinct users, ordered by visitedAt desc
    const recentVisits = await prisma.profileVisit.findMany({
      where: { visitedId: user.id },
      orderBy: { visitedAt: 'desc' },
      take: 10,
      include: {
        visitor: {
          select: {
            nickname: true,
            fullName: true,
            profileImage: true
          }
        }
      }
    });

    const visitors = recentVisits.map(v => ({
      nickname: v.visitor.nickname,
      fullName: v.visitor.fullName,
      profileImage: v.visitor.profileImage
    }));

    const joinDate = new Date(user.createdAt || new Date()).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return NextResponse.json({
      id: user.id,
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
      role: user.role,
      coverImage: user.coverImage,
      profileImage: user.profileImage,
      isFollowing,
      followsYou,
      isBanned: user.isBanned,
      isBlocked,
      isBlocking,
      visitors: visitors // Include visitors in response
    });
  } catch (error) {
    console.error("Kullanıcı bilgisi getirme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
