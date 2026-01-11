
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

import { cookies } from "next/headers";

export async function GET(request: Request) {
    try {
        let token = request.headers.get("Authorization")?.split(" ")[1];

        // Fallback to cookie for browser access
        if (!token) {
            const cookieStore = await cookies();
            token = cookieStore.get("token")?.value;
        }

        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Allow any admin to seed for now
        const user = await verifyToken(token);
        if (!user || (user.role !== "ADMIN" && user.role !== "ROOTADMIN")) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 1. Languages
        const languages = [
            { code: "tr", name: "Türkçe", isDefault: true },
            { code: "en", name: "English", isDefault: false },
            { code: "fr", name: "Français", isDefault: false },
            { code: "it", name: "Italiano", isDefault: false },
        ];

        for (const lang of languages) {
            await prisma.language.upsert({
                where: { code: lang.code },
                update: {},
                create: {
                    code: lang.code,
                    name: lang.name,
                    isDefault: lang.isDefault
                }
            });
        }

        // 2. Initial Translations (Sidebar)
        const trTranslations: Record<string, string> = {
            "sidebar.dashboard": "Dashboard",
            "sidebar.chat": "Chat",
            "sidebar.users": "Kullanıcılar",
            "sidebar.users_list": "Kullanıcı Listesi",
            "sidebar.approve_users": "Üye Onay Havuzu",
            "sidebar.badges": "Rozet Talepleri",
            "sidebar.bans": "Cezalı Hesaplar",
            "sidebar.content": "İçerik",
            "sidebar.posts": "Gönderi Yönetimi",
            "sidebar.reports": "Şikayetler",
            "sidebar.sensitive": "Hassas İçerik",
            "sidebar.system": "Sistem",
            "sidebar.status": "Sunucu Durumu",
            "sidebar.announcements": "Duyuru Yönetimi",
            "sidebar.pages": "Sayfa Yönetimi",
            "sidebar.ghost_message": "Ghost Mesaj",
            "sidebar.settings": "Ayarlar",
            "sidebar.back_platform": "Platforma Dön",
            "sidebar.languages": "Dil Yönetimi",
            "sidebar.logout": "Çıkış Yap"
        };

        const enTranslations: Record<string, string> = {
            "sidebar.dashboard": "Dashboard",
            "sidebar.chat": "Chat",
            "sidebar.users": "Users",
            "sidebar.users_list": "User List",
            "sidebar.approve_users": "Approval Queue",
            "sidebar.badges": "Badge Requests",
            "sidebar.bans": "Banned Accounts",
            "sidebar.content": "Content",
            "sidebar.posts": "Post Management",
            "sidebar.reports": "Reports",
            "sidebar.sensitive": "Sensitive Content",
            "sidebar.system": "System",
            "sidebar.status": "Server Status",
            "sidebar.announcements": "Announcements",
            "sidebar.pages": "Page Management",
            "sidebar.ghost_message": "Ghost Message",
            "sidebar.settings": "Settings",
            "sidebar.back_platform": "Back to Platform",
            "sidebar.languages": "Language Management",
            "sidebar.logout": "Logout"
        };

        // Helper to seed
        const seedLang = async (code: string, map: Record<string, string>) => {
            for (const [key, value] of Object.entries(map)) {
                await prisma.translation.upsert({
                    where: {
                        languageCode_key: {
                            languageCode: code,
                            key: key
                        }
                    },
                    update: {},
                    create: {
                        languageCode: code,
                        key,
                        value
                    }
                });
            }
        };

        await seedLang("tr", trTranslations);
        await seedLang("en", enTranslations);
        // Seed others as English for now or empty? Let's leave empty so they see fallback or we can copy EN.
        await seedLang("fr", enTranslations); // Fallback
        await seedLang("it", enTranslations); // Fallback

        return NextResponse.json({ success: true, message: "Seeding completed" });

    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
