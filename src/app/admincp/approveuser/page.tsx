"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import AdmStandardPageLayout from "@/components/AdmStandardPageLayout";
import { fetchApi, postApi } from "@/lib/api";
import { IconCheck, IconX, IconUser } from "@tabler/icons-react";
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

            <div className="p-4">
                {loading ? (
                    <div className="text-center py-10 opacity-50">Yükleniyor...</div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p>Bekleyen onay isteği yok.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {users.map((user) => (
                            <div key={user.id} className="bg-[#111] border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-900 overflow-hidden relative border border-gray-800">
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt={user.nickname} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                <IconUser size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white leading-none mb-1">
                                            {user.fullName || user.nickname}
                                        </h3>
                                        <p className="text-sm text-gray-500">@{user.nickname}</p>
                                        <p className="text-xs text-gray-600 mt-1">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction(user.id, 'REJECT')}
                                        disabled={processing === user.id}
                                        className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                        title="Reddet (Sil)"
                                    >
                                        <IconX size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleAction(user.id, 'APPROVE')}
                                        disabled={processing === user.id}
                                        className="p-2 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                                        title="Onayla"
                                    >
                                        <IconCheck size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdmStandardPageLayout>
    );
}
