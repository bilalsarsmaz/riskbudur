import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "E-posta adresi gerekli" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Security: Don't reveal if user exists
            return NextResponse.json({ message: "Eğer bu adrese kayıtlı bir hesap varsa, sıfırlama bağlantısı gönderildi." });
        }

        // Since we don't have an email provider configured (SMTP/Resend/SendGrid),
        // we will simulate the process.
        // In a real app, generate a token, save to DB, and send email.

        console.log(`[DEV MODE] Password reset requested for: ${email}`);
        // console.log(`[DEV MODE] Reset Link: http://localhost:3000/reset-password?token=...`);

        return NextResponse.json({
            message: "Eğer bu adrese kayıtlı bir hesap varsa, sıfırlama bağlantısı gönderildi."
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { message: "Bir hata oluştu" },
            { status: 500 }
        );
    }
}
