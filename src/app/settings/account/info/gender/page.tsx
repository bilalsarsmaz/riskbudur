"use client";
import { useState, useEffect } from "react";
import { fetchApi, postApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import GlobalHeader from "@/components/GlobalHeader";

export default function GenderPage() {
    const router = useRouter();
    const [gender, setGender] = useState("unspecified");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchApi("/users/me")
            .then(data => {
                setGender(data.gender || "unspecified");
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
            });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await postApi("/users/me", { gender });
            setMessage({ type: 'success', text: "Cinsiyet bilgisi güncellendi" });
            setTimeout(() => router.back(), 1000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Hata oluştu" });
        }
    };

    if (loading) return <div className="p-8 text-[var(--app-subtitle)] bg-[var(--app-body-bg)] h-screen">Yükleniyor...</div>;

    return (
        <div className="flex flex-col min-h-full bg-[var(--app-body-bg)] text-[var(--app-body-text)]">
            <GlobalHeader
                title="Cinsiyet"
                showBackButton={true}
                className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)]"
            />

            <div className="p-4 md:p-8 max-w-2xl">

                {message && (
                    <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[var(--app-subtitle)] mb-2">Cinsiyet Seçimi</label>
                        <div className="relative">
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full bg-[var(--app-body-bg)] border border-[var(--app-border)] rounded text-[var(--app-body-text)] px-4 py-3 appearance-none focus:outline-none focus:border-[var(--app-global-link-color)] focus:ring-1 focus:ring-[var(--app-global-link-color)] transition-colors"
                            >
                                <option value="unspecified">Belirtmek İstemiyorum</option>
                                <option value="male">Erkek</option>
                                <option value="female">Kadın</option>
                                <option value="other">Diğer</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                <ChevronRightIcon className="w-5 h-5 text-[var(--app-subtitle)] rotate-90" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-[var(--app-border)]">
                        <button type="submit" className="px-6 py-2.5 bg-[var(--app-global-link-color)] text-white font-bold rounded-full hover:opacity-90 transition-colors text-[15px]">
                            Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
