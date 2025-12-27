import Link from "next/link";
import {
    UserIcon,
    KeyIcon,
    HeartIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";
import GlobalHeader from "@/components/GlobalHeader";

export default function AccountSettingsPage() {
    const items = [
        {
            icon: UserIcon,
            title: "Hesap Bilgileri",
            description: "Kullanıcı adı, e-posta ve diğer bilgilerini gör.",
            href: "/settings/account/info"
        },
        {
            icon: KeyIcon,
            title: "Şifre",
            description: "İstediğin zaman şifreni değiştir.",
            href: "/settings/account/password"
        },
        {
            icon: HeartIcon,
            title: "Hesabını devre dışı bırak",
            description: "Hesabınızı nasıl devre dışı bırakacağını öğren.",
            href: "/settings/account/deactivate"
        }
    ];

    return (
        <div className="flex flex-col min-h-full bg-[var(--app-body-bg)] text-[var(--app-body-text)]">
            {/* Header */}
            <GlobalHeader
                title="Hesap"
                className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)]"
                showBackButton={true}
                backButtonClassName="lg:hidden"
            />

            <div className="px-4 py-4 border-b border-[var(--app-border)]">
                <p className="text-[13px] text-[var(--app-subtitle)] leading-5">
                    Hesabın hakkındaki bilgileri gör, şifreni değiştir veya hesabını devre dışı bırak.
                </p>
            </div>

            <div className="mt-2">
                {items.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className="flex items-start px-4 py-3 hover:bg-[var(--app-card-hover)] transition-colors group"
                    >
                        <div className="flex-shrink-0 mt-1 mr-4 text-[var(--app-subtitle)] group-hover:text-[var(--app-body-text)] transition-colors">
                            <item.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[15px] font-medium text-[var(--app-body-text)] group-hover:underline decoration-1">{item.title}</h3>
                                <ChevronRightIcon className="w-5 h-5 text-[var(--app-subtitle)]" />
                            </div>
                            <p className="text-[13px] text-[var(--app-subtitle)] mt-0.5">{item.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
