"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import MobileHeader from "@/components/MobileHeader";
import { 
  IconUsers,
  IconFileText,
  IconFlag,
  IconChartBar
} from "@tabler/icons-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalReports: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    setIsAuthenticated(true);
    // TODO: Admin kontrolü yapılmalı
    
    // İstatistikleri yükle
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      // TODO: API endpoint'leri oluşturulmalı
      setStats({
        totalUsers: 0,
        totalPosts: 0,
        totalReports: 0,
        activeUsers: 0
      });
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const statCards = [
    { label: "Toplam Kullanıcı", value: stats.totalUsers, icon: IconUsers, color: "text-blue-500" },
    { label: "Toplam Gönderi", value: stats.totalPosts, icon: IconFileText, color: "text-green-500" },
    { label: "Şikayetler", value: stats.totalReports, icon: IconFlag, color: "text-red-500" },
    { label: "Aktif Kullanıcılar", value: stats.activeUsers, icon: IconChartBar, color: "text-yellow-500" }
  ];

  return (
    <>
      <MobileHeader />
      
      <header className="left-nav hidden lg:block fixed left-0 top-0 h-screen overflow-y-auto z-10 w-[68px] sm:w-[88px] lg:w-[595px]">
        <div className="absolute left-0 sm:left-0 lg:left-[320px] w-full sm:w-full lg:w-[275px] h-full p-0 m-0 border-0">
          <AdminSidebar />
        </div>
      </header>

      <div className="lg:ml-[68px] sm:ml-[88px] lg:ml-[595px] flex justify-center">
        <main className="content flex w-full max-w-[1310px] min-h-screen">
          {/* Orta Alan */}
          <section className="admin-content flex-1 w-full lg:max-w-[600px] flex flex-col items-stretch bg-black text-white lg:border-l lg:border-r border-[#222222] pt-14 pb-16 lg:pt-6 lg:pb-6">
            <div className="px-4">
              <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-500">Yükleniyor...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={index}
                        className="bg-[#111111] border border-[#222222] rounded-lg p-4 hover:bg-[#1a1a1a] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                          </div>
                          <Icon className={`w-8 h-8 ${stat.color}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Sağ Sidebar */}
          <aside className="right-side hidden 2xl:block w-[350px] flex-shrink-0 ml-[10px] pt-6 bg-black text-white border border-[#222222] rounded-lg">
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto p-4">
              <h2 className="text-xl font-bold mb-4">Hızlı İşlemler</h2>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#111111] transition-colors">
                  Yeni Kullanıcı Ekle
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#111111] transition-colors">
                  Şikayetleri İncele
                </button>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#111111] transition-colors">
                  Sistem Ayarları
                </button>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </>
  );
}
