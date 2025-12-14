"use client";

import { useState, useEffect, useRef } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  IconRosetteDiscountCheckFilled,

  IconSettings,
  IconSparkles
} from "@tabler/icons-react";
import VerificationBadge from "@/components/VerificationBadge";

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
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

        // Temel bilgileri set et
        setUserInfo(data);

        // Count bilgilerini almak için profil detayını çek
        if (data.nickname) {
          try {
            const profileData = await fetchApi(`/users/${data.nickname}`);
            setUserInfo((prev: any) => ({
              ...prev,
              following: profileData.following,
              followers: profileData.followers
            }));
          } catch (profileErr) {
            console.error("Profil detayları alınamadı:", profileErr);
          }
        }
        const storedUserInfo = localStorage.getItem("userInfo");
        if (storedUserInfo) {
          const parsed = JSON.parse(storedUserInfo);
          parsed.profileImage = data.profileImage;
          parsed.fullName = data.fullName;
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
            hasBlueTick: false
          });
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const menuItems = [
    {
      id: "home",
      label: "Anasayfa",
      icon: IconHome,
      iconFilled: IconHomeFilled,
      href: "/home",
      hasFilled: true
    },
    {
      id: "explore",
      label: "Keşfet",
      icon: IconSearch,
      iconFilled: IconSearch,
      href: "/explore",
      hasFilled: false
    },
    {
      id: "notifications",
      label: "Bildirim",
      icon: IconBell,
      iconFilled: IconBellFilled,
      href: "/notifications",
      count: 5,
      hasFilled: true
    },
    {
      id: "messages",
      label: "Mesajlar",
      icon: IconMail,
      iconFilled: IconMailFilled,
      href: "/messages",
      count: 2,
      hasFilled: true
    },
    {
      id: "profile",
      label: "Profilim",
      icon: IconUser,
      iconFilled: IconUserFilled,
      href: userInfo ? `/${userInfo.nickname}` : "/profile",
      hasFilled: true
    },
    {
      id: "bookmarks",
      label: "Kaydedilenler",
      icon: IconTargetArrow,
      iconFilled: IconTargetArrow,
      href: "/bookmarks",
      hasFilled: false
    }
  ];

  const getActiveMenuId = () => {
    if (pathname === "/home") return "home";
    if (pathname === "/explore") return "explore";
    if (pathname === "/notifications") return "notifications";
    if (pathname === "/messages") return "messages";
    if (pathname === `/${userInfo?.nickname}` || pathname === "/profile") return "profile";
    if (pathname === "/bookmarks") return "bookmarks";
    return "";
  };

  const activeMenuId = getActiveMenuId();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setIsMenuOpen(false);
    router.push("/");
  };

  if (!userInfo) {
    return (
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-theme-bg/80 backdrop-blur-md border-b border-theme-border z-50 flex items-center justify-between px-4">
        <Link href="/home" className="flex items-center">
          <div className="flex items-start justify-center">
            <img src="/riskbudurlogo.png" alt="Logo" style={{ width: "40px", height: "auto", objectFit: "contain", marginRight: '5px' }} />
            <div className="flex flex-col justify-center" style={{ marginTop: '5px' }}>
              <h1 className="text-xl font-extrabold font-montserrat leading-none" style={{ color: 'var(--app-body-text)' }}>
                riskbudur
              </h1>
              <p className="text-[9px] font-medium font-montserrat text-right" style={{ color: 'var(--app-subtitle)', marginTop: '0px' }}>
                underground sosyal medya
              </p>
            </div>
          </div>
        </Link>
        <button
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-full hover:bg-[#151515] transition-colors"
          aria-label="Menü"
        >
          <Bars3Icon className="w-6 h-6 text-gray-200" />
        </button>
      </header>
    );
  }

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-theme-bg/80 backdrop-blur-md border-b border-theme-border z-50 flex items-center justify-between px-4">
        <Link href="/home" className="flex items-center">
          <div className="flex items-start justify-center">
            <img src="/riskbudurlogo.png" alt="Logo" style={{ width: "40px", height: "auto", objectFit: "contain", marginRight: '5px' }} />
            <div className="flex flex-col justify-center" style={{ marginTop: '5px' }}>
              <h1 className="text-xl font-extrabold font-montserrat leading-none" style={{ color: 'var(--app-body-text)' }}>
                riskbudur
              </h1>
              <p className="text-[9px] font-medium font-montserrat text-right" style={{ color: 'var(--app-subtitle)', marginTop: '0px' }}>
                underground sosyal medya
              </p>
            </div>
          </div>
        </Link>

        <button
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-full hover:bg-[#151515] transition-colors"
          aria-label="Menü"
        >
          <Bars3Icon className="w-6 h-6 text-gray-200" />
        </button>
      </header>

      {/* Backdrop blur */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
          style={{ top: '56px' }}
        />
      )}

      {/* Sidebar Menu */}
      <div
        ref={menuRef}
        className={`fixed top-14 right-0 bottom-0 bg-black/70 backdrop-blur-md border-l border-theme-border z-50 transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        style={{ width: "300px", paddingBottom: "60px" }}

      >
        <div className="flex flex-col h-full">
          {/* User Profile Section */}
          <div className="px-4 py-4">
            {/* Profil Fotoğrafı ve Kullanıcı Bilgileri */}
            <div className="flex items-center p-2" style={{ marginBottom: "5px" }}>
              {userInfo.profileImage ? (
                <img
                  src={userInfo.profileImage}
                  alt={userInfo.nickname}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                  style={{ border: '0.5px solid #222222' }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3" style={{ border: '0.5px solid #222222', color: '#d9dadd' }}>
                  {userInfo.nickname?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-[15px] font-bold" style={{ color: '#d9dadd' }}>
                    {userInfo.fullName || userInfo.nickname}
                  </div>
                  <VerificationBadge
                    tier={userInfo.verificationTier}
                    hasBlueTick={userInfo.hasBlueTick}
                    username={userInfo.nickname} // username is stored as nickname in this component's state
                    className="w-5 h-5 -ml-1"
                  />
                </div>
                <div className="text-sm" style={{ color: 'var(--app-subtitle)' }}>
                  @{userInfo.nickname}
                </div>
              </div>
            </div>

            {/* Takip edilenler ve takipçi */}
            <div className="flex items-center gap-4 mb-4 px-2">
              <div className="flex items-center gap-1">
                <div className="text-base font-bold" style={{ color: '#d9dadd' }}>{userInfo.following || 0}</div>
                <div className="text-xs" style={{ color: 'var(--app-subtitle)' }}>Kovalanan</div>
              </div>
              <div className="flex items-center gap-1">
                <div className="text-base font-bold" style={{ color: '#d9dadd' }}>{userInfo.followers || 0}</div>
                <div className="text-xs" style={{ color: 'var(--app-subtitle)' }}>Kovalayan</div>
              </div>
            </div>

            {/* HR */}
            <hr className="border-theme-border my-4" />

            {/* Menu Items */}
            <nav>
              <ul className="space-y-1">
                <li>
                  <Link
                    href={userInfo ? `/${userInfo.nickname}` : "/profile"}
                    className="flex items-center p-3 hover:bg-[#151515] rounded-lg"
                    style={{ color: '#d9dadd' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconUser className="h-5 w-5 mr-3" />
                    <span>Profilim</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/bookmarks"
                    className="flex items-center p-3 rounded-lg transition-colors"
                    style={{ color: 'var(--app-body-text)' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconTargetArrow className="h-5 w-5 mr-3" />
                    <span>Kaydedilenler</span>
                  </Link>
                </li>

                <li>
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center p-3 rounded-lg text-left transition-colors"
                    style={{ color: 'var(--app-body-text)' }}
                  >
                    <IconSparkles className="h-5 w-5 mr-3" style={{ color: theme === 'dark' ? '#1DCD9F' : '#DC5F00' }} />
                    <span>{theme === 'dark' ? 'Gündüz Teması' : 'Gece Teması'}</span>
                  </button>
                </li>

                <li>
                  <Link
                    href="/settings"
                    className="flex items-center p-3 hover:bg-[#151515] rounded-lg"
                    style={{ color: '#d9dadd' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconSettings className="h-5 w-5 mr-3" />
                    <span>Ayarlar</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center p-3 hover:bg-[#151515] rounded-lg text-left"
                    style={{ color: '#d9dadd' }}
                  >
                    <IconLogout className="h-5 w-5 mr-3" />
                    <span>Çıkış</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
