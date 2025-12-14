import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
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
    // const userId = decoded.userId;
    const targetUserId = params.id;

    // Onay rozeti ver
    await prisma.user.update({
      where: { id: targetUserId },
      data: { hasBlueTick: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Give blue tick error:", error);
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
    // const userId = decoded.userId;
    const targetUserId = params.id;

    // Onay rozetini kaldır
    await prisma.user.update({
      where: { id: targetUserId },
      data: { hasBlueTick: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove blue tick error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
