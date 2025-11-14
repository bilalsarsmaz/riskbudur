"use client";

import { useState } from "react";
import { 
  HomeIcon,
  BellIcon,
  EnvelopeIcon,
  BookmarkIcon,
  UserIcon,
  EllipsisHorizontalCircleIcon,
  HashtagIcon,
  UserGroupIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";

import { 
  HomeIcon as HomeIconSolid,
  CheckBadgeIcon
} from "@heroicons/react/24/solid";

// Sidebar menü öğesi tipi
interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  activeIcon?: React.ElementType;
  count?: number;
  href: string;
}

// Kullanıcı tipi
interface User {
  id: string;
  nickname: string;
  fullName?: string;
  hasBlueTick: boolean;
  avatar?: string;
}

// Örnek kullanıcı
const currentUser: User = {
  id: "user1",
  nickname: "test_user",
  fullName: "Test Kullanıcı",
  hasBlueTick: true
};

// X.com benzeri sidebar menü öğeleri
const sidebarItems: SidebarItem[] = [
  {
    id: "home",
    label: "Ana Sayfa",
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
    href: "/"
  },
  {
    id: "explore",
    label: "Keşfet",
    icon: HashtagIcon,
    href: "/explore"
  },
  {
    id: "notifications",
    label: "Bildirimler",
    icon: BellIcon,
    count: 5,
    href: "/notifications"
  },
  {
    id: "messages",
    label: "Mesajlar",
    icon: EnvelopeIcon,
    count: 2,
    href: "/messages"
  },
  {
    id: "bookmarks",
    label: "Yer İşaretleri",
    icon: BookmarkIcon,
    href: "/bookmarks"
  },
  {
    id: "communities",
    label: "Topluluklar",
    icon: UserGroupIcon,
    href: "/communities"
  },
  {
    id: "profile",
    label: "Profil",
    icon: UserIcon,
    href: "/profile"
  }
];

// X.com benzeri sidebar bileşeni
const XStyleSidebar = () => {
  const [activeItem, setActiveItem] = useState("home");

  return (
    <div className="flex flex-col h-screen py-2 px-3">
      {/* Logo */}
      <div className="mb-4 px-3 py-2">
        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold hover:bg-orange-600 cursor-pointer">
          N
        </div>
      </div>

      {/* Menü öğeleri */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = activeItem === item.id;
            const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;
            
            return (
              <li key={item.id}>
                <a 
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveItem(item.id);
                  }}
                  className={`flex items-center p-3 rounded-full hover:bg-gray-200 transition-colors ${
                    isActive ? "font-bold" : "font-normal"
                  }`}
                >
                  <Icon className="w-7 h-7 mr-4" />
                  <span className="text-xl">{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="ml-auto bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      {item.count}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Post butonu */}
      <div className="mb-4 px-3">
        <button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-full transition-colors flex items-center justify-center"
          aria-label="Yeni post oluştur"
        >
          <span className="block md:hidden"><PencilSquareIcon className="w-6 h-6" /></span>
          <span className="hidden md:block text-lg">Post</span>
        </button>
      </div>

      {/* Kullanıcı profili */}
      <div className="mt-auto px-3">
        <div className="flex items-center p-3 rounded-full hover:bg-gray-200 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3">
            {currentUser.nickname.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center">
              <span className="font-bold text-sm">{currentUser.fullName || currentUser.nickname}</span>
              {currentUser.hasBlueTick && (
                <CheckBadgeIcon className="w-4 h-4 ml-1 text-blue-500" />
              )}
            </div>
            <div className="text-sm text-gray-500">
              @{currentUser.nickname}
            </div>
          </div>
          <EllipsisHorizontalCircleIcon className="w-5 h-5 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

// Kompakt X.com benzeri sidebar bileşeni
const CompactXStyleSidebar = () => {
  const [activeItem, setActiveItem] = useState("home");

  return (
    <div className="flex flex-col h-screen py-2 px-2 items-center">
      {/* Logo */}
      <div className="mb-4 p-2">
        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold hover:bg-orange-600 cursor-pointer">
          N
        </div>
      </div>

      {/* Menü öğeleri */}
      <nav className="flex-1">
        <ul className="space-y-3">
          {sidebarItems.map((item) => {
            const isActive = activeItem === item.id;
            const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;
            
            return (
              <li key={item.id}>
                <a 
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveItem(item.id);
                  }}
                  className="relative flex items-center justify-center p-3 rounded-full hover:bg-gray-200 transition-colors"
                  title={item.label}
                >
                  <Icon className={`w-7 h-7 ${isActive ? "text-orange-500" : ""}`} />
                  {item.count !== undefined && item.count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {item.count}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Post butonu */}
      <div className="mb-4">
        <button 
          className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full transition-colors"
          aria-label="Yeni post oluştur"
        >
          <PencilSquareIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Kullanıcı profili */}
      <div className="mt-auto mb-2">
        <div className="relative w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-400">
          {currentUser.nickname.charAt(0).toUpperCase()}
          {currentUser.hasBlueTick && (
            <span className="absolute -top-1 -right-1 bg-white rounded-full p-0.5">
              <CheckBadgeIcon className="w-3 h-3 text-blue-500" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Mobil X.com benzeri alt navigasyon
const MobileXStyleNavigation = () => {
  const [activeItem, setActiveItem] = useState("home");

  // Mobil görünüm için sadece ana menü öğelerini göster
  const mobileItems = sidebarItems.slice(0, 5);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
      <div className="flex justify-around">
        {mobileItems.map((item) => {
          const isActive = activeItem === item.id;
          const Icon = isActive && item.activeIcon ? item.activeIcon : item.icon;
          
          return (
            <a 
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                setActiveItem(item.id);
              }}
              className="relative flex items-center justify-center p-2"
            >
              <Icon className={`w-7 h-7 ${isActive ? "text-orange-500" : "text-gray-500"}`} />
              {item.count !== undefined && item.count > 0 && (
                <span className="absolute top-0 right-0 bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {item.count}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
};

// Sidebar tasarım sayfası
export default function SidebarDesignPage() {
  return (
    <div className="flex">
      {/* X.com Stili Sidebar */}
      <div className="w-72 border-r border-gray-200">
        <XStyleSidebar />
      </div>
      
      {/* İçerik alanı */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">X.com Benzeri Sol Sidebar Tasarımları</h1>
        
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">X.com Stili Sidebar</h2>
          <p className="mb-4 text-gray-600">
            X.com&apos;daki gibi geniş menü öğeleri, yuvarlak hover efektleri ve büyük post butonu içeren sidebar.
          </p>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="w-72 border border-gray-200 rounded-lg overflow-hidden bg-white">
              <XStyleSidebar />
            </div>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">X.com Stili Kompakt Sidebar</h2>
          <p className="mb-4 text-gray-600">
            X.com&apos;un kompakt versiyonu, sadece ikonlar ve yuvarlak hover efektleri içerir.
          </p>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="w-16 border border-gray-200 rounded-lg overflow-hidden bg-white">
              <CompactXStyleSidebar />
            </div>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">X.com Stili Mobil Navigasyon</h2>
          <p className="mb-4 text-gray-600">
            X.com mobil uygulamasındaki gibi alt navigasyon çubuğu, sadece ikonlardan oluşur.
          </p>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="w-full max-w-md border border-gray-200 rounded-lg overflow-hidden bg-white h-16">
              <MobileXStyleNavigation />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 