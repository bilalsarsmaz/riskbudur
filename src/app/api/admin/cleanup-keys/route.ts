
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const result = await prisma.translation.deleteMany({
            where: {
                key: {
                    startsWith: "who_to_follow."
                }
            }
        });
        return NextResponse.json({ success: true, count: result.count });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
