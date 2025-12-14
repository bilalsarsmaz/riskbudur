import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const latestId = searchParams.get('latestId');

        if (!latestId) {
            return NextResponse.json({ count: 0 });
        }

        const count = await prisma.post.count({
            where: {
                id: {
                    gt: BigInt(latestId)
                },
                parentPostId: null // Sadece ana gonderileri say, yanitlari degil
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error("Yeni post kontrolü hatası:", error);
        return NextResponse.json(
            { message: "Bir hata oluştu" },
            { status: 500 }
        );
    }
}
