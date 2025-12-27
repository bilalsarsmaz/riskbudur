"use client";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface SettingsPlaceholderProps {
    title: string;
}

export default function SettingsPlaceholderPage({ params }: { params: { slug: string } }) {
    const router = useRouter();

    // We can't easily pass props to page components in App Router like this without a client wrapper or specific prop.
    // For this generated file, we will hardcode the title or derive it.

    return (
        <div className="flex flex-col h-full bg-black text-white">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center p-4 border-b border-[#2f3336] sticky top-0 bg-black z-10">
                <button onClick={() => router.back()} className="mr-4 text-[#e7e9ea]">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold">Ayarlar</h2>
            </div>

            <div className="hidden lg:flex items-center space-x-4 px-4 py-3 sticky top-0 bg-black/80 backdrop-blur-md z-10 border-b border-[#2f3336]">
                <button onClick={() => router.back()} className="text-[#e7e9ea] hover:bg-[#18191c] p-2 rounded-full transition-colors">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-[#e7e9ea]">Ayarlar</h2>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
                <h2 className="text-2xl font-bold mb-2">Bu özellik yakında aktif</h2>
                <p className="text-[#71767b] max-w-md">
                    Bu ayar sayfası şu anda geliştirme aşamasında.
                </p>
            </div>
        </div>
    );
}
