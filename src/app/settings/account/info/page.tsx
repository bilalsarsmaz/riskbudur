"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";

export default function AccountInfoPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApi("/users/me")
            .then(data => {
                setUser(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("tr-TR", { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (loading) return <div className="p-8 text-[var(--app-subtitle)] bg-[var(--app-body-bg)] min-h-screen">Yükleniyor...</div>;

    const infoItems = [
        { label: "Kullanıcı Adı", value: user?.nickname ? `@${user.nickname}` : "", href: "/settings/account/info/username" },
        { label: "E-posta", value: user?.email, href: "/settings/account/info/email" },
        { label: "Cinsiyet", value: user?.gender === 'male' ? 'Erkek' : user?.gender === 'female' ? 'Kadın' : 'Diğer', href: "/settings/account/info/gender" },
        { label: "Doğum Tarihi", value: user?.birthday ? `${formatDate(user.birthday)}` : "Ekle", href: "/settings/account/info/birthdate" },
        { label: "Onaylanmış Hesap", value: user?.isVerified ? "Evet" : "Hayır. Daha fazla bilgi al", isLink: !user?.isVerified, href: "/settings/account/info/verification" },
    ];

    return (
        <div className="flex flex-col min-h-full bg-[var(--app-body-bg)] text-[var(--app-body-text)]">
            {/* Global Header with Back Button */}
            <GlobalHeader
                title="Hesap Bilgileri"
                showBackButton={true} // Triggers the default router.back() behavior
                className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)]"
            />

            <div className="mt-2">
                {infoItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className={`flex items-center justify-between px-4 py-3 hover:bg-[var(--app-card-hover)] transition-colors border-b border-[var(--app-border)]`}
                    >
                        <div className="flex-1 min-w-0 pr-4">
                            <p className="text-[15px] font-medium text-[var(--app-body-text)]">{item.label}</p>
                            <div className="text-[14px] text-[var(--app-subtitle)] mt-0.5 whitespace-pre-line">
                                {item.isLink ? <span className="text-[var(--app-global-link-color)] hover:underline">{item.value}</span> : item.value}
                            </div>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-[var(--app-subtitle)]" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
