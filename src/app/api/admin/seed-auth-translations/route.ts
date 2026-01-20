import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// PHASE 3: AUTHENTICATION PAGES
//  - Login, Register, Setup, Forgot Password

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
            // LOGIN PAGE
            { languageCode: 'tr', key: 'login.title', value: 'Giriş Yap' },
            { languageCode: 'en', key: 'login.title', value: 'Log In' },
            { languageCode: 'fr', key: 'login.title', value: 'Se connecter' },
            { languageCode: 'it', key: 'login.title', value: 'Accedi' },

            { languageCode: 'tr', key: 'login.subtitle', value: 'Seni tekrar görmek güzel.' },
            { languageCode: 'en', key: 'login.subtitle', value: 'Good to see you again.' },
            { languageCode: 'fr', key: 'login.subtitle', value: 'Heureux de vous revoir.' },
            { languageCode: 'it', key: 'login.subtitle', value: 'Bello rivederti.' },

            { languageCode: 'tr', key: 'login.hero_title', value: 'Şu an olup biten her şey.' },
            { languageCode: 'en', key: 'login.hero_title', value: 'Everything happening right now.' },
            { languageCode: 'fr', key: 'login.hero_title', value: 'Tout ce qui se passe maintenant.' },
            { languageCode: 'it', key: 'login.hero_title', value: 'Tutto quello che succede ora.' },

            { languageCode: 'tr', key: 'login.hero_subtitle', value: 'Riskbudur\'a katıl, dünyadan haberdar ol. Sohbetlere dahil ol, gündemi yakala.' },
            { languageCode: 'en', key: 'login.hero_subtitle', value: 'Join Riskbudur, stay informed. Join conversations, catch the trends.' },
            { languageCode: 'fr', key: 'login.hero_subtitle', value: 'Rejoignez Riskbudur, restez informé. Rejoignez les conversations, suivez les tendances.' },
            { languageCode: 'it', key: 'login.hero_subtitle', value: 'Unisciti a Riskbudur, rimani informato. Unisciti alle conversazioni, segui le tendenze.' },

            { languageCode: 'tr', key: 'login.google_button', value: 'Google ile Giriş Yap' },
            { languageCode: 'en', key: 'login.google_button', value: 'Log in with Google' },
            { languageCode: 'fr', key: 'login.google_button', value: 'Se connecter avec Google' },
            { languageCode: 'it', key: 'login.google_button', value: 'Accedi con Google' },

            { languageCode: 'tr', key: 'login.or', value: 'veya' },
            { languageCode: 'en', key: 'login.or', value: 'or' },
            { languageCode: 'fr', key: 'login.or', value: 'ou' },
            { languageCode: 'it', key: 'login.or', value: 'o' },

            { languageCode: 'tr', key: 'login.email_placeholder', value: 'E-posta' },
            { languageCode: 'en', key: 'login.email_placeholder', value: 'Email' },
            { languageCode: 'fr', key: 'login.email_placeholder', value: 'E-mail' },
            { languageCode: 'it', key: 'login.email_placeholder', value: 'Email' },

            { languageCode: 'tr', key: 'login.password_placeholder', value: 'Şifre' },
            { languageCode: 'en', key: 'login.password_placeholder', value: 'Password' },
            { languageCode: 'fr', key: 'login.password_placeholder', value: 'Mot de passe' },
            { languageCode: 'it', key: 'login.password_placeholder', value: 'Password' },

            { languageCode: 'tr', key: 'login.button_submit', value: 'Giriş Yap' },
            { languageCode: 'en', key: 'login.button_submit', value: 'Log In' },
            { languageCode: 'fr', key: 'login.button_submit', value: 'Se connecter' },
            { languageCode: 'it', key: 'login.button_submit', value: 'Accedi' },

            { languageCode: 'tr', key: 'login.button_loading', value: 'Giriş Yapılıyor...' },
            { languageCode: 'en', key: 'login.button_loading', value: 'Logging in...' },
            { languageCode: 'fr', key: 'login.button_loading', value: 'Connexion...' },
            { languageCode: 'it', key: 'login.button_loading', value: 'Accesso...' },

            { languageCode: 'tr', key: 'login.no_account', value: 'Hesabın yok mu?' },
            { languageCode: 'en', key: 'login.no_account', value: 'Don\'t have an account?' },
            { languageCode: 'fr', key: 'login.no_account', value: 'Pas de compte?' },
            { languageCode: 'it', key: 'login.no_account', value: 'Non hai un account?' },

            { languageCode: 'tr', key: 'login.signup_link', value: 'Kayıt Ol' },
            { languageCode: 'en', key: 'login.signup_link', value: 'Sign Up' },
            { languageCode: 'fr', key: 'login.signup_link', value: 'S\'inscrire' },
            { languageCode: 'it', key: 'login.signup_link', value: 'Iscriviti' },

            // REGISTER PAGE
            { languageCode: 'tr', key: 'register.title', value: 'Hesap Oluştur' },
            { languageCode: 'en', key: 'register.title', value: 'Create Account' },
            { languageCode: 'fr', key: 'register.title', value: 'Créer un compte' },
            { languageCode: 'it', key: 'register.title', value: 'Crea account' },

            { languageCode: 'tr', key: 'register.subtitle', value: 'Hemen katıl, sohbete başla.' },
            { languageCode: 'en', key: 'register.subtitle', value: 'Join now, start chatting.' },
            { languageCode: 'fr', key: 'register.subtitle', value: 'Rejoignez maintenant, commencez à discuter.' },
            { languageCode: 'it', key: 'register.subtitle', value: 'Unisciti ora, inizia a chattare.' },

            { languageCode: 'tr', key: 'register.name_placeholder', value: 'Ad Soyad' },
            { languageCode: 'en', key: 'register.name_placeholder', value: 'Full Name' },
            { languageCode: 'fr', key: 'register.name_placeholder', value: 'Nom complet' },
            { languageCode: 'it', key: 'register.name_placeholder', value: 'Nome completo' },

            { languageCode: 'tr', key: 'register.button_submit', value: 'Kayıt Ol' },
            { languageCode: 'en', key: 'register.button_submit', value: 'Sign Up' },
            { languageCode: 'fr', key: 'register.button_submit', value: 'S\'inscrire' },
            { languageCode: 'it', key: 'register.button_submit', value: 'Iscriviti' },

            { languageCode: 'tr', key: 'register.button_loading', value: 'Kaydediliyor...' },
            { languageCode: 'en', key: 'register.button_loading', value: 'Signing up...' },
            { languageCode: 'fr', key: 'register.button_loading', value: 'Inscription...' },
            { languageCode: 'it', key: 'register.button_loading', value: 'Iscrizione...' },

            { languageCode: 'tr', key: 'register.have_account', value: 'Zaten hesabın var mı?' },
            { languageCode: 'en', key: 'register.have_account', value: 'Already have an account?' },
            { languageCode: 'fr', key: 'register.have_account', value: 'Vous avez déjà un compte?' },
            { languageCode: 'it', key: 'register.have_account', value: 'Hai già un account?' },

            { languageCode: 'tr', key: 'register.login_link', value: 'Giriş Yap' },
            { languageCode: 'en', key: 'register.login_link', value: 'Log In' },
            { languageCode: 'fr', key: 'register.login_link', value: 'Se connecter' },
            { languageCode: 'it', key: 'register.login_link', value: 'Accedi' },

            // SETUP PAGE
            { languageCode: 'tr', key: 'setup.title', value: 'Profilini Tamamla' },
            { languageCode: 'en', key: 'setup.title', value: 'Complete Your Profile' },
            { languageCode: 'fr', key: 'setup.title', value: 'Complétez votre profil' },
            { languageCode: 'it', key: 'setup.title', value: 'Completa il tuo profilo' },

            { languageCode: 'tr', key: 'setup.username_placeholder', value: 'kullaniciadi' },
            { languageCode: 'en', key: 'setup.username_placeholder', value: 'username' },
            { languageCode: 'fr', key: 'setup.username_placeholder', value: 'nomutilisateur' },
            { languageCode: 'it', key: 'setup.username_placeholder', value: 'nomeutente' },

            { languageCode: 'tr', key: 'setup.bio_placeholder', value: 'Kendinden bahset...' },
            { languageCode: 'en', key: 'setup.bio_placeholder', value: 'Tell us about yourself...' },
            { languageCode: 'fr', key: 'setup.bio_placeholder', value: 'Parlez-nous de vous...' },
            { languageCode: 'it', key: 'setup.bio_placeholder', value: 'Parlaci di te...' },

            { languageCode: 'tr', key: 'setup.button_submit', value: 'Devam Et' },
            { languageCode: 'en', key: 'setup.button_submit', value: 'Continue' },
            { languageCode: 'fr', key: 'setup.button_submit', value: 'Continuer' },
            { languageCode: 'it', key: 'setup.button_submit', value: 'Continua' },

            // COMMON AUTH
            { languageCode: 'tr', key: 'auth.error_generic', value: 'Bir hata oluştu' },
            { languageCode: 'en', key: 'auth.error_generic', value: 'An error occurred' },
            { languageCode: 'fr', key: 'auth.error_generic', value: 'Une erreur s\'est produite' },
            { languageCode: 'it', key: 'auth.error_generic', value: 'Si è verificato un errore' },
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
            message: "Auth translations seeded successfully",
            inserted,
            updated,
            total: translations.length
        });
    } catch (error) {
        console.error("Auth translation seed error:", error);
        return NextResponse.json(
            { message: "Failed to seed auth translations", error: String(error) },
            { status: 500 }
        );
    }
}
