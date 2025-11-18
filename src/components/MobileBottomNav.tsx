"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome2,
  IconSearch,
  IconBell,
  IconBellFilled,
  IconMessageCircle,
  IconMessageCircleFilled,
  IconUserCircle,
} from "@tabler/icons-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/home", icon: IconHome2, iconActive: IconHome2, label: "Ana Sayfa" },
    { href: "/explore", icon: IconSearch, iconActive: IconSearch, label: "Keşfet" },
    { href: "/notifications", icon: IconBell, iconActive: IconBellFilled, label: "Bildirimler" },
    { href: "/messages", icon: IconMessageCircle, iconActive: IconMessageCircleFilled, label: "Mesajlar" },
    { href: "/profile", icon: IconUserCircle, iconActive: IconUserCircle, label: "Profil" },
  ];

  return (
    <nav className="mobile-nav lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-[#222222] z-50">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = isActive ? item.iconActive : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full hover:bg-[#111111] transition-colors"
              aria-label={item.label}
            >
              <IconComponent className={`nav-icon ${isActive ? "active" : ""}`} size={24} stroke={1.8} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
