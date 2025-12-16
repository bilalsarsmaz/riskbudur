import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";

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

    // Check if target user is SUPERADMIN
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true }
    });

    // TypeScript might complain if types are stale, cast to ensure check passes
    if ((targetUser?.role as unknown as string) === 'SUPERADMIN') {
      return NextResponse.json({ error: "Süper Admin silinemez!" }, { status: 403 });
    }

    // Kısıtlama: Moderatörler Adminleri ve Süper Adminleri silemez
    if (authResult.user?.role === 'MODERATOR' && (targetUser?.role === 'ADMIN' || (targetUser?.role as unknown as string) === 'SUPERADMIN')) {
      return NextResponse.json({ error: "Yetkisiz işlem: Yönetici hesaplarını silemezsiniz." }, { status: 403 });
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

    // Check if target user is SUPERADMIN

    // Check if target user is SUPERADMIN
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true }
    });

    if (targetUser?.role === 'SUPERADMIN') {
      return NextResponse.json({ error: "Süper Admin düzenlenemez!" }, { status: 403 });
    }

    const body = await request.json();
    const { fullName, nickname, email, verificationTier, role } = body;

    // Güncelleme verilerini hazırla
    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (nickname !== undefined) {
      // Nickname validasyonu
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
      // Admin API allows setting restricted nicknames
      // const lowerNickname = nickname.toLowerCase();
      // if (lowerNickname.includes("admin") || lowerNickname.includes("riskbudur")) {
      //   return NextResponse.json(
      //     { error: "Kullanıcı adı 'admin' veya 'riskbudur' içeremez" },
      //     { status: 400 }
      //   );
      // }
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
    if (email !== undefined) {
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
      // Kısıtlama: Moderatörler doğrulama seviyesini değiştiremez
      if (authResult.user?.role === 'MODERATOR') {
        return NextResponse.json({ error: "Erişim reddedildi: Doğrulama seviyesini değiştirme yetkiniz yok." }, { status: 403 });
      }

      updateData.verificationTier = verificationTier;
      updateData.hasBlueTick = verificationTier !== 'NONE';
    }
    if (role !== undefined) {
      if ((role as unknown as string) === 'SUPERADMIN') {
        return NextResponse.json({ error: "Süper Admin rolü atanamaz!" }, { status: 403 });
      }

      // Kısıtlama: Moderatörler rol değiştiremez
      if (authResult.user?.role === 'MODERATOR') {
        return NextResponse.json({ error: "Erişim reddedildi: Rol değiştirme yetkiniz yok." }, { status: 403 });
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
