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
  IconSparkles,
  IconSun,
  IconMoon,
  IconSunFilled,
  IconMoonFilled,
  IconHomeCog,
  IconLayoutDashboard,
  IconSpeakerphone,
  IconUserSearch,
  IconMessageReport,
  IconUserCheck,
  IconRosetteDiscountCheck,
  IconMailSpark,
  IconSitemap,
  IconArrowLeftToArc
} from "@tabler/icons-react";
import VerificationBadge from "@/components/VerificationBadge";
import AdminBadge from "@/components/AdminBadge";
import { menuItems as baseMenuItems } from "@/constants/menuItems";

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

  const menuItems = baseMenuItems
    .filter(item => {
      // Mobile header drawer usually shows everything EXCEPT things that might be duplicating bottom nav?
      // Actually usually it shows everything.
      // But we should filter admin items using role.
      if (item.showInMobile === false && item.id !== "profile" && item.id !== "bookmarks" && item.id !== "dashboard") {
        // Keep profile and bookmarks and dashboard even if showInMobile is false (because they are in drawer but not bottom nav)
        // Actually showInMobile usually means "Bottom Nav".
        // Drawer shows "More" stuff.
        return false;
      }
      // This logic is tricky because baseMenuItems has `showInMobile` for bottom nav.
      // Let's just include specific IDs that we know go into the drawer, OR include everything.
      // The previous hardcoded list had: Home, Explore, Notifications, Messages, Profile, Bookmarks.
      // Missing: Compose (handled by button).
      // New: Dashboard.

      if (item.id === 'compose') return false;

      if (item.isAdmin) {
        return userInfo?.role === 'ADMIN' || userInfo?.role === 'ROOTADMIN';
      }
      return true;
    })
    .map(item => ({
      ...item,
      // Map icons if needed, but baseMenuItems already has them.
      // We might need to handle 'count' manually if we want to keep it, but dynamic is better.
      href: typeof item.href === 'function' ? item.href(userInfo?.nickname) : item.href
    }));

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
            <img src="/riskbudurlogo.png?v=2" alt="Logo" style={{ width: "30px", height: "auto", objectFit: "contain", marginRight: '5px' }} />
            <div className="flex flex-col justify-center" style={{ marginTop: '2px' }}>
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
          <Bars3Icon className="w-6 h-6" style={{ color: 'var(--app-icon-nav)' }} />
        </button>
      </header>
    );
  }

  return (
    <>
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-theme-bg/80 backdrop-blur-md border-b border-theme-border z-[9999] flex items-center justify-between px-4">
        <Link href="/home" className="flex items-center">
          <div className="flex items-start justify-center">
            <img src="/riskbudurlogo.png?v=2" alt="Logo" style={{ width: "30px", height: "auto", objectFit: "contain", marginRight: '5px' }} />
            <div className="flex flex-col justify-center" style={{ marginTop: '2px' }}>
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
          <Bars3Icon className="w-6 h-6" style={{ color: 'var(--app-icon-nav)' }} />
        </button>
      </header>

      {/* Backdrop blur */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] lg:hidden"
          onClick={() => setIsMenuOpen(false)}
          style={{ top: '56px' }}
        />
      )}

      {/* Sidebar Menu */}
      <div
        ref={menuRef}
        className={`fixed top-14 right-0 bottom-0 backdrop-blur-md border-l border-theme-border z-[9999] transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        style={{ width: "300px", paddingBottom: "60px", backgroundColor: "var(--app-body-bg)" }}

      >
        <div className="flex flex-col h-full">
          {pathname.startsWith('/admincp') && (userInfo.role === 'ADMIN' || userInfo.role === 'ROOTADMIN') ? (
            // =========================
            // ADMIN DRAWER CONTENT
            // =========================
            <div className="flex flex-col h-full pt-4">
              {/* Admin Menu Items */}
              <nav className="flex-1 overflow-y-auto px-4 py-2">
                <ul className="space-y-1">
                  <li>
                    <Link
                      href="/admincp"
                      className={`flex items-center p-3 rounded-lg text-sm sm:text-base ${pathname === "/admincp" ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)]"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconLayoutDashboard className="h-5 w-5 mr-3" />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admincp/announcements"
                      className={`flex items-center p-3 rounded-lg text-sm sm:text-base ${pathname.includes("/announcements") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)]"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconSpeakerphone className="h-5 w-5 mr-3" />
                      <span>Duyurular</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admincp/users"
                      className={`flex items-center p-3 rounded-lg text-sm sm:text-base ${pathname.includes("/users") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)]"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconUserSearch className="h-5 w-5 mr-3" />
                      <span>Kullanıcılar</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admincp/reports"
                      className={`flex items-center p-3 rounded-lg text-sm sm:text-base ${pathname.includes("/reports") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)]"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconMessageReport className="h-5 w-5 mr-3" />
                      <span>Şikayetler</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admincp/approveuser"
                      className={`flex items-center p-3 rounded-lg text-sm sm:text-base ${pathname.includes("/approveuser") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)]"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconUserCheck className="h-5 w-5 mr-3" />
                      <span>Üyeleri Onayla</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admincp/badges"
                      className={`flex items-center p-3 rounded-lg text-sm sm:text-base ${pathname.includes("/badges") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)]"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconRosetteDiscountCheck className="h-5 w-5 mr-3" />
                      <span>Rozet Talepleri</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admincp/ghostmessage"
                      className={`flex items-center p-3 rounded-lg text-sm sm:text-base ${pathname.includes("/ghostmessage") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)]"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconMailSpark className="h-5 w-5 mr-3" />
                      <span>Ghost Mesaj</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admincp/pages"
                      className={`flex items-center p-3 rounded-lg text-sm sm:text-base ${pathname.includes("/pages") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)]"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconSitemap className="h-5 w-5 mr-3" />
                      <span>Sayfalar</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admincp/settings"
                      className={`flex items-center p-3 rounded-lg text-sm sm:text-base ${pathname === "/admincp/settings" ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)]"}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconSettings className="h-5 w-5 mr-3" />
                      <span>Ayarlar</span>
                    </Link>
                  </li>
                  <li className="pt-2 border-t border-theme-border mt-2">
                    <Link
                      href="/home"
                      className="flex items-center p-3 hover:bg-[#151515] rounded-lg text-sm sm:text-base text-[var(--app-global-link-color)]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconArrowLeftToArc className="h-5 w-5 mr-3" />
                      <span>Platforma Dön</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          ) : (
            // =========================
            // USER DRAWER CONTENT (STANDARD)
            // =========================
            <>
              {/* User Profile Section */}
              <div className="px-4 py-4">
                {/* Profil Fotoğrafı ve Kullanıcı Bilgileri */}
                <div className="flex items-center p-2" style={{ marginBottom: "5px" }}>
                  {userInfo.profileImage ? (
                    <img
                      src={userInfo.profileImage}
                      alt={userInfo.nickname}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover mr-3"
                      style={{ border: '0.5px solid #222222' }}
                    />
                  ) : (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3" style={{ border: '0.5px solid #222222', color: 'var(--app-body-text)' }}>
                      {userInfo.nickname?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm sm:text-[15px] font-bold" style={{ color: 'var(--app-body-text)' }}>
                        {userInfo.fullName || userInfo.nickname}
                      </div>
                      <VerificationBadge
                        tier={userInfo.verificationTier}
                        hasBlueTick={userInfo.hasBlueTick}
                        username={userInfo.nickname} // username is stored as nickname in this component's state
                        className="w-5 h-5 -ml-1"
                      />
                      <AdminBadge
                        role={userInfo.role}
                        className="w-5 h-5 ml-1"
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
                    <div className="text-sm sm:text-base font-bold" style={{ color: 'var(--app-body-text)' }}>{userInfo.following || 0}</div>
                    <div className="text-[10px] sm:text-xs" style={{ color: 'var(--app-subtitle)' }}>Kovalanan</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="text-sm sm:text-base font-bold" style={{ color: 'var(--app-body-text)' }}>{userInfo.followers || 0}</div>
                    <div className="text-[10px] sm:text-xs" style={{ color: 'var(--app-subtitle)' }}>Kovalayan</div>
                  </div>
                </div>

                {/* HR */}
                <hr className="border-theme-border my-4" />

                {/* Menu Items */}
                <nav>
                  <ul className="space-y-1">
                    {(userInfo.role === 'ADMIN' || userInfo.role === 'ROOTADMIN') && (
                      <li className="md:hidden">
                        <Link
                          href="/admincp"
                          className="flex items-center p-3 hover:bg-[#151515] rounded-lg text-sm sm:text-base"
                          style={{ color: 'var(--app-body-text)' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <IconLayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                          <span>Dashboard</span>
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        href={userInfo ? `/${userInfo.nickname}` : "/profile"}
                        className="flex items-center p-3 hover:bg-[#151515] rounded-lg text-sm sm:text-base"
                        style={{ color: 'var(--app-body-text)' }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <IconUser className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                        <span>Profilim</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/i/bookmarks"
                        className="flex items-center p-3 rounded-lg transition-colors text-sm sm:text-base"
                        style={{ color: 'var(--app-body-text)' }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <IconTargetArrow className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                        <span>Çivilenenler</span>
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/settings"
                        className="flex items-center p-3 hover:bg-[#151515] rounded-lg text-sm sm:text-base"
                        style={{ color: 'var(--app-body-text)' }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <IconSettings className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                        <span>Ayarlar</span>
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center p-3 hover:bg-[#151515] rounded-lg text-left text-sm sm:text-base"
                        style={{ color: 'var(--app-body-text)' }}
                      >
                        <IconLogout className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                        <span>Çıkış</span>
                      </button>
                    </li>
                  </ul>

                  <hr className="border-theme-border my-4" />

                  <ul className="space-y-1">
                    <li>
                      <button
                        onClick={toggleTheme}
                        className="w-full flex items-center p-3 rounded-lg text-left transition-colors"
                      >
                        {/* Custom Toggle Switch */}
                        <div
                          className={`relative w-[48px] h-[26px] rounded-full transition-colors duration-300 mr-3 flex-shrink-0 border ${theme === 'dark' ? 'bg-black border-gray-700' : 'bg-gray-200 border-gray-300'}`}
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
                        <span style={{ color: 'var(--app-body-text)' }} className="text-xs sm:text-sm">Platform Temasını Değiştir</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
