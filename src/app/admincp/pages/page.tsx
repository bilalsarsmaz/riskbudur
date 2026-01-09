"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
import AdmSecondaryLayout from "@/components/AdmSecondaryLayout";
import GlobalHeader from "@/components/GlobalHeader";
import { fetchApi, deleteApi } from "@/lib/api";
import { hasPermission, Permission, Role } from "@/lib/permissions";

export default function AdminPagesPage() {
    const router = useRouter();
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPages = async () => {
        try {
            setLoading(true);
            const data = await fetchApi("/admin/pages");
            if (Array.isArray(data)) {
                setPages(data);
            }
        } catch (error) {
            console.error("Error loading pages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const me = await fetchApi("/users/me");
                if (me) {
                    if (!hasPermission(me.role as Role, Permission.MANAGE_PAGES)) {
                        router.push("/admincp");
                        return;
                    }
                }
            } catch (e) { }
            loadPages();
        };
        checkAuth();
    }, []);

    const handleEdit = (slug: string) => {
        router.push(`/admincp/pages/${slug}`);
    };

    const handleDelete = async (slug: string) => {
        if (!confirm("Bu sayfayı silmek istediğinize emin misiniz?")) return;

        try {
            // Using direct fetch or expanding deleteApi helper if needed, 
            // but standard pattern usually implies ID. Here we use query param.
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/pages?slug=${slug}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                loadPages();
            } else {
                alert("Silme işlemi başarısız");
            }
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    return (
        <AdmSecondaryLayout>
            <GlobalHeader title="Sayfalar" subtitle="Sinir Sistemi" />
            <div className="p-4">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pages.map((page) => (
                            <div
                                key={page.slug}
                                className="border border-theme-border rounded-xl p-4 transition-colors hover:bg-white/5 cursor-pointer flex flex-col justify-between h-full"
                                style={{ backgroundColor: 'var(--app-surface)' }}
                                onClick={() => handleEdit(page.slug)}
                            >
                                <div className="mb-4">
                                    <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--app-body-text)' }}>{page.title}</h3>
                                    <p className="text-sm opacity-60 mb-2 truncate" style={{ color: 'var(--app-subtitle)' }}>/{page.slug}</p>
                                    <p className="text-xs line-clamp-3" style={{ color: 'var(--app-subtitle)' }}>
                                        {page.subtitle || 'Alt başlık yok'}
                                    </p>
                                </div>
                                <div className="flex gap-2 justify-end mt-auto pt-2 border-t border-theme-border/50">
                                    <a
                                        href={`https://riskbudur.net/help/${page.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 hover:bg-green-500/10 rounded-full text-green-500 transition-colors"
                                        title="Görüntüle"
                                    >
                                        <IconEye size={18} />
                                    </a>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(page.slug);
                                        }}
                                        className="p-2 hover:bg-blue-500/10 rounded-full text-blue-500 transition-colors"
                                        title="Düzenle"
                                    >
                                        <IconEdit size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(page.slug);
                                        }}
                                        className="p-2 hover:bg-red-500/10 rounded-full text-red-500 transition-colors"
                                        title="Sil"
                                    >
                                        <IconTrash size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdmSecondaryLayout>
    );
}
