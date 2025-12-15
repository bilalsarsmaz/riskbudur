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

        const body = await req.json();
        const { requestId, status } = body; // status: APPROVED or REJECTED

        const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } });
        if (!request) return NextResponse.json({ message: "Request not found" }, { status: 404 });

        // Update request status
        await prisma.verificationRequest.update({
            where: { id: requestId },
            data: { status }
        });

        // 1. APPROVAL LOGIC
        if (status === "APPROVED") {
            await prisma.user.update({
                where: { id: request.userId },
                data: { hasBlueTick: true, verificationTier: "GREEN" } // GREEN maps to Default Color
            });
        }

        // 2. REJECTION LOGIC (Notification)
        else if (status === "REJECTED") {
            // Create a SYSTEM notification for the user
            // We use the user themselves as the 'actor' so their profile photo shows up in the notification card
            // mimicking: "[User Photo] [User Name] başvurunuz..."
            await prisma.notification.create({
                data: {
                    type: "SYSTEM",
                    recipientId: request.userId,
                    actorId: request.userId, // Self-notification to show own avatar
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
