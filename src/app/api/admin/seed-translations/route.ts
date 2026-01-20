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
            // COMPOSEBOX TRANSLATIONS
            { languageCode: 'tr', key: 'compose.placeholder', value: 'Ne düşünüyorsun?' },
            { languageCode: 'en', key: 'compose.placeholder', value: 'What\'s on your mind?' },
            { languageCode: 'fr', key: 'compose.placeholder', value: 'À quoi pensez-vous?' },
            { languageCode: 'it', key: 'compose.placeholder', value: 'A cosa stai pensando?' },

            { languageCode: 'tr', key: 'compose.placeholder_anonymous', value: 'Anonim olarak paylaşacaksınız...' },
            { languageCode: 'en', key: 'compose.placeholder_anonymous', value: 'You will post anonymously...' },
            { languageCode: 'fr', key: 'compose.placeholder_anonymous', value: 'Vous allez publier anonymement...' },
            { languageCode: 'it', key: 'compose.placeholder_anonymous', value: 'Pubblicherai in forma anonima...' },

            { languageCode: 'tr', key: 'compose.error_empty', value: 'Post içeriği boş olamaz' },
            { languageCode: 'en', key: 'compose.error_empty', value: 'Post content cannot be empty' },
            { languageCode: 'fr', key: 'compose.error_empty', value: 'Le contenu du post ne peut pas être vide' },
            { languageCode: 'it', key: 'compose.error_empty', value: 'Il contenuto del post non può essere vuoto' },

            { languageCode: 'tr', key: 'compose.error_session', value: 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.' },
            { languageCode: 'en', key: 'compose.error_session', value: 'Session expired. Please login again.' },
            { languageCode: 'fr', key: 'compose.error_session', value: 'Session expirée. Veuillez vous reconnecter.' },
            { languageCode: 'it', key: 'compose.error_session', value: 'Sessione scaduta. Effettua nuovamente l\'accesso.' },

            { languageCode: 'tr', key: 'compose.error_upload_failed', value: 'Dosya yüklenemedi' },
            { languageCode: 'en', key: 'compose.error_upload_failed', value: 'File upload failed' },
            { languageCode: 'fr', key: 'compose.error_upload_failed', value: 'Échec du téléchargement du fichier' },
            { languageCode: 'it', key: 'compose.error_upload_failed', value: 'Caricamento file non riuscito' },

            { languageCode: 'tr', key: 'compose.error_file_size', value: 'Dosya boyutu çok büyük (Max 50MB)' },
            { languageCode: 'en', key: 'compose.error_file_size', value: 'File size too large (Max 50MB)' },
            { languageCode: 'fr', key: 'compose.error_file_size', value: 'Taille du fichier trop grande (Max 50MB)' },
            { languageCode: 'it', key: 'compose.error_file_size', value: 'Dimensione file troppo grande (Max 50MB)' },

            { languageCode: 'tr', key: 'compose.error_poll_min_options', value: 'Anket için en az 2 seçenek gereklidir.' },
            { languageCode: 'en', key: 'compose.error_poll_min_options', value: 'Poll must have at least 2 options.' },
            { languageCode: 'fr', key: 'compose.error_poll_min_options', value: 'Le sondage doit avoir au moins 2 options.' },
            { languageCode: 'it', key: 'compose.error_poll_min_options', value: 'Il sondaggio deve avere almeno 2 opzioni.' },

            { languageCode: 'tr', key: 'compose.error_poll_min_duration', value: 'Anket süresi en az 5 dakika olmalıdır.' },
            { languageCode: 'en', key: 'compose.error_poll_min_duration', value: 'Poll duration must be at least 5 minutes.' },
            { languageCode: 'fr', key: 'compose.error_poll_min_duration', value: 'La durée du sondage doit être d\'au moins 5 minutes.' },
            { languageCode: 'it', key: 'compose.error_poll_min_duration', value: 'La durata del sondaggio deve essere di almeno 5 minuti.' },

            { languageCode: 'tr', key: 'compose.error_generic', value: 'Bir hata oluştu' },
            { languageCode: 'en', key: 'compose.error_generic', value: 'An error occurred' },
            { languageCode: 'fr', key: 'compose.error_generic', value: 'Une erreur s\'est produite' },
            { languageCode: 'it', key: 'compose.error_generic', value: 'Si è verificato un errore' },

            { languageCode: 'tr', key: 'compose.link_preview_loading', value: 'Link önizlemesi yükleniyor...' },
            { languageCode: 'en', key: 'compose.link_preview_loading', value: 'Loading link preview...' },
            { languageCode: 'fr', key: 'compose.link_preview_loading', value: 'Chargement de l\'aperç du lien...' },
            { languageCode: 'it', key: 'compose.link_preview_loading', value: 'Caricamento anteprima link...' },

            { languageCode: 'tr', key: 'compose.poll_options', value: 'Anket Seçenekleri' },
            { languageCode: 'en', key: 'compose.poll_options', value: 'Poll Options' },
            { languageCode: 'fr', key: 'compose.poll_options', value: 'Options du sondage' },
            { languageCode: 'it', key: 'compose.poll_options', value: 'Opzioni sondaggio' },

            { languageCode: 'tr', key: 'compose.poll_option_placeholder', value: 'Seçenek {n}' },
            { languageCode: 'en', key: 'compose.poll_option_placeholder', value: 'Option {n}' },
            { languageCode: 'fr', key: 'compose.poll_option_placeholder', value: 'Option {n}' },
            { languageCode: 'it', key: 'compose.poll_option_placeholder', value: 'Opzione {n}' },

            { languageCode: 'tr', key: 'compose.add_option', value: 'Seçenek Ekle' },
            { languageCode: 'en', key: 'compose.add_option', value: 'Add Option' },
            { languageCode: 'fr', key: 'compose.add_option', value: 'Ajouter une option' },
            { languageCode: 'it', key: 'compose.add_option', value: 'Aggiungi opzione' },

            { languageCode: 'tr', key: 'compose.poll_duration', value: 'Anket uzunluğu' },
            { languageCode: 'en', key: 'compose.poll_duration', value: 'Poll duration' },
            { languageCode: 'fr', key: 'compose.poll_duration', value: 'Durée du sondage' },
            { languageCode: 'it', key: 'compose.poll_duration', value: 'Durata sondaggio' },

            { languageCode: 'tr', key: 'compose.days', value: 'Gün' },
            { languageCode: 'en', key: 'compose.days', value: 'Days' },
            { languageCode: 'fr', key: 'compose.days', value: 'Jours' },
            { languageCode: 'it', key: 'compose.days', value: 'Giorni' },

            { languageCode: 'tr', key: 'compose.hours', value: 'Saat' },
            { languageCode: 'en', key: 'compose.hours', value: 'Hours' },
            { languageCode: 'fr', key: 'compose.hours', value: 'Heures' },
            { languageCode: 'it', key: 'compose.hours', value: 'Ore' },

            { languageCode: 'tr', key: 'compose.minutes', value: 'Dakika' },
            { languageCode: 'en', key: 'compose.minutes', value: 'Minutes' },
            { languageCode: 'fr', key: 'compose.minutes', value: 'Minutes' },
            { languageCode: 'it', key: 'compose.minutes', value: 'Minuti' },

            { languageCode: 'tr', key: 'compose.button_post', value: 'Paylaş' },
            { languageCode: 'en', key: 'compose.button_post', value: 'Post' },
            { languageCode: 'fr', key: 'compose.button_post', value: 'Publier' },
            { languageCode: 'it', key: 'compose.button_post', value: 'Pubblica' },

            // QUOTE MODAL
            { languageCode: 'tr', key: 'modal.quote.add_thought', value: 'Bir şeyler ekle...' },
            { languageCode: 'en', key: 'modal.quote.add_thought', value: 'Add your thoughts...' },
            { languageCode: 'fr', key: 'modal.quote.add_thought', value: 'Ajoutez vos commentaires...' },
            { languageCode: 'it', key: 'modal.quote.add_thought', value: 'Aggiungi i tuoi pensieri...' },

            { languageCode: 'tr', key: 'modal.quote.button_quote', value: 'Alıntıla' },
            { languageCode: 'en', key: 'modal.quote.button_quote', value: 'Quote' },
            { languageCode: 'fr', key: 'modal.quote.button_quote', value: 'Citer' },
            { languageCode: 'it', key: 'modal.quote.button_quote', value: 'Cita' },

            // COMMENT MODAL
            { languageCode: 'tr', key: 'modal.comment.write_reply', value: 'Yanıtınızı yazın...' },
            { languageCode: 'en', key: 'modal.comment.write_reply', value: 'Write your reply...' },
            { languageCode: 'fr', key: 'modal.comment.write_reply', value: 'Écrivez votre réponse...' },
            { languageCode: 'it', key: 'modal.comment.write_reply', value: 'Scrivi la tua risposta...' },

            { languageCode: 'tr', key: 'modal.comment.reply', value: 'Yanıtla' },
            { languageCode: 'en', key: 'modal.comment.reply', value: 'Reply' },
            { languageCode: 'fr', key: 'modal.comment.reply', value: 'Répondre' },
            { languageCode: 'it', key: 'modal.comment.reply', value: 'Rispondi' },
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
            message: "Translations seeded successfully",
            inserted,
            updated,
            total: translations.length
        });
    } catch (error) {
        console.error("Translation seed error:", error);
        return NextResponse.json(
            { message: "Failed to seed translations", error: String(error) },
            { status: 500 }
        );
    }
}
