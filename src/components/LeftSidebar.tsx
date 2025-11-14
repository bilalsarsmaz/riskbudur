"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { fetchApi } from "@/lib/api";
import { 
  HomeIcon,
  UserIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
  EnvelopeIcon,
  ArrowRightStartOnRectangleIcon,
  EllipsisHorizontalIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { 
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  BellIcon as BellIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  UserIcon as UserIconSolid,
  BookmarkIcon as BookmarkIconSolid
} from "@heroicons/react/24/solid";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

export default function LeftSidebar() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("home");
  const [showUserMenu, setShowUserMenu] = useState(false);
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
        } else {
          // Fallback
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
  
  const menuItems = [
    { id: "home", label: "Ana Sayfa", icon: HomeIcon, activeIcon: HomeIconSolid, href: "/home" },
    { id: "explore", label: "Keşfet", icon: MagnifyingGlassIcon, activeIcon: MagnifyingGlassIconSolid, href: "/explore" },
    { id: "notifications", label: "Bildirimler", icon: BellIcon, activeIcon: BellIconSolid, href: "/notifications", count: 5 },
    { id: "messages", label: "Mesajlar", icon: EnvelopeIcon, activeIcon: EnvelopeIconSolid, href: "/messages", count: 2 },
    { id: "profile", label: "Profilim", icon: UserIcon, activeIcon: UserIconSolid, href: userInfo ? `/${userInfo.nickname}` : "/profile" },
    { id: "bookmarks", label: "Kaydedilenler", icon: BookmarkIcon, activeIcon: BookmarkIconSolid, href: "/bookmarks" }
  ];

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

  return (
    <div className="px-4 pb-4 sticky top-4 flex flex-col h-[calc(100vh-2rem)]" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Logo */}
      <div className="mb-4 px-2">
        <Link href="/home" className="inline-block">
          <div className="text-2xl font-bold font-montserrat" style={{ color: 'oklch(0.71 0.24 43.55)' }}>
            ultraswall
          </div>
        </Link>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2 pt-0">
          {menuItems.map(item => {
            const isActive = activeMenu === item.id;
            const Icon = isActive ? item.activeIcon : item.icon;
            
            return (
              <li key={item.id}>
                <Link 
                  href={item.href} 
                  className="flex items-center p-2 hover:bg-gray-800 rounded-lg"
                  style={{ color: '#d9dadd' }}
                  onClick={() => {
                    setActiveMenu(item.id);
                  }}
                >
                  <Icon 
                    className={`h-6 w-6 mr-3`}
                    style={{ color: isActive ? 'oklch(0.71 0.24 43.55)' : '#d9dadd' }}
                  />
                  <span className={isActive ? 'font-bold' : ''}>{item.label}</span>
                  {item.count && (
                    <span className="ml-auto text-white rounded-full w-5 h-5 flex items-center justify-center text-xs" style={{ backgroundColor: 'oklch(0.71 0.24 43.55)' }}>
                      {item.count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Kullanıcı profil menüsü */}
      <div className="mt-auto relative">
        <div 
          className="flex items-center p-2 rounded-lg hover:bg-gray-800 cursor-pointer"
          onClick={handleUserMenuToggle}
        >
          {userInfo.profileImage ? (
            <img
              src={userInfo.profileImage}
              alt={userInfo.nickname}
              className="w-10 h-10 rounded-full object-cover mr-3"
              style={{ border: '0.5px solid #2a2a2a' }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3" style={{ border: '0.5px solid #2a2a2a', color: '#d9dadd' }}>
              {userInfo.nickname?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center text-[15px] font-bold" style={{ color: '#d9dadd' }}>
              {userInfo.fullName || userInfo.nickname}
              {userInfo.hasBlueTick && (
                <CheckBadgeIcon className="w-5 h-5 ml-1 text-blue-500" />
              )}
            </div>
            <div className="text-[13px]" style={{ color: '#6e767d' }}>
              @{userInfo.nickname}
            </div>
          </div>
          <EllipsisHorizontalIcon className="w-5 h-5" style={{ color: '#6e767d' }} />
        </div>
        
        {/* Açılır menü */}
        {showUserMenu && (
          <div className="absolute bottom-full left-0 mb-2 w-full rounded-lg shadow-lg overflow-hidden z-10" style={{ backgroundColor: '#0a0a0a', border: '1px solid #2a2a2a' }}>
            <div className="p-2">
              <button 
                className="flex items-center w-full p-2 hover:bg-gray-800 rounded-lg"
                style={{ color: '#d9dadd' }}
                onClick={() => {
                  router.push("/settings");
                  setShowUserMenu(false);
                }}
              >
                <Cog6ToothIcon className="h-5 w-5 mr-2" />
                Ayarlar
              </button>
              <button 
                className="flex items-center w-full p-2 hover:bg-gray-800 rounded-lg"
                style={{ color: '#d9dadd' }}
                onClick={handleLogout}
              >
                <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-2" />
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
