"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  BellIcon as BellIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/home",
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      label: "Ana Sayfa",
    },
    {
      href: "/explore",
      icon: MagnifyingGlassIcon,
      iconSolid: MagnifyingGlassIconSolid,
      label: "Keşfet",
    },
    {
      href: "/notifications",
      icon: BellIcon,
      iconSolid: BellIconSolid,
      label: "Bildirimler",
    },
    {
      href: "/messages",
      icon: ChatBubbleLeftRightIcon,
      iconSolid: ChatBubbleLeftRightIconSolid,
      label: "Mesajlar",
    },
    {
      href: "/profile",
      icon: UserIcon,
      iconSolid: UserIconSolid,
      label: "Profil",
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#2a2a2a] z-50">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.iconSolid : item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 h-full hover:bg-gray-50 transition-colors"
              aria-label={item.label}
            >
              <Icon
                className={`w-6 h-6 ${
                  isActive ? "text-blue-500" : "text-gray-600"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
