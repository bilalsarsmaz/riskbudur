"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import AdmSecondaryLayout from "@/components/AdmSecondaryLayout";
import AdminSidebar from "@/components/AdminSidebar";
import {
  IconUsers,
  IconFileText,
  IconFlag,
  IconChartBar,
  IconUserCheck,
  IconRosetteDiscountCheck,
  IconBan
} from "@tabler/icons-react";

import { fetchApi } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalReports: 0,
    activeUsers: 0,
    pendingUsers: 0,
    pendingBadges: 0,
    bannedUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    setIsAuthenticated(true);
    // TODO: Admin check
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      const data = await fetchApi("/admin/stats");
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-black" />;
  }

  const statCards = [
    { label: "Toplam Kullanıcı", value: stats.totalUsers, icon: IconUsers, color: "text-blue-500", bg: "bg-blue-500/5", border: "border-blue-500/20", href: "/admincp/users" },
    { label: "Toplam Gönderi", value: stats.totalPosts, icon: IconFileText, color: "text-green-500", bg: "bg-green-500/5", border: "border-green-500/20", href: "/admincp/posts" },
    { label: "Şikayetler", value: stats.totalReports, icon: IconFlag, color: "text-red-500", bg: "bg-red-500/5", border: "border-red-500/20", href: "/admincp/reports" },
    { label: "Onay Bekleyenler", value: stats.pendingUsers, icon: IconUserCheck, color: "text-purple-500", bg: "bg-purple-500/5", border: "border-purple-500/20", href: "/admincp/approveuser" },
    { label: "Rozet Başvuruları", value: stats.pendingBadges || 0, icon: IconRosetteDiscountCheck, color: "text-orange-500", bg: "bg-orange-500/5", border: "border-orange-500/20", href: "/admincp/badges" },
    { label: "Yasaklanmış Üyeler", value: stats.bannedUsers || 0, icon: IconBan, color: "text-red-600", bg: "bg-red-600/5", border: "border-red-600/20", href: "/admincp/bans" }
  ];

  return (
    <AdmSecondaryLayout sidebarContent={<AdminSidebar />} maxWidth="1200px">
      <GlobalHeader title="Riskbudur Admin Paneli" subtitle="Dashboard" />
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: 'var(--app-accent)' }}></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  onClick={() => router.push(stat.href)}
                  className={`border rounded-2xl p-6 transition-all hover:bg-white/5 cursor-pointer ${stat.border} ${stat.bg}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium mb-2 opacity-80" style={{ color: 'var(--app-subtitle)' }}>{stat.label}</p>
                      <h3 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--app-body-text)' }}>
                        {stat.value.toLocaleString('tr-TR')}
                      </h3>
                    </div>
                    <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdmSecondaryLayout>
  );
}
