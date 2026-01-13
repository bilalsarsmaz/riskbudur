export const dynamic = 'force-dynamic';

import { getTranslations } from '@/lib/translations';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function PendingApprovalPage() {
    const cookieStore = await cookies();
    const lang = cookieStore.get("NEXT_LOCALE")?.value || "tr";
    const t = await getTranslations(lang);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--app-body-bg)] text-[var(--app-body-text)] p-4 text-center">
            <div className="max-w-md w-full p-8 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] shadow-2xl animate-fade-in">
                <div className="mb-6 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-clock-hour-4 text-[var(--app-global-link-color)]" width="64" height="64" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                        <path d="M12 12l3 2" />
                        <path d="M12 7v5" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold mb-4 font-montserrat">
                    {t?.pendingApproval?.title || "Hesabınız Onay Bekliyor"}
                </h1>

                <p className="text-[var(--app-subtitle)] mb-8 leading-relaxed">
                    {t?.pendingApproval?.description || "Kaydınız başarıyla alındı. Yönetici onayı sonrası platforma erişim sağlayabileceksiniz. Lütfen daha sonra tekrar kontrol edin."}
                </p>

                <Link
                    href="/login"
                    className="inline-block px-6 py-3 rounded-full bg-[var(--app-global-link-color)] text-white font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-[var(--app-global-link-color)]/30"
                >
                    {t?.auth?.login || "Giriş Ekranına Dön"}
                </Link>
            </div>
        </div>
    );
}
