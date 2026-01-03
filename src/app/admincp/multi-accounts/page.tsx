"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdmStandardPageLayout from "@/components/AdmStandardPageLayout";
import AdminSidebar from "@/components/AdminSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import AdminBadge from "@/components/AdminBadge";
import { fetchApi } from "@/lib/api";
import {
    IconUsersGroup,
    IconAlertTriangle,
    IconBan,
    IconMapPin,
    IconMail,
    IconRosetteDiscountCheckFilled,
    IconExternalLink,
    IconChevronDown,
    IconChevronUp
} from "@tabler/icons-react";
import Link from "next/link";

interface User {
    id: string;
    nickname: string;
    fullName: string | null;
    email: string;
    profileImage: string | null;
    role: string;
    isBanned: boolean;
    ipAddress: string | null;
    createdAt: string;
    lastSeen: string | null;
    verificationTier?: 'NONE' | 'GREEN' | 'GOLD' | 'GRAY'; // Opsiyonel ekledik
    hasBlueTick?: boolean; // Opsiyonel ekledik
}

interface IpGroup {
    ipAddress: string;
    count: number;
    users: User[];
}

export default function MultiAccountsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState<IpGroup[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [expandedIps, setExpandedIps] = useState<Record<string, boolean>>({});

    useEffect(() => {
        loadData();
    }, []);

    const toggleIp = (ip: string) => {
        setExpandedIps(prev => ({
            ...prev,
            [ip]: !prev[ip]
        }));
    };

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchApi("/admin/multi-accounts");
            if (Array.isArray(data)) {
                setGroups(data);
                // Auto expand all
                const expanded: Record<string, boolean> = {};
                data.forEach((g: IpGroup) => expanded[g.ipAddress] = true);
                setExpandedIps(expanded);
            } else {
                setError("Veri formatı hatalı");
            }
        } catch (err) {
            console.error("Multi-accounts load error:", err);
            setError("Veriler yüklenirken bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    // Right Sidebar Content
    const rightSidebarContent = (
        <div className="rounded-2xl p-4 sticky top-4" style={{ backgroundColor: 'var(--app-surface)' }}>
            <h2 className="text-xl font-extrabold mb-4" style={{ color: 'var(--app-body-text)' }}>İstatistikler</h2>
            <div className="space-y-4">
                <div>
                    <p className="text-[13px]" style={{ color: 'var(--app-subtitle)' }}>Şüpheli IP Grubu</p>
                    <p className="text-2xl font-bold text-[#f4212e]">
                        {groups.length}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <AdmStandardPageLayout sidebarContent={<AdminSidebar />} rightSidebarContent={rightSidebarContent}>
            <GlobalHeader title="Multi-Hesap Kontrolü" subtitle="Aynı IP adresini kullanan hesaplar" />

            <div className="">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d9bf0]"></div>
                        <p className="mt-2 text-[#71767b]">Analiz yapılıyor...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <IconAlertTriangle size={40} className="mx-auto text-red-500 mb-2" />
                        <h3 className="text-lg font-bold text-red-500">Hata Oluştu</h3>
                        <p className="text-gray-400 mt-1">{error}</p>
                        <button
                            onClick={loadData}
                            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="text-center py-12 text-[#71767b]">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <IconUsersGroup size={32} className="text-green-500" />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--app-body-text)]">Tertemiz!</h3>
                        <p className="text-sm mt-1">
                            Şu an için çakışan IP adresi tespit edilmedi.
                        </p>
                    </div>
                ) : (
                    <div>
                        {groups.map((group) => (
                            <div key={group.ipAddress} className="border-b border-theme-border">
                                {/* Group Header - Click to Toggle */}
                                <div
                                    onClick={() => toggleIp(group.ipAddress)}
                                    className="px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors flex items-center justify-between bg-[var(--app-surface)]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-lg bg-[#DC5F00]/10 text-[#DC5F00]">
                                            <IconAlertTriangle size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-[15px]" style={{ color: 'var(--app-body-text)' }}>
                                                    {group.ipAddress === "127.0.0.1" || group.ipAddress === "::1" ? "Yerel Ağ (Localhost)" : group.ipAddress}
                                                </span>
                                                <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded text-xs font-bold">
                                                    {group.count} HESAP
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[var(--app-subtitle)]">
                                        {expandedIps[group.ipAddress] ? <IconChevronUp size={20} /> : <IconChevronDown size={20} />}
                                    </div>
                                </div>

                                {/* Group Content - Users List */}
                                {expandedIps[group.ipAddress] && (
                                    <div className="bg-[var(--app-body-bg)]">
                                        {group.users.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between group px-4 py-2 border-l-4 border-l-transparent hover:border-l-[#DC5F00] hover:bg-white/5 transition-all pl-8"
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
                                                                className="w-10 h-10 rounded-full object-cover border-[0.5px] border-theme-border"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-[0.5px] border-theme-border" style={{ backgroundColor: 'var(--app-surface)', color: 'var(--app-body-text)' }}>
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
                                                            {(user.verificationTier && user.verificationTier !== 'NONE' || user.hasBlueTick) && (
                                                                <IconRosetteDiscountCheckFilled className={`w-[18px] h-[18px] verified-icon ${user.verificationTier === 'GOLD' ? 'gold' :
                                                                    user.verificationTier === 'GRAY' ? 'gray' :
                                                                        user.verificationTier === 'GREEN' ? 'green' :
                                                                            user.nickname === 'riskbudur' ? 'gold' : 'green'
                                                                    }`} />
                                                            )}
                                                            <AdminBadge
                                                                role={user.role as any}
                                                                className="w-[18px] h-[18px] ml-0.5"
                                                            />
                                                            {user.isBanned && (
                                                                <span className="ml-2 px-1.5 py-0.5 text-[10px] uppercase font-bold bg-[#f4212e] text-white rounded-sm tracking-wide">
                                                                    Yasaklı
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-[14px]" style={{ color: 'var(--app-subtitle)' }}>
                                                            @{user.nickname}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end space-y-1.5">
                                                    <div className="flex items-center space-x-2">
                                                        <Link
                                                            href={`/admincp/users?search=${user.nickname}`}
                                                            className="p-1.5 rounded-full hover:bg-[#1d9bf0]/10 text-[#1d9bf0] transition-colors"
                                                            title="Yönet"
                                                        >
                                                            <IconUsersGroup size={18} />
                                                        </Link>
                                                        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                                                            {/* Ban button could go here */}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 text-xs text-[#536471]">
                                                        <div className="flex items-center space-x-1" title="Son Görülme">
                                                            <span>Son: {user.lastSeen ? new Date(user.lastSeen).toLocaleDateString("tr-TR") : "-"}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdmStandardPageLayout>
    );
}
