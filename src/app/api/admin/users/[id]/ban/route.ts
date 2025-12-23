import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";
import { hasPermission, Permission, canManageRole, Role } from "@/lib/permissions";

export async function POST(
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

    // Check permissions
    const actorRole = authResult.user.role as Role;

    if (!hasPermission(actorRole, Permission.BAN_USER)) {
      return NextResponse.json({ error: "Yetkisiz işlem: Banlama yetkiniz yok." }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true }
    });

    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const targetRole = targetUser.role as Role;

    if (!canManageRole(actorRole, targetRole)) {
      return NextResponse.json({ error: "Yetkisiz işlem: Sizinle aynı veya daha yüksek yetkiye sahip bir kullanıcıyı banlayamazsınız." }, { status: 403 });
    }

    // Kullanıcıyı banla
    await prisma.user.update({
      where: { id: targetUserId },
      data: { isBanned: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ban user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




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

    // Unban requires same as ban permission usually
    const actorRole = authResult.user.role as Role;

    if (!hasPermission(actorRole, Permission.BAN_USER)) {
      return NextResponse.json({ error: "Yetkisiz işlem: Ban açma yetkiniz yok." }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true }
    });

    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const targetRole = targetUser.role as Role;

    if (!canManageRole(actorRole, targetRole)) {
      return NextResponse.json({ error: "Yetkisiz işlem: Yetkiniz yetersiz." }, { status: 403 });
    }

    // Banı kaldır
    await prisma.user.update({
      where: { id: targetUserId },
      data: { isBanned: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unban user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
