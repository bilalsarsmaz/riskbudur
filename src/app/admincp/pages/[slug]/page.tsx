"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import AdmStandardPageLayout from "@/components/AdmStandardPageLayout";
import AdminSidebar from "@/components/AdminSidebar";
import { fetchApi, postApi } from "@/lib/api";

export default function EditPagePage() {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        content: ""
    });

    useEffect(() => {
        if (!slug) return;

        const loadPage = async () => {
            try {
                const data = await fetchApi(`/pages/${slug}`);
                if (data) {
                    setFormData({
                        title: data.title || "",
                        subtitle: data.subtitle || "",
                        content: data.content || ""
                    });
                }
            } catch (error) {
                console.error("Error loading page:", error);
                alert("Sayfa bulunamadı");
                router.push("/admincp/pages");
            } finally {
                setLoading(false);
            }
        };
        loadPage();
    }, [slug, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await postApi("/admin/pages", {
                slug,
                ...formData
            });
            alert("Sayfa güncellendi");
            router.push("/admincp/pages");
        } catch (error) {
            console.error("Error saving page:", error);
            alert("Kaydederken bir hata oluştu");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdmStandardPageLayout sidebarContent={<AdminSidebar />}>
                <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Yükleniyor...</p>
                </div>
            </AdmStandardPageLayout>
        );
    }

    return (
        <AdmStandardPageLayout sidebarContent={<AdminSidebar />}>
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                {/* Header */}
                <div className="sticky top-0 z-10 backdrop-blur-md bg-theme-bg/80 border-b border-theme-border px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <IconArrowLeft size={20} className="text-[var(--app-body-text)]" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold" style={{ color: 'var(--app-body-text)' }}>Sayfa Düzenle</h1>
                            <p className="text-sm" style={{ color: 'var(--app-subtitle)' }}>/{slug}</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--app-accent)] text-black font-bold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        <IconDeviceFloppy size={20} />
                        {saving ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--app-subtitle)' }}>Sayfa Başlığı</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-3 bg-[var(--app-surface)] border border-theme-border rounded-xl focus:outline-none focus:border-[var(--app-accent)] transition-colors"
                            style={{ color: 'var(--app-body-text)' }}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--app-subtitle)' }}>Alt Başlık</label>
                        <input
                            type="text"
                            value={formData.subtitle}
                            onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                            className="w-full px-4 py-3 bg-[var(--app-surface)] border border-theme-border rounded-xl focus:outline-none focus:border-[var(--app-accent)] transition-colors"
                            style={{ color: 'var(--app-body-text)' }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--app-subtitle)' }}>İçerik (HTML)</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            className="w-full px-4 py-3 bg-[var(--app-surface)] border border-theme-border rounded-xl focus:outline-none focus:border-[var(--app-accent)] transition-colors font-mono text-sm"
                            style={{ color: 'var(--app-body-text)', minHeight: '400px' }}
                            required
                        />
                        <p className="text-xs mt-2 opacity-60" style={{ color: 'var(--app-subtitle)' }}>
                            Bu alan HTML formatını destekler.
                        </p>
                    </div>
                </div>
            </form>
        </AdmStandardPageLayout>
    );
}
