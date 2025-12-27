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
    rightContent?: React.ReactNode;
    backButtonClassName?: string;
}

export default function GlobalHeader({ title, subtitle, className = "", onBack, showBackButton, style, rightContent, backButtonClassName = "" }: GlobalHeaderProps) {
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
            className={`sticky top-0 z-50 bg-theme-bg/80 backdrop-blur-md px-3 sm:px-4 border-b border-theme-border h-[56px] sm:h-[60px] flex items-center justify-between ${className}`}
            style={style}
        >
            <div className="flex items-center flex-1 min-w-0">
                {(showBackButton || onBack) && (
                    <button
                        onClick={handleBack}
                        className={`mr-3 sm:mr-6 p-2 rounded-full hover:bg-[var(--app-card-hover)] transition-colors flex-shrink-0 ${backButtonClassName}`}
                    >
                        <ArrowLeftIcon className="w-5 h-5" style={{ color: "var(--app-body-text)" }} />
                    </button>
                )}
                <div className="flex flex-col justify-center min-w-0 flex-1">
                    <h1 className="text-base sm:text-xl font-bold leading-tight truncate" style={{ color: "var(--app-body-text)" }}>{title}</h1>
                    {subtitle && <p className="text-[10px] sm:text-xs truncate leading-tight" style={{ color: 'var(--app-subtitle)' }}>{subtitle}</p>}
                </div>
            </div>
            {rightContent && <div className="ml-2 flex-shrink-0">{rightContent}</div>}
        </div>
    );
}
