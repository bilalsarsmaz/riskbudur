import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// COMPREHENSIVE PLATFORM TRANSLATIONS
// Settings, Messages, Notifications, Explore, Help, UI Components

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
            // ==================== SETTINGS PAGES ====================

            // Password Settings
            { languageCode: 'tr', key: 'settings.password.title', value: 'Şifreni değiştir' },
            { languageCode: 'en', key: 'settings.password.title', value: 'Change your password' },
            { languageCode: 'fr', key: 'settings.password.title', value: 'Changez votre mot de passe' },
            { languageCode: 'it', key: 'settings.password.title', value: 'Cambia la tua password' },

            { languageCode: 'tr', key: 'settings.password.subtitle', value: 'Hesabının güvenliği için güçlü bir şifre kullan.' },
            { languageCode: 'en', key: 'settings.password.subtitle', value: 'Use a strong password for your account security.' },
            { languageCode: 'fr', key: 'settings.password.subtitle', value: 'Utilisez un mot de passe fort pour la sécurité de votre compte.' },
            { languageCode: 'it', key: 'settings.password.subtitle', value: 'Usa una password forte per la sicurezza del tuo account.' },

            { languageCode: 'tr', key: 'settings.password.current', value: 'Mevcut Şifre' },
            { languageCode: 'en', key: 'settings.password.current', value: 'Current Password' },
            { languageCode: 'fr', key: 'settings.password.current', value: 'Mot de passe actuel' },
            { languageCode: 'it', key: 'settings.password.current', value: 'Password attuale' },

            { languageCode: 'tr', key: 'settings.password.new', value: 'Yeni Şifre' },
            { languageCode: 'en', key: 'settings.password.new', value: 'New Password' },
            { languageCode: 'fr', key: 'settings.password.new', value: 'Nouveau mot de passe' },
            { languageCode: 'it', key: 'settings.password.new', value: 'Nuova password' },

            { languageCode: 'tr', key: 'settings.password.confirm', value: 'Yeni Şifre (Tekrar)' },
            { languageCode: 'en', key: 'settings.password.confirm', value: 'Confirm New Password' },
            { languageCode: 'fr', key: 'settings.password.confirm', value: 'Confirmer le nouveau mot de passe' },
            { languageCode: 'it', key: 'settings.password.confirm', value: 'Conferma nuova password' },

            { languageCode: 'tr', key: 'settings.password.save', value: 'Kaydet' },
            { languageCode: 'en', key: 'settings.password.save', value: 'Save' },
            { languageCode: 'fr', key: 'settings.password.save', value: 'Enregistrer' },
            { languageCode: 'it', key: 'settings.password.save', value: 'Salva' },

            { languageCode: 'tr', key: 'settings.password.error_mismatch', value: 'Yeni şifreler eşleşmiyor!' },
            { languageCode: 'en', key: 'settings.password.error_mismatch', value: 'New passwords do not match!' },
            { languageCode: 'fr', key: 'settings.password.error_mismatch', value: 'Les nouveaux mots de passe ne correspondent pas!' },
            { languageCode: 'it', key: 'settings.password.error_mismatch', value: 'Le nuove password non corrispondono!' },

            { languageCode: 'tr', key: 'settings.password.success', value: 'Şifre başarıyla güncellendi!' },
            { languageCode: 'en', key: 'settings.password.success', value: 'Password updated successfully!' },
            { languageCode: 'fr', key: 'settings.password.success', value: 'Mot de passe mis à jour avec succès!' },
            { languageCode: 'it', key: 'settings.password.success', value: 'Password aggiornata con successo!' },

            { languageCode: 'tr', key: 'settings.password.error_generic', value: 'Şifre güncellenirken bir hata oluştu.' },
            { languageCode: 'en', key: 'settings.password.error_generic', value: 'An error occurred while updating password.' },
            { languageCode: 'fr', key: 'settings.password.error_generic', value: 'Une erreur s\'est produite lors de la mise à jour du mot de passe.' },
            { languageCode: 'it', key: 'settings.password.error_generic', value: 'Si è verificato un errore durante l\'aggiornamento della password.' },

            // Verification Settings
            { languageCode: 'tr', key: 'settings.verification.title', value: 'Mavi Tik Başvurusu' },
            { languageCode: 'en', key: 'settings.verification.title', value: 'Blue Tick Application' },
            { languageCode: 'fr', key: 'settings.verification.title', value: 'Demande de coche bleue' },
            { languageCode: 'it', key: 'settings.verification.title', value: 'Richiesta spunta blu' },

            { languageCode: 'tr', key: 'settings.verification.id_name', value: 'Kimlikte yazan isminiz' },
            { languageCode: 'en', key: 'settings.verification.id_name', value: 'Name on your ID' },
            { languageCode: 'fr', key: 'settings.verification.id_name', value: 'Nom sur votre pièce d\'identité' },
            { languageCode: 'it', key: 'settings.verification.id_name', value: 'Nome sul tuo documento' },

            { languageCode: 'tr', key: 'settings.verification.reason', value: 'Bize kendinizden veya markanızdan kısaca bahsedin...' },
            { languageCode: 'en', key: 'settings.verification.reason', value: 'Tell us briefly about yourself or your brand...' },
            { languageCode: 'fr', key: 'settings.verification.reason', value: 'Parlez-nous brièvement de vous ou de votre marque...' },
            { languageCode: 'it', key: 'settings.verification.reason', value: 'Parlaci brevemente di te o del tuo brand...' },

            // ==================== MESSAGES ====================

            { languageCode: 'tr', key: 'messages.title', value: 'Mesajlar' },
            { languageCode: 'en', key: 'messages.title', value: 'Messages' },
            { languageCode: 'fr', key: 'messages.title', value: 'Messages' },
            { languageCode: 'it', key: 'messages.title', value: 'Messaggi' },

            { languageCode: 'tr', key: 'messages.new_message', value: 'Yeni Mesaj' },
            { languageCode: 'en', key: 'messages.new_message', value: 'New Message' },
            { languageCode: 'fr', key: 'messages.new_message', value: 'Nouveau message' },
            { languageCode: 'it', key: 'messages.new_message', value: 'Nuovo messaggio' },

            { languageCode: 'tr', key: 'messages.send_placeholder', value: 'Bir mesaj yaz...' },
            { languageCode: 'en', key: 'messages.send_placeholder', value: 'Write a message...' },
            { languageCode: 'fr', key: 'messages.send_placeholder', value: 'Écrire un message...' },
            { languageCode: 'it', key: 'messages.send_placeholder', value: 'Scrivi un messaggio...' },

            { languageCode: 'tr', key: 'messages.empty_state', value: 'Henüz mesaj yok' },
            { languageCode: 'en', key: 'messages.empty_state', value: 'No messages yet' },
            { languageCode: 'fr', key: 'messages.empty_state', value: 'Pas encore de messages' },
            { languageCode: 'it', key: 'messages.empty_state', value: 'Nessun messaggio ancora' },

            { languageCode: 'tr', key: 'messages.search', value: 'Mesajlarda ara...' },
            { languageCode: 'en', key: 'messages.search', value: 'Search messages...' },
            { languageCode: 'fr', key: 'messages.search', value: 'Rechercher des messages...' },
            { languageCode: 'it', key: 'messages.search', value: 'Cerca messaggi...' },

            // ==================== NOTIFICATIONS ====================

            { languageCode: 'tr', key: 'notifications.title', value: 'Bildirimler' },
            { languageCode: 'en', key: 'notifications.title', value: 'Notifications' },
            { languageCode: 'fr', key: 'notifications.title', value: 'Notifications' },
            { languageCode: 'it', key: 'notifications.title', value: 'Notifiche' },

            { languageCode: 'tr', key: 'notifications.subtitle', value: 'Tehlike çanlarını görüntüle' },
            { languageCode: 'en', key: 'notifications.subtitle', value: 'View your alerts' },
            { languageCode: 'fr', key: 'notifications.subtitle', value: 'Voir vos alertes' },
            { languageCode: 'it', key: 'notifications.subtitle', value: 'Visualizza i tuoi avvisi' },

            { languageCode: 'tr', key: 'notifications.empty', value: 'Henüz bildirim yok.' },
            { languageCode: 'en', key: 'notifications.empty', value: 'No notifications yet.' },
            { languageCode: 'fr', key: 'notifications.empty', value: 'Pas encore de notifications.' },
            { languageCode: 'it', key: 'notifications.empty', value: 'Nessuna notifica ancora.' },

            { languageCode: 'tr', key: 'notifications.liked_post', value: 'gönderini beğendi' },
            { languageCode: 'en', key: 'notifications.liked_post', value: 'liked your post' },
            { languageCode: 'fr', key: 'notifications.liked_post', value: 'a aimé votre publication' },
            { languageCode: 'it', key: 'notifications.liked_post', value: 'ha messo mi piace al tuo post' },

            { languageCode: 'tr', key: 'notifications.liked_reply', value: 'yanıtını beğendi' },
            { languageCode: 'en', key: 'notifications.liked_reply', value: 'liked your reply' },
            { languageCode: 'fr', key: 'notifications.liked_reply', value: 'a aimé votre réponse' },
            { languageCode: 'it', key: 'notifications.liked_reply', value: 'ha messo mi piace alla tua risposta' },

            { languageCode: 'tr', key: 'notifications.followed', value: 'seni takip etti' },
            { languageCode: 'en', key: 'notifications.followed', value: 'followed you' },
            { languageCode: 'fr', key: 'notifications.followed', value: 'vous a suivi' },
            { languageCode: 'it', key: 'notifications.followed', value: 'ti ha seguito' },

            { languageCode: 'tr', key: 'notifications.replied', value: 'sana yanıt verdi' },
            { languageCode: 'en', key: 'notifications.replied', value: 'replied to you' },
            { languageCode: 'fr', key: 'notifications.replied', value: 'vous a répondu' },
            { languageCode: 'it', key: 'notifications.replied', value: 'ti ha risposto' },

            { languageCode: 'tr', key: 'notifications.quoted', value: 'gönderini alıntıladı' },
            { languageCode: 'en', key: 'notifications.quoted', value: 'quoted your post' },
            { languageCode: 'fr', key: 'notifications.quoted', value: 'a cité votre publication' },
            { languageCode: 'it', key: 'notifications.quoted', value: 'ha citato il tuo post' },

            { languageCode: 'tr', key: 'notifications.mentioned', value: 'senden bahsetti' },
            { languageCode: 'en', key: 'notifications.mentioned', value: 'mentioned you' },
            { languageCode: 'fr', key: 'notifications.mentioned', value: 'vous a mentionné' },
            { languageCode: 'it', key: 'notifications.mentioned', value: 'ti ha menzionato' },

            { languageCode: 'tr', key: 'notifications.system', value: 'Sistem Bildirimi' },
            { languageCode: 'en', key: 'notifications.system', value: 'System Notification' },
            { languageCode: 'fr', key: 'notifications.system', value: 'Notification système' },
            { languageCode: 'it', key: 'notifications.system', value: 'Notifica sistema' },

            { languageCode: 'tr', key: 'notifications.and_others', value: 've diğer {count} kişi' },
            { languageCode: 'en', key: 'notifications.and_others', value: 'and {count} others' },
            { languageCode: 'fr', key: 'notifications.and_others', value: 'et {count} autres' },
            { languageCode: 'it', key: 'notifications.and_others', value: 'e {count} altri' },

            // ==================== EXPLORE / SEARCH ====================

            { languageCode: 'tr', key: 'explore.title', value: 'Keşfet' },
            { languageCode: 'en', key: 'explore.title', value: 'Explore' },
            { languageCode: 'fr', key: 'explore.title', value: 'Explorer' },
            { languageCode: 'it', key: 'explore.title', value: 'Esplora' },

            { languageCode: 'tr', key: 'explore.search_placeholder', value: 'Ara...' },
            { languageCode: 'en', key: 'explore.search_placeholder', value: 'Search...' },
            { languageCode: 'fr', key: 'explore.search_placeholder', value: 'Rechercher...' },
            { languageCode: 'it', key: 'explore.search_placeholder', value: 'Cerca...' },

            { languageCode: 'tr', key: 'explore.trending', value: 'Trendler' },
            { languageCode: 'en', key: 'explore.trending', value: 'Trending' },
            { languageCode: 'fr', key: 'explore.trending', value: 'Tendances' },
            { languageCode: 'it', key: 'explore.trending', value: 'Di tendenza' },

            { languageCode: 'tr', key: 'explore.for_you', value: 'Senin İçin' },
            { languageCode: 'en', key: 'explore.for_you', value: 'For You' },
            { languageCode: 'fr', key: 'explore.for_you', value: 'Pour vous' },
            { languageCode: 'it', key: 'explore.for_you', value: 'Per te' },

            // ==================== BOOKMARKS ====================

            { languageCode: 'tr', key: 'bookmarks.title', value: 'Yer İmleri' },
            { languageCode: 'en', key: 'bookmarks.title', value: 'Bookmarks' },
            { languageCode: 'fr', key: 'bookmarks.title', value: 'Favoris' },
            { languageCode: 'it', key: 'bookmarks.title', value: 'Segnalibri' },

            { languageCode: 'tr', key: 'bookmarks.empty', value: 'Henüz kaydedilmiş gönderi yok' },
            { languageCode: 'en', key: 'bookmarks.empty', value: 'No saved posts yet' },
            { languageCode: 'fr', key: 'bookmarks.empty', value: 'Aucune publication enregistrée pour le moment' },
            { languageCode: 'it', key: 'bookmarks.empty', value: 'Nessun post salvato ancora' },

            // ==================== HELP & SUPPORT ====================

            { languageCode: 'tr', key: 'help.title', value: 'Yardım Merkezi' },
            { languageCode: 'en', key: 'help.title', value: 'Help Center' },
            { languageCode: 'fr', key: 'help.title', value: 'Centre d\'aide' },
            { languageCode: 'it', key: 'help.title', value: 'Centro assistenza' },

            { languageCode: 'tr', key: 'help.contact', value: 'İletişim' },
            { languageCode: 'en', key: 'help.contact', value: 'Contact' },
            { languageCode: 'fr', key: 'help.contact', value: 'Contact' },
            { languageCode: 'it', key: 'help.contact', value: 'Contatto' },

            { languageCode: 'tr', key: 'help.faq', value: 'Sık Sorulan Sorular' },
            { languageCode: 'en', key: 'help.faq', value: 'Frequently Asked Questions' },
            { languageCode: 'fr', key: 'help.faq', value: 'Questions fréquemment posées' },
            { languageCode: 'it', key: 'help.faq', value: 'Domande frequenti' },

            // ==================== COMMON UI ====================

            { languageCode: 'tr', key: 'common.loading', value: 'Yükleniyor...' },
            { languageCode: 'en', key: 'common.loading', value: 'Loading...' },
            { languageCode: 'fr', key: 'common.loading', value: 'Chargement...' },
            { languageCode: 'it', key: 'common.loading', value: 'Caricamento...' },

            { languageCode: 'tr', key: 'common.save', value: 'Kaydet' },
            { languageCode: 'en', key: 'common.save', value: 'Save' },
            { languageCode: 'fr', key: 'common.save', value: 'Enregistrer' },
            { languageCode: 'it', key: 'common.save', value: 'Salva' },

            { languageCode: 'tr', key: 'common.cancel', value: 'İptal' },
            { languageCode: 'en', key: 'common.cancel', value: 'Cancel' },
            { languageCode: 'fr', key: 'common.cancel', value: 'Annuler' },
            { languageCode: 'it', key: 'common.cancel', value: 'Annulla' },

            { languageCode: 'tr', key: 'common.delete', value: 'Sil' },
            { languageCode: 'en', key: 'common.delete', value: 'Delete' },
            { languageCode: 'fr', key: 'common.delete', value: 'Supprimer' },
            { languageCode: 'it', key: 'common.delete', value: 'Elimina' },

            { languageCode: 'tr', key: 'common.edit', value: 'Düzenle' },
            { languageCode: 'en', key: 'common.edit', value: 'Edit' },
            { languageCode: 'fr', key: 'common.edit', value: 'Modifier' },
            { languageCode: 'it', key: 'common.edit', value: 'Modifica' },

            { languageCode: 'tr', key: 'common.send', value: 'Gönder' },
            { languageCode: 'en', key: 'common.send', value: 'Send' },
            { languageCode: 'fr', key: 'common.send', value: 'Envoyer' },
            { languageCode: 'it', key: 'common.send', value: 'Invia' },

            { languageCode: 'tr', key: 'common.search', value: 'Ara' },
            { languageCode: 'en', key: 'common.search', value: 'Search' },
            { languageCode: 'fr', key: 'common.search', value: 'Rechercher' },
            { languageCode: 'it', key: 'common.search', value: 'Cerca' },

            { languageCode: 'tr', key: 'common.back', value: 'Geri' },
            { languageCode: 'en', key: 'common.back', value: 'Back' },
            { languageCode: 'fr', key: 'common.back', value: 'Retour' },
            { languageCode: 'it', key: 'common.back', value: 'Indietro' },

            { languageCode: 'tr', key: 'common.close', value: 'Kapat' },
            { languageCode: 'en', key: 'common.close', value: 'Close' },
            { languageCode: 'fr', key: 'common.close', value: 'Fermer' },
            { languageCode: 'it', key: 'common.close', value: 'Chiudi' },

            { languageCode: 'tr', key: 'common.confirm', value: 'Onayla' },
            { languageCode: 'en', key: 'common.confirm', value: 'Confirm' },
            { languageCode: 'fr', key: 'common.confirm', value: 'Confirmer' },
            { languageCode: 'it', key: 'common.confirm', value: 'Conferma' },

            // ==================== ERROR MESSAGES ====================

            { languageCode: 'tr', key: 'error.network', value: 'Bağlantı hatası. Lütfen tekrar deneyin.' },
            { languageCode: 'en', key: 'error.network', value: 'Network error. Please try again.' },
            { languageCode: 'fr', key: 'error.network', value: 'Erreur réseau. Veuillez réessayer.' },
            { languageCode: 'it', key: 'error.network', value: 'Errore di rete. Riprova.' },

            { languageCode: 'tr', key: 'error.unauthorized', value: 'Yetkisiz erişim.' },
            { languageCode: 'en', key: 'error.unauthorized', value: 'Unauthorized access.' },
            { languageCode: 'fr', key: 'error.unauthorized', value: 'Accès non autorisé.' },
            { languageCode: 'it', key: 'error.unauthorized', value: 'Accesso non autorizzato.' },

            { languageCode: 'tr', key: 'error.not_found', value: 'Bulunamadı.' },
            { languageCode: 'en', key: 'error.not_found', value: 'Not found.' },
            { languageCode: 'fr', key: 'error.not_found', value: 'Introuvable.' },
            { languageCode: 'it', key: 'error.not_found', value: 'Non trovato.' },

            { languageCode: 'tr', key: 'error.server', value: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' },
            { languageCode: 'en', key: 'error.server', value: 'Server error. Please try again later.' },
            { languageCode: 'fr', key: 'error.server', value: 'Erreur serveur. Veuillez réessayer plus tard.' },
            { languageCode: 'it', key: 'error.server', value: 'Errore del server. Riprova più tardi.' },

            // ==================== SUCCESS MESSAGES ====================

            { languageCode: 'tr', key: 'success.saved', value: 'Başarıyla kaydedildi!' },
            { languageCode: 'en', key: 'success.saved', value: 'Successfully saved!' },
            { languageCode: 'fr', key: 'success.saved', value: 'Enregistré avec succès!' },
            { languageCode: 'it', key: 'success.saved', value: 'Salvato con successo!' },

            { languageCode: 'tr', key: 'success.updated', value: 'Başarıyla güncellendi!' },
            { languageCode: 'en', key: 'success.updated', value: 'Successfully updated!' },
            { languageCode: 'fr', key: 'success.updated', value: 'Mis à jour avec succès!' },
            { languageCode: 'it', key: 'success.updated', value: 'Aggiornato con successo!' },

            { languageCode: 'tr', key: 'success.deleted', value: 'Başarıyla silindi!' },
            { languageCode: 'en', key: 'success.deleted', value: 'Successfully deleted!' },
            { languageCode: 'fr', key: 'success.deleted', value: 'Supprimé avec succès!' },
            { languageCode: 'it', key: 'success.deleted', value: 'Eliminato con successo!' },

            { languageCode: 'tr', key: 'success.sent', value: 'Başarıyla gönderildi!' },
            { languageCode: 'en', key: 'success.sent', value: 'Successfully sent!' },
            { languageCode: 'fr', key: 'success.sent', value: 'Envoyé avec succès!' },
            { languageCode: 'it', key: 'success.sent', value: 'Inviato con successo!' },
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
            message: "Platform translations seeded successfully",
            inserted,
            updated,
            total: translations.length
        });
    } catch (error) {
        console.error("Platform translation seed error:", error);
        return NextResponse.json(
            { message: "Failed to seed platform translations", error: String(error) },
            { status: 500 }
        );
    }
}
