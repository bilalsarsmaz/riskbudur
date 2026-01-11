
import { NextResponse } from "next/server";
import { getTranslations } from "@/lib/translations";

export async function GET(
    request: Request,
    { params }: { params: { lang: string } }
) {
    const translations = await getTranslations(params.lang.toLowerCase());
    return NextResponse.json(translations);
}
