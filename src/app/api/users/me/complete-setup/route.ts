import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function PUT(req: Request) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!process.env.JWT_SECRET) {
            return NextResponse.json({ error: "Server Error" }, { status: 500 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
        const userId = decoded.userId;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { isSetupComplete: true }
        });

        // Yeni token ver (Setup true olduğu için)
        const newToken = jwt.sign(
            { userId: updatedUser.id, email: updatedUser.email, role: updatedUser.role, isSetupComplete: true },
            process.env.JWT_SECRET,
            { expiresIn: "365d" }
        );

        const response = NextResponse.json({ success: true, token: newToken });

        // Cookie güncelle
        response.cookies.set({
            name: 'token',
            value: newToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error("Setup complete error:", error);
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
