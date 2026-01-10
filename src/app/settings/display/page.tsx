"use client";
import { useRouter } from "next/navigation";
import { MoonIcon, SunIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";

export default function DisplayPage() {
    const router = useRouter();
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    // Load theme from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }, []);

    // Toggle theme
    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center p-4 border-b border-theme-border sticky top-0 bg-[var(--app-body-bg)] z-10">
                <button onClick={() => router.back()} className="mr-4 text-theme-text">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">Görünüm</h2>
            </div>

            <div className="p-4 md:p-8 max-w-2xl">
                <h2 className="hidden lg:block text-xl font-bold mb-6 text-[var(--app-body-text)]">Görünüm</h2>

                <div className="bg-[var(--app-card-bg)] border border-[var(--app-border)] rounded-xl p-6">
                    <h3 className="font-bold mb-4 text-[var(--app-body-text)]">Tema</h3>
                    <p className="text-sm text-[var(--app-subtitle)] mb-6">Uygulamanın görünümünü tercihlerinize göre ayarlayın.</p>

                    <div className="flex items-center justify-between p-4 border border-[var(--app-border)] rounded-lg" style={{ backgroundColor: 'var(--app-body-bg)' }}>
                        <span className="font-medium text-[var(--app-body-text)]">Platform Teması</span>

                        <button
                            onClick={toggleTheme}
                            // ...
                            className="relative w-[52px] h-[28px] rounded-full transition-colors duration-300 flex-shrink-0 border cursor-pointer"
                            style={{
                                backgroundColor: theme === 'dark' ? '#000000' : '#e5e7eb',
                                borderColor: theme === 'dark' ? '#374151' : '#d1d5db'
                            }}
                        >
                            {/* Sun Icon (Left Background - Visible when Dark) */}
                            <div className={`absolute left-1.5 top-1.5 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
                                <SunIcon className="w-4 h-4 text-gray-500" />
                            </div>

                            {/* Moon Icon (Right Background - Visible when Light) */}
                            <div className={`absolute right-1.5 top-1.5 transition-opacity duration-300 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}>
                                <MoonIcon className="w-4 h-4 text-gray-400" />
                            </div>

                            {/* Sliding Circle */}
                            <div
                                className={`absolute top-[2px] w-[22px] h-[22px] rounded-full shadow-sm flex items-center justify-center transition-transform duration-300 bg-[#f97316]`}
                                style={{ transform: theme === 'dark' ? 'translateX(26px)' : 'translateX(2px)' }}
                            >
                                {theme === 'dark' ? (
                                    <MoonIcon className="w-3.5 h-3.5 text-white" />
                                ) : (
                                    <SunIcon className="w-3.5 h-3.5 text-white" />
                                )}
                            </div>
                        </button>
                    </div>

                    <p className="mt-4 text-xs text-[var(--app-subtitle)]">
                        {theme === 'dark'
                            ? "Şu an karanlık moddasınız. Gözleriniz size minnettar."
                            : "Şu an aydınlık moddasınız. Biraz parlak değil mi?"}
                    </p>
                </div>
            </div>
        </div>
    );
}
