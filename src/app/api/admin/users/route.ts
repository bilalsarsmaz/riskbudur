import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";



export async function GET(req: Request) {
  try {
    // Token kontrolü
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") || authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Kullanıcı kontrolü
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Tüm kullanıcıları getir
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        fullName: true,
        email: true,
        profileImage: true,
        hasBlueTick: true,
        verificationTier: true,
        isBanned: true,
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
