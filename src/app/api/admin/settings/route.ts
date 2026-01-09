
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function PUT(req: Request) {
    try {
        const token = req.headers.get("authorization")?.replace("Bearer ", "");
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string };
            const adminUser = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { role: true }
            });

            const allowedRoles = ['ADMIN', 'ROOTADMIN'];
            if (!adminUser || !adminUser.role || !allowedRoles.includes(adminUser.role)) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        } catch (e) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const body = await req.json();
        const { key, value, description } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ error: "Key and value are required" }, { status: 400 });
        }

        const setting = await prisma.systemSetting.upsert({
            where: { key },
            update: {
                value: String(value),
                ...(description && { description })
            },
            create: {
                key,
                value: String(value),
                description: description || null
            }
        });

        return NextResponse.json(setting);
    } catch (error) {
        console.error("Settings update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
