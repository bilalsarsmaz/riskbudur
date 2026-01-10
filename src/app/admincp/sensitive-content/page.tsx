"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdmStandardPageLayout from "@/components/AdmStandardPageLayout";
import AdminSidebar from "@/components/AdminSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import { fetchApi, postApi, deleteApi } from "@/lib/api";
import { hasPermission, Permission, Role } from "@/lib/permissions";
import { IconShieldLock, IconPlus, IconTrash, IconAlertTriangle, IconInfoCircle } from "@tabler/icons-react";

interface SensitiveWord {
    id: string;
    word: string;
    createdAt: string;
    createdBy: string | null;
}

export default function SensitiveContentPage() {
    const router = useRouter();
    const [words, setWords] = useState<SensitiveWord[]>([]);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const me = await fetchApi("/users/me");
                if (me) {
                    if (!hasPermission(me.role as Role, Permission.MANAGE_SENSITIVE_CONTENT)) {
                        router.push("/admincp");
                        return;
                    }
                }
            } catch (e) { }
            loadData();
        };
        checkAuth();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchApi("/admin/sensitive-content");
            if (Array.isArray(data)) {
                setWords(data);
            }
        } catch (err) {
            console.error("Sensitive words load error:", err);
            setError("Liste yüklenirken hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setSubmitting(true);
        try {
            // Split by comma and clean
            const res = await postApi("/admin/sensitive-content", { words: input });
            if (res) {
                setInput("");
                loadData();
            }
        } catch (err) {
            alert("Ekleme başarısız");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, word: string) => {
        if (!confirm(`"${word}" kelimesini filtreden kaldırmak istiyor musunuz?`)) return;

        try {
            await deleteApi(`/admin/sensitive-content?id=${id}`);
            setWords(prev => prev.filter(w => w.id !== id));
        } catch (err) {
            alert("Silme başarısız");
        }
    };

    const rightSidebarContent = (
        <div className="rounded-2xl p-4 sticky top-4 bg-theme-surface">
            <h2 className="text-xl font-extrabold mb-4 text-theme-text">İstatistikler</h2>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                    <IconShieldLock size={24} />
                </div>
                <div>
                    <p className="text-[13px] text-theme-subtitle">Yasaklı Kelime</p>
                    <p className="text-2xl font-bold text-theme-text">{words.length}</p>
                </div>
            </div>
            <div className="text-sm p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <div className="flex items-start gap-2">
                    <IconInfoCircle size={16} className="mt-0.5 shrink-0" />
                    <p>Bu listedeki kelimeler site genelinde <b>****</b> şeklinde maskelenir.</p>
                </div>
            </div>
        </div>
    );

    return (
        <AdmStandardPageLayout sidebarContent={<AdminSidebar />} rightSidebarContent={rightSidebarContent}>
            <GlobalHeader title="Hassas İçerik" subtitle="Argo ve Yasaklı Kelime Filtresi" />

            <div className="p-4">
                {/* Add Form */}
                <div className="bg-theme-surface border border-theme-border rounded-2xl p-6 mb-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-theme-text">
                        <IconPlus className="text-[#DC5F00]" />
                        Yeni Kelime Ekle
                    </h3>

                    <form onSubmit={handleAdd} className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Örn: kelime1, kelime2, kötü söz..."
                            className="flex-1 px-4 py-3 bg-theme-surface rounded-xl border-none focus:ring-2 focus:ring-[#DC5F00] text-theme-text"
                        />
                        <button
                            type="submit"
                            disabled={submitting || !input.trim()}
                            className="px-6 py-3 bg-[#DC5F00] hover:bg-[#b04c00] text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Ekleniyor...' : 'Ekle'}
                        </button>
                    </form>
                    <p className="text-xs text-theme-subtitle mt-2 ml-1">
                        * Birden fazla kelime eklemek için virgül ile ayırabilirsiniz. Büyük/küçük harf duyarsızdır.
                    </p>
                </div>

                {/* List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold px-1 text-theme-text">
                        Filtre Listesi ({words.length})
                    </h3>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#DC5F00]"></div>
                        </div>
                    ) : words.length === 0 ? (
                        <div className="text-center py-12 bg-theme-surface rounded-2xl border border-dashed border-theme-border">
                            <p className="text-theme-subtitle">Henüz filtrelenen kelime yok.</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {words.map((item) => (
                                <div
                                    key={item.id}
                                    className="group flex items-center gap-2 pl-4 pr-2 py-2 bg-theme-surface border border-theme-border rounded-full hover:border-red-500/50 transition-colors"
                                >
                                    <span className="font-medium text-theme-text">{item.word}</span>
                                    <button
                                        onClick={() => handleDelete(item.id, item.word)}
                                        className="p-1.5 rounded-full hover:bg-red-500/20 text-theme-subtitle hover:text-red-500 transition-colors"
                                        title="Sil"
                                    >
                                        <IconTrash size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdmStandardPageLayout>
    );
}
