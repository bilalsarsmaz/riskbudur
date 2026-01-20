import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

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
            // ADMIN SIDEBAR TRANSLATIONS
            { languageCode: 'tr', key: 'sidebar.dashboard', value: 'Dashboard' },
            { languageCode: 'en', key: 'sidebar.dashboard', value: 'Dashboard' },
            { languageCode: 'fr', key: 'sidebar.dashboard', value: 'Tableau de bord' },
            { languageCode: 'it', key: 'sidebar.dashboard', value: 'Dashboard' },

            { languageCode: 'tr', key: 'sidebar.chat', value: 'Chat' },
            { languageCode: 'en', key: 'sidebar.chat', value: 'Chat' },
            { languageCode: 'fr', key: 'sidebar.chat', value: 'Discussion' },
            { languageCode: 'it', key: 'sidebar.chat', value: 'Chat' },

            { languageCode: 'tr', key: 'sidebar.users', value: 'Kullanıcılar' },
            { languageCode: 'en', key: 'sidebar.users', value: 'Users' },
            { languageCode: 'fr', key: 'sidebar.users', value: 'Utilisateurs' },
            { languageCode: 'it', key: 'sidebar.users', value: 'Utenti' },

            { languageCode: 'tr', key: 'sidebar.users_list', value: 'Kullanıcı Listesi' },
            { languageCode: 'en', key: 'sidebar.users_list', value: 'User List' },
            { languageCode: 'fr', key: 'sidebar.users_list', value: 'Liste des utilisateurs' },
            { languageCode: 'it', key: 'sidebar.users_list', value: 'Elenco utenti' },

            { languageCode: 'tr', key: 'sidebar.approve_users', value: 'Kullanıcı Onayı' },
            { languageCode: 'en', key: 'sidebar.approve_users', value: 'User Approval' },
            { languageCode: 'fr', key: 'sidebar.approve_users', value: 'Approbation d\'utilisateur' },
            { languageCode: 'it', key: 'sidebar.approve_users', value: 'Approvazione utenti' },

            { languageCode: 'tr', key: 'sidebar.badges', value: 'Rozet Başvuruları' },
            { languageCode: 'en', key: 'sidebar.badges', value: 'Badge Applications' },
            { languageCode: 'fr', key: 'sidebar.badges', value: 'Demandes de badge' },
            { languageCode: 'it', key: 'sidebar.badges', value: 'Richieste badge' },

            { languageCode: 'tr', key: 'sidebar.bans', value: 'Yasaklı Kullanıcılar' },
            { languageCode: 'en', key: 'sidebar.bans', value: 'Banned Users' },
            { languageCode: 'fr', key: 'sidebar.bans', value: 'Utilisateurs bannis' },
            { languageCode: 'it', key: 'sidebar.bans', value: 'Utenti bannati' },

            { languageCode: 'tr', key: 'sidebar.content', value: 'İçerik' },
            { languageCode: 'en', key: 'sidebar.content', value: 'Content' },
            { languageCode: 'fr', key: 'sidebar.content', value: 'Contenu' },
            { languageCode: 'it', key: 'sidebar.content', value: 'Contenuto' },

            { languageCode: 'tr', key: 'sidebar.posts', value: 'Gönderiler' },
            { languageCode: 'en', key: 'sidebar.posts', value: 'Posts' },
            { languageCode: 'fr', key: 'sidebar.posts', value: 'Publications' },
            { languageCode: 'it', key: 'sidebar.posts', value: 'Post' },

            { languageCode: 'tr', key: 'sidebar.reports', value: 'Raporlar' },
            { languageCode: 'en', key: 'sidebar.reports', value: 'Reports' },
            { languageCode: 'fr', key: 'sidebar.reports', value: 'Signalements' },
            { languageCode: 'it', key: 'sidebar.reports', value: 'Segnalazioni' },

            { languageCode: 'tr', key: 'sidebar.sensitive', value: 'Hassas İçerik' },
            { languageCode: 'en', key: 'sidebar.sensitive', value: 'Sensitive Content' },
            { languageCode: 'fr', key: 'sidebar.sensitive', value: 'Contenu sensible' },
            { languageCode: 'it', key: 'sidebar.sensitive', value: 'Contenuto sensibile' },

            { languageCode: 'tr', key: 'sidebar.system', value: 'Sistem' },
            { languageCode: 'en', key: 'sidebar.system', value: 'System' },
            { languageCode: 'fr', key: 'sidebar.system', value: 'Système' },
            { languageCode: 'it', key: 'sidebar.system', value: 'Sistema' },

            { languageCode: 'tr', key: 'sidebar.status', value: 'Sunucu Durumu' },
            { languageCode: 'en', key: 'sidebar.status', value: 'Server Status' },
            { languageCode: 'fr', key: 'sidebar.status', value: 'État du serveur' },
            { languageCode: 'it', key: 'sidebar.status', value: 'Stato server' },

            { languageCode: 'tr', key: 'sidebar.announcements', value: 'Duyurular' },
            { languageCode: 'en', key: 'sidebar.announcements', value: 'Announcements' },
            { languageCode: 'fr', key: 'sidebar.announcements', value: 'Annonces' },
            { languageCode: 'it', key: 'sidebar.announcements', value: 'Annunci' },

            { languageCode: 'tr', key: 'sidebar.pages', value: 'Sayfa Yönetimi' },
            { languageCode: 'en', key: 'sidebar.pages', value: 'Page Management' },
            { languageCode: 'fr', key: 'sidebar.pages', value: 'Gestion des pages' },
            { languageCode: 'it', key: 'sidebar.pages', value: 'Gestione pagine' },

            { languageCode: 'tr', key: 'sidebar.ghost_message', value: 'Ghost Mesajları' },
            { languageCode: 'en', key: 'sidebar.ghost_message', value: 'Ghost Messages' },
            { languageCode: 'fr', key: 'sidebar.ghost_message', value: 'Messages fantômes' },
            { languageCode: 'it', key: 'sidebar.ghost_message', value: 'Messaggi fantasma' },

            { languageCode: 'tr', key: 'sidebar.languages', value: 'Dil Yönetimi' },
            { languageCode: 'en', key: 'sidebar.languages', value: 'Language Management' },
            { languageCode: 'fr', key: 'sidebar.languages', value: 'Gestion des langues' },
            { languageCode: 'it', key: 'sidebar.languages', value: 'Gestione lingue' },

            { languageCode: 'tr', key: 'sidebar.settings', value: 'Ayarlar' },
            { languageCode: 'en', key: 'sidebar.settings', value: 'Settings' },
            { languageCode: 'fr', key: 'sidebar.settings', value: 'Paramètres' },
            { languageCode: 'it', key: 'sidebar.settings', value: 'Impostazioni' },

            { languageCode: 'tr', key: 'sidebar.back_platform', value: 'Platforma Dön' },
            { languageCode: 'en', key: 'sidebar.back_platform', value: 'Back to Platform' },
            { languageCode: 'fr', key: 'sidebar.back_platform', value: 'Retour à la plateforme' },
            { languageCode: 'it', key: 'sidebar.back_platform', value: 'Torna alla piattaforma' },

            { languageCode: 'tr', key: 'sidebar.logout', value: 'Çıkış Yap' },
            { languageCode: 'en', key: 'sidebar.logout', value: 'Logout' },
            { languageCode: 'fr', key: 'sidebar.logout', value: 'Se déconnecter' },
            { languageCode: 'it', key: 'sidebar.logout', value: 'Disconnetti' },

            // DASHBOARD TRANSLATIONS
            { languageCode: 'tr', key: 'dashboard.title', value: 'Riskbudur Admin Paneli' },
            { languageCode: 'en', key: 'dashboard.title', value: 'Riskbudur Admin Panel' },
            { languageCode: 'fr', key: 'dashboard.title', value: 'Panneau d\'administration Riskbudur' },
            { languageCode: 'it', key: 'dashboard.title', value: 'Pannello di amministrazione Riskbudur' },

            { languageCode: 'tr', key: 'dashboard.subtitle', value: 'Dashboard' },
            { languageCode: 'en', key: 'dashboard.subtitle', value: 'Dashboard' },
            { languageCode: 'fr', key: 'dashboard.subtitle', value: 'Tableau de bord' },
            { languageCode: 'it', key: 'dashboard.subtitle', value: 'Dashboard' },

            { languageCode: 'tr', key: 'dashboard.total_users', value: 'Toplam Kullanıcı' },
            { languageCode: 'en', key: 'dashboard.total_users', value: 'Total Users' },
            { languageCode: 'fr', key: 'dashboard.total_users', value: 'Total utilisateurs' },
            { languageCode: 'it', key: 'dashboard.total_users', value: 'Totale utenti' },

            { languageCode: 'tr', key: 'dashboard.total_posts', value: 'Toplam Gönderi' },
            { languageCode: 'en', key: 'dashboard.total_posts', value: 'Total Posts' },
            { languageCode: 'fr', key: 'dashboard.total_posts', value: 'Total publications' },
            { languageCode: 'it', key: 'dashboard.total_posts', value: 'Totale post' },

            { languageCode: 'tr', key: 'dashboard.reports', value: 'Şikayetler' },
            { languageCode: 'en', key: 'dashboard.reports', value: 'Reports' },
            { languageCode: 'fr', key: 'dashboard.reports', value: 'Signalements' },
            { languageCode: 'it', key: 'dashboard.reports', value: 'Segnalazioni' },

            { languageCode: 'tr', key: 'dashboard.pending_approval', value: 'Onay Bekleyenler' },
            { languageCode: 'en', key: 'dashboard.pending_approval', value: 'Pending Approval' },
            { languageCode: 'fr', key: 'dashboard.pending_approval', value: 'En attente d\'approbation' },
            { languageCode: 'it', key: 'dashboard.pending_approval', value: 'In attesa di approvazione' },

            { languageCode: 'tr', key: 'dashboard.badge_applications', value: 'Rozet Başvuruları' },
            { languageCode: 'en', key: 'dashboard.badge_applications', value: 'Badge Applications' },
            { languageCode: 'fr', key: 'dashboard.badge_applications', value: 'Demandes de badge' },
            { languageCode: 'it', key: 'dashboard.badge_applications', value: 'Richieste badge' },

            { languageCode: 'tr', key: 'dashboard.banned_users', value: 'Yasaklanmış Üyeler' },
            { languageCode: 'en', key: 'dashboard.banned_users', value: 'Banned Users' },
            { languageCode: 'fr', key: 'dashboard.banned_users', value: 'Utilisateurs bannis' },
            { languageCode: 'it', key: 'dashboard.banned_users', value: 'Utenti bannati' },
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
            message: "Admin translations seeded successfully",
            inserted,
            updated,
            total: translations.length
        });
    } catch (error) {
        console.error("Admin translation seed error:", error);
        return NextResponse.json(
            { message: "Failed to seed translations", error: String(error) },
            { status: 500 }
        );
    }
}
