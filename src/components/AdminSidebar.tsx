"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi } from "@/lib/api";
import {
  IconLayoutDashboard,
  IconSpeakerphone,
  IconUserSearch,
  IconMessage2Search,
  IconMessageReport,
  IconRosetteDiscountCheckFilled,
  IconRosetteDiscountCheck,
  IconSitemap,
  IconSettings,
  IconLogout,
  IconDots,
  IconArrowLeftToArc,
  IconUserCheck,
  IconMailSpark,
  IconSun,
  IconMoon,
  IconSunFilled,
  IconMoonFilled
} from "@tabler/icons-react";
import VerificationBadge from "@/components/VerificationBadge";
import AdminBadge from "@/components/AdminBadge";
import { hasPermission, Permission, Role } from "@/lib/permissions";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
      document.documentElement.setAttribute('data-theme', systemTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

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
      href: "/admincp",
      visible: true
    },
    {
      id: "announcements",
      label: "Duyurular",
      icon: IconSpeakerphone,
      href: "/admincp/announcements",
      visible: hasPermission(userInfo?.role as Role, Permission.MANAGE_ANNOUNCEMENTS)
    },
    {
      id: "users",
      label: "Kullanıcılar",
      icon: IconUserSearch,
      href: "/admincp/users",
      // Moderator+ can access users to ban/edit basics.
      // We assume basic admin access implies viewing users.
      // Matrix didn't restrict viewing users explicitly, only "View Moderators" logic.
      visible: true
    },
    {
      id: "posts",
      label: "Gönderiler",
      icon: IconMessage2Search,
      href: "/admincp/posts",
      visible: true // Or check permission if needed
    },
    {
      id: "reports",
      label: "Şikayetler",
      icon: IconMessageReport,
      href: "/admincp/reports",
      visible: true // Moderators need this
    },
    {
      id: "approve-users",
      label: "Üyeleri Onayla",
      icon: IconUserCheck,
      href: "/admincp/approveuser",
      visible: hasPermission(userInfo?.role as Role, Permission.APPROVE_USER)
    },
    {
      id: "badges",
      label: "Rozet Talepleri",
      icon: IconRosetteDiscountCheck,
      href: "/admincp/badges",
      visible: hasPermission(userInfo?.role as Role, Permission.GRANT_BADGES)
    },
    {
      id: "ghost-message",
      label: "Ghost Mesaj",
      icon: IconMailSpark,
      href: "/admincp/ghostmessage",
      visible: hasPermission(userInfo?.role as Role, Permission.GHOST_MESSAGE)
    },
    {
      id: "pages",
      label: "Sayfalar",
      icon: IconSitemap,
      href: "/admincp/pages",
      visible: hasPermission(userInfo?.role as Role, Permission.MANAGE_PAGES)
    },
    {
      id: "settings",
      label: "Ayarlar",
      icon: IconSettings,
      href: "/admincp/settings",
      visible: true
    },
    {
      id: "back-to-platform",
      label: "Platforma Dön",
      icon: IconArrowLeftToArc,
      href: "/home",
      visible: true
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
          {menuItems.filter(item => item.visible).map((item) => {
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

      <div className="mt-auto relative w-full flex flex-col items-center xl:items-start xl:px-2">
        {/* Theme Toggle (Custom Switch) */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center xl:justify-start p-3 xl:p-2 rounded-full xl:rounded-lg transition-colors aspect-square xl:aspect-auto w-fit xl:w-auto mx-auto xl:mx-0 w-full group mb-1 xl:mb-0"
        >
          {/* Custom Toggle Switch */}
          <div
            className={`relative w-[48px] h-[26px] rounded-full transition-colors duration-300 xl:mr-3 flex-shrink-0 border ${theme === 'dark' ? 'bg-black border-gray-700' : 'bg-gray-200 border-gray-300'}`}
          >
            {/* Sun Icon (Left Background - Visible when Dark) */}
            <div className={`absolute left-1.5 top-1 transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
              <IconSun className="w-4 h-4 text-gray-500" />
            </div>

            {/* Moon Icon (Right Background - Visible when Light) */}
            <div className={`absolute right-1.5 top-1 transition-opacity duration-300 ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`}>
              <IconMoon className="w-4 h-4 text-gray-400" />
            </div>

            {/* Sliding Circle */}
            <div
              className={`absolute top-[2px] w-[20px] h-[20px] rounded-full shadow-sm flex items-center justify-center transition-transform duration-300 bg-[#f97316] ${theme === 'dark' ? 'translate-x-[25px]' : 'translate-x-[3px]'}`}
            >
              {theme === 'dark' ? (
                <IconMoonFilled className="w-3 h-3 text-white" />
              ) : (
                <IconSunFilled className="w-3 h-3 text-white" />
              )}
            </div>
          </div>

          <span className="hidden xl:inline text-[13px]" style={{ color: 'var(--app-body-text)' }}>
            Platform Temasını Değiştir
          </span>
        </button>

        {/* HR Separator */}
        <div className="w-full px-2 my-2 xl:my-2 hidden xl:block">
          <div className="border-t border-theme-border"></div>
        </div>

        <div
          className="flex items-center justify-center xl:justify-start p-2 rounded-lg cursor-pointer w-full"
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
              <VerificationBadge
                tier={userInfo?.verificationTier}
                hasBlueTick={userInfo?.hasBlueTick}
                username={userInfo?.nickname}
                className="w-5 h-5 ml-1"
              />
              <AdminBadge
                role={userInfo?.role}
                className="w-5 h-5 ml-1"
              />
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
