import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    MagnifyingGlassIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";
import GlobalHeader from "@/components/GlobalHeader";

export default function SettingsList() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname?.startsWith(path);

    const menuItems = [
        { label: "Hesabın", href: "/settings/account" },
        { label: "Premium", href: "/settings/premium" },
        { label: "Görünüm", href: "/settings/display" },
    ];

    return (
        <div className="flex flex-col h-full bg-[var(--app-body-bg)] text-[var(--app-body-text)]">
            <GlobalHeader title="Ayarlar" className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)]" />

            <div className="p-3">
                <div className="relative mb-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-[var(--app-subtitle)]" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-[var(--app-border)] rounded-full leading-5 bg-[var(--app-header-hover)] text-[var(--app-body-text)] placeholder-gray-500 focus:outline-none focus:bg-[var(--app-body-bg)] focus:border-[var(--app-global-link-color)] sm:text-sm transition-colors"
                        placeholder="Ayarlarda Ara"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`w-full flex items-center justify-between py-3 px-4 hover:bg-[var(--app-card-hover)] transition-colors border-r-2 ${isActive(item.href)
                                ? 'border-[var(--app-global-link-color)]'
                                : 'border-transparent'
                            }`}
                    >
                        <span className="text-[15px] text-[var(--app-body-text)]">{item.label}</span>
                        <ChevronRightIcon className="w-4 h-4 text-[var(--app-subtitle)]" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
