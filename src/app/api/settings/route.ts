
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("authorization")?.replace("Bearer ", "");
        // Allow public access or strictly authenticated?
        // User asked for site feature toggles. Home page uses it. Home page checks auth.
        // Let's verify token to be safe, but maybe allowed if public pages need it?
        // For now, consistent with other APIs, verify token.

        if (token) {
            await verifyToken(token);
        }
        // Actually, if we want to support public pages having toggles later, we might relax this.
        // But currently request is for TimelineTabs which is inside Home (Auth required).

        const settings = await prisma.systemSetting.findMany();

        // Convert to object for easier client usage: { "key": "value" }
        const settingsMap = settings.reduce((acc: Record<string, string>, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error("Settings fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
