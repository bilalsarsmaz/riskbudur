import { NextRequest, NextResponse } from "next/server";
import { getPages, updatePage, deletePage } from "@/lib/pageContent";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const pages = await getPages();
        return NextResponse.json(pages);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { slug, content, title, subtitle } = body;

        if (!slug || !content) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const updatedPage = await updatePage(slug, content, title, subtitle);
        if (!updatedPage) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 });
        }

        return NextResponse.json(updatedPage);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json({ error: "Slug required" }, { status: 400 });
        }

        const success = await deletePage(slug);
        if (!success) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
