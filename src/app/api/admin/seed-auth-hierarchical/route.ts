import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// HIERARCHICAL AUTH TRANSLATIONS
// auth.login.*
// auth.register.*
// auth.setup.*

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
            { languageCode: 'tr', key: 'auth.login.title', value: 'Giriş Yap' },
            { languageCode: 'en', key: 'auth.login.title', value: 'Log In' },
            { languageCode: 'fr', key: 'auth.login.title', value: 'Log In' },
            { languageCode: 'it', key: 'auth.login.title', value: 'Log In' },
            { languageCode: 'tr', key: 'auth.login.subtitle', value: 'Seni tekrar görmek güzel.' },
            { languageCode: 'en', key: 'auth.login.subtitle', value: 'Good to see you again.' },
            { languageCode: 'fr', key: 'auth.login.subtitle', value: 'Good to see you again.' },
            { languageCode: 'it', key: 'auth.login.subtitle', value: 'Good to see you again.' },
            { languageCode: 'tr', key: 'auth.login.hero_title', value: 'Şu an olup biten her şey.' },
            { languageCode: 'en', key: 'auth.login.hero_title', value: 'Everything happening right now.' },
            { languageCode: 'fr', key: 'auth.login.hero_title', value: 'Everything happening right now.' },
            { languageCode: 'it', key: 'auth.login.hero_title', value: 'Everything happening right now.' },
            { languageCode: 'tr', key: 'auth.login.hero_subtitle', value: 'Riskbudur\'a katıl, dünyadan haberdar ol. Sohbetlere dahil ol, gündemi yakala.' },
            { languageCode: 'en', key: 'auth.login.hero_subtitle', value: 'Join Riskbudur, stay informed. Join conversations, catch the trends.' },
            { languageCode: 'fr', key: 'auth.login.hero_subtitle', value: 'Join Riskbudur, stay informed. Join conversations, catch the trends.' },
            { languageCode: 'it', key: 'auth.login.hero_subtitle', value: 'Join Riskbudur, stay informed. Join conversations, catch the trends.' },
            { languageCode: 'tr', key: 'auth.login.google_button', value: 'Google ile Giriş Yap' },
            { languageCode: 'en', key: 'auth.login.google_button', value: 'Log in with Google' },
            { languageCode: 'fr', key: 'auth.login.google_button', value: 'Log in with Google' },
            { languageCode: 'it', key: 'auth.login.google_button', value: 'Log in with Google' },
            { languageCode: 'tr', key: 'auth.login.or', value: 'veya' },
            { languageCode: 'en', key: 'auth.login.or', value: 'or' },
            { languageCode: 'fr', key: 'auth.login.or', value: 'or' },
            { languageCode: 'it', key: 'auth.login.or', value: 'or' },
            { languageCode: 'tr', key: 'auth.login.email_placeholder', value: 'E-posta' },
            { languageCode: 'en', key: 'auth.login.email_placeholder', value: 'Email' },
            { languageCode: 'fr', key: 'auth.login.email_placeholder', value: 'Email' },
            { languageCode: 'it', key: 'auth.login.email_placeholder', value: 'Email' },
            { languageCode: 'tr', key: 'auth.login.password_placeholder', value: 'Şifre' },
            { languageCode: 'en', key: 'auth.login.password_placeholder', value: 'Password' },
            { languageCode: 'fr', key: 'auth.login.password_placeholder', value: 'Password' },
            { languageCode: 'it', key: 'auth.login.password_placeholder', value: 'Password' },
            { languageCode: 'tr', key: 'auth.login.button_submit', value: 'Giriş Yap' },
            { languageCode: 'en', key: 'auth.login.button_submit', value: 'Log In' },
            { languageCode: 'fr', key: 'auth.login.button_submit', value: 'Log In' },
            { languageCode: 'it', key: 'auth.login.button_submit', value: 'Log In' },
            { languageCode: 'tr', key: 'auth.login.button_loading', value: 'Giriş Yapılıyor...' },
            { languageCode: 'en', key: 'auth.login.button_loading', value: 'Logging in...' },
            { languageCode: 'fr', key: 'auth.login.button_loading', value: 'Logging in...' },
            { languageCode: 'it', key: 'auth.login.button_loading', value: 'Logging in...' },
            { languageCode: 'tr', key: 'auth.login.no_account', value: 'Hesabın yok mu?' },
            { languageCode: 'en', key: 'auth.login.no_account', value: 'Don\'t have an account?' },
            { languageCode: 'fr', key: 'auth.login.no_account', value: 'Don\'t have an account?' },
            { languageCode: 'it', key: 'auth.login.no_account', value: 'Don\'t have an account?' },
            { languageCode: 'tr', key: 'auth.login.signup_link', value: 'Kayıt Ol' },
            { languageCode: 'en', key: 'auth.login.signup_link', value: 'Sign Up' },
            { languageCode: 'fr', key: 'auth.login.signup_link', value: 'Sign Up' },
            { languageCode: 'it', key: 'auth.login.signup_link', value: 'Sign Up' },

            // REGISTER PAGE
            { languageCode: 'tr', key: 'auth.register.title', value: 'Hesap Oluştur' },
            { languageCode: 'en', key: 'auth.register.title', value: 'Create Account' },
            { languageCode: 'fr', key: 'auth.register.title', value: 'Create Account' },
            { languageCode: 'it', key: 'auth.register.title', value: 'Create Account' },
            { languageCode: 'tr', key: 'auth.register.subtitle', value: 'Hemen katıl, sohbete başla.' },
            { languageCode: 'en', key: 'auth.register.subtitle', value: 'Join now, start chatting.' },
            { languageCode: 'fr', key: 'auth.register.subtitle', value: 'Join now, start chatting.' },
            { languageCode: 'it', key: 'auth.register.subtitle', value: 'Join now, start chatting.' },
            { languageCode: 'tr', key: 'auth.register.name_placeholder', value: 'Ad Soyad' },
            { languageCode: 'en', key: 'auth.register.name_placeholder', value: 'Full Name' },
            { languageCode: 'fr', key: 'auth.register.name_placeholder', value: 'Full Name' },
            { languageCode: 'it', key: 'auth.register.name_placeholder', value: 'Full Name' },
            { languageCode: 'tr', key: 'auth.register.button_submit', value: 'Kayıt Ol' },
            { languageCode: 'en', key: 'auth.register.button_submit', value: 'Sign Up' },
            { languageCode: 'fr', key: 'auth.register.button_submit', value: 'Sign Up' },
            { languageCode: 'it', key: 'auth.register.button_submit', value: 'Sign Up' },
            { languageCode: 'tr', key: 'auth.register.button_loading', value: 'Kaydediliyor...' },
            { languageCode: 'en', key: 'auth.register.button_loading', value: 'Signing up...' },
            { languageCode: 'fr', key: 'auth.register.button_loading', value: 'Signing up...' },
            { languageCode: 'it', key: 'auth.register.button_loading', value: 'Signing up...' },
            { languageCode: 'tr', key: 'auth.register.have_account', value: 'Zaten hesabın var mı?' },
            { languageCode: 'en', key: 'auth.register.have_account', value: 'Already have an account?' },
            { languageCode: 'fr', key: 'auth.register.have_account', value: 'Already have an account?' },
            { languageCode: 'it', key: 'auth.register.have_account', value: 'Already have an account?' },
            { languageCode: 'tr', key: 'auth.register.login_link', value: 'Giriş Yap' },
            { languageCode: 'en', key: 'auth.register.login_link', value: 'Log In' },
            { languageCode: 'fr', key: 'auth.register.login_link', value: 'Log In' },
            { languageCode: 'it', key: 'auth.register.login_link', value: 'Log In' },

            // SETUP PAGE
            { languageCode: 'tr', key: 'auth.setup.title', value: 'Profilini Tamamla' },
            { languageCode: 'en', key: 'auth.setup.title', value: 'Complete Your Profile' },
            { languageCode: 'fr', key: 'auth.setup.title', value: 'Complete Your Profile' },
            { languageCode: 'it', key: 'auth.setup.title', value: 'Complete Your Profile' },
            { languageCode: 'tr', key: 'auth.setup.username_placeholder', value: 'kullaniciadi' },
            { languageCode: 'en', key: 'auth.setup.username_placeholder', value: 'username' },
            { languageCode: 'fr', key: 'auth.setup.username_placeholder', value: 'username' },
            { languageCode: 'it', key: 'auth.setup.username_placeholder', value: 'username' },
            { languageCode: 'tr', key: 'auth.setup.bio_placeholder', value: 'Kendinden bahset...' },
            { languageCode: 'en', key: 'auth.setup.bio_placeholder', value: 'Tell us about yourself...' },
            { languageCode: 'fr', key: 'auth.setup.bio_placeholder', value: 'Tell us about yourself...' },
            { languageCode: 'it', key: 'auth.setup.bio_placeholder', value: 'Tell us about yourself...' },
            { languageCode: 'tr', key: 'auth.setup.button_submit', value: 'Devam Et' },
            { languageCode: 'en', key: 'auth.setup.button_submit', value: 'Continue' },
            { languageCode: 'fr', key: 'auth.setup.button_submit', value: 'Continue' },
            { languageCode: 'it', key: 'auth.setup.button_submit', value: 'Continue' }
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
            message: "Hierarchical Auth translations seeded",
            inserted,
            updated,
            total: translations.length
        });
    } catch (error) {
        console.error("Auth seed error:", error);
        return NextResponse.json(
            { message: "Failed to seed auth translations", error: String(error) },
            { status: 500 }
        );
    }
}
