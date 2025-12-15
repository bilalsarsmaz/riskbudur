import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ message: "Geçersiz oturum" }, { status: 401 });

        const { fullName, category, description, identityImage } = await req.json();

        if (!identityImage) {
            return NextResponse.json({ message: "Lütfen bir kimlik fotoğrafı yükleyin." }, { status: 400 });
        }

        // Save to database
        await prisma.verificationRequest.create({
            data: {
                userId: decoded.userId,
                fullName,
                category,
                description,
                identityImageUrl: identityImage, // Saving base64 directly for now (development mode)
            }
        });

        console.log(`[VERIFICATION REQUEST] User: ${decoded.email} applied.`);

        return NextResponse.json({ message: "Başvurunuz alındı! İncelendikten sonra size dönüş yapılacaktır." });

    } catch (error) {
        console.error("Verification Request Error:", error);
        return NextResponse.json({ message: "Bir hata oluştu" }, { status: 500 });
    }
}
