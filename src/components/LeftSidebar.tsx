"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Cookies from 'js-cookie';
import { fetchApi } from "@/lib/api";
import {
  IconHome,
  IconHomeFilled,
  IconSearch,
  IconBell,
  IconBellFilled,
  IconMail,
  IconMailFilled,
  IconUser,
  IconUserFilled,
  IconTargetArrow,
  IconLogout,
  IconSettings,
  IconDots,
  IconSparkles,
  IconSun,
  IconMoon,
  IconSunFilled,
  IconMoonFilled,
} from "@tabler/icons-react";
import VerificationBadge from "./VerificationBadge";
import AdminBadge from "./AdminBadge";
import { menuItems as baseMenuItems } from "@/constants/menuItems";

export default function LeftSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  // Toggle theme
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
        setUserInfo(data);
        const storedUserInfo = localStorage.getItem("userInfo");
        if (storedUserInfo) {
          const parsed = JSON.parse(storedUserInfo);
          parsed.profileImage = data.profileImage;
          parsed.fullName = data.fullName;
          parsed.verificationTier = data.verificationTier;
          parsed.hasBlueTick = data.hasBlueTick;
          parsed.role = data.role;
          localStorage.setItem("userInfo", JSON.stringify(parsed));
        }
      } catch (err) {
        console.error("Kullanıcı bilgileri alınamadı:", err);
        const storedUserInfo = localStorage.getItem("userInfo");
        if (storedUserInfo) {
          setUserInfo(JSON.parse(storedUserInfo));
        } else {
          setUserInfo({
            id: "user",
            nickname: "kullanici",
            fullName: "Kullanıcı",
            hasBlueTick: false,
            verificationTier: 'NONE'
          });
        }
      }
    };

    const fetchNotificationCount = async () => {
      try {
        const res = await fetchApi("/notifications/count");
        if (res && typeof res.count === 'number') {
          setNotificationCount(res.count);
        }
      } catch (error) {
        console.error("Bildirim sayısı alınamadı:", error);
      }
    };

    const fetchUnreadMessagesCount = async () => {
      try {
        const res = await fetchApi("/conversations/unread-count");
        if (res && typeof res.count === 'number') {
          setUnreadMessagesCount(res.count);
        }
      } catch (error) {
        console.error("Okunmamış mesaj sayısı alınamadı:", error);
      }
    };

    fetchUserData();
    fetchNotificationCount();
    fetchUnreadMessagesCount();

    // Basit bir polling (her 30 saniyede bir güncelle)
    const interval = setInterval(() => {
      fetchNotificationCount();
      fetchUnreadMessagesCount();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMessagesRead = () => {
      // Re-fetch count when a message is read
      fetchApi("/conversations/unread-count")
        .then(res => {
          if (res && typeof res.count === 'number') {
            setUnreadMessagesCount(res.count);
          }
        })
        .catch(console.error);
    };
    window.addEventListener('messagesRead', handleMessagesRead);
    return () => window.removeEventListener('messagesRead', handleMessagesRead);
  }, []);

  // Map menu items with dynamic href for profile
  // 1. Exclude compose (mobile only)
  // 2. Exclude admin items if user is not admin
  const menuItems = baseMenuItems
    .filter(item => {
      if (item.id === 'compose') return false;
      if (item.isAdmin) {
        return userInfo?.role === 'ADMIN' || userInfo?.role === 'ROOTADMIN';
      }
      return true;
    })
    .map(item => ({
      ...item,
      href: typeof item.href === 'function' ? item.href(userInfo?.nickname) : item.href
    }));

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    Cookies.remove('token');
    setShowUserMenu(false);
    router.push("/");
  };

  if (!userInfo) {
    return null;
  }

  function getActiveMenuId() {
    if (pathname === "/home") return "home";
    if (pathname?.startsWith("/i/explore")) return "explore";
    if (pathname === "/notifications") return "notifications";
    if (pathname === "/messages") return "messages";
    if (pathname === `/${userInfo.nickname}` || pathname === "/profile") return "profile";
    if (pathname?.startsWith("/i/bookmarks")) return "bookmarks";
    return "";
  }

  const activeMenuId = getActiveMenuId();

  return (
    <div className="px-2 w-full h-[calc(100vh-2rem)] sticky top-4 flex flex-col items-center xl:items-start" style={{ backgroundColor: 'var(--app-header-bg)' }}>
      <div className="mb-4 px-2">
        <Link href="/home" className="flex items-start justify-center xl:justify-start py-2 xl:pr-2 xl:pl-0">
          <img src="/riskbudurlogo.png?v=2" alt="Logo" style={{ width: "32px", height: "auto", objectFit: "contain", marginRight: '5px' }} className="xl:mr-[3px] xl:mt-[2px]" />
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

      <nav className="flex-1 w-full">
        <ul className="space-y-2 pt-0 flex flex-col items-center xl:items-stretch">
          {menuItems.map(item => {
            const isActive = activeMenuId === item.id;
            const Icon = (isActive && item.hasFilled) ? item.iconFilled : item.icon;

            return (
              <li key={item.id} className="w-full">
                <Link
                  href={item.href}
                  className="flex items-center justify-center xl:justify-start p-3 xl:p-2 rounded-full xl:rounded-lg transition-colors aspect-square xl:aspect-auto w-fit xl:w-auto mx-auto xl:mx-0 relative"
                  style={{ color: 'var(--app-body-text)' }}
                >
                  <div className="relative">
                    <Icon
                      className="h-7 w-7 xl:h-6 xl:w-6 xl:mr-3"
                      style={{ color: isActive ? 'var(--app-body-text)' : 'var(--app-subtitle)' }}
                    />
                    {item.id === 'notifications' && notificationCount > 0 && (
                      <div className="absolute -top-1 right-2 text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center" style={{ backgroundColor: 'var(--app-global-link-color)' }}>
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </div>
                    )}
                    {item.id === 'messages' && unreadMessagesCount > 0 && (
                      <div className="absolute -top-1 right-2 text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center" style={{ backgroundColor: 'var(--app-global-link-color)' }}>
                        {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                      </div>
                    )}
                  </div>
                  <span className={`hidden xl:inline text-[20px] ${isActive ? 'font-bold' : ''}`} style={{ color: 'var(--app-body-text)' }}>{item.label}</span>

                </Link>
              </li>
            );
          })}


        </ul>
      </nav>

      <div className="mt-auto relative w-full flex flex-col items-center xl:items-start xl:px-2">
        {/* Theme Toggle (Moved to Footer) */}
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
          className="flex items-center justify-center p-2 rounded-full xl:rounded-lg cursor-pointer aspect-square xl:aspect-auto w-fit xl:w-full"
          onClick={handleUserMenuToggle}
        >
          {userInfo.profileImage ? (
            <img
              src={userInfo.profileImage}
              alt={userInfo.nickname}
              className="w-10 h-10 rounded-full object-cover xl:mr-3"
              style={{ border: '0.5px solid var(--app-border)' }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center xl:mr-3" style={{ border: '0.5px solid var(--app-border)', color: 'var(--app-subtitle)' }}>
              {userInfo.nickname?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden xl:flex flex-1 flex-col">
            <div className="flex items-center text-[15px] font-bold" style={{ color: 'var(--app-body-text)' }}>
              {userInfo.fullName || userInfo.nickname}
              <VerificationBadge
                tier={userInfo.verificationTier}
                hasBlueTick={userInfo.hasBlueTick}
                username={userInfo.nickname}
              />
              <AdminBadge
                role={userInfo.role}
                className="w-5 h-5 ml-0.5"
              />
            </div>
            <div className="text-[13px]" style={{ color: 'var(--app-subtitle)' }}>
              @{userInfo.nickname}
            </div>
          </div>
          <IconDots className="hidden xl:block w-5 h-5" style={{ color: 'var(--app-subtitle)' }} />
        </div>

        {showUserMenu && (
          <div className="absolute bottom-full left-0 mb-2 w-[250px] rounded-lg shadow-lg overflow-hidden z-20" style={{ backgroundColor: 'var(--app-body-bg)', border: '1px solid var(--app-border)' }}>
            <div className="p-2">
              <button
                className="flex items-center w-full p-2 rounded-lg transition-colors"
                style={{ color: 'var(--app-body-text)' }}
                onClick={() => {
                  router.push("/settings");
                  setShowUserMenu(false);
                }}
              >
                <IconSettings className="h-5 w-5 mr-2" />
                Ayarlar
              </button>
              <button
                className="flex items-center w-full p-2 rounded-lg transition-colors"
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
    </div >
  );
}
