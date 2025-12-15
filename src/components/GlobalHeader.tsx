"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface GlobalHeaderProps {
    title: string | React.ReactNode;
    subtitle?: string;
    className?: string;
    onBack?: () => void;
    showBackButton?: boolean;
    style?: React.CSSProperties;
}

export default function GlobalHeader({ title, subtitle, className = "", onBack, showBackButton, style }: GlobalHeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (window.history.length > 1) {
            router.back();
        } else {
            // Fallback if no history
            window.location.href = '/home';
        }
    };

    return (
        <div
            className={`sticky top-0 z-50 bg-theme-bg/80 backdrop-blur-md px-4 border-b border-theme-border h-[60px] flex items-center ${className}`}
            style={style}
        >
            {(showBackButton || onBack) && (
                <button
                    onClick={handleBack}
                    className="mr-6 p-2 rounded-full hover:bg-[#181818] transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" style={{ color: "var(--app-body-text)" }} />
                </button>
            )}
            <div className="flex flex-col justify-center">
                <h1 className="text-xl font-bold leading-[22px]" style={{ color: "var(--app-body-text)" }}>{title}</h1>
                {subtitle && <p className="text-xs leading-[14px]" style={{ color: 'var(--app-subtitle)' }}>{subtitle}</p>}
            </div>
        </div>
    );
}
