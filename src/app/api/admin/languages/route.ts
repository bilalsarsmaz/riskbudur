
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { TAGS } from "@/lib/translations";

export async function GET(request: Request) {
    try {
        const token = request.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || (user.role !== "ADMIN" && user.role !== "ROOTADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const languages = await prisma.language.findMany({
            orderBy: { isDefault: 'desc' }
        });

        return NextResponse.json(languages);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const token = request.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const user = await verifyToken(token);
        if (!user || user.role !== "ROOTADMIN") { // Only Root can add languages maybe? Or Admin too. Let's allow Admin.
            if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { code, name } = body;

        if (!code || !name) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const language = await prisma.language.create({
            data: {
                code: code.toLowerCase(),
                name,
                isActive: true,
                isDefault: false, // Default should be set explicitly via another endpoint usually
            }
        });

        revalidateTag(TAGS.LANGUAGES);
        return NextResponse.json(language);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
