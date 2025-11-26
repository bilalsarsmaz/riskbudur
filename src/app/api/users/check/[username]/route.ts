import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: { username: string } }
) {
  try {
    const { username } = context.params;

    const user = await prisma.user.findUnique({
      where: { nickname: username },
      select: { id: true, nickname: true }
    });

    return NextResponse.json({ 
      exists: !!user,
      username: user?.nickname || null
    });
  } catch (error) {
    console.error("Username kontrol hatası:", error);
    return NextResponse.json(
      { exists: false, username: null },
      { status: 500 }
    );
  }
}
