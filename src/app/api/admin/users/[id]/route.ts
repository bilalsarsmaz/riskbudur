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

    if (targetUser?.role === 'SUPERADMIN') {
      return NextResponse.json({ error: "Süper Admin silinemez!" }, { status: 403 });
    }

    // İlişkili verileri sil
    await prisma.comment.deleteMany({
      where: { authorId: targetUserId }
    });

    // Like.userId is String
    await prisma.like.deleteMany({
      where: { userId: targetUserId }
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
      updateData.verificationTier = verificationTier;
      updateData.hasBlueTick = verificationTier !== 'NONE';
    }
    if (role !== undefined) {
      if (role === 'SUPERADMIN') {
        return NextResponse.json({ error: "Süper Admin rolü atanamaz!" }, { status: 403 });
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
