
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
            "common.register": "Kayıt Ol",
            "common.email": "E-posta",
            "common.password": "Şifre",
            "common.slogan": "underground sosyal medya",
            "profile.following": "Kovalanan",
            "profile.followers": "Kovalayan",
            "sidebar.dashboard": "Dashboard",
            "sidebar.home": "Ana Sayfa",
            "sidebar.explore": "Keşfet",
            "sidebar.compose": "Gönder",
            "sidebar.notifications": "Bildirimler",
            "sidebar.messages": "Mesajlar",
            "sidebar.bookmarks": "Kaydedilenler",
            "sidebar.profile": "Profil",
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
            "sidebar.logout": "Çıkış Yap",
            "trending.title": "Gündem",
            "trending.posts_suffix": "gönderi",
            "common.show_more": "Daha fazla göster",
            "feed.all": "Herkes",
            "feed.following": "Kovaladıklarım",
            "who_visited.title": "Dikizleyenler",
            "who_visited.empty": "Henüz kimse dikizlemedi...",
            "popular_posts.title": "Popüler Postlar",
            "footer.about": "Hakkında",
            "footer.terms": "Kullanım Şartları",
            "footer.privacy": "Gizlilik",
            "footer.contact": "İletişim",
            "post.confirm_block": "@{nickname} adlı kullanıcıyı engellemek istediğinize emin misiniz?",
            "post.confirm_delete": "Bu gönderiyi silmek istediğinize emin misiniz?",
            "post.delete": "Gönderiyi sil",
            "post.follow_user": "@{nickname} adlı kişiyi takip et",
            "post.block_user": "@{nickname} adlı kişiyi engelle",
            "post.unfollow_user": "@{nickname} adlı kişiyi takipten çıkar",
            "post.report": "Gönderiyi bildir",
            "post.admin_censored_label": "⚠️ Admin Görünümü - Gizlenen İçerik",
            "post.banned_title": "Bu hesap sınır dışı edildi!",
            "post.banned_message": "Kurallara uymadığı için RiskBudur Özel Tim'i tarafından yaka paça sınır dışı edildi.",
            "post.censored_message_1": "Bu gönderi sistem tarafından otomatik olarak gizlenmiştir. Gönderinizin gizlenmesi ile ilgili detaylı bilgi için lütfen",
            "post.terms": "RiskBudur Kullanım Şartları",
            "post.censored_message_2": "sayfasını ziyaret edin.",
            "post.copied": "Kopyalandı!",
            "post.show_all_thread": "Tümünü gör"
        };

        const enTranslations: Record<string, string> = {
            "common.register": "Register",
            "common.email": "Email",
            "common.password": "Password",
            "common.slogan": "underground social media",
            "profile.following": "Following",
            "profile.followers": "Followers",
            "sidebar.dashboard": "Dashboard",
            "sidebar.home": "Home",
            "sidebar.explore": "Explore",
            "sidebar.compose": "Compose",
            "sidebar.notifications": "Notifications",
            "sidebar.messages": "Messages",
            "sidebar.bookmarks": "Bookmarks",
            "sidebar.profile": "Profile",
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
            "sidebar.logout": "Logout",
            "trending.title": "Trending",
            "trending.posts_suffix": "posts",
            "common.show_more": "Show more",
            "feed.all": "Everyone",
            "feed.following": "Following",
            "who_visited.title": "Who visited",
            "who_visited.empty": "No one visited yet...",
            "popular_posts.title": "Popular Posts",
            "footer.about": "About",
            "footer.terms": "Terms of Service",
            "footer.privacy": "Privacy Policy",
            "footer.contact": "Contact",
            "post.confirm_block": "Are you sure you want to block @{nickname}?",
            "post.confirm_delete": "Are you sure you want to delete this post?",
            "post.delete": "Delete post",
            "post.follow_user": "Follow @{nickname}",
            "post.block_user": "Block @{nickname}",
            "post.unfollow_user": "Unfollow @{nickname}",
            "post.report": "Report post",
            "post.admin_censored_label": "⚠️ Admin View - Censored Content",
            "post.banned_title": "This account has been banned!",
            "post.banned_message": "Account banned by RiskBudur Special Team for violation of rules.",
            "post.censored_message_1": "This post has been automatically hidden by the system. For more detailed information about why your post was hidden, please visit",
            "post.terms": "RiskBudur Terms of Service",
            "post.censored_message_2": "page.",
            "post.copied": "Copied!",
            "post.show_all_thread": "Show all"
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
