
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { TAGS } from "@/lib/translations";

export async function GET(
    request: Request,
    props: { params: Promise<{ lang: string }> }
) {
    const params = await props.params;
    try {
        const token = request.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || (user.role !== "ADMIN" && user.role !== "ROOTADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Get all translations for this language
        const translations = await prisma.translation.findMany({
            where: { languageCode: params.lang.toLowerCase() },
            orderBy: { key: 'asc' }
        });

        return NextResponse.json(translations);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    props: { params: Promise<{ lang: string }> }
) {
    const params = await props.params;
    try {
        const token = request.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || user.role !== "ROOTADMIN") { // Only Root can edit hard translations usually? Let's allow Admin.
            if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { updates } = body; // Array of { key, value }

        if (!Array.isArray(updates)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const languageCode = params.lang.toLowerCase();

        // Transaction to update all
        await prisma.$transaction(
            updates.map((item: { key: string; value: string }) =>
                prisma.translation.upsert({
                    where: {
                        languageCode_key: {
                            languageCode,
                            key: item.key
                        }
                    },
                    update: { value: item.value },
                    create: {
                        languageCode,
                        key: item.key,
                        value: item.value
                    }
                })
            )
        );

        revalidateTag(TAGS.TRANSLATIONS);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Translation update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
