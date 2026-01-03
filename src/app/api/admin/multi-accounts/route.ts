import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET(req: Request) {
    try {
        const token = req.headers.get("authorization")?.split(" ")[1];
        if (!token) {
            return NextResponse.json(
                { message: "Yetkilendirme gerekli" },
                { status: 401 }
            );
        }

        const decoded = await verifyToken(token);
        if (!decoded || (decoded.role !== Role.ADMIN && decoded.role !== Role.ROOTADMIN)) {
            return NextResponse.json(
                { message: "Bu işlem için yetkiniz yok" },
                { status: 403 }
            );
        }

        // 1. IP adresine göre grupla ve sayısı 1'den fazla olanları bul
        // Prisma'da groupBy kullanarak count > 1 olanları filtrelemek için:
        const groupedIps = await prisma.user.groupBy({
            by: ['ipAddress'],
            _count: {
                ipAddress: true
            },
            having: {
                ipAddress: {
                    _count: {
                        gt: 1
                    }
                }
            }
        });

        // 2. Bu IP'lere sahip kullanıcıları çek
        const targetIps = groupedIps
            .map(g => g.ipAddress)
            .filter((ip): ip is string => ip !== null && ip !== "127.0.0.1"); // Localhost'u hariç tutabiliriz veya tutmayabiliriz, genelde test için tutulur ama gerçekte çokça olabilir. Şimdilik "127.0.0.1" hariç diyelim mi? Kullanıcı isteyebilir. Şimdilik hepsini alalım.

        if (targetIps.length === 0) {
            return NextResponse.json([]);
        }

        const users = await prisma.user.findMany({
            where: {
                ipAddress: {
                    in: targetIps
                }
            },
            select: {
                id: true,
                nickname: true,
                fullName: true,
                email: true,
                profileImage: true,
                role: true,
                isBanned: true,
                ipAddress: true,
                createdAt: true,
                lastSeen: true
            },
            orderBy: {
                lastSeen: 'desc'
            }
        });

        // 3. Kullanıcıları IP'ye göre JS tarafında grupla
        const result = targetIps.map(ip => {
            const usersInIp = users.filter(u => u.ipAddress === ip);
            return {
                ipAddress: ip,
                count: usersInIp.length,
                users: usersInIp
            };
        }).sort((a, b) => b.count - a.count); // En çok hesap olan IP en üstte

        return NextResponse.json(result);

    } catch (error) {
        console.error("Multi-account fetch error:", error);
        return NextResponse.json(
            { message: "Veriler alınırken bir hata oluştu" },
            { status: 500 }
        );
    }
}
