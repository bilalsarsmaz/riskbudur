import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const params = await context.params;
    const { username } = params;

    const lowerUsername = username;


    const user = await prisma.user.findFirst({
      where: {
        nickname: {
          equals: lowerUsername,


          mode: "insensitive"


        }


      },
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
