import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";



export async function GET(req: Request) {
  try {
    // Admin yetki kontrolü
    const authResult = await verifyAdmin(req);
    if (authResult.error) {
      return authResult.error;
    }
    // const user = authResult.user; // Authorized user if needed

    // Tüm kullanıcıları getir

    // Tüm kullanıcıları getir
    const users = await prisma.user.findMany({
      where: {
        isApproved: true
      },
      select: {
        id: true,
        nickname: true,
        fullName: true,
        email: true,
        profileImage: true,
        hasBlueTick: true,
        verificationTier: true,
        isBanned: true,
        isApproved: true,
        createdAt: true,
        role: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(users.map(user => ({
      id: user.id,
      nickname: user.nickname,
      fullName: user.fullName,
      email: user.email,
      profileImage: user.profileImage,
      hasBlueTick: user.hasBlueTick || false,
      verificationTier: user.verificationTier || 'NONE',
      isBanned: user.isBanned || false,
      isApproved: user.isApproved || false,
      role: user.role || 'USER',
      createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString()
    })));
  } catch (error: any) {
    console.error("Users list error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
