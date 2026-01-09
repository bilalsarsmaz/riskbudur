"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdmSecondaryLayout from "@/components/AdmSecondaryLayout";
import GlobalHeader from "@/components/GlobalHeader";
import {
    IconActivity,
    IconClock,
    IconDatabase,
    IconServer,
    IconBolt,
    IconAlertTriangle,
    IconRefresh,
    IconCpu,
    IconDeviceDesktopAnalytics,
    IconCheck,
    IconX
} from "@tabler/icons-react";
import { fetchApi, postApi } from "@/lib/api";
import { hasPermission, Permission, Role } from "@/lib/permissions";

interface SystemStatus {
    status: string;
    db: {
        status: string;
        latency: number;
    };
    system: {
        uptime: number;
        memory: {
            rss: number;
            heapTotal: number;
            heapUsed: number;
        };
        nodeVersion: string;
        platform: string;
    };
    settings: {
        maintenanceMode: boolean;
        uptimeStartDate: string;
    };
    timestamp: string;
}

export default function AdminStatusPage() {
    const router = useRouter();
    const [data, setData] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [maintenanceLoading, setMaintenanceLoading] = useState(false);

    const loadStatus = async () => {
        try {
            setLoading(true);
            const res = await fetchApi("/admin/status");
            setData(res);
        } catch (error) {
            console.error("Failed to load status", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const me = await fetchApi("/users/me");
                if (me) {
                    if (!hasPermission(me.role as Role, Permission.VIEW_SYSTEM_STATUS)) {
                        router.push("/admincp");
                        return;
                    }
                }
            } catch (e) { }
            loadStatus();
        };
        checkAuth();

        const interval = setInterval(() => {
            fetchApi("/admin/status").then(setData).catch(console.error);
        }, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleMaintenanceToggle = async () => {
        if (!data) return;
        if (!confirm(data.settings.maintenanceMode
            ? "Bakım modunu kapatmak istediğinize emin misiniz? Site herkes erişime açılacak."
            : "Siteyi BAKIM MODUNA almak üzeresiniz. Normal kullanıcılar siteye erişemeyecek. Emin misiniz?")) {
            return;
        }

        try {
            setMaintenanceLoading(true);
            const res = await postApi("/admin/status", {
                action: "update_settings",
                maintenanceMode: !data.settings.maintenanceMode
            });
            if (res.success) {
                setData(prev => prev ? ({ ...prev, settings: res.settings }) : null);
            }
        } catch (error) {
            alert("İşlem başarısız oldu.");
        } finally {
            setMaintenanceLoading(false);
        }
    };

    const handleClearCache = async () => {
        if (!confirm("Tüm önbelleği (Cache) temizlemek istediğinize emin misiniz? Bu işlem sunucuda anlık yük oluşturabilir.")) return;

        try {
            setRefreshing(true);
            await postApi("/admin/status", { action: "clear_cache" });
            alert("Önbellek temizleme komutu gönderildi.");
            loadStatus();
        } catch (error) {
            alert("Hata oluştu.");
            setRefreshing(false);
        }
    };

    const formatUptime = (seconds: number) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${d}g ${h}s ${m}d`;
    };

    const StatusCard = ({ title, value, icon: Icon, subtext, color = "var(--app-global-link-color)" }: any) => (
        <div className="p-4 rounded-2xl border border-theme-border flex items-start justify-between" style={{ backgroundColor: 'var(--app-surface)' }}>
            <div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--app-subtitle)' }}>{title}</p>
                <h3 className="text-2xl font-bold" style={{ color: 'var(--app-body-text)' }}>{value}</h3>
                {subtext && <p className="text-xs mt-1" style={{ color: 'var(--app-subtitle)' }}>{subtext}</p>}
            </div>
            <div className="p-2 rounded-xl bg-opacity-10" style={{ backgroundColor: `${color}20` }}>
                <Icon size={24} style={{ color: color }} />
            </div>
        </div>
    );

    if (loading && !data) {
        return (
            <AdmSecondaryLayout>
                <GlobalHeader title="Sunucu Durumu" subtitle="Sistem İzleme Paneli" />
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-global-link-color)]"></div>
                </div>
            </AdmSecondaryLayout>
        );
    }

    const isHealthy = data?.db.status === "connected" && data?.db.latency < 200;
    const isMaintenance = data?.settings.maintenanceMode;

    return (
        <AdmSecondaryLayout>
            <div className="flex items-center justify-between pr-4">
                <GlobalHeader title="Sunucu Durumu" subtitle="Sistem İzleme Paneli" />
                <button
                    onClick={loadStatus}
                    className="p-2 rounded-full hover:bg-[var(--app-border)] transition-colors"
                >
                    <IconRefresh size={20} className={refreshing ? "animate-spin" : ""} style={{ color: 'var(--app-body-text)' }} />
                </button>
            </div>

            <div className="p-4 space-y-6">

                {/* 1. Üst Kısım: KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatusCard
                        title="Genel Durum"
                        value={isHealthy ? "Normal" : "Sorun Var"}
                        icon={IconActivity}
                        color={isHealthy ? "#1DCD9F" : "#F4212E"}
                        subtext={isMaintenance ? "Bakım Modu Aktif" : "Sistem Yayında"}
                    />
                    <StatusCard
                        title="Uptime"
                        value={data ? formatUptime(data.system.uptime) : "-"}
                        icon={IconClock}
                        color="#1d9bf0"
                    />
                    <StatusCard
                        title="Veritabanı"
                        value={`${data?.db.latency}ms`}
                        icon={IconDatabase}
                        color={data?.db.status === 'connected' ? "#1DCD9F" : "#F4212E"}
                        subtext={data?.db.status === 'connected' ? "Bağlı" : "Hata"}
                    />
                    <StatusCard
                        title="RAM Kullanımı"
                        value={`${data?.system.memory.rss} MB`}
                        icon={IconCpu}
                        color="#FFB020"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 2. Orta Kısım: Servis Sağlık Tablosu */}
                    <div className="lg:col-span-2 rounded-2xl border border-theme-border overflow-hidden" style={{ backgroundColor: 'var(--app-surface)' }}>
                        <div className="px-5 py-4 border-b border-theme-border">
                            <h3 className="font-bold text-lg" style={{ color: 'var(--app-body-text)' }}>Servis Durumları</h3>
                        </div>
                        <div className="divide-y divide-theme-border">
                            <div className="px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <IconDatabase size={20} className="text-blue-500" />
                                    <div>
                                        <p className="font-medium" style={{ color: 'var(--app-body-text)' }}>PostgreSQL Veritabanı</p>
                                        <p className="text-xs" style={{ color: 'var(--app-subtitle)' }}>Ana veri saklama alanı</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${data?.db.status === 'connected' ? 'bg-[#1DCD9F]/10 text-[#1DCD9F]' : 'bg-[#F4212E]/10 text-[#F4212E]'}`}>
                                    {data?.db.status === 'connected' ? <IconCheck size={14} /> : <IconX size={14} />}
                                    {data?.db.status === 'connected' ? "Çalışıyor" : "Kesinti"}
                                </div>
                            </div>

                            <div className="px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <IconServer size={20} className="text-purple-500" />
                                    <div>
                                        <p className="font-medium" style={{ color: 'var(--app-body-text)' }}>API Gateway</p>
                                        <p className="text-xs" style={{ color: 'var(--app-subtitle)' }}>/api/ endpoints</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-[#1DCD9F]/10 text-[#1DCD9F] text-xs font-bold flex items-center gap-1">
                                    <IconCheck size={14} /> Çalışıyor
                                </div>
                            </div>

                            <div className="px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <IconDeviceDesktopAnalytics size={20} className="text-orange-500" />
                                    <div>
                                        <p className="font-medium" style={{ color: 'var(--app-body-text)' }}>Web Sunucusu</p>
                                        <p className="text-xs" style={{ color: 'var(--app-subtitle)' }}>Next.js Rendering</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-[#1DCD9F]/10 text-[#1DCD9F] text-xs font-bold flex items-center gap-1">
                                    <IconCheck size={14} /> Çalışıyor
                                </div>
                            </div>

                            <div className="px-5 py-4 flex items-center justify-between bg-opacity-50 opacity-60">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 flex items-center justify-center font-bold text-[10px] rounded border border-[var(--app-subtitle)] text-[var(--app-subtitle)]">
                                        PHP
                                    </div>
                                    <div>
                                        <p className="font-medium" style={{ color: 'var(--app-body-text)' }}>PHP FastCGI Process</p>
                                        <p className="text-xs" style={{ color: 'var(--app-subtitle)' }}>Backend Services</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-gray-500/10 text-gray-500 text-xs font-bold flex items-center gap-1">
                                    <IconX size={14} /> Devre Dışı
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Sağ Kısım: Yönetim & Bilgi */}
                    <div className="space-y-6">
                        {/* Sistem Bilgisi */}
                        <div className="rounded-2xl border border-theme-border p-5" style={{ backgroundColor: 'var(--app-surface)' }}>
                            <h3 className="font-bold mb-4" style={{ color: 'var(--app-body-text)' }}>Sistem Bilgileri</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--app-subtitle)' }}>Platform</span>
                                    <span className="font-mono" style={{ color: 'var(--app-body-text)' }}>{data?.system.platform}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--app-subtitle)' }}>Node Sürümü</span>
                                    <span className="font-mono" style={{ color: 'var(--app-body-text)' }}>{data?.system.nodeVersion}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span style={{ color: 'var(--app-subtitle)' }}>Memory (Heap)</span>
                                    <span className="font-mono" style={{ color: 'var(--app-body-text)' }}>{data?.system.memory.heapUsed} MB</span>
                                </div>
                            </div>
                        </div>

                        {/* Hızlı İşlemler */}
                        <div className="rounded-2xl border border-theme-border p-5" style={{ backgroundColor: 'var(--app-surface)' }}>
                            <h3 className="font-bold mb-4" style={{ color: 'var(--app-body-text)' }}>Hızlı İşlemler</h3>

                            <button
                                onClick={handleClearCache}
                                disabled={refreshing}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-theme-border hover:bg-[var(--app-border)] transition-colors mb-3 font-medium text-sm"
                                style={{ color: 'var(--app-body-text)' }}
                            >
                                <IconRefresh size={18} /> Önbelleği Temizle
                            </button>

                            <button
                                onClick={handleMaintenanceToggle}
                                disabled={maintenanceLoading}
                                className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl transition-colors font-bold text-sm ${isMaintenance ? 'bg-[#1DCD9F] text-black hover:opacity-90' : 'bg-[#F4212E] text-white hover:opacity-90'}`}
                            >
                                <IconAlertTriangle size={18} />
                                {maintenanceLoading ? "İşleniyor..." : (isMaintenance ? "Bakım Modunu Kapat" : "Bakım Moduna Al")}
                            </button>
                            <p className="text-xs mt-2 text-center opacity-70" style={{ color: 'var(--app-subtitle)' }}>
                                {isMaintenance ? "Site şu an sadece yöneticilere açık." : "Site şu an herkese açık."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdmSecondaryLayout>
    );
}
