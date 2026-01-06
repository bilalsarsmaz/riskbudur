"use client";

import Link from "next/link";
import SecondaryLayout from "@/components/SecondaryLayout";
import HelpSidebar from "@/components/HelpSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import { IconArrowRight, IconBook, IconInfoCircle, IconShield, IconMail } from "@tabler/icons-react";

const helpPages = [
    {
        slug: 'about',
        title: 'Hakkımızda',
        subtitle: 'RiskBudur hakkında bilgi edinin',
        icon: <IconInfoCircle className="w-8 h-8 mb-4 text-blue-500" />,
        href: '/help/about'
    },
    {
        slug: 'contact',
        title: 'İletişim',
        subtitle: 'Bizimle iletişime geçin',
        icon: <IconMail className="w-8 h-8 mb-4 text-purple-500" />,
        href: '/help/contact'
    },
    {
        slug: 'terms',
        title: 'Kullanım Şartları',
        subtitle: 'Kullanım koşullarını inceleyin',
        icon: <IconBook className="w-8 h-8 mb-4 text-orange-500" />,
        href: '/help/terms'
    },
    {
        slug: 'privacy',
        title: 'Gizlilik Politikası',
        subtitle: 'Gizlilik politikamızı okuyun',
        icon: <IconShield className="w-8 h-8 mb-4 text-green-500" />,
        href: '/help/privacy'
    }
];

export default function HelpHomePage() {
    return (
        <SecondaryLayout sidebarContent={<HelpSidebar />}>
            <GlobalHeader
                title="Yardım Merkezi"
                subtitle="Sana nasıl yardımcı olabiliriz?"
                showBackButton={false}
            />

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {helpPages.map((page) => (
                        <Link
                            key={page.slug}
                            href={page.href}
                            className="group relative bg-[#111] border border-gray-800 rounded-2xl p-6 hover:border-[var(--app-global-link-color)] transition-colors hover:bg-[#161616] block"
                        >
                            {page.icon}

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--app-global-link-color)] transition-colors">
                                {page.title}
                            </h3>

                            <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10">
                                {page.subtitle}
                            </p>

                            <span className="inline-flex items-center text-sm font-bold text-[var(--app-global-link-color)] hover:underline">
                                Detaylar
                                <IconArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </SecondaryLayout>
    );
}
