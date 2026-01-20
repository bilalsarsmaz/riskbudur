import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// HIERARCHICAL COMMON & HELP TRANSLATIONS
// common.ui.*
// common.error.*
// common.success.*
// help.*

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
            // COMMON UI
            { languageCode: 'tr', key: 'common.ui.loading', value: 'Yükleniyor...' },
            { languageCode: 'en', key: 'common.ui.loading', value: 'Loading...' },
            { languageCode: 'fr', key: 'common.ui.loading', value: 'Loading...' },
            { languageCode: 'it', key: 'common.ui.loading', value: 'Loading...' },
            { languageCode: 'tr', key: 'common.ui.save', value: 'Kaydet' },
            { languageCode: 'en', key: 'common.ui.save', value: 'Save' },
            { languageCode: 'fr', key: 'common.ui.save', value: 'Save' },
            { languageCode: 'it', key: 'common.ui.save', value: 'Save' },
            { languageCode: 'tr', key: 'common.ui.cancel', value: 'İptal' },
            { languageCode: 'en', key: 'common.ui.cancel', value: 'Cancel' },
            { languageCode: 'fr', key: 'common.ui.cancel', value: 'Cancel' },
            { languageCode: 'it', key: 'common.ui.cancel', value: 'Cancel' },
            { languageCode: 'tr', key: 'common.ui.delete', value: 'Sil' },
            { languageCode: 'en', key: 'common.ui.delete', value: 'Delete' },
            { languageCode: 'fr', key: 'common.ui.delete', value: 'Delete' },
            { languageCode: 'it', key: 'common.ui.delete', value: 'Delete' },
            { languageCode: 'tr', key: 'common.ui.edit', value: 'Düzenle' },
            { languageCode: 'en', key: 'common.ui.edit', value: 'Edit' },
            { languageCode: 'fr', key: 'common.ui.edit', value: 'Edit' },
            { languageCode: 'it', key: 'common.ui.edit', value: 'Edit' },
            { languageCode: 'tr', key: 'common.ui.send', value: 'Gönder' },
            { languageCode: 'en', key: 'common.ui.send', value: 'Send' },
            { languageCode: 'fr', key: 'common.ui.send', value: 'Send' },
            { languageCode: 'it', key: 'common.ui.send', value: 'Send' },
            { languageCode: 'tr', key: 'common.ui.search', value: 'Ara' },
            { languageCode: 'en', key: 'common.ui.search', value: 'Search' },
            { languageCode: 'fr', key: 'common.ui.search', value: 'Search' },
            { languageCode: 'it', key: 'common.ui.search', value: 'Search' },
            { languageCode: 'tr', key: 'common.ui.back', value: 'Geri' },
            { languageCode: 'en', key: 'common.ui.back', value: 'Back' },
            { languageCode: 'fr', key: 'common.ui.back', value: 'Back' },
            { languageCode: 'it', key: 'common.ui.back', value: 'Back' },
            { languageCode: 'tr', key: 'common.ui.close', value: 'Kapat' },
            { languageCode: 'en', key: 'common.ui.close', value: 'Close' },
            { languageCode: 'fr', key: 'common.ui.close', value: 'Close' },
            { languageCode: 'it', key: 'common.ui.close', value: 'Close' },
            { languageCode: 'tr', key: 'common.ui.confirm', value: 'Onayla' },
            { languageCode: 'en', key: 'common.ui.confirm', value: 'Confirm' },
            { languageCode: 'fr', key: 'common.ui.confirm', value: 'Confirm' },
            { languageCode: 'it', key: 'common.ui.confirm', value: 'Confirm' },
            { languageCode: 'tr', key: 'common.ui.show_more', value: 'Daha fazla göster' },
            { languageCode: 'en', key: 'common.ui.show_more', value: 'Show more' },
            { languageCode: 'fr', key: 'common.ui.show_more', value: 'Show more' },
            { languageCode: 'it', key: 'common.ui.show_more', value: 'Show more' },

            // COMMON ERROR
            { languageCode: 'tr', key: 'common.error.network', value: 'Bağlantı hatası. Lütfen tekrar deneyin.' },
            { languageCode: 'en', key: 'common.error.network', value: 'Network error. Please try again.' },
            { languageCode: 'fr', key: 'common.error.network', value: 'Network error. Please try again.' },
            { languageCode: 'it', key: 'common.error.network', value: 'Network error. Please try again.' },
            { languageCode: 'tr', key: 'common.error.unauthorized', value: 'Yetkisiz erişim.' },
            { languageCode: 'en', key: 'common.error.unauthorized', value: 'Unauthorized access.' },
            { languageCode: 'fr', key: 'common.error.unauthorized', value: 'Unauthorized access.' },
            { languageCode: 'it', key: 'common.error.unauthorized', value: 'Unauthorized access.' },
            { languageCode: 'tr', key: 'common.error.not_found', value: 'Bulunamadı.' },
            { languageCode: 'en', key: 'common.error.not_found', value: 'Not found.' },
            { languageCode: 'fr', key: 'common.error.not_found', value: 'Not found.' },
            { languageCode: 'it', key: 'common.error.not_found', value: 'Not found.' },
            { languageCode: 'tr', key: 'common.error.server', value: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' },
            { languageCode: 'en', key: 'common.error.server', value: 'Server error. Please try again later.' },
            { languageCode: 'fr', key: 'common.error.server', value: 'Server error. Please try again later.' },
            { languageCode: 'it', key: 'common.error.server', value: 'Server error. Please try again later.' },
            { languageCode: 'tr', key: 'common.error.generic', value: 'Bir hata oluştu' },
            { languageCode: 'en', key: 'common.error.generic', value: 'An error occurred' },
            { languageCode: 'fr', key: 'common.error.generic', value: 'An error occurred' },
            { languageCode: 'it', key: 'common.error.generic', value: 'An error occurred' },

            // COMMON SUCCESS
            { languageCode: 'tr', key: 'common.success.saved', value: 'Başarıyla kaydedildi!' },
            { languageCode: 'en', key: 'common.success.saved', value: 'Successfully saved!' },
            { languageCode: 'fr', key: 'common.success.saved', value: 'Successfully saved!' },
            { languageCode: 'it', key: 'common.success.saved', value: 'Successfully saved!' },
            { languageCode: 'tr', key: 'common.success.updated', value: 'Başarıyla güncellendi!' },
            { languageCode: 'en', key: 'common.success.updated', value: 'Successfully updated!' },
            { languageCode: 'fr', key: 'common.success.updated', value: 'Successfully updated!' },
            { languageCode: 'it', key: 'common.success.updated', value: 'Successfully updated!' },
            { languageCode: 'tr', key: 'common.success.deleted', value: 'Başarıyla silindi!' },
            { languageCode: 'en', key: 'common.success.deleted', value: 'Successfully deleted!' },
            { languageCode: 'fr', key: 'common.success.deleted', value: 'Successfully deleted!' },
            { languageCode: 'it', key: 'common.success.deleted', value: 'Successfully deleted!' },
            { languageCode: 'tr', key: 'common.success.sent', value: 'Başarıyla gönderildi!' },
            { languageCode: 'en', key: 'common.success.sent', value: 'Successfully sent!' },
            { languageCode: 'fr', key: 'common.success.sent', value: 'Successfully sent!' },
            { languageCode: 'it', key: 'common.success.sent', value: 'Successfully sent!' },

            // BRANDING
            { languageCode: 'tr', key: 'common.site_name', value: 'riskbudur' },
            { languageCode: 'en', key: 'common.site_name', value: 'riskbudur' },
            { languageCode: 'fr', key: 'common.site_name', value: 'riskbudur' },
            { languageCode: 'it', key: 'common.site_name', value: 'riskbudur' },
            { languageCode: 'tr', key: 'common.slogan', value: 'underground sosyal medya' },
            { languageCode: 'en', key: 'common.slogan', value: 'underground social media' },
            { languageCode: 'fr', key: 'common.slogan', value: 'médias sociaux souterrains' },
            { languageCode: 'it', key: 'common.slogan', value: 'social media underground' },

            // HELP
            { languageCode: 'tr', key: 'help.title', value: 'Yardım Merkezi' },
            { languageCode: 'en', key: 'help.title', value: 'Help Center' },
            { languageCode: 'fr', key: 'help.title', value: 'Help Center' },
            { languageCode: 'it', key: 'help.title', value: 'Help Center' },
            { languageCode: 'tr', key: 'help.contact', value: 'İletişim' },
            { languageCode: 'en', key: 'help.contact', value: 'Contact' },
            { languageCode: 'fr', key: 'help.contact', value: 'Contact' },
            { languageCode: 'it', key: 'help.contact', value: 'Contact' },
            { languageCode: 'tr', key: 'help.faq', value: 'Sık Sorulan Sorular' },
            { languageCode: 'en', key: 'help.faq', value: 'Frequently Asked Questions' },
            { languageCode: 'fr', key: 'help.faq', value: 'Frequently Asked Questions' },
            { languageCode: 'it', key: 'help.faq', value: 'Frequently Asked Questions' },

            // FOOTER
            { languageCode: 'tr', key: 'common.footer.about', value: 'Hakkında' },
            { languageCode: 'en', key: 'common.footer.about', value: 'About' },
            { languageCode: 'fr', key: 'common.footer.about', value: 'About' },
            { languageCode: 'it', key: 'common.footer.about', value: 'About' },
            { languageCode: 'tr', key: 'common.footer.terms', value: 'Kullanım Şartları' },
            { languageCode: 'en', key: 'common.footer.terms', value: 'Terms of Service' },
            { languageCode: 'fr', key: 'common.footer.terms', value: 'Terms of Service' },
            { languageCode: 'it', key: 'common.footer.terms', value: 'Terms of Service' },
            { languageCode: 'tr', key: 'common.footer.privacy', value: 'Gizlilik' },
            { languageCode: 'en', key: 'common.footer.privacy', value: 'Privacy Policy' },
            { languageCode: 'fr', key: 'common.footer.privacy', value: 'Privacy Policy' },
            { languageCode: 'it', key: 'common.footer.privacy', value: 'Privacy Policy' },
            { languageCode: 'tr', key: 'common.footer.contact', value: 'İletişim' },
            { languageCode: 'en', key: 'common.footer.contact', value: 'Contact' },
            { languageCode: 'fr', key: 'common.footer.contact', value: 'Contact' },
            { languageCode: 'it', key: 'common.footer.contact', value: 'Contact' }
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
            message: "Hierarchical Common/Help translations seeded",
            inserted,
            updated,
            total: translations.length
        });
    } catch (error) {
        console.error("Common seed error:", error);
        return NextResponse.json(
            { message: "Failed to seed common translations", error: String(error) },
            { status: 500 }
        );
    }
}
