"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { menuItems as baseMenuItems } from "@/constants/menuItems";
import MobileComposeModal from "@/components/MobileComposeModal";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isMobileComposeOpen, setIsMobileComposeOpen] = useState(false);

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
          localStorage.setItem("userInfo", JSON.stringify(parsed));
        }
      } catch (err) {
        console.error("Kullanıcı bilgileri alınamadı:", err);
        const storedUserInfo = localStorage.getItem("userInfo");
        if (storedUserInfo) {
          setUserInfo(JSON.parse(storedUserInfo));
        }
      }
    };

    fetchUserData();
  }, []);

  // Map menu items for mobile (only items with showInMobile=true)
  const navItems = baseMenuItems
    .filter(item => {
      if (!item.showInMobile) return false;
      if (item.isAdmin) {
        return ['MODERATOR', 'LEAD', 'ADMIN', 'ROOTADMIN'].includes(userInfo?.role);
      }
      return true;
    })
    .map(item => ({
      href: typeof item.href === 'function' ? item.href(userInfo?.nickname) : item.href,
      icon: item.icon,
      iconActive: item.iconFilled,
      label: item.label,
      id: item.id
    }));

  // Aktif menü kontrolü - profil için nickname kontrolü de yap
  const isActive = (href: string) => {
    if (href === "/profile" || (userInfo && href === `/${userInfo.nickname}`)) {
      return pathname === `/${userInfo?.nickname}` || pathname === "/profile";
    }
    return pathname === href;
  };

  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    if (itemId === "compose") {
      e.preventDefault();
      setIsMobileComposeOpen(true);
    }
  };

  return (
    <>
      <nav className="mobile-nav lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-theme-bg/80 backdrop-blur-md border-t border-theme-border z-50">
        <div className="flex items-center justify-around h-full">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const IconComponent = active ? item.iconActive : item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleItemClick(e, item.id)}
                className="flex flex-col items-center justify-center flex-1 h-full hover:bg-[#151515] transition-colors"
                aria-label={item.label}
              >
                <IconComponent className={`nav-icon ${active ? "active" : ""}`} size={24} stroke={1.8} />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Compose Modal */}
      <MobileComposeModal
        isOpen={isMobileComposeOpen}
        onClose={() => setIsMobileComposeOpen(false)}
        onPostCreated={(post) => {
          // Dispatch custom event for other components to listen
          window.dispatchEvent(new CustomEvent('mobilePostCreated', { detail: post }));
          router.refresh();
        }}
      />
    </>
  );
}
