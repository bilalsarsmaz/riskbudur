import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";
import { hasPermission, Permission, canManageRole, Role } from "@/lib/permissions";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: targetUserId } = await params;

    // Admin yetki kontrolü
    const authResult = await verifyAdmin(request);
    if (authResult.error) {
      return authResult.error;
    }
    // const userId = authResult.user.id;

    // Check if target user is ROOTADMIN
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true }
    });

    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 1. Permission Check
    if (!hasPermission(authResult.user.role as Role, Permission.DELETE_USER)) {
      return NextResponse.json({ error: "Yetkisiz işlem: Kullanıcı silme yetkiniz yok." }, { status: 403 });
    }

    // 2. Hierarchy Check
    const actorRole = authResult.user.role as Role;
    const targetRole = targetUser.role as Role;

    if (!canManageRole(actorRole, targetRole)) {
      return NextResponse.json({ error: "Yetkisiz işlem: Sizinle aynı veya daha yüksek yetkiye sahip bir kullanıcıyı silemezsiniz." }, { status: 403 });
    }

    // İlişkili verileri sil

    // 1. Kullanıcının postlarını bul
    const userPosts = await prisma.post.findMany({
      where: { authorId: targetUserId },
      select: { id: true }
    });
    const userPostIds = userPosts.map(p => p.id);

    // 2. Bu postlara gelen etkileşimleri sil (Post silinmeden önce temizlenmeli)
    if (userPostIds.length > 0) {
      // Yorumlar
      await prisma.comment.deleteMany({
        where: { postId: { in: userPostIds } }
      });
      // Beğeniler (Posta gelenler)
      await prisma.like.deleteMany({
        where: { postId: { in: userPostIds } }
      });
      // Kaydedilenler
      await prisma.bookmark.deleteMany({
        where: { postId: { in: userPostIds } }
      });
      // Alıntılar
      await prisma.quote.deleteMany({
        where: { quotedPostId: { in: userPostIds } }
      });
      // Bildirimler (Post ile ilişkili olanlar)
      await prisma.notification.deleteMany({
        where: { postId: { in: userPostIds } }
      });

      // Posta cevap olarak atılan postlar varsa, parent bağlantısını kopar (veya sil)
      // Şimdilik parent bağlantısını koparıyoruz ki zincirleme silme hatası almayalım
      await prisma.post.updateMany({
        where: { parentPostId: { in: userPostIds } },
        data: { parentPostId: null }
      });

      // Thread root bağlantısını kopar
      await prisma.post.updateMany({
        where: { threadRootId: { in: userPostIds } },
        data: { threadRootId: null }
      });
    }

    // 3. Kullanıcının kendi oluşturduğu diğer verileri sil
    await prisma.verificationRequest.deleteMany({
      where: { userId: targetUserId }
    });

    await prisma.announcement.deleteMany({
      where: { authorId: targetUserId }
    });

    await prisma.notification.deleteMany({
      where: {
        OR: [
          { recipientId: targetUserId },
          { actorId: targetUserId }
        ]
      }
    });

    await prisma.comment.deleteMany({
      where: { authorId: targetUserId }
    });

    // Like.userId is String
    await prisma.like.deleteMany({
      where: { userId: targetUserId }
    });

    await prisma.quote.deleteMany({
      where: { authorId: targetUserId }
    });

    await prisma.post.deleteMany({
      where: { authorId: targetUserId }
    });

    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: targetUserId },
          { followingId: targetUserId }
        ]
      }
    });

    await prisma.bookmark.deleteMany({
      where: { userId: targetUserId }
    });

    // Kullanıcıyı sil
    await prisma.user.delete({
      where: { id: targetUserId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: targetUserId } = await params;

    // Admin yetki kontrolü
    const authResult = await verifyAdmin(request);
    if (authResult.error) {
      return authResult.error;
    }



    // Check hierarchy for target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true, nickname: true, email: true }
    });

    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const actorRole = authResult.user.role as Role;
    const targetRole = targetUser.role as Role;

    if (!canManageRole(actorRole, targetRole)) {
      // Exception: Users can potentially edit lower tiers? Actually canManageRole covers strictly higher. 
      // But wait, can an Admin edit another Admin? strict > implies no.
      // Let's enforce strict hierarchy for now.
      // actually if actorRole == targetRole (e.g. Admin edits Admin), should be allowed? 
      // Usually no, unless self. But this is admin API. 
      // canManageRole is actor > target. So Admin cannot edit Admin. This is good/safe.
      return NextResponse.json({ error: "Yetkisiz işlem: Sizinle aynı veya daha yüksek yetkiye sahip bir kullanıcıyı düzenleyemezsiniz." }, { status: 403 });
    }

    const body = await request.json();
    const { fullName, nickname, email, verificationTier, role } = body;

    // Güncelleme verilerini hazırla
    const updateData: any = {};

    // FULL NAME
    if (fullName !== undefined) {
      if (!hasPermission(actorRole, Permission.MANAGE_USER_FULLNAME)) {
        return NextResponse.json({ error: "Erişim reddedildi: İsim düzenleme yetkiniz yok." }, { status: 403 });
      }
      updateData.fullName = fullName;
    }

    // NICKNAME / USERNAME
    if (nickname !== undefined) {
      if (!hasPermission(actorRole, Permission.MANAGE_USER_USERNAME)) {
        return NextResponse.json({ error: "Erişim reddedildi: Kullanıcı adı düzenleme yetkiniz yok." }, { status: 403 });
      }

      // ... nickname validations ...
      if (nickname.length > 15) {
        return NextResponse.json(
          { error: "Kullanıcı adı en fazla 15 karakter olabilir" },
          { status: 400 }
        );
      }
      if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
        return NextResponse.json(
          { error: "Kullanıcı adı sadece İngilizce karakterler, rakamlar ve alt çizgi içerebilir" },
          { status: 400 }
        );
      }
      // Aynı nickname kontrolü (kendisi hariç)
      const existingUser = await prisma.user.findFirst({
        where: {
          nickname: { equals: nickname, mode: "insensitive" },
          NOT: { id: targetUserId }
        }
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Bu kullanıcı adı zaten kullanılıyor" },
          { status: 400 }
        );
      }
      updateData.nickname = nickname;
    }

    // EMAIL (Sensitive, treat as full edit or specific? Let's check permissions.ts, likely DELETE/MANAGE_USER implies heavy access)
    // We didn't define MANAGE_EMAIL. Let's assume MANAGE_USER_USERNAME or DELETE_USER level needed?
    // Or just let anyone with access edit email? 
    // Let's assume MANAGE_USER_FULLNAME is enough for basic details, but let's stick to base access.
    // Actually, Admin/Lead usually can. Moderators? Matrix says "Edit Fullname" only.
    // Matrix didn't specify Email. I will restrict Email to LEAD+ (same as Username)
    if (email !== undefined) {
      if (!hasPermission(actorRole, Permission.MANAGE_USER_USERNAME)) { // Reusing username perm for email for now
        return NextResponse.json({ error: "Erişim reddedildi: Email düzenleme yetkiniz yok." }, { status: 403 });
      }

      // Email validasyonu
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Geçersiz email adresi" },
          { status: 400 }
        );
      }
      // Aynı email kontrolü (kendisi hariç)
      const existingUser = await prisma.user.findFirst({
        where: {
          email: { equals: email, mode: "insensitive" },
          NOT: { id: targetUserId }
        }
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "Bu email adresi zaten kullanılıyor" },
          { status: 400 }
        );
      }
      updateData.email = email;
    }

    if (verificationTier !== undefined) {
      // Permission specific? Not explicit in matrix, but let's assume ADMIN+ or LEAD+? 
      // Matrix says "Grant Badges" -> Admin+.
      if (!hasPermission(actorRole, Permission.GRANT_BADGES)) {
        return NextResponse.json({ error: "Erişim reddedildi: Rozet verme yetkiniz yok." }, { status: 403 });
      }

      updateData.verificationTier = verificationTier;
      updateData.hasBlueTick = verificationTier !== 'NONE';
    }

    if (role !== undefined) {
      if (!hasPermission(actorRole, Permission.GRANT_ROLES)) {
        return NextResponse.json({ error: "Erişim reddedildi: Rol verme yetkiniz yok." }, { status: 403 });
      }

      // Cannot grant a role higher or equal to self
      const newRole = role as Role;
      if (!canManageRole(actorRole, newRole)) {
        return NextResponse.json({ error: "Erişim reddedildi: Kendinizden yüksek veya eşit bir rol atayamazsınız." }, { status: 403 });
      }

      updateData.role = role;
    }

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData
    });

    return NextResponse.json({
      id: updatedUser.id,
      nickname: updatedUser.nickname,
      fullName: updatedUser.fullName,
      email: updatedUser.email
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
