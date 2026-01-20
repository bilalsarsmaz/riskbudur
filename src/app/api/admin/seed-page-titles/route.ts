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
            // PAGE TITLES - ADMIN PAGES
            { languageCode: 'tr', key: 'page.users.title', value: 'Kullanıcılar' },
            { languageCode: 'en', key: 'page.users.title', value: 'Users' },
            { languageCode: 'fr', key: 'page.users.title', value: 'Utilisateurs' },
            { languageCode: 'it', key: 'page.users.title', value: 'Utenti' },

            { languageCode: 'tr', key: 'page.users.subtitle', value: 'Site Ahalisi' },
            { languageCode: 'en', key: 'page.users.subtitle', value: 'Site Community' },
            { languageCode: 'fr', key: 'page.users.subtitle', value: 'Communauté du site' },
            { languageCode: 'it', key: 'page.users.subtitle', value: 'Comunità del sito' },

            { languageCode: 'tr', key: 'page.status.title', value: 'Sunucu Durumu' },
            { languageCode: 'en', key: 'page.status.title', value: 'Server Status' },
            { languageCode: 'fr', key: 'page.status.title', value: 'État du serveur' },
            { languageCode: 'it', key: 'page.status.title', value: 'Stato server' },

            { languageCode: 'tr', key: 'page.status.subtitle', value: 'Sistem İzleme Paneli' },
            { languageCode: 'en', key: 'page.status.subtitle', value: 'System Monitoring Panel' },
            { languageCode: 'fr', key: 'page.status.subtitle', value: 'Panneau de surveillance du système' },
            { languageCode: 'it', key: 'page.status.subtitle', value: 'Pannello di monitoraggio sistema' },

            { languageCode: 'tr', key: 'page.settings.title', value: 'Ayarlar' },
            { languageCode: 'en', key: 'page.settings.title', value: 'Settings' },
            { languageCode: 'fr', key: 'page.settings.title', value: 'Paramètres' },
            { languageCode: 'it', key: 'page.settings.title', value: 'Impostazioni' },

            { languageCode: 'tr', key: 'page.settings.subtitle', value: 'Sistem yapılandırması' },
            { languageCode: 'en', key: 'page.settings.subtitle', value: 'System configuration' },
            { languageCode: 'fr', key: 'page.settings.subtitle', value: 'Configuration système' },
            { languageCode: 'it', key: 'page.settings.subtitle', value: 'Configurazione sistema' },

            { languageCode: 'tr', key: 'page.sensitive.title', value: 'Hassas İçerik' },
            { languageCode: 'en', key: 'page.sensitive.title', value: 'Sensitive Content' },
            { languageCode: 'fr', key: 'page.sensitive.title', value: 'Contenu sensible' },
            { languageCode: 'it', key: 'page.sensitive.title', value: 'Contenuto sensibile' },

            { languageCode: 'tr', key: 'page.sensitive.subtitle', value: 'Argo ve Yasaklı Kelime Filtresi' },
            { languageCode: 'en', key: 'page.sensitive.subtitle', value: 'Profanity and Banned Word Filter' },
            { languageCode: 'fr', key: 'page.sensitive.subtitle', value: 'Filtre de mots interdits et blasphématoires' },
            { languageCode: 'it', key: 'page.sensitive.subtitle', value: 'Filtro parolacce e parole vietate' },

            { languageCode: 'tr', key: 'page.reports.title', value: 'Şikayetler' },
            { languageCode: 'en', key: 'page.reports.title', value: 'Reports' },
            { languageCode: 'fr', key: 'page.reports.title', value: 'Signalements' },
            { languageCode: 'it', key: 'page.reports.title', value: 'Segnalazioni' },

            { languageCode: 'tr', key: 'page.reports.subtitle', value: 'Kimler İspiyonlanmış?' },
            { languageCode: 'en', key: 'page.reports.subtitle', value: 'Who\'s been reported?' },
            { languageCode: 'fr', key: 'page.reports.subtitle', value: 'Qui a été signalé?' },
            { languageCode: 'it', key: 'page.reports.subtitle', value: 'Chi è stato segnalato?' },

            { languageCode: 'tr', key: 'page.posts.title', value: 'Gönderi Yönetimi' },
            { languageCode: 'en', key: 'page.posts.title', value: 'Post Management' },
            { languageCode: 'fr', key: 'page.posts.title', value: 'Gestion des publications' },
            { languageCode: 'it', key: 'page.posts.title', value: 'Gestione post' },

            { languageCode: 'tr', key: 'page.posts.subtitle', value: 'Kullanıcı İçerikleri' },
            { languageCode: 'en', key: 'page.posts.subtitle', value: 'User Content' },
            { languageCode: 'fr', key: 'page.posts.subtitle', value: 'Contenu utilisateur' },
            { languageCode: 'it', key: 'page.posts.subtitle', value: 'Contenuti utente' },

            { languageCode: 'tr', key: 'page.pages.title', value: 'Sayfalar' },
            { languageCode: 'en', key: 'page.pages.title', value: 'Pages' },
            { languageCode: 'fr', key: 'page.pages.title', value: 'Pages' },
            { languageCode: 'it', key: 'page.pages.title', value: 'Pagine' },

            { languageCode: 'tr', key: 'page.pages.subtitle', value: 'Sinir Sistemi' },
            { languageCode: 'en', key: 'page.pages.subtitle', value: 'Nervous System' },
            { languageCode: 'fr', key: 'page.pages.subtitle', value: 'Système nerveux' },
            { languageCode: 'it', key: 'page.pages.subtitle', value: 'Sistema nervoso' },

            { languageCode: 'tr', key: 'page.multi_accounts.title', value: 'Multi-Hesap Kontrolü' },
            { languageCode: 'en', key: 'page.multi_accounts.title', value: 'Multi-Account Check' },
            { languageCode: 'fr', key: 'page.multi_accounts.title', value: 'Vérification multi-comptes' },
            { languageCode: 'it', key: 'page.multi_accounts.title', value: 'Controllo multi-account' },

            { languageCode: 'tr', key: 'page.multi_accounts.subtitle', value: 'Aynı IP adresini kullanan hesaplar' },
            { languageCode: 'en', key: 'page.multi_accounts.subtitle', value: 'Accounts using the same IP address' },
            { languageCode: 'fr', key: 'page.multi_accounts.subtitle', value: 'Comptes utilisant la même adresse IP' },
            { languageCode: 'it', key: 'page.multi_accounts.subtitle', value: 'Account che utilizzano lo stesso indirizzo IP' },

            { languageCode: 'tr', key: 'page.language.title', value: 'Dil Yönetimi' },
            { languageCode: 'en', key: 'page.language.title', value: 'Language Management' },
            { languageCode: 'fr', key: 'page.language.title', value: 'Gestion des langues' },
            { languageCode: 'it', key: 'page.language.title', value: 'Gestione lingue' },

            { languageCode: 'tr', key: 'page.language.subtitle', value: 'Site dillerini ve çevirilerini yönetin' },
            { languageCode: 'en', key: 'page.language.subtitle', value: 'Manage site languages and translations' },
            { languageCode: 'fr', key: 'page.language.subtitle', value: 'Gérer les langues et traductions du site' },
            { languageCode: 'it', key: 'page.language.subtitle', value: 'Gestisci le lingue e le traduzioni del sito' },

            { languageCode: 'tr', key: 'page.ghost.title', value: 'Ghost Message' },
            { languageCode: 'en', key: 'page.ghost.title', value: 'Ghost Message' },
            { languageCode: 'fr', key: 'page.ghost.title', value: 'Message fantôme' },
            { languageCode: 'it', key: 'page.ghost.title', value: 'Messaggio fantasma' },

            { languageCode: 'tr', key: 'page.ghost.subtitle', value: 'Shadow View' },
            { languageCode: 'en', key: 'page.ghost.subtitle', value: 'Shadow View' },
            { languageCode: 'fr', key: 'page.ghost.subtitle', value: 'Vue fantôme' },
            { languageCode: 'it', key: 'page.ghost.subtitle', value: 'Vista ombra' },

            { languageCode: 'tr', key: 'page.chat.title', value: 'Yönetim Sohbeti' },
            { languageCode: 'en', key: 'page.chat.title', value: 'Admin Chat' },
            { languageCode: 'fr', key: 'page.chat.title', value: 'Discussion admin' },
            { languageCode: 'it', key: 'page.chat.title', value: 'Chat amministratori' },

            { languageCode: 'tr', key: 'page.chat.subtitle', value: 'Oldskool IRC mevzuları' },
            { languageCode: 'en', key: 'page.chat.subtitle', value: 'Oldschool IRC vibes' },
            { languageCode: 'fr', key: 'page.chat.subtitle', value: 'Ambiance IRC old school' },
            { languageCode: 'it', key: 'page.chat.subtitle', value: 'Atmosfera IRC old school' },

            { languageCode: 'tr', key: 'page.bans.title', value: 'Cezalı Hesaplar' },
            { languageCode: 'en', key: 'page.bans.title', value: 'Banned Accounts' },
            { languageCode: 'fr', key: 'page.bans.title', value: 'Comptes bannis' },
            { languageCode: 'it', key: 'page.bans.title', value: 'Account bannati' },

            { languageCode: 'tr', key: 'page.bans.subtitle', value: 'Yasaklı Kullanıcı Yönetimi' },
            { languageCode: 'en', key: 'page.bans.subtitle', value: 'Banned User Management' },
            { languageCode: 'fr', key: 'page.bans.subtitle', value: 'Gestion des utilisateurs bannis' },
            { languageCode: 'it', key: 'page.bans.subtitle', value: 'Gestione utenti bannati' },

            { languageCode: 'tr', key: 'page.badges.title', value: 'Rozet Talepleri' },
            { languageCode: 'en', key: 'page.badges.title', value: 'Badge Requests' },
            { languageCode: 'fr', key: 'page.badges.title', value: 'Demandes de badge' },
            { languageCode: 'it', key: 'page.badges.title', value: 'Richieste badge' },

            { languageCode: 'tr', key: 'page.badges.subtitle', value: 'Popüleride sevdalıları' },
            { languageCode: 'en', key: 'page.badges.subtitle', value: 'Popularity seekers' },
            { languageCode: 'fr', key: 'page.badges.subtitle', value: 'Chercheurs de popularité' },
            { languageCode: 'it', key: 'page.badges.subtitle', value: 'Cercatori di popolarità' },

            { languageCode: 'tr', key: 'page.announcements.title', value: 'Duyurular' },
            { languageCode: 'en', key: 'page.announcements.title', value: 'Announcements' },
            { languageCode: 'fr', key: 'page.announcements.title', value: 'Annonces' },
            { languageCode: 'it', key: 'page.announcements.title', value: 'Annunci' },

            { languageCode: 'tr', key: 'page.announcements.subtitle', value: 'Ulusa Sesleniş' },
            { languageCode: 'en', key: 'page.announcements.subtitle', value: 'Broadcast to Nation' },
            { languageCode: 'fr', key: 'page.announcements.subtitle', value: 'Diffusion à la nation' },
            { languageCode: 'it', key: 'page.announcements.subtitle', value: 'Trasmissione alla nazione' },

            { languageCode: 'tr', key: 'page.approve.title', value: 'Üyeleri Onayla' },
            { languageCode: 'en', key: 'page.approve.title', value: 'Approve Members' },
            { languageCode: 'fr', key: 'page.approve.title', value: 'Approuver les membres' },
            { languageCode: 'it', key: 'page.approve.title', value: 'Approva membri' },

            { languageCode: 'tr', key: 'page.approve.subtitle', value: 'Kimler gelmiş kimler?' },
            { languageCode: 'en', key: 'page.approve.subtitle', value: 'Who\'s arrived who?' },
            { languageCode: 'fr', key: 'page.approve.subtitle', value: 'Qui est arrivé?' },
            { languageCode: 'it', key: 'page.approve.subtitle', value: 'Chi è arrivato?' },
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
            message: "Admin page titles seeded successfully",
            inserted,
            updated,
            total: translations.length
        });
    } catch (error) {
        console.error("Page titles seed error:", error);
        return NextResponse.json(
            { message: "Failed to seed page titles", error: String(error) },
            { status: 500 }
        );
    }
}
