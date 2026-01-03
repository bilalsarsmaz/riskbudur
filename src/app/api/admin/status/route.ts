import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import { getSystemSettings, updateSystemSettings } from "@/lib/settings";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        // Allow ADMIN/ROOTADMIN or anyone with MANAGE_PAGES (proxy for system view)
        if (!decoded || (!hasPermission(decoded.role as any, Permission.MANAGE_PAGES) && decoded.role !== 'ROOTADMIN')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 1. DB Health Check
        let dbStatus = "unknown";
        let dbLatency = 0;
        try {
            const start = performance.now();
            await prisma.$queryRaw`SELECT 1`;
            const end = performance.now();
            dbLatency = Math.round(end - start);
            dbStatus = "connected";
        } catch (e) {
            console.error("DB Check failed:", e);
            dbStatus = "error";
        }

        // 2. System Metrics
        const memUsage = process.memoryUsage();
        const uptime = process.uptime();

        // 3. Settings
        const settings = await getSystemSettings();

        // 4. API Health (Self-check implied by this response)

        return NextResponse.json({
            status: "ok",
            db: {
                status: dbStatus,
                latency: dbLatency
            },
            system: {
                uptime: uptime,
                memory: {
                    rss: Math.round(memUsage.rss / 1024 / 1024), // MB
                    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
                    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
                },
                nodeVersion: process.version,
                platform: process.platform,
                cpuLoad: 0 // Cannot reliably get without os-utils, sending 0 as placeholder
            },
            settings: settings,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Status API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.headers.get("Authorization")?.split(" ")[1];
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const decoded = await verifyToken(token);
        if (!decoded || (!hasPermission(decoded.role as any, Permission.MANAGE_PAGES) && decoded.role !== 'ROOTADMIN')) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();
        const { action, maintenanceMode, clearCache } = body;

        if (action === "update_settings") {
            if (maintenanceMode !== undefined) {
                const updated = await updateSystemSettings({ maintenanceMode });
                return NextResponse.json({ success: true, settings: updated });
            }
        }

        if (action === "clear_cache") {
            // Revalidate all
            revalidatePath("/", "layout");
            return NextResponse.json({ success: true, message: "Cache revalidation triggered" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Status API POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
