import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// HIERARCHICAL ADMIN TRANSLATIONS
// admin.sidebar.*
// admin.dashboard.*
// admin.pages.*

export async function POST(request: Request) {
    try {
        const token = request.headers.get("authorization")?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || (decoded.role !== "ROOTADMIN" && decoded.role !== "ADMIN")) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const translations = [
            // ADMIN SIDEBAR
            { languageCode: 'tr', key: 'admin.sidebar.dashboard', value: 'Dashboard' },
            { languageCode: 'en', key: 'admin.sidebar.dashboard', value: 'Dashboard' },
            { languageCode: 'fr', key: 'admin.sidebar.dashboard', value: 'Dashboard' },
            { languageCode: 'it', key: 'admin.sidebar.dashboard', value: 'Dashboard' },
            { languageCode: 'tr', key: 'admin.sidebar.chat', value: 'Admin Chat' },
            { languageCode: 'en', key: 'admin.sidebar.chat', value: 'Admin Chat' },
            { languageCode: 'fr', key: 'admin.sidebar.chat', value: 'Admin Chat' },
            { languageCode: 'it', key: 'admin.sidebar.chat', value: 'Admin Chat' },
            { languageCode: 'tr', key: 'admin.sidebar.users', value: 'Kullanıcılar' },
            { languageCode: 'en', key: 'admin.sidebar.users', value: 'Users' },
            { languageCode: 'fr', key: 'admin.sidebar.users', value: 'Users' },
            { languageCode: 'it', key: 'admin.sidebar.users', value: 'Users' },
            { languageCode: 'tr', key: 'admin.sidebar.users_list', value: 'Kullanıcı Listesi' },
            { languageCode: 'en', key: 'admin.sidebar.users_list', value: 'User List' },
            { languageCode: 'fr', key: 'admin.sidebar.users_list', value: 'User List' },
            { languageCode: 'it', key: 'admin.sidebar.users_list', value: 'User List' },
            { languageCode: 'tr', key: 'admin.sidebar.approve_users', value: 'Onay Bekleyenler' },
            { languageCode: 'en', key: 'admin.sidebar.approve_users', value: 'Pending Approval' },
            { languageCode: 'fr', key: 'admin.sidebar.approve_users', value: 'Pending Approval' },
            { languageCode: 'it', key: 'admin.sidebar.approve_users', value: 'Pending Approval' },
            { languageCode: 'tr', key: 'admin.sidebar.badges', value: 'Rozet Talepleri' },
            { languageCode: 'en', key: 'admin.sidebar.badges', value: 'Badge Requests' },
            { languageCode: 'fr', key: 'admin.sidebar.badges', value: 'Badge Requests' },
            { languageCode: 'it', key: 'admin.sidebar.badges', value: 'Badge Requests' },
            { languageCode: 'tr', key: 'admin.sidebar.bans', value: 'Banlı Hesaplar' },
            { languageCode: 'en', key: 'admin.sidebar.bans', value: 'Banned Accounts' },
            { languageCode: 'fr', key: 'admin.sidebar.bans', value: 'Banned Accounts' },
            { languageCode: 'it', key: 'admin.sidebar.bans', value: 'Banned Accounts' },
            { languageCode: 'tr', key: 'admin.sidebar.content', value: 'İçerik & Rapor' },
            { languageCode: 'en', key: 'admin.sidebar.content', value: 'Content & Reports' },
            { languageCode: 'fr', key: 'admin.sidebar.content', value: 'Content & Reports' },
            { languageCode: 'it', key: 'admin.sidebar.content', value: 'Content & Reports' },
            { languageCode: 'tr', key: 'admin.sidebar.posts', value: 'Gönderi Yönetimi' },
            { languageCode: 'en', key: 'admin.sidebar.posts', value: 'Post Management' },
            { languageCode: 'fr', key: 'admin.sidebar.posts', value: 'Post Management' },
            { languageCode: 'it', key: 'admin.sidebar.posts', value: 'Post Management' },
            { languageCode: 'tr', key: 'admin.sidebar.reports', value: 'Şikayetler' },
            { languageCode: 'en', key: 'admin.sidebar.reports', value: 'Reports' },
            { languageCode: 'fr', key: 'admin.sidebar.reports', value: 'Reports' },
            { languageCode: 'it', key: 'admin.sidebar.reports', value: 'Reports' },
            { languageCode: 'tr', key: 'admin.sidebar.sensitive', value: 'Hassas İçerik' },
            { languageCode: 'en', key: 'admin.sidebar.sensitive', value: 'Sensitive Content' },
            { languageCode: 'fr', key: 'admin.sidebar.sensitive', value: 'Sensitive Content' },
            { languageCode: 'it', key: 'admin.sidebar.sensitive', value: 'Sensitive Content' },
            { languageCode: 'tr', key: 'admin.sidebar.system', value: 'Sistem & Araçlar' },
            { languageCode: 'en', key: 'admin.sidebar.system', value: 'System & Tools' },
            { languageCode: 'fr', key: 'admin.sidebar.system', value: 'System & Tools' },
            { languageCode: 'it', key: 'admin.sidebar.system', value: 'System & Tools' },
            { languageCode: 'tr', key: 'admin.sidebar.status', value: 'Sistem Durumu' },
            { languageCode: 'en', key: 'admin.sidebar.status', value: 'System Status' },
            { languageCode: 'fr', key: 'admin.sidebar.status', value: 'System Status' },
            { languageCode: 'it', key: 'admin.sidebar.status', value: 'System Status' },
            { languageCode: 'tr', key: 'admin.sidebar.announcements', value: 'Duyurular' },
            { languageCode: 'en', key: 'admin.sidebar.announcements', value: 'Announcements' },
            { languageCode: 'fr', key: 'admin.sidebar.announcements', value: 'Announcements' },
            { languageCode: 'it', key: 'admin.sidebar.announcements', value: 'Announcements' },
            { languageCode: 'tr', key: 'admin.sidebar.pages', value: 'Sayfalar' },
            { languageCode: 'en', key: 'admin.sidebar.pages', value: 'Pages' },
            { languageCode: 'fr', key: 'admin.sidebar.pages', value: 'Pages' },
            { languageCode: 'it', key: 'admin.sidebar.pages', value: 'Pages' },
            { languageCode: 'tr', key: 'admin.sidebar.ghost_message', value: 'Hayalet Mesaj' },
            { languageCode: 'en', key: 'admin.sidebar.ghost_message', value: 'Ghost Message' },
            { languageCode: 'fr', key: 'admin.sidebar.ghost_message', value: 'Ghost Message' },
            { languageCode: 'it', key: 'admin.sidebar.ghost_message', value: 'Ghost Message' },
            { languageCode: 'tr', key: 'admin.sidebar.languages', value: 'Diller' },
            { languageCode: 'en', key: 'admin.sidebar.languages', value: 'Languages' },
            { languageCode: 'fr', key: 'admin.sidebar.languages', value: 'Languages' },
            { languageCode: 'it', key: 'admin.sidebar.languages', value: 'Languages' },
            { languageCode: 'tr', key: 'admin.sidebar.settings', value: 'Site Ayarları' },
            { languageCode: 'en', key: 'admin.sidebar.settings', value: 'Site Settings' },
            { languageCode: 'fr', key: 'admin.sidebar.settings', value: 'Site Settings' },
            { languageCode: 'it', key: 'admin.sidebar.settings', value: 'Site Settings' },
            { languageCode: 'tr', key: 'admin.sidebar.back_platform', value: 'Platforma Dön' },
            { languageCode: 'en', key: 'admin.sidebar.back_platform', value: 'Back to Platform' },
            { languageCode: 'fr', key: 'admin.sidebar.back_platform', value: 'Back to Platform' },
            { languageCode: 'it', key: 'admin.sidebar.back_platform', value: 'Back to Platform' },
            { languageCode: 'tr', key: 'admin.sidebar.logout', value: 'Çıkış Yap' },
            { languageCode: 'en', key: 'admin.sidebar.logout', value: 'Log Out' },
            { languageCode: 'fr', key: 'admin.sidebar.logout', value: 'Log Out' },
            { languageCode: 'it', key: 'admin.sidebar.logout', value: 'Log Out' },

            // ADMIN DASHBOARD
            { languageCode: 'tr', key: 'admin.dashboard.title', value: 'Gösterge Paneli' },
            { languageCode: 'en', key: 'admin.dashboard.title', value: 'Dashboard' },
            { languageCode: 'fr', key: 'admin.dashboard.title', value: 'Dashboard' },
            { languageCode: 'it', key: 'admin.dashboard.title', value: 'Dashboard' },
            { languageCode: 'tr', key: 'admin.dashboard.subtitle', value: 'Site istatistikleri ve genel durum' },
            { languageCode: 'en', key: 'admin.dashboard.subtitle', value: 'Site statistics and overview' },
            { languageCode: 'fr', key: 'admin.dashboard.subtitle', value: 'Site statistics and overview' },
            { languageCode: 'it', key: 'admin.dashboard.subtitle', value: 'Site statistics and overview' },
            { languageCode: 'tr', key: 'admin.dashboard.total_users', value: 'Toplam Kullanıcı' },
            { languageCode: 'en', key: 'admin.dashboard.total_users', value: 'Total Users' },
            { languageCode: 'fr', key: 'admin.dashboard.total_users', value: 'Total Users' },
            { languageCode: 'it', key: 'admin.dashboard.total_users', value: 'Total Users' },
            { languageCode: 'tr', key: 'admin.dashboard.total_posts', value: 'Toplam Gönderi' },
            { languageCode: 'en', key: 'admin.dashboard.total_posts', value: 'Total Posts' },
            { languageCode: 'fr', key: 'admin.dashboard.total_posts', value: 'Total Posts' },
            { languageCode: 'it', key: 'admin.dashboard.total_posts', value: 'Total Posts' },
            { languageCode: 'tr', key: 'admin.dashboard.reports', value: 'Bekleyen Şikayet' },
            { languageCode: 'en', key: 'admin.dashboard.reports', value: 'Pending Reports' },
            { languageCode: 'fr', key: 'admin.dashboard.reports', value: 'Pending Reports' },
            { languageCode: 'it', key: 'admin.dashboard.reports', value: 'Pending Reports' },
            { languageCode: 'tr', key: 'admin.dashboard.pending_approval', value: 'Onay Bekleyenler' },
            { languageCode: 'en', key: 'admin.dashboard.pending_approval', value: 'Pending Approval' },
            { languageCode: 'fr', key: 'admin.dashboard.pending_approval', value: 'Pending Approval' },
            { languageCode: 'it', key: 'admin.dashboard.pending_approval', value: 'Pending Approval' },
            { languageCode: 'tr', key: 'admin.dashboard.badge_applications', value: 'Rozet Başvurusu' },
            { languageCode: 'en', key: 'admin.dashboard.badge_applications', value: 'Badge Applications' },
            { languageCode: 'fr', key: 'admin.dashboard.badge_applications', value: 'Badge Applications' },
            { languageCode: 'it', key: 'admin.dashboard.badge_applications', value: 'Badge Applications' },
            { languageCode: 'tr', key: 'admin.dashboard.banned_users', value: 'Banlanan Kullanıcı' },
            { languageCode: 'en', key: 'admin.dashboard.banned_users', value: 'Banned Users' },
            { languageCode: 'fr', key: 'admin.dashboard.banned_users', value: 'Banned Users' },
            { languageCode: 'it', key: 'admin.dashboard.banned_users', value: 'Banned Users' },

            // ADMIN PAGES
            { languageCode: 'tr', key: 'admin.pages.users.title', value: 'Kullanıcı Yönetimi' },
            { languageCode: 'en', key: 'admin.pages.users.title', value: 'User Management' },
            { languageCode: 'fr', key: 'admin.pages.users.title', value: 'User Management' },
            { languageCode: 'it', key: 'admin.pages.users.title', value: 'User Management' },
            { languageCode: 'tr', key: 'admin.pages.users.subtitle', value: 'Kayıtlı kullanıcıları görüntüle ve düzenle' },
            { languageCode: 'en', key: 'admin.pages.users.subtitle', value: 'View and edit registered users' },
            { languageCode: 'fr', key: 'admin.pages.users.subtitle', value: 'View and edit registered users' },
            { languageCode: 'it', key: 'admin.pages.users.subtitle', value: 'View and edit registered users' },

            { languageCode: 'tr', key: 'admin.pages.status.title', value: 'Sistem Durumu' },
            { languageCode: 'en', key: 'admin.pages.status.title', value: 'System Status' },
            { languageCode: 'fr', key: 'admin.pages.status.title', value: 'System Status' },
            { languageCode: 'it', key: 'admin.pages.status.title', value: 'System Status' },
            { languageCode: 'tr', key: 'admin.pages.status.subtitle', value: 'Sunucu ve veritabanı sağlık durumu' },
            { languageCode: 'en', key: 'admin.pages.status.subtitle', value: 'Server and database health status' },
            { languageCode: 'fr', key: 'admin.pages.status.subtitle', value: 'Server and database health status' },
            { languageCode: 'it', key: 'admin.pages.status.subtitle', value: 'Server and database health status' },

            { languageCode: 'tr', key: 'admin.pages.settings.title', value: 'Site Ayarları' },
            { languageCode: 'en', key: 'admin.pages.settings.title', value: 'Site Settings' },
            { languageCode: 'fr', key: 'admin.pages.settings.title', value: 'Site Settings' },
            { languageCode: 'it', key: 'admin.pages.settings.title', value: 'Site Settings' },
            { languageCode: 'tr', key: 'admin.pages.settings.subtitle', value: 'Genel yapılandırma ve site tercihleri' },
            { languageCode: 'en', key: 'admin.pages.settings.subtitle', value: 'General configuration and site preferences' },
            { languageCode: 'fr', key: 'admin.pages.settings.subtitle', value: 'General configuration and site preferences' },
            { languageCode: 'it', key: 'admin.pages.settings.subtitle', value: 'General configuration and site preferences' },

            { languageCode: 'tr', key: 'admin.pages.sensitive.title', value: 'Hassas İçerik Ayarları' },
            { languageCode: 'en', key: 'admin.pages.sensitive.title', value: 'Sensitive Content Settings' },
            { languageCode: 'fr', key: 'admin.pages.sensitive.title', value: 'Sensitive Content Settings' },
            { languageCode: 'it', key: 'admin.pages.sensitive.title', value: 'Sensitive Content Settings' },
            { languageCode: 'tr', key: 'admin.pages.sensitive.subtitle', value: 'Filtrelenecek kelimeleri yönet' },
            { languageCode: 'en', key: 'admin.pages.sensitive.subtitle', value: 'Manage words to filter' },
            { languageCode: 'fr', key: 'admin.pages.sensitive.subtitle', value: 'Manage words to filter' },
            { languageCode: 'it', key: 'admin.pages.sensitive.subtitle', value: 'Manage words to filter' },

            { languageCode: 'tr', key: 'admin.pages.reports.title', value: 'Şikayet Merkezi' },
            { languageCode: 'en', key: 'admin.pages.reports.title', value: 'Report Center' },
            { languageCode: 'fr', key: 'admin.pages.reports.title', value: 'Report Center' },
            { languageCode: 'it', key: 'admin.pages.reports.title', value: 'Report Center' },
            { languageCode: 'tr', key: 'admin.pages.reports.subtitle', value: 'Kullanıcı şikayetlerini incele' },
            { languageCode: 'en', key: 'admin.pages.reports.subtitle', value: 'Review user reports' },
            { languageCode: 'fr', key: 'admin.pages.reports.subtitle', value: 'Review user reports' },
            { languageCode: 'it', key: 'admin.pages.reports.subtitle', value: 'Review user reports' },

            { languageCode: 'tr', key: 'admin.pages.posts.title', value: 'Gönderi Yönetimi' },
            { languageCode: 'en', key: 'admin.pages.posts.title', value: 'Post Management' },
            { languageCode: 'fr', key: 'admin.pages.posts.title', value: 'Post Management' },
            { languageCode: 'it', key: 'admin.pages.posts.title', value: 'Post Management' },
            { languageCode: 'tr', key: 'admin.pages.posts.subtitle', value: 'Tüm paylaşılan içerikleri yönet' },
            { languageCode: 'en', key: 'admin.pages.posts.subtitle', value: 'Manage all shared content' },
            { languageCode: 'fr', key: 'admin.pages.posts.subtitle', value: 'Manage all shared content' },
            { languageCode: 'it', key: 'admin.pages.posts.subtitle', value: 'Manage all shared content' },

            { languageCode: 'tr', key: 'admin.pages.pages.title', value: 'Sayfa Yönetimi' },
            { languageCode: 'en', key: 'admin.pages.pages.title', value: 'Page Management' },
            { languageCode: 'fr', key: 'admin.pages.pages.title', value: 'Page Management' },
            { languageCode: 'it', key: 'admin.pages.pages.title', value: 'Page Management' },
            { languageCode: 'tr', key: 'admin.pages.pages.subtitle', value: 'Statik sayfaları düzenle' },
            { languageCode: 'en', key: 'admin.pages.pages.subtitle', value: 'Edit static pages' },
            { languageCode: 'fr', key: 'admin.pages.pages.subtitle', value: 'Edit static pages' },
            { languageCode: 'it', key: 'admin.pages.pages.subtitle', value: 'Edit static pages' },

            { languageCode: 'tr', key: 'admin.pages.multi_accounts.title', value: 'Multi-Hesap Kontrolü' },
            { languageCode: 'en', key: 'admin.pages.multi_accounts.title', value: 'Multi-Account Check' },
            { languageCode: 'fr', key: 'admin.pages.multi_accounts.title', value: 'Multi-Account Check' },
            { languageCode: 'it', key: 'admin.pages.multi_accounts.title', value: 'Multi-Account Check' },
            { languageCode: 'tr', key: 'admin.pages.multi_accounts.subtitle', value: 'Aynı IP adresini kullanan hesaplar' },
            { languageCode: 'en', key: 'admin.pages.multi_accounts.subtitle', value: 'Accounts using the same IP address' },
            { languageCode: 'fr', key: 'admin.pages.multi_accounts.subtitle', value: 'Accounts using the same IP address' },
            { languageCode: 'it', key: 'admin.pages.multi_accounts.subtitle', value: 'Accounts using the same IP address' },

            { languageCode: 'tr', key: 'admin.pages.language.title', value: 'Dil Yönetimi' },
            { languageCode: 'en', key: 'admin.pages.language.title', value: 'Language Management' },
            { languageCode: 'fr', key: 'admin.pages.language.title', value: 'Language Management' },
            { languageCode: 'it', key: 'admin.pages.language.title', value: 'Language Management' },
            { languageCode: 'tr', key: 'admin.pages.language.subtitle', value: 'Site dillerini ve çevirileri düzenle' },
            { languageCode: 'en', key: 'admin.pages.language.subtitle', value: 'Edit site languages and translations' },
            { languageCode: 'fr', key: 'admin.pages.language.subtitle', value: 'Edit site languages and translations' },
            { languageCode: 'it', key: 'admin.pages.language.subtitle', value: 'Edit site languages and translations' },

            { languageCode: 'tr', key: 'admin.pages.ghost.title', value: 'Hayalet Mesaj' },
            { languageCode: 'en', key: 'admin.pages.ghost.title', value: 'Ghost Message' },
            { languageCode: 'fr', key: 'admin.pages.ghost.title', value: 'Ghost Message' },
            { languageCode: 'it', key: 'admin.pages.ghost.title', value: 'Ghost Message' },
            { languageCode: 'tr', key: 'admin.pages.ghost.subtitle', value: 'Sistem adına anonim mesaj gönder' },
            { languageCode: 'en', key: 'admin.pages.ghost.subtitle', value: 'Send anonymous messages on behalf of system' },
            { languageCode: 'fr', key: 'admin.pages.ghost.subtitle', value: 'Send anonymous messages on behalf of system' },
            { languageCode: 'it', key: 'admin.pages.ghost.subtitle', value: 'Send anonymous messages on behalf of system' },

            { languageCode: 'tr', key: 'admin.pages.chat.title', value: 'Admin Sohbet' },
            { languageCode: 'en', key: 'admin.pages.chat.title', value: 'Admin Chat' },
            { languageCode: 'fr', key: 'admin.pages.chat.title', value: 'Admin Chat' },
            { languageCode: 'it', key: 'admin.pages.chat.title', value: 'Admin Chat' },
            { languageCode: 'tr', key: 'admin.pages.chat.subtitle', value: 'Yöneticiler arası özel kanal' },
            { languageCode: 'en', key: 'admin.pages.chat.subtitle', value: 'Private channel for administrators' },
            { languageCode: 'fr', key: 'admin.pages.chat.subtitle', value: 'Private channel for administrators' },
            { languageCode: 'it', key: 'admin.pages.chat.subtitle', value: 'Private channel for administrators' },

            { languageCode: 'tr', key: 'admin.pages.bans.title', value: 'Yasaklı Hesaplar' },
            { languageCode: 'en', key: 'admin.pages.bans.title', value: 'Banned Accounts' },
            { languageCode: 'fr', key: 'admin.pages.bans.title', value: 'Banned Accounts' },
            { languageCode: 'it', key: 'admin.pages.bans.title', value: 'Banned Accounts' },
            { languageCode: 'tr', key: 'admin.pages.bans.subtitle', value: 'Erişimi engellenen kullanıcıları yönet' },
            { languageCode: 'en', key: 'admin.pages.bans.subtitle', value: 'Manage banned users' },
            { languageCode: 'fr', key: 'admin.pages.bans.subtitle', value: 'Manage banned users' },
            { languageCode: 'it', key: 'admin.pages.bans.subtitle', value: 'Manage banned users' },

            { languageCode: 'tr', key: 'admin.pages.badges.title', value: 'Rozet Başvuruları' },
            { languageCode: 'en', key: 'admin.pages.badges.title', value: 'Badge Applications' },
            { languageCode: 'fr', key: 'admin.pages.badges.title', value: 'Badge Applications' },
            { languageCode: 'it', key: 'admin.pages.badges.title', value: 'Badge Applications' },
            { languageCode: 'tr', key: 'admin.pages.badges.subtitle', value: 'Doğrulama ve özel rozet talepleri' },
            { languageCode: 'en', key: 'admin.pages.badges.subtitle', value: 'Verification and special badge requests' },
            { languageCode: 'fr', key: 'admin.pages.badges.subtitle', value: 'Verification and special badge requests' },
            { languageCode: 'it', key: 'admin.pages.badges.subtitle', value: 'Verification and special badge requests' },

            { languageCode: 'tr', key: 'admin.pages.announcements.title', value: 'Duyuru Yönetimi' },
            { languageCode: 'en', key: 'admin.pages.announcements.title', value: 'Announcement Management' },
            { languageCode: 'fr', key: 'admin.pages.announcements.title', value: 'Announcement Management' },
            { languageCode: 'it', key: 'admin.pages.announcements.title', value: 'Announcement Management' },
            { languageCode: 'tr', key: 'admin.pages.announcements.subtitle', value: 'Sistem geneli duyurular yayınla' },
            { languageCode: 'en', key: 'admin.pages.announcements.subtitle', value: 'Publish system-wide announcements' },
            { languageCode: 'fr', key: 'admin.pages.announcements.subtitle', value: 'Publish system-wide announcements' },
            { languageCode: 'it', key: 'admin.pages.announcements.subtitle', value: 'Publish system-wide announcements' },

            { languageCode: 'tr', key: 'admin.pages.approve.title', value: 'Onay Bekleyen Kullanıcılar' },
            { languageCode: 'en', key: 'admin.pages.approve.title', value: 'Users Pending Approval' },
            { languageCode: 'fr', key: 'admin.pages.approve.title', value: 'Users Pending Approval' },
            { languageCode: 'it', key: 'admin.pages.approve.title', value: 'Users Pending Approval' },
            { languageCode: 'tr', key: 'admin.pages.approve.subtitle', value: 'Manuel onay gerektiren kayıtlar' },
            { languageCode: 'en', key: 'admin.pages.approve.subtitle', value: 'Registrations requiring manual approval' },
            { languageCode: 'fr', key: 'admin.pages.approve.subtitle', value: 'Registrations requiring manual approval' },
            { languageCode: 'it', key: 'admin.pages.approve.subtitle', value: 'Registrations requiring manual approval' }
        ];

        let inserted = 0;
        let updated = 0;

        for (const trans of translations) {
            const existing = await prisma.translation.findUnique({
                where: {
                    languageCode_key: {
                        languageCode: trans.languageCode,
                        key: trans.key
                    }
                }
            });

            if (existing) {
                await prisma.translation.update({
                    where: {
                        languageCode_key: {
                            languageCode: trans.languageCode,
                            key: trans.key
                        }
                    },
                    data: { value: trans.value }
                });
                updated++;
            } else {
                await prisma.translation.create({
                    data: trans
                });
                inserted++;
            }
        }

        return NextResponse.json({
            message: "Hierarchical Admin translations seeded",
            inserted,
            updated,
            total: translations.length
        });
    } catch (error) {
        console.error("Admin seed error:", error);
        return NextResponse.json(
            { message: "Failed to seed admin translations", error: String(error) },
            { status: 500 }
        );
    }
}
