"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "@tabler/icons-react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<any>(null);

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

  const navItems = [
    { href: "/home", icon: IconHome, iconActive: IconHomeFilled, label: "Ana Sayfa" },
    { href: "/explore", icon: IconSearch, iconActive: IconSearch, label: "Keşfet" },
    { href: "/notifications", icon: IconBell, iconActive: IconBellFilled, label: "Bildirimler" },
    { href: "/messages", icon: IconMail, iconActive: IconMailFilled, label: "Mesajlar" },
    { href: userInfo ? `/${userInfo.nickname}` : "/profile", icon: IconUser, iconActive: IconUserFilled, label: "Profil" },
  ];

  // Aktif menü kontrolü - profil için nickname kontrolü de yap
  const isActive = (href: string) => {
    if (href === "/profile" || (userInfo && href === `/${userInfo.nickname}`)) {
      return pathname === `/${userInfo?.nickname}` || pathname === "/profile";
    }
    return pathname === href;
  };

  return (
    <nav className="mobile-nav lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-[#222222] z-50">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const IconComponent = active ? item.iconActive : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full hover:bg-[#151515] transition-colors"
              aria-label={item.label}
            >
              <IconComponent className={`nav-icon ${active ? "active" : ""}`} size={24} stroke={1.8} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
