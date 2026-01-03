"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdmStandardPageLayout from "@/components/AdmStandardPageLayout";
import AdminSidebar from "@/components/AdminSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import AdminBadge from "@/components/AdminBadge";
import {
    IconBan,
    IconSearch,
    IconMapPin,
    IconMail,
    IconRosetteDiscountCheckFilled,
    IconChevronLeft,
    IconChevronRight
} from "@tabler/icons-react";
import { hasPermission, Permission, Role } from "@/lib/permissions";
import { fetchApi } from "@/lib/api";

interface User {
    id: string;
    nickname: string;
    fullName: string | null;
    email: string;
    profileImage: string | null;
    hasBlueTick: boolean;
    isBanned: boolean;
    createdAt: string;
    verificationTier: 'NONE' | 'GREEN' | 'GOLD' | 'GRAY';
    ipAddress?: string | null;
    role?: string;
    banReason?: string; // If available in API response
}

export default function AdminBans() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<Role | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset page to 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/");
            return;
        }
        const fetchMe = async () => {
            try {
                const me = await fetchApi("/users/me");
                if (me) setCurrentUserRole(me.role as Role);
                setIsAuthenticated(true);
                fetchUsers();
            } catch (e) {
                router.push("/");
            }
        };
        fetchMe();
    }, [router]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch("/api/admin/users", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                // Filter and Sort: Banned users only, Newest first (using createdAt or id if timestamp not available)
                const bannedUsers = data
                    .filter((u: User) => u.isBanned)
                    .sort((a: User, b: User) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setUsers(bannedUsers);
            } else if (response.status === 401) {
                router.push("/");
            } else {
                const error = await response.json();
                console.error("API Error:", error);
                alert("Kullanıcılar yüklenirken bir hata oluştu: " + (error.error || "Bilinmeyen hata"));
            }
        } catch (error) {
            console.error("Kullanıcılar yüklenirken hata:", error);
            alert("Kullanıcılar yüklenirken bir hata oluştu. Konsolu kontrol edin.");
        } finally {
            setLoading(false);
        }
    };

    const handleUnban = async (userId: string) => {
        if (!confirm("Kullanıcının banını kaldırmak istediğinize emin misiniz?")) {
            return;
        }

        setActionLoading(userId);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/admin/users/${userId}/ban`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                await fetchUsers();
            } else {
                const errorData = await response.json();
                alert(errorData.error || "İşlem başarısız oldu");
            }
        } catch (error) {
            console.error("Ban kaldırma hatası:", error);
            alert("Bir hata oluştu");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4">Yönlendiriliyor...</p>
                </div>
            </div>
        );
    }

    // Right Sidebar Content
    const rightSidebarContent = (
        <div className="rounded-2xl p-4 sticky top-4" style={{ backgroundColor: 'var(--app-surface)' }}>
            <h2 className="text-xl font-extrabold mb-4" style={{ color: 'var(--app-body-text)' }}>İstatistikler</h2>
            <div className="space-y-4">
                <div>
                    <p className="text-[13px]" style={{ color: 'var(--app-subtitle)' }}>Toplam Banlı</p>
                    <p className="text-2xl font-bold text-[#f4212e]">
                        {users.length}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <AdmStandardPageLayout sidebarContent={<AdminSidebar />} rightSidebarContent={rightSidebarContent}>
            <GlobalHeader title="Cezalı Hesaplar" subtitle="Yasaklı Kullanıcı Yönetimi" />

            <div className="px-4 py-2 border-b border-theme-border">
                {/* Arama */}
                <div className="relative">
                    <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-subtitle)' }} />
                    <input
                        type="text"
                        placeholder="Banlı kullanıcı ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-theme-surface border-none rounded-full placeholder-theme-subtitle focus:outline-none focus:ring-1 focus:ring-theme-accent"
                        style={{ backgroundColor: 'var(--app-input-bg)', color: 'var(--app-body-text)', colorScheme: 'dark' }}
                    />
                </div>
            </div>

            <div className="">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d9bf0]"></div>
                        <p className="mt-2 text-[#71767b]">Yükleniyor...</p>
                    </div>
                ) : (
                    <div>
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-8 text-[#71767b]">
                                {searchTerm ? "Arama sonucu bulunamadı" : "Cezalı hesap bulunmamaktadır."}
                            </div>
                        ) : (
                            filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user) => (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between group px-4 py-2 border-b border-theme-border transition-colors hover:bg-white/5"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/${user.nickname}`);
                                            }}
                                        >
                                            {user.profileImage ? (
                                                <img
                                                    src={user.profileImage}
                                                    alt={user.nickname}
                                                    className="w-12 h-12 rounded-full object-cover border-[0.5px] border-theme-border grayscale opacity-70"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-[0.5px] border-theme-border grayscale opacity-70" style={{ backgroundColor: 'var(--app-surface)', color: 'var(--app-body-text)' }}>
                                                    {user.nickname.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <div
                                                className="flex items-center space-x-1 cursor-pointer group/name"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/${user.nickname}`);
                                                }}
                                            >
                                                <span className="font-bold text-[15px] group-hover/name:underline" style={{ color: 'var(--app-body-text)' }}>
                                                    {user.fullName || user.nickname}
                                                </span>
                                                {(user.verificationTier !== 'NONE' || user.hasBlueTick) && (
                                                    <IconRosetteDiscountCheckFilled className={`w-[18px] h-[18px] verified-icon ${user.verificationTier === 'GOLD' ? 'gold' :
                                                        user.verificationTier === 'GRAY' ? 'gray' :
                                                            user.verificationTier === 'GREEN' ? 'green' :
                                                                user.nickname === 'riskbudur' ? 'gold' : 'green'
                                                        }`} />
                                                )}
                                                <AdminBadge
                                                    role={user.role}
                                                    className="w-[18px] h-[18px] ml-0.5"
                                                />
                                                <span className="ml-2 px-1.5 py-0.5 text-[10px] uppercase font-bold bg-[#f4212e] text-white rounded-sm tracking-wide">
                                                    Yasaklı
                                                </span>
                                            </div>
                                            <div className="text-[14px]" style={{ color: 'var(--app-subtitle)' }}>
                                                @{user.nickname}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end space-y-1.5">
                                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>

                                            {hasPermission(currentUserRole, Permission.BAN_USER) && (
                                                <button
                                                    onClick={() => handleUnban(user.id)}
                                                    disabled={actionLoading === user.id}
                                                    className="p-2 rounded-full bg-[#f4212e]/10 text-[#f4212e] hover:bg-[#f4212e]/20 transition-colors flex items-center gap-2 px-3"
                                                    title="Banı kaldır"
                                                >
                                                    <IconBan size={18} />
                                                    <span className="text-sm font-bold">Banı Kaldır</span>
                                                </button>
                                            )}

                                        </div>
                                        <div className="flex items-center space-x-3 text-xs text-[#536471] pr-2">
                                            {user.ipAddress && (
                                                <div className="flex items-center space-x-1" title="IP Adresi">
                                                    <IconMapPin size={14} />
                                                    <span>{user.ipAddress}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-1" title="Kayıtlı Email">
                                                <IconMail size={14} />
                                                <span className="truncate max-w-[200px]">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Pagination UI */}
                        {filteredUsers.length > itemsPerPage && (
                            <div className="flex items-center justify-center px-4 py-[10px] space-x-2 mt-auto sticky bottom-0 bg-[var(--app-body-bg)] z-10">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <IconChevronLeft size={20} style={{ color: 'var(--app-body-text)' }} />
                                </button>

                                {(() => {
                                    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
                                    const pages = [];

                                    if (totalPages <= 7) {
                                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                                    } else {
                                        if (currentPage <= 4) {
                                            pages.push(1, 2, 3, 4, 5, "...", totalPages);
                                        } else if (currentPage >= totalPages - 3) {
                                            pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                                        } else {
                                            pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
                                        }
                                    }

                                    return pages.map((page, index) => (
                                        <button
                                            key={index}
                                            onClick={() => typeof page === 'number' && setCurrentPage(page)}
                                            disabled={typeof page !== 'number'}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${page === currentPage
                                                ? "text-white"
                                                : typeof page === 'number'
                                                    ? "hover:bg-white/10 text-[var(--app-body-text)]"
                                                    : "text-[var(--app-subtitle)]"
                                                }`}
                                            style={page === currentPage ? { backgroundColor: 'var(--app-accent)' } : undefined}
                                        >
                                            {page}
                                        </button>
                                    ));
                                })()}

                                <button
                                    onClick={() => setCurrentPage(Math.min(Math.ceil(filteredUsers.length / itemsPerPage), currentPage + 1))}
                                    disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
                                    className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <IconChevronRight size={20} style={{ color: 'var(--app-body-text)' }} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdmStandardPageLayout>
    );
}
