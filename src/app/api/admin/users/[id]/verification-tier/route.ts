
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || decoded.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { tier } = await req.json();
        const userId = params.id; // User ID is explicitly passed as number in frontend but it is string in DB

        // Note: frontend passes userId as number (legacy) but DB uses CUID (string).
        // Admin list fetches users and might be getting integer IDs if they were legacy, but schema says String @cuid.
        // Let's verify what `fetchUsers` returns. The User interface in admincp/users/page.tsx defines id as number.
        // But the prisma schema says id is String.
        // The frontend interface might be wrong.

        // For now, let's assume valid ID is passed.

        await prisma.user.update({
            where: { id: userId.toString() }, // Ensure string
            data: {
                verificationTier: tier,
                hasBlueTick: tier !== 'NONE' // Sync legacy field
            }
        });

        // Create system notification for the user
        // Determine notification type based on tier
        const isApproval = tier !== 'NONE';
        const notificationType = isApproval ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED';

        console.log(`[DEBUG] Tier Update: User=${userId}, Tier=${tier}, Type=${notificationType}, Actor=${decoded.userId}`);

        try {
            const notif = await prisma.notification.create({
                data: {
                    type: notificationType,
                    recipientId: userId.toString(),
                    actorId: decoded.userId, // Admin who performed the action
                    read: false,
                }
            });
            console.log("[DEBUG] Notification created:", notif.id);
        } catch (notifError) {
            console.error("[DEBUG] Notification creation failed:", notifError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Verification tier update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
