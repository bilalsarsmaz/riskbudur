
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenAndUpdateActivity } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const decoded = await verifyTokenAndUpdateActivity(token);

    // If verifyTokenAndUpdateActivity returns null (due to invalid token OR BAN), we return 401
    if (!decoded) {
        return NextResponse.json({ authenticated: false, reason: "banned_or_invalid" }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
}
