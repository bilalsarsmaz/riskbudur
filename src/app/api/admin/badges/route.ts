import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";

// Get pending requests (Force Rebuild)
export async function GET(req: Request) {
    try {
        // Admin yetki kontrolü
        const authResult = await verifyAdmin(req);
        if (authResult.error) {
            return authResult.error;
        }

        // Kısıtlama: Sadece ADMIN ve SUPERADMIN erişebilir (Moderatör erişemez)
        if (authResult.user?.role === 'MODERATOR') {
            return NextResponse.json({ message: "Erişim reddedildi: Bu işlem için yetkiniz yok." }, { status: 403 });
        }

        const requests = await prisma.verificationRequest.findMany({
            where: { status: "PENDING" },
            include: { user: { select: { nickname: true, email: true, profileImage: true, fullName: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(requests);

    } catch (error) {
        console.error("Admin Badges GET Error:", error);
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}

// Approve/Reject
export async function PUT(req: Request) {
    try {
        // Admin yetki kontrolü
        const authResult = await verifyAdmin(req);
        if (authResult.error) {
            return authResult.error;
        }

        // Kısıtlama: Sadece ADMIN ve SUPERADMIN erişebilir (Moderatör erişemez)
        if (authResult.user?.role === 'MODERATOR') {
            return NextResponse.json({ message: "Erişim reddedildi: Bu işlem için yetkiniz yok." }, { status: 403 });
        }

        const body = await req.json();
        const { requestId, status } = body; // status: APPROVED or REJECTED

        const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } });
        if (!request) return NextResponse.json({ message: "Request not found" }, { status: 404 });

        // Update request status
        await prisma.verificationRequest.update({
            where: { id: requestId },
            data: { status }
        });

        const admin = authResult.user;

        // 1. APPROVAL LOGIC
        if (status === "APPROVED") {
            await prisma.user.update({
                where: { id: request.userId },
                data: { hasBlueTick: true, verificationTier: "GREEN" }
            });

            // Create Notification
            await prisma.notification.create({
                data: {
                    type: "VERIFICATION_APPROVED",
                    recipientId: request.userId,
                    actorId: admin.id,
                    read: false,
                }
            });
        }

        // 2. REJECTION LOGIC
        else if (status === "REJECTED") {
            await prisma.notification.create({
                data: {
                    type: "VERIFICATION_REJECTED",
                    recipientId: request.userId,
                    actorId: admin.id,
                    read: false,
                }
            });
        }

        return NextResponse.json({ message: `Request ${status}` });

    } catch (error) {
        console.error("Admin Badges PUT Error:", error);
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}
