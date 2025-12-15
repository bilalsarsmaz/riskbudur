"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi } from "@/lib/api";
import {
  IconLayoutDashboard,
  IconSpeakerphone,
  IconUserSearch,
  IconMessageReport,
  IconRosetteDiscountCheckFilled,
  IconSitemap,
  IconSettings,
  IconLogout,
  IconDots,
  IconArrowLeftToArc
} from "@tabler/icons-react";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await fetchApi("/users/me");
        if (data) {
          setUserInfo(data);
        }
      } catch (err) {
        console.error("Kullanıcı bilgileri alınamadı:", err);
      }
    };
    fetchUserData();
  }, []);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: IconLayoutDashboard,
      href: "/admincp"
    },
    {
      id: "announcements",
      label: "Duyurular",
      icon: IconSpeakerphone,
      href: "/admincp/announcements"
    },
    {
      id: "users",
      label: "Kullanıcılar",
      icon: IconUserSearch,
      href: "/admincp/users"
    },
    {
      id: "reports",
      label: "Şikayetler",
      icon: IconMessageReport,
      href: "/admincp/reports"
    },
    {
      id: "badges",
      label: "Rozet Talepleri",
      icon: IconRosetteDiscountCheckFilled,
      href: "/admincp/badges"
    },
    {
      id: "pages",
      label: "Sayfalar",
      icon: IconSitemap,
      href: "/admincp/pages"
    },
    {
      id: "settings",
      label: "Ayarlar",
      icon: IconSettings,
      href: "/admincp/settings"
    },
    {
      id: "back-to-platform",
      label: "Platforma Dön",
      icon: IconArrowLeftToArc,
      href: "/home"
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setShowUserMenu(false);
    router.push("/");
  };

  const activeMenuId = pathname === "/admincp" ? "dashboard" : pathname.split("/")[2] || "";

  return (
    <div className="px-2 lg:px-4 pb-4 sticky top-0 flex flex-col h-screen overflow-y-auto">
      <div className="flex-1">
        <div className="mb-6 px-2">
          <Link href="/admincp" className="flex items-start justify-center xl:justify-start py-2 xl:pr-2 xl:pl-0">
            <img src="/riskbudurlogo.png" alt="Logo" style={{ width: "40px", height: "auto", objectFit: "contain", marginRight: '5px' }} className="xl:mr-[3px] xl:mt-[2px]" />
            <div className="hidden xl:flex flex-col justify-center" style={{ marginTop: '5px' }}>
              <h1 className="text-xl font-extrabold font-montserrat leading-none" style={{ color: 'var(--app-body-text)' }}>
                riskbudur
              </h1>
              <p className="text-[9px] font-medium font-montserrat text-right" style={{ color: 'var(--app-subtitle)', marginTop: '0px' }}>
                underground sosyal medya
              </p>
            </div>
          </Link>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenuId === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center px-3 py-3 rounded-full transition-all w-fit xl:w-full ${isActive ? "font-bold" : ""
                  }`}
              >
                <div className="relative flex items-center">
                  <Icon className={`w-[26.25px] h-[26.25px] ${isActive ? "" : ""}`} style={{ color: isActive ? "var(--app-body-text)" : "var(--app-body-text)" }} stroke={isActive ? 2.5 : 2} />
                  <span className={`hidden xl:block ml-4 text-[20px] ${isActive ? "font-bold" : "font-normal"}`} style={{ color: isActive ? "var(--app-body-text)" : "var(--app-body-text)" }}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto relative">
        <div
          className="flex items-center justify-center xl:justify-start p-2 rounded-lg cursor-pointer"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          {userInfo?.profileImage ? (
            <img
              src={userInfo.profileImage}
              alt={userInfo.nickname}
              className="w-10 h-10 rounded-full object-cover xl:mr-3"
              style={{ border: '0.5px solid var(--app-border)' }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center xl:mr-3" style={{ border: '0.5px solid var(--app-border)', backgroundColor: 'var(--app-surface)', color: 'var(--app-body-text)' }}>
              {userInfo?.nickname?.charAt(0).toUpperCase() || 'A'}
            </div>
          )}
          <div className="hidden xl:flex flex-1 flex-col">
            <div className="flex items-center text-[15px] font-bold" style={{ color: 'var(--app-body-text)' }}>
              {userInfo?.fullName || userInfo?.nickname || 'Admin'}
              {userInfo?.hasBlueTick && (
                <IconRosetteDiscountCheckFilled className="w-5 h-5 ml-1" style={{ color: 'var(--app-icon-verified)' }} />
              )}
            </div>
            <div className="text-[13px]" style={{ color: 'var(--app-subtitle)' }}>
              @{userInfo?.nickname || 'admin'}
            </div>
          </div>
          <IconDots className="hidden xl:block w-5 h-5" style={{ color: 'var(--app-subtitle)' }} />
        </div>

        {showUserMenu && (
          <div className="absolute bottom-full left-0 mb-2 w-full xl:w-auto min-w-[200px] rounded-lg shadow-lg overflow-hidden z-10" style={{ backgroundColor: 'var(--app-body-bg)', border: '1px solid var(--app-border)' }}>
            <div className="p-2">
              <button
                className="flex items-center w-full p-2 rounded-lg"
                style={{ color: 'var(--app-body-text)' }}
                onClick={() => {
                  router.push("/admincp/settings");
                  setShowUserMenu(false);
                }}
              >
                <IconSettings className="h-5 w-5 mr-2" />
                Ayarlar
              </button>
              <button
                className="flex items-center w-full p-2 rounded-lg"
                style={{ color: 'var(--app-body-text)' }}
                onClick={handleLogout}
              >
                <IconLogout className="h-5 w-5 mr-2" />
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
