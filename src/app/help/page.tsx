import Link from "next/link";
import { getPages } from "@/lib/pageContent";
import HelpLayout from "@/components/HelpLayout";
import { IconArrowRight, IconBook, IconInfoCircle, IconShield, IconMail, IconFileText } from "@tabler/icons-react";

export const metadata = {
    title: "Yardım Merkezi | RiskBudur",
    description: "RiskBudur destek, kullanım şartları ve gizlilik politikaları.",
};

const getIconForSlug = (slug: string) => {
    switch (slug) {
        case 'about': return <IconInfoCircle className="w-8 h-8 mb-4 text-blue-500" />;
        case 'terms': return <IconBook className="w-8 h-8 mb-4 text-orange-500" />;
        case 'privacy': return <IconShield className="w-8 h-8 mb-4 text-green-500" />;
        case 'contact': return <IconMail className="w-8 h-8 mb-4 text-purple-500" />;
        default: return <IconFileText className="w-8 h-8 mb-4 text-gray-500" />;
    }
};

export default async function HelpHomePage() {
    const pages = await getPages();

    // Sort pages? Maybe 'about' first, then 'terms', 'privacy', 'contact'
    const order = ['about', 'contact', 'terms', 'privacy'];
    const sortedPages = [...pages].sort((a, b) => {
        const indexA = order.indexOf(a.slug);
        const indexB = order.indexOf(b.slug);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    return (
        <HelpLayout title="Yardım Merkezi" subtitle="Sana nasıl yardımcı olabiliriz?">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                {sortedPages.map((page) => (
                    <div key={page.slug} className="group relative bg-[#111] border border-gray-800 rounded-2xl p-6 hover:border-[var(--app-global-link-color)] transition-colors hover:bg-[#161616]">
                        {getIconForSlug(page.slug)}

                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--app-global-link-color)] transition-colors">
                            {page.title}
                        </h3>

                        <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">
                            {page.subtitle || "Daha fazla bilgi için tıklayın."}
                        </p>

                        <Link
                            href={page.slug === 'contact' ? '/contact' : `/${page.slug}`}
                            className="inline-flex items-center text-sm font-bold text-[var(--app-global-link-color)] hover:underline"
                        >
                            Detaylar
                            <IconArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                ))}

                {/* Fallback if contact page is not in DB but we want to show it manually 
            (Though implementing contact page usually implies it's in DB for content, 
             if it's missing from DB list, we can add a hardcoded card here) 
        */}
                {!pages.find(p => p.slug === 'contact') && (
                    <div className="group relative bg-[#111] border border-gray-800 rounded-2xl p-6 hover:border-[var(--app-global-link-color)] transition-colors hover:bg-[#161616]">
                        <IconMail className="w-8 h-8 mb-4 text-purple-500" />
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--app-global-link-color)] transition-colors">
                            İletişim
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Bizimle iletişime geçin.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center text-sm font-bold text-[var(--app-global-link-color)] hover:underline"
                        >
                            Detaylar
                            <IconArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                )}

            </div>
        </HelpLayout>
    );
}
