
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { TAGS } from "@/lib/translations";

export async function PATCH(
    request: Request,
    props: { params: Promise<{ code: string }> }
) {
    const params = await props.params;
    try {
        const token = request.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Only admins
        const user = await verifyToken(token);
        if (!user || user.role !== "ROOTADMIN") {
            if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { isActive, name } = body; // Allow updating name too if needed

        const language = await prisma.language.update({
            where: { code: params.code },
            data: {
                ...(isActive !== undefined && { isActive }),
                ...(name !== undefined && { name }),
            }
        });

        revalidateTag(TAGS.LANGUAGES);
        return NextResponse.json(language);

    } catch (error) {
        console.error("Update language error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
