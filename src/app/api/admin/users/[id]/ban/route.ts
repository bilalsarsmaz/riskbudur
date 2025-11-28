import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import jwt from "jsonwebtoken";

export async function POST(
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
    const token = request.headers.get("authorization")?.replace("Bearer ", "") ||
                  new URL(request.url).searchParams.get("token") ||
                  request.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = BigInt(decoded.userId);
    const targetUserId = BigInt(params.id);

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
