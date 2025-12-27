"use client";
import { useRouter } from "next/navigation";
import { MoonIcon, SunIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function DisplayPage() {
    const router = useRouter();

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
                <h2 className="hidden lg:block text-xl font-bold mb-6">Görünüm</h2>

                <div className="bg-[var(--app-card-bg)] border border-theme-border rounded-xl p-6">
                    <h3 className="font-bold mb-4">Tema</h3>
                    <p className="text-sm text-gray-500 mb-6">Uygulamanın görünümünü tercihlerinize göre ayarlayın.</p>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex flex-col items-center p-4 border-2 border-[var(--app-global-link-color)] rounded-lg bg-[#000000] text-white">
                            <MoonIcon className="w-8 h-8 mb-2 text-[var(--app-global-link-color)]" />
                            <span className="font-bold">Karanlık</span>
                        </button>
                        <button className="flex flex-col items-center p-4 border border-theme-border rounded-lg bg-gray-100 text-black opacity-50 cursor-not-allowed" title="Açık tema yakında">
                            <SunIcon className="w-8 h-8 mb-2 text-orange-500" />
                            <span className="font-bold">Aydınlık</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
