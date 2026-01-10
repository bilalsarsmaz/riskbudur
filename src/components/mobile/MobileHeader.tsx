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
  IconArrowLeftToArc,
  IconUsersGroup,
  IconTimelineEventText,
  IconWorldCog
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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'user-management': false,
    'content-moderation': false,
    'system-technical': false
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
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

                  {/* User Management Group */}
                  <li className="space-y-1">
                    <button
                      onClick={() => toggleGroup('user-management')}
                      className="flex items-center w-full p-3 text-sm sm:text-base font-bold text-[var(--app-body-text)] hover:bg-[#151515] rounded-lg transition-colors"
                    >
                      <IconUsersGroup className="h-5 w-5 mr-3" />
                      <span>Kullanıcı Yönetimi</span>
                    </button>
                    {expandedGroups['user-management'] && (
                      <div className="ml-8 space-y-1">
                        <Link
                          href="/admincp/users"
                          className={`flex items-center p-2 rounded-lg text-xs sm:text-sm ${pathname.includes("/users") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)] opacity-70"}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current mr-3"></div>
                          Kullanıcı Listesi
                        </Link>
                        <Link
                          href="/admincp/approveuser"
                          className={`flex items-center p-2 rounded-lg text-xs sm:text-sm ${pathname.includes("/approveuser") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)] opacity-70"}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current mr-3"></div>
                          Üye Onay Havuzu
                        </Link>
                        <Link
                          href="/admincp/badges"
                          className={`flex items-center p-2 rounded-lg text-xs sm:text-sm ${pathname.includes("/badges") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)] opacity-70"}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current mr-3"></div>
                          Rozet Talepleri
                        </Link>
                        <Link
                          href="/admincp/bans"
                          className={`flex items-center p-2 rounded-lg text-xs sm:text-sm ${pathname.includes("/bans") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)] opacity-70"}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current mr-3"></div>
                          Cezalı Hesaplar
                        </Link>
                      </div>
                    )}
                  </li>

                  {/* Content Moderation Group */}
                  <li className="space-y-1 mt-2">
                    <button
                      onClick={() => toggleGroup('content-moderation')}
                      className="flex items-center w-full p-3 text-sm sm:text-base font-bold text-[var(--app-body-text)] hover:bg-[#151515] rounded-lg transition-colors"
                    >
                      <IconTimelineEventText className="h-5 w-5 mr-3" />
                      <span>İçerik Yönetimi</span>
                    </button>
                    {expandedGroups['content-moderation'] && (
                      <div className="ml-8 space-y-1">
                        <Link
                          href="/admincp/posts"
                          className={`flex items-center p-2 rounded-lg text-xs sm:text-sm ${pathname.includes("/posts") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)] opacity-70"}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current mr-3"></div>
                          Gönderi Yönetimi
                        </Link>
                        <Link
                          href="/admincp/reports"
                          className={`flex items-center p-2 rounded-lg text-xs sm:text-sm ${pathname.includes("/reports") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)] opacity-70"}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current mr-3"></div>
                          Şikayetler
                        </Link>
                        <Link
                          href="/admincp/sensitive-content"
                          className={`flex items-center p-2 rounded-lg text-xs sm:text-sm ${pathname.includes("/sensitive-content") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)] opacity-70"}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current mr-3"></div>
                          Hassas İçerik
                        </Link>
                      </div>
                    )}
                  </li>

                  {/* System Management Group */}
                  <li className="space-y-1 mt-2">
                    <button
                      onClick={() => toggleGroup('system-technical')}
                      className="flex items-center w-full p-3 text-sm sm:text-base font-bold text-[var(--app-body-text)] hover:bg-[#151515] rounded-lg transition-colors"
                    >
                      <IconWorldCog className="h-5 w-5 mr-3" />
                      <span>Sistem Yönetimi</span>
                    </button>
                    {expandedGroups['system-technical'] && (
                      <div className="ml-8 space-y-1">
                        <Link
                          href="/admincp/status"
                          className={`flex items-center p-2 rounded-lg text-xs sm:text-sm ${pathname.includes("/status") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)] opacity-70"}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current mr-3"></div>
                          Sunucu Durumu
                        </Link>
                        <Link
                          href="/admincp/announcements"
                          className={`flex items-center p-2 rounded-lg text-xs sm:text-sm ${pathname.includes("/announcements") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)] opacity-70"}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current mr-3"></div>
                          Duyuru Yönetimi
                        </Link>
                        <Link
                          href="/admincp/pages"
                          className={`flex items-center p-2 rounded-lg text-xs sm:text-sm ${pathname.includes("/pages") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)] opacity-70"}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current mr-3"></div>
                          Sayfa Yönetimi
                        </Link>
                        <Link
                          href="/admincp/ghostmessage"
                          className={`flex items-center p-2 rounded-lg text-xs sm:text-sm ${pathname.includes("/ghostmessage") ? "text-[var(--app-global-link-color)] font-bold" : "hover:bg-[#151515] text-[var(--app-body-text)] opacity-70"}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-current mr-3"></div>
                          Ghost Mesaj
                        </Link>
                      </div>
                    )}
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
                </nav>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
