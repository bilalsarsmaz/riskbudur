
"use client";

import { useEffect, useState, useMemo } from "react";
import AdmSecondaryLayout from "@/components/AdmSecondaryLayout";
import GlobalHeader from "@/components/GlobalHeader";
import { fetchApi, postApi } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { IconDeviceFloppy, IconSearch, IconArrowLeft, IconLoader, IconCheck, IconEdit, IconChevronRight } from "@tabler/icons-react";

interface Translation {
    key: string;
    value: string;
}

export default function EditTranslationPage() {
    const params = useParams();
    const router = useRouter();
    const langCode = params.lang as string;

    const [translations, setTranslations] = useState<Translation[]>([]);
    const [originalData, setOriginalData] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [unsavedChanges, setUnsavedChanges] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadTranslations();
    }, [langCode]);

    const loadTranslations = async () => {
        try {
            setLoading(true);
            const data = await fetchApi(`/admin/translations/${langCode}`);
            // Sort by key
            data.sort((a: Translation, b: Translation) => a.key.localeCompare(b.key));
            setTranslations(data);

            const originalMap: Record<string, string> = {};
            data.forEach((t: Translation) => originalMap[t.key] = t.value);
            setOriginalData(originalMap);
        } catch (error) {
            console.error("Failed to load", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: string, newValue: string) => {
        setTranslations(prev => prev.map(t => t.key === key ? { ...t, value: newValue } : t));

        // Track changes
        if (originalData[key] !== newValue) {
            setUnsavedChanges(prev => new Set(prev).add(key));
        } else {
            setUnsavedChanges(prev => {
                const newSet = new Set(prev);
                newSet.delete(key);
                return newSet;
            });
        }
    };

    const handleSave = async () => {
        if (unsavedChanges.size === 0) return;

        setSaving(true);
        try {
            // Prepare payload: only send changed items
            const updates = translations
                .filter(t => unsavedChanges.has(t.key))
                .map(t => ({ key: t.key, value: t.value }));

            await postApi(`/admin/translations/${langCode}`, { updates });

            // Update original data
            const newOriginals = { ...originalData };
            updates.forEach(u => newOriginals[u.key] = u.value);
            setOriginalData(newOriginals);
            setUnsavedChanges(new Set());

            alert("Değişiklikler kaydedildi!");
        } catch (error) {
            alert("Kaydetme başarısız");
        } finally {
            setSaving(false);
        }
    };

    const filteredTranslations = useMemo(() => {
        if (!searchQuery) return translations;
        const lower = searchQuery.toLowerCase();
        return translations.filter(t =>
            t.key.toLowerCase().includes(lower) ||
            t.value.toLowerCase().includes(lower)
        );
    }, [translations, searchQuery]);

    return (
        <AdmSecondaryLayout>
            <GlobalHeader
                title={`Çeviri Düzenle: ${langCode.toUpperCase()}`}
                subtitle={`${translations.length} metin bulundu`}
                showBackButton
                onBack={() => router.push("/admincp/language")}
                rightContent={
                    unsavedChanges.size > 0 && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-[#1DCD9F] text-black px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-[#1abe92] animate-pulse"
                        >
                            {saving ? <IconLoader className="animate-spin" size={18} /> : <IconDeviceFloppy size={18} />}
                            Kaydet ({unsavedChanges.size})
                        </button>
                    )
                }
            />

            <div className="p-4 space-y-4">
                {/* Search */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-subtitle" size={18} />
                        <input
                            type="text"
                            placeholder="Anahtar veya çeviri ara..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-theme-surface border border-theme-border rounded-xl py-3 pl-10 pr-4 text-theme-text outline-none focus:border-[#1DCD9F] transition-colors"
                            autoFocus
                        />
                    </div>
                    <button
                        onClick={async () => {
                            if (!confirm("Eksik anahtarlar taranıp eklenecek. Emin misiniz?")) return;
                            try {
                                await fetchApi("/admin/seed-languages");
                                loadTranslations();
                                alert("Tarama tamamlandı!");
                            } catch (e) {
                                alert("Hata oluştu");
                            }
                        }}
                        className="bg-[#181818] border border-theme-border rounded-xl px-4 text-theme-subtitle hover:text-white hover:border-white transition-colors flex items-center gap-2 whitespace-nowrap"
                        title="Eksik anahtarları tarar ve ekler"
                    >
                        <IconCheck size={18} />
                        <span className="hidden sm:inline">Varsayılanları Tara</span>
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-10"><IconLoader className="animate-spin text-[#1DCD9F]" /></div>
                ) : (
                    <div className="space-y-4">
                        {Object.entries(
                            filteredTranslations.reduce((acc, t) => {
                                const group = t.key.includes('.') ? t.key.split('.')[0] : 'Diğer';
                                if (!acc[group]) acc[group] = [];
                                acc[group].push(t);
                                return acc;
                            }, {} as Record<string, Translation[]>)
                        ).map(([group, items]) => (
                            <div key={group} className="border border-theme-border rounded-xl overflow-hidden bg-[#111]">
                                <details className="group" open>
                                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors select-none font-bold text-lg text-theme-text capitalize">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#1DCD9F]">#</span>
                                            {group.replace(/_/g, ' ')}
                                            <span className="text-xs font-normal text-theme-subtitle bg-white/10 px-2 py-0.5 rounded-full ml-2">
                                                {items.length}
                                            </span>
                                        </div>
                                        <IconChevronRight className="transform transition-transform group-open:rotate-90 text-theme-subtitle" />
                                    </summary>
                                    <div className="p-4 pt-0 space-y-2 border-t border-theme-border/50 bg-[#000]/20">
                                        {items.map((t) => {
                                            const isChanged = unsavedChanges.has(t.key);
                                            return (
                                                <div key={t.key} className={`bg-theme-surface p-3 rounded-lg border ${isChanged ? "border-[#1DCD9F]/50 bg-[#1DCD9F]/5" : "border-theme-border"} hover:border-theme-subtitle transition-colors group/item`}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="text-xs font-mono text-theme-subtitle">{t.key}</div>
                                                        <IconEdit size={14} className="text-theme-subtitle opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                                    </div>
                                                    <textarea
                                                        value={t.value}
                                                        onChange={e => handleChange(t.key, e.target.value)}
                                                        className="w-full bg-[#111] border border-theme-border rounded-lg px-3 py-2 text-theme-text outline-none focus:border-[#1DCD9F] focus:bg-black transition-all resize-none overflow-hidden h-auto min-h-[42px]"
                                                        rows={1}
                                                        style={{ height: 'auto' }}
                                                        onInput={(e) => {
                                                            (e.target as HTMLTextAreaElement).style.height = "auto";
                                                            (e.target as HTMLTextAreaElement).style.height = (e.target as HTMLTextAreaElement).scrollHeight + "px";
                                                        }}
                                                        placeholder="Çeviri giriniz..."
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </details>
                            </div>
                        ))}

                        {filteredTranslations.length === 0 && (
                            <div className="text-center text-theme-subtitle py-8">Sonuç bulunamadı.</div>
                        )}
                    </div>
                )}
            </div>
        </AdmSecondaryLayout>
    );
}
