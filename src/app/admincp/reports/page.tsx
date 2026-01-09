"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdmStandardPageLayout from "@/components/AdmStandardPageLayout";
import AdminSidebar from "@/components/AdminSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import {
    IconAlertCircle,
    IconCheck,
    IconTrash,
    IconBan,
    IconExternalLink,
    IconUser
} from "@tabler/icons-react";
import { formatCustomDate } from "@/utils/date";
import { hasPermission, Permission, Role } from "@/lib/permissions";
import { fetchApi } from "@/lib/api";

interface Report {
    id: string;
    reason: string;
    details: string | null;
    status: string;
    createdAt: string;
    reporter: {
        id: string;
        nickname: string;
        profileImage: string | null;
    };
    reportedPost: {
        id: string;
        content: string;
        author: {
            id: string;
            nickname: string;
            fullName: string | null;
            profileImage: string | null;
            isBanned: boolean;
        };
    };
}

export default function AdminReportsPage() {
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const me = await fetchApi("/users/me");
                if (me) {
                    if (!hasPermission(me.role as Role, Permission.MANAGE_REPORTS)) {
                        router.push("/admincp");
                        return;
                    }
                }
            } catch (e) { }
            fetchReports();
        };
        checkAuth();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/");
                return;
            }

            const response = await fetch("/api/admin/reports", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setReports(data);
            } else {
                console.error("Failed to fetch reports");
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDismissReport = async (reportId: string) => {
        if (!confirm("Bu bildirimi silmek istediğinize emin misiniz?")) return;

        setActionLoading(reportId);
        try {
            const token = localStorage.getItem("token");
            await fetch(`/api/admin/reports/${reportId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            setReports(prev => prev.filter(r => r.id !== reportId));
        } catch (error) {
            alert("İşlem başarısız");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeletePost = async (postId: string, reportId: string) => {
        if (!confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) return;

        setActionLoading(reportId);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/posts/${postId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                // Post silindiyse, raporu da listeden kaldırabiliriz veya "Çözüldü" işaretleyebiliriz.
                // Şimdilik raporu da siliyoruz çünkü post gitti.
                // Ama belki backend zaten post silinince cascade siliyor? 
                // Prisma schema'da `onDelete: Cascade` var. 
                // Yani post silinince rapor otomatik silinir veritabanından.
                // Client side listeyi güncelleyelim.
                setReports(prev => prev.filter(r => r.reportedPost.id !== postId));
            } else {
                alert("Post silinemedi");
            }
        } catch (error) {
            alert("İşlem hatası");
        } finally {
            setActionLoading(null);
        }
    };

    const handleBanUser = async (userId: string, reportId: string) => {
        if (!confirm("Kullanıcıyı banlamak istediğinize emin misiniz?")) return;

        setActionLoading(reportId);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/admin/users/${userId}/ban`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                alert("Kullanıcı banlandı");
                // Update local state to show banned? Or just reload
                fetchReports();
            } else {
                alert("Ban işlemi başarısız");
            }
        } catch (error) {
            alert("Hata oluştu");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <AdmStandardPageLayout sidebarContent={<AdminSidebar />}>
            <GlobalHeader title="Şikayetler" subtitle="Kimler İspiyonlanmış?" />

            <div className="p-4">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-500">Yükleniyor...</p>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-gray-800">
                            <IconCheck className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Henüz şikayet yok</h3>
                        <p className="text-gray-500">Her şey yolunda görünüyor.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className="bg-[#111] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
                            >
                                {/* Header: Reason & Reporter */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="font-bold text-red-500 text-lg flex items-center">
                                                <IconAlertCircle className="w-5 h-5 mr-1" />
                                                {report.reason}
                                            </span>
                                            <span className="text-xs text-gray-500">• {formatCustomDate(report.createdAt)}</span>
                                        </div>
                                        {report.details && (
                                            <p className="text-sm text-gray-400 mb-2">{report.details}</p>
                                        )}
                                        <div className="flex items-center text-xs text-gray-500">
                                            <IconUser className="w-3 h-3 mr-1" />
                                            Raporlayan: <span className="text-gray-300 ml-1">@{report.reporter.nickname}</span>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleDismissReport(report.id)}
                                            disabled={actionLoading === report.id}
                                            className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                                            title="Bildirimi Sil (Yoksay)"
                                        >
                                            <IconCheck size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Reported Content Preview */}
                                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800 mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <img
                                                src={report.reportedPost.author.profileImage || "/Riskbudur-first.png"}
                                                className="w-6 h-6 rounded-full"
                                            />
                                            <span className="font-bold text-sm text-white">
                                                {report.reportedPost.author.fullName || report.reportedPost.author.nickname}
                                            </span>
                                            <span className="text-xs text-gray-500">@{report.reportedPost.author.nickname}</span>
                                            {report.reportedPost.author.isBanned && (
                                                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-[#f4212e]/10 text-[#f4212e] rounded-sm">Banned</span>
                                            )}
                                        </div>
                                        <a
                                            href={`/${report.reportedPost.author.nickname}/status/${report.reportedPost.id}`}
                                            target="_blank"
                                            className="text-blue-400 hover:underline text-xs flex items-center"
                                        >
                                            Gönderiye Git <IconExternalLink size={12} className="ml-1" />
                                        </a>
                                    </div>
                                    <p className="text-gray-300 text-sm line-clamp-3 mb-2">
                                        {report.reportedPost.content}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-800">
                                    <button
                                        onClick={() => handleDeletePost(report.reportedPost.id, report.id)}
                                        disabled={actionLoading === report.id}
                                        className="flex items-center space-x-2 px-4 py-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-bold"
                                    >
                                        <IconTrash size={16} />
                                        <span>Gönderiyi Sil</span>
                                    </button>

                                    {!report.reportedPost.author.isBanned && (
                                        <button
                                            onClick={() => handleBanUser(report.reportedPost.author.id, report.id)}
                                            disabled={actionLoading === report.id}
                                            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-sm font-bold"
                                        >
                                            <IconBan size={16} />
                                            <span>Kullanıcıyı Banla</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdmStandardPageLayout>
    );
}
