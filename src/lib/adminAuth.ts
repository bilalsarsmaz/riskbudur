import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function verifyAdmin(req: Request) {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
        return { error: NextResponse.json({ message: "Yetkilendirme gerekli" }, { status: 401 }) };
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
        return { error: NextResponse.json({ message: "Geçersiz oturum" }, { status: 401 }) };
    }

    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true, email: true } // Select minimal fields needed
    });

    if (!user) {
        return { error: NextResponse.json({ message: "Kullanıcı bulunamadı" }, { status: 404 }) };
    }

    // Check roles
    const authorizedRoles = ['ADMIN', 'MODERATOR', 'SUPERADMIN'];
    if (!user.role || !authorizedRoles.includes(user.role)) {
        return { error: NextResponse.json({ message: "Erişim reddedildi: Yetkiniz yok." }, { status: 403 }) };
    }

    // Return user if authorized
    return { user };
}
