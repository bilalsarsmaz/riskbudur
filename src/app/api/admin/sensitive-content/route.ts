import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || (decoded.role !== Role.ADMIN && decoded.role !== Role.ROOTADMIN)) {
            return NextResponse.json({ message: "Bu işlem için yetkiniz yok" }, { status: 403 });
        }

        const words = await prisma.sensitiveWord.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(words);
    } catch (error) {
        return NextResponse.json({ message: "Sunucu hatası" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || (decoded.role !== Role.ADMIN && decoded.role !== Role.ROOTADMIN)) {
            return NextResponse.json({ message: "Bu işlem için yetkiniz yok" }, { status: 403 });
        }

        const { words } = await req.json(); // Expecting string "word1, word2" or array
        if (!words) {
            return NextResponse.json({ message: "Kelime gerekli" }, { status: 400 });
        }

        let wordList: string[] = [];
        if (typeof words === 'string') {
            wordList = words.split(',').map(w => w.trim()).filter(w => w.length > 0);
        } else if (Array.isArray(words)) {
            wordList = words.map(w => String(w).trim()).filter(w => w.length > 0);
        }

        if (wordList.length === 0) {
            return NextResponse.json({ message: "Geçerli kelime bulunamadı" }, { status: 400 });
        }

        // Upsert or createMany (createMany skips duplicates if expected, but Prisma doesn't support ON CONFLICT DO NOTHING easily in createMany with SQLite/some adaptors, but Postgres does support skipDuplicates in createMany)
        // Let's use createMany with skipDuplicates: true
        const result = await prisma.sensitiveWord.createMany({
            data: wordList.map(w => ({
                word: w.toLowerCase(),
                createdBy: decoded.userId
            })),
            skipDuplicates: true
        });

        return NextResponse.json({ message: `${result.count} kelime eklendi`, count: result.count });

    } catch (error) {
        console.error("Sensitive Add Error:", error);
        return NextResponse.json({ message: "Ekleme başarısız" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || (decoded.role !== Role.ADMIN && decoded.role !== Role.ROOTADMIN)) {
            return NextResponse.json({ message: "Bu işlem için yetkiniz yok" }, { status: 403 });
        }

        const url = new URL(req.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return NextResponse.json({ message: "ID gerekli" }, { status: 400 });
        }

        await prisma.sensitiveWord.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Silindi" });
    } catch (error) {
        return NextResponse.json({ message: "Silme hatası" }, { status: 500 });
    }
}
