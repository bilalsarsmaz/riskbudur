
import { NextResponse } from "next/server";
import { getTranslations } from "@/lib/translations";

export async function GET(
    request: Request,
    context: { params: Promise<{ lang: string }> }
) {
    const params = await context.params;
    const translations = await getTranslations(params.lang.toLowerCase());
    return NextResponse.json(translations);
}
