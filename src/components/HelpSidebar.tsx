"use client";

import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

export default function HelpSidebar() {
    return (
        <div className="flex flex-col h-full p-4">
            {/* Logo */}
            <div className="mb-8 px-2">
                <Link href="/home">
                    <img
                        src="/riskbudurlogo.png?v=2"
                        alt="Riskbudur"
                        className="h-8 xl:h-9 w-auto"
                    />
                </Link>
            </div>

            {/* Platforma Dön Button */}
            <Link
                href="/home"
                className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-white/5 transition-all group"
            >
                <IconArrowLeft
                    className="w-6 h-6 group-hover:scale-110 transition-transform"
                    style={{ color: 'var(--app-body-text)' }}
                />
                <span
                    className="hidden xl:block font-medium text-[15px]"
                    style={{ color: 'var(--app-body-text)' }}
                >
                    Platforma Dön
                </span>
            </Link>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Footer Info */}
            <div className="hidden xl:block px-4 py-4 text-xs" style={{ color: 'var(--app-subtitle)' }}>
                <p className="mb-1 font-medium">Riskbudur Yardım</p>
                <p className="opacity-70">Destek ve Bilgi Merkezi</p>
            </div>
        </div>
    );
}
