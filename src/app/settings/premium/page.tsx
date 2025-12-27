"use client";
import { SparklesIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function PremiumPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col h-full">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center p-4 border-b border-theme-border sticky top-0 bg-[var(--app-body-bg)] z-10">
                <button onClick={() => router.back()} className="mr-4 text-theme-text">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold">Premium</h2>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full mb-6 shadow-lg shadow-orange-500/20">
                    <SparklesIcon className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Premium Yakında</h2>
                <p className="text-gray-500 max-w-md">
                    RiskBudur Premium ile daha fazla özelliğe erişin. Çok yakında sizlerle!
                </p>
            </div>
        </div>
    );
}
