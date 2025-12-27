"use client";
import { useState, useEffect } from "react";
import { fetchApi, postApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";

export default function BirthdatePage() {
    const router = useRouter();
    const [birthday, setBirthday] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchApi("/users/me")
            .then(data => {
                setBirthday(data.birthday ? new Date(data.birthday).toISOString().split('T')[0] : "");
                setLoading(false);
            })
            .catch(err => {
                setLoading(false);
            });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await postApi("/users/me", { birthday: birthday || null });
            setMessage({ type: 'success', text: "Doğum tarihi güncellendi" });
            setTimeout(() => router.back(), 1000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Hata oluştu" });
        }
    };

    if (loading) return <div className="p-8 text-[var(--app-subtitle)] bg-[var(--app-body-bg)] h-screen">Yükleniyor...</div>;

    return (
        <div className="flex flex-col min-h-full bg-[var(--app-body-bg)] text-[var(--app-body-text)]">
            <GlobalHeader
                title="Doğum Tarihi"
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
                        <label className="block text-sm font-medium text-[var(--app-subtitle)] mb-2">Doğum Tarihi</label>
                        <input
                            type="date"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            className="w-full bg-[var(--app-body-bg)] border border-[var(--app-border)] rounded text-[var(--app-body-text)] px-3 py-3 focus:outline-none focus:border-[var(--app-global-link-color)] focus:ring-1 focus:ring-[var(--app-global-link-color)] transition-colors [color-scheme:dark]"
                        />
                        <p className="text-[13px] text-[var(--app-subtitle)] mt-2">Bu, genel profilinde gösterilir.</p>
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
