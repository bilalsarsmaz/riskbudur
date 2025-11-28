import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "") ||
                  new URL(request.url).searchParams.get("token") ||
                  request.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = BigInt(decoded.userId);
    const targetUserId = BigInt(params.id);

    // İlişkili verileri sil
    await prisma.comment.deleteMany({
      where: { authorId: targetUserId }
    });

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
    const token = request.headers.get("authorization")?.replace("Bearer ", "") ||
                  new URL(request.url).searchParams.get("token") ||
                  request.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = BigInt(decoded.userId);
    const targetUserId = BigInt(params.id);

    const body = await request.json();
    const { fullName, nickname, email } = body;

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
      const lowerNickname = nickname.toLowerCase();
      if (lowerNickname.includes("admin") || lowerNickname.includes("ultraswall")) {
        return NextResponse.json(
          { error: "Kullanıcı adı 'admin' veya 'ultraswall' içeremez" },
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

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData
    });

    return NextResponse.json({
      id: Number(updatedUser.id),
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
