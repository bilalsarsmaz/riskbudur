import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { hasPermission, Permission, Role, canManageRole } from "@/lib/permissions";

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

// Admin Updates
export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
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

    // Get current user role
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });

    if (!currentUser) {
      return NextResponse.json({ message: "Oturum açan kullanıcı bulunamadı" }, { status: 404 });
    }

    // Find target user by ID (which is passed as 'id' param, but check if it's nickname or ID)
    // The previous GET treated it as nickname. We should handle both or check how modal sends it.
    // The Modal uses `user.id` or `user.username`? 
    // Usually routes are structured. If this route is [id], params.id is the value.
    // The GET method treated it as nickname. 
    // BUT for PUT, usually we want ID for stability. 
    // If I use the same route file for PUT /users/[nickname], it might be confusing if nickname changes.
    // However, the modal will likely use the USER ID if I instruct it. 
    // But this file is situated at `api/users/[id]`. 
    // The GET logic treats [id] as nickname. 
    // I should check if it's a UUID.

    let targetUser = await prisma.user.findFirst({
      where: { id: params.id }
    });

    if (!targetUser) {
      // Fallback to nickname search just in case, but prefer ID for updates
      targetUser = await prisma.user.findFirst({
        where: { nickname: { equals: params.id, mode: "insensitive" } }
      });
    }

    if (!targetUser) {
      return NextResponse.json({ message: "Hedef kullanıcı bulunamadı" }, { status: 404 });
    }

    // Check Permissions
    // User can edit themselves? Assuming this endpoint is for ADMIN usage or if user calls it.
    // But `me/route.ts` exists for self. 
    // If user calls this for themselves, it's fine.

    if (currentUser.id !== targetUser.id) {
      const canManage = hasPermission(currentUser.role as Role, Permission.MANAGE_USER_FULLNAME) ||
        hasPermission(currentUser.role as Role, Permission.MANAGE_USER_AVATAR); // General check

      // Also check role hierarchy
      const isHigher = canManageRole(currentUser.role as Role, targetUser.role as Role);

      if (!canManage || !isHigher) {
        return NextResponse.json({ message: "Bu işlem için yetkiniz yok" }, { status: 403 });
      }
    }

    const { nickname: rawNickname, fullName, bio, website, email, profileImage, coverImage, gender, birthday } = await req.json();
    const nickname = rawNickname ? rawNickname.trim() : undefined;

    // Nickname validasyonu
    if (nickname) {
      if (nickname.length > 15) {
        return NextResponse.json({ error: "Kullanıcı adı en fazla 15 karakter olabilir" }, { status: 400 });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
        return NextResponse.json({ error: "Kullanıcı adı geçersiz karakterler içeriyor" }, { status: 400 });
      }
      const lowerNickname = nickname.toLowerCase();
      if (lowerNickname.includes("admin") || lowerNickname.includes("riskbudur")) {
        // Admins can maybe override this? Let's keep rule for now.
        return NextResponse.json({ error: "Bu kullanıcı adı alınamaz" }, { status: 400 });
      }
    }

    // Benzersizlik Kontrolleri
    if (nickname && nickname !== targetUser.nickname) {
      const existingUser = await prisma.user.findFirst({
        where: { nickname: { equals: nickname, mode: "insensitive" } }
      });
      if (existingUser) {
        return NextResponse.json({ message: "Bu kullanıcı adı kullanımda" }, { status: 400 });
      }
    }

    if (email && email !== targetUser.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ message: "Bu e-posta kullanımda" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        ...(nickname && { nickname }),
        ...(fullName !== undefined && { fullName }),
        ...(bio !== undefined && { bio }),
        ...(website !== undefined && { website }),
        ...(email && { email }),
        ...(gender !== undefined && { gender }),
        ...(birthday !== undefined && { birthday: birthday ? new Date(birthday) : null }),
        ...(profileImage !== undefined && { profileImage }),
        ...(coverImage !== undefined && { coverImage }),
        // Password update intentionally omitted here for safety, use dedicated admin endpoint if needed or add later
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        bio: true,
        website: true,
        profileImage: true,
        coverImage: true,
        gender: true,
        birthday: true,
        role: true,
        hasBlueTick: true,
        verificationTier: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Kullanıcı güncelleme hatası:", error);
    return NextResponse.json(
      { message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}
