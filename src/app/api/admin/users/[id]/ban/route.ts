import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin } from "@/lib/adminAuth";

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
