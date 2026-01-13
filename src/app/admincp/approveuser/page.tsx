"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import AdmStandardPageLayout from "@/components/AdmStandardPageLayout";
import { fetchApi, postApi } from "@/lib/api";
import { IconCheck, IconX, IconUser, IconMail } from "@tabler/icons-react";
import AdminSidebar from "@/components/AdminSidebar";

interface PendingUser {
    id: string;
    nickname: string;
    email: string;
    fullName: string | null;
    profileImage: string | null;
    createdAt: string;
    isSetupComplete: boolean;
}

export default function ApproveUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await fetchApi("/admin/approvals");
            setUsers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId: string, action: 'APPROVE' | 'REJECT') => {
        setProcessing(userId);
        try {
            await postApi("/admin/approvals", { userId, action });
            // Remove from list
            setUsers(prev => prev.filter(u => u.id !== userId));
        } catch (e) {
            alert("İşlem başarısız.");
        } finally {
            setProcessing(null);
        }
    };

    return (
        <AdmStandardPageLayout sidebarContent={<AdminSidebar />}>
            <GlobalHeader title="Üyeleri Onayla" subtitle="Kimler gelmiş kimler?" showBackButton={true} />

            <div>
                {loading ? (
                    <div className="text-center py-10 opacity-50">Yükleniyor...</div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p>Bekleyen onay isteği yok.</p>
                    </div>
                ) : (
                    <div>
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between group px-[11px] py-[8px] border-b border-theme-border transition-colors hover:bg-white/5"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        {user.profileImage ? (
                                            <img
                                                src={user.profileImage}
                                                alt={user.nickname}
                                                className="w-12 h-12 rounded-full object-cover border-[0.5px] border-theme-border"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-[0.5px] border-theme-border bg-theme-surface text-theme-text">
                                                <IconUser size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center space-x-1 group/name cursor-default">
                                            <span className="font-bold text-[15px] text-theme-text">
                                                {user.fullName || user.nickname}
                                            </span>
                                        </div>
                                        <div className="text-[14px] text-theme-subtitle">
                                            @{user.nickname}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end space-y-1.5">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleAction(user.id, 'REJECT')}
                                            disabled={processing === user.id}
                                            className="p-2 rounded-full hover:bg-red-500/10 text-theme-subtitle hover:text-red-500 transition-colors"
                                            title="Reddet (Sil)"
                                        >
                                            <IconX size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleAction(user.id, 'APPROVE')}
                                            disabled={processing === user.id}
                                            className="p-2 rounded-full hover:bg-green-500/10 text-theme-subtitle hover:text-green-500 transition-colors"
                                            title="Onayla"
                                        >
                                            <IconCheck size={18} />
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-3 text-xs text-theme-subtitle pr-2">
                                        <div className="flex items-center space-x-1" title="Kayıtlı Email">
                                            <IconMail size={14} />
                                            <span className="truncate max-w-[200px]">{user.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdmStandardPageLayout>
    );
}
