import { NextRequest, NextResponse } from "next/server";
import { getPage } from "@/lib/pageContent";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const page = await getPage(slug);
        if (!page) {
            return NextResponse.json({ error: "Page not found" }, { status: 404 });
        }
        return NextResponse.json(page);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
