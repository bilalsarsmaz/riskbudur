"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconTrash, IconEdit, IconCheck, IconX, IconPlus, IconAlertCircle } from "@tabler/icons-react";
import { fetchApi, postApi, putApi, deleteApi } from "@/lib/api";
import { hasPermission, Permission, Role } from "@/lib/permissions";
import AdmStandardPageLayout from "@/components/AdmStandardPageLayout";
import AdminSidebar from "@/components/AdminSidebar";
import GlobalHeader from "@/components/GlobalHeader";

type Announcement = {
    id: string;
    content: string;
    isActive: boolean;
    createdAt: string;
    author: {
        fullName: string | null;
        nickname: string | null;
    };
};

export default function AnnouncementsPage() {
    const router = useRouter();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newAnnouncement, setNewAnnouncement] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [editContent, setEditContent] = useState("");
    const [userInfo, setUserInfo] = useState<any>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await fetchApi("/users/me");
                if (data) {
                    setUserInfo(data);
                    if (!hasPermission(data.role as Role, Permission.MANAGE_ANNOUNCEMENTS)) {
                        router.push("/admincp");
                    }
                }
            } catch (err) {
                console.error("Kullanıcı bilgileri alınamadı:", err);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const data = await fetchApi("/admin/announcements");
            if (Array.isArray(data)) {
                setAnnouncements(data);
            }
        } catch (err) {
            setError("Duyurular yüklenemedi.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAnnouncement.trim()) return;

        setSubmitting(true);
        try {
            await postApi("/admin/announcements", {
                content: newAnnouncement,
                isActive,
            });
            setNewAnnouncement("");
            setIsActive(true);
            fetchAnnouncements();
        } catch (err) {
            alert("Duyuru oluşturulamadı.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) return;

        try {
            await deleteApi(`/admin/announcements/${id}`);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            alert("Silme işlemi başarısız.");
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await putApi(`/admin/announcements/${id}`, {
                isActive: !currentStatus,
            });
            fetchAnnouncements();
        } catch (err) {
            const announcement = announcements.find(a => a.id === id);
            if (announcement) {
                try {
                    await putApi(`/admin/announcements/${id}`, {
                        isActive: !currentStatus,
                        content: announcement.content
                    });
                    fetchAnnouncements();
                } catch (retryErr) {
                    alert("Durum güncellenemedi.");
                }
            }
        }
    };

    const openEditModal = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setEditContent(announcement.content);
    };

    const handleUpdate = async () => {
        if (!editingAnnouncement || !editContent.trim()) return;

        try {
            await putApi(`/admin/announcements/${editingAnnouncement.id}`, {
                content: editContent,
                isActive: editingAnnouncement.isActive
            });
            setEditingAnnouncement(null);
            fetchAnnouncements();
        } catch (err) {
            alert("Güncelleme başarısız");
        }
    };

    if (loading) return <div className="p-8 text-center text-[#71767b]">Yükleniyor...</div>;

    const rightSidebarContent = (
        <div className="rounded-2xl p-4 sticky top-4" style={{ backgroundColor: 'var(--app-surface)' }}>
            <h2 className="text-xl font-extrabold mb-3" style={{ color: 'var(--app-body-text)' }}>Bilgi</h2>
            <p className="text-[15px] leading-relaxed" style={{ color: 'var(--app-subtitle)' }}>
                Aktif duyurular anasayfanın en üstünde, timeline'ın hemen üzerinde gösterilir.
                <br /><br />
                Aynı anda sadece <span className="font-bold" style={{ color: 'var(--app-accent)' }}>1</span> duyuru aktif olabilir. Yeni bir duyuruyu aktif ettiğinizde diğerleri otomatik olarak pasife alınır.
                <br /><br />
                <span className="font-bold" style={{ color: 'var(--app-body-text)' }}>Biçimlendirme:</span>
            </p>
            <ul className="list-disc pl-4 mt-1 space-y-1 text-[15px]" style={{ color: 'var(--app-subtitle)' }}>
                <li>*kalın*</li>
                <li>_italik_</li>
                <li>@kullanici</li>
                <li>https://link.com</li>
            </ul>
        </div>
    );

    return (
        <AdmStandardPageLayout sidebarContent={<AdminSidebar />} rightSidebarContent={rightSidebarContent}>
            {/* Edit Modal */}
            {editingAnnouncement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-black border border-theme-border rounded-2xl w-full max-w-lg p-6 shadow-2xl" style={{ backgroundColor: 'var(--app-body-bg)' }}>
                        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--app-body-text)' }}>Duyuruyu Düzenle</h2>
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-black border border-theme-border rounded-xl p-3 placeholder-theme-subtitle focus:outline-none focus:border-theme-accent transition-colors resize-none h-32 mb-4"
                            style={{ backgroundColor: 'var(--app-input-bg)', color: 'var(--app-body-text)' }}
                        />
                        <div className="text-xs mb-4 space-y-1" style={{ color: 'var(--app-subtitle)' }}>
                            <p>Markdown desteklenir:</p>
                            <p><span style={{ color: 'var(--app-accent)' }}>*kalın*</span>, <span style={{ color: 'var(--app-accent)' }}>_italik_</span></p>
                            <p>Linkler otomatik algılanır. Bahsetme: <span style={{ color: 'var(--app-accent)' }}>@kullaniciadi</span></p>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setEditingAnnouncement(null)}
                                className="px-4 py-2 rounded-full text-[#d9d9d9] hover:bg-[#2f3336] transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 rounded-full bg-[#1DCD9F] text-black font-bold hover:bg-[#19b38a] transition-colors"
                            >
                                Güncelle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <GlobalHeader title="Duyurular" subtitle="Ulusa Sesleniş" />

            <div className="p-4">
                {/* Create Form - ComposeBox Style */}
                <div className="border border-theme-border rounded-2xl p-4 mb-6" style={{ backgroundColor: 'var(--app-surface)' }}>
                    <div className="flex space-x-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {userInfo?.profileImage ? (
                                <img
                                    src={userInfo.profileImage}
                                    alt={userInfo.nickname}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--app-body-bg)', color: 'var(--app-body-text)' }}>
                                    {userInfo?.nickname?.charAt(0).toUpperCase() || "A"}
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="flex-1">
                            <form onSubmit={handleSubmit}>
                                <textarea
                                    value={newAnnouncement}
                                    onChange={(e) => setNewAnnouncement(e.target.value)}
                                    placeholder="Bir duyuru yayınla..."
                                    className="w-full bg-transparent border-none p-0 text-[18px] placeholder-theme-subtitle focus:outline-none focus:ring-0 resize-none min-h-[80px]"
                                    style={{ color: 'var(--app-body-text)' }}
                                />

                                <div className="border-t border-theme-border my-2 pt-2 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <label className="flex items-center space-x-2 cursor-pointer group select-none">
                                            <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isActive ? 'bg-theme-accent border-theme-accent' : 'border-theme-border bg-transparent'}`} style={{ backgroundColor: isActive ? 'var(--app-accent)' : 'transparent', borderColor: isActive ? 'var(--app-accent)' : 'var(--app-border)' }}>
                                                {isActive && <IconCheck size={14} className="text-white" />}
                                            </div>
                                            <span className="text-[14px] font-medium transition-colors" style={{ color: isActive ? 'var(--app-accent)' : 'var(--app-subtitle)' }}>
                                                Hemen Yayınla
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={isActive}
                                                onChange={(e) => setIsActive(e.target.checked)}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting || !newAnnouncement.trim()}
                                        className="px-4 py-1.5 rounded-full font-bold text-[15px] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: 'var(--app-accent)', color: '#000000' }}
                                    >
                                        {submitting ? "Yayınlanıyor..." : "Yayınla"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold px-1" style={{ color: 'var(--app-body-text)' }}>Geçmiş Duyurular</h2>
                    {announcements.length === 0 ? (
                        <div className="text-center py-8 rounded-2xl" style={{ color: 'var(--app-subtitle)', backgroundColor: 'var(--app-surface)' }}>Henüz duyuru oluşturulmamış.</div>
                    ) : (
                        announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className={`border rounded-xl p-4 transition-colors ${announcement.isActive ? "border-theme-accent shadow-[0_0_10px_rgba(29,205,159,0.1)]" : "border-theme-border"
                                    }`}
                                style={{ backgroundColor: 'var(--app-body-bg)' }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${announcement.isActive
                                        ? "bg-[#1DCD9F]/10 text-[#1DCD9F]"
                                        : "bg-[#2f3336]/30 text-[#71767b]"
                                        }`}>
                                        {announcement.isActive ? "YAYINDA" : "PASİF"}
                                    </span>
                                    <div className="flex items-center space-x-1">
                                        <button
                                            onClick={() => openEditModal(announcement)}
                                            className="p-1.5 rounded-full hover:bg-[#1D9BF0]/10 text-[#1D9BF0] transition-colors"
                                            title="Düzenle"
                                        >
                                            <IconEdit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(announcement.id, announcement.isActive)}
                                            className={`p-1.5 rounded-full hover:bg-[#1d9bf0]/10 transition-colors ${announcement.isActive ? "text-[#f4212e]" : "text-[#1DCD9F]"
                                                }`}
                                            title={announcement.isActive ? "Yayından Kaldır" : "Yayınla"}
                                        >
                                            {announcement.isActive ? <IconX size={18} /> : <IconCheck size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(announcement.id)}
                                            className="p-1.5 rounded-full hover:bg-[#f4212e]/10 text-[#f4212e] transition-colors"
                                            title="Sil"
                                        >
                                            <IconTrash size={18} />
                                        </button>
                                    </div>
                                </div>
                                <p className="whitespace-pre-wrap mb-3 text-[15px]" style={{ color: 'var(--app-body-text)' }}>{announcement.content}</p>
                                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--app-subtitle)' }}>
                                    <span>Yazan: <span>@{announcement.author.nickname || "admin"}</span></span>
                                    <span>{new Date(announcement.createdAt).toLocaleString("tr-TR")}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdmStandardPageLayout>
    );
}
