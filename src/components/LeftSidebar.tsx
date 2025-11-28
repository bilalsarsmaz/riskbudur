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
  IconRosetteDiscountCheckFilled
} from "@tabler/icons-react";

export default function LeftSidebar() {
  const router = useRouter();
  const pathname = usePathname();
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

  const getActiveMenuId = () => {
    if (pathname === "/home") return "home";
    if (pathname === "/explore") return "explore";
    if (pathname === "/notifications") return "notifications";
    if (pathname === "/messages") return "messages";
    if (pathname === `/${userInfo.nickname}` || pathname === "/profile") return "profile";
    if (pathname === "/bookmarks") return "bookmarks";
    return "";
  };

  const activeMenuId = getActiveMenuId();

  return (
    <div className="px-2 sm:px-4 pb-4 sticky top-4 flex flex-col h-[calc(100vh-2rem)]" style={{ backgroundColor: '#000000' }}>
      <div className="mb-4 px-2 hidden lg:block">
        <Link href="/home" className="inline-block">
          <img src="/logo3.png" alt="ultraswall" className="h-10 w-50" style={{ width: "200px", height: "40px", objectFit: "contain" }} />
        </Link>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2 pt-0">
          {menuItems.map(item => {
            const isActive = activeMenuId === item.id;
            const Icon = (isActive && item.hasFilled) ? item.iconFilled : item.icon;
            
            return (
              <li key={item.id}>
                <Link 
                  href={item.href} 
                  className="flex items-center justify-center lg:justify-start p-2 hover:bg-[#151515] rounded-lg"
                  style={{ color: '#d9dadd' }}
                >
                  <Icon 
                    className="h-6 w-6 lg:mr-3"
                    style={{ color: isActive ? '#d9dadd' : '#d9dadd' }}
                  />
                  <span className={`hidden lg:inline ${isActive ? 'font-bold text-[#d9dadd]' : 'text-[#d9dadd]'}`}>{item.label}</span>
                  {item.count && (
                    <span className="hidden lg:flex ml-auto text-white rounded-full w-5 h-5 items-center justify-center text-xs" style={{ backgroundColor: '#1DCD9F' }}>
                      {item.count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="mt-auto relative">
        <div 
          className="flex items-center justify-center lg:justify-start p-2 rounded-lg hover:bg-[#151515] cursor-pointer"
          onClick={handleUserMenuToggle}
        >
          {userInfo.profileImage ? (
            <img
              src={userInfo.profileImage}
              alt={userInfo.nickname}
              className="w-10 h-10 rounded-full object-cover lg:mr-3"
              style={{ border: '0.5px solid #222222' }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center lg:mr-3" style={{ border: '0.5px solid #222222', color: '#d9dadd' }}>
              {userInfo.nickname?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="hidden lg:flex flex-1 flex-col">
            <div className="flex items-center text-[15px] font-bold" style={{ color: '#d9dadd' }}>
              {userInfo.fullName || userInfo.nickname}
              {userInfo.hasBlueTick && (
                <IconRosetteDiscountCheckFilled className="w-5 h-5 ml-1" style={{ color: '#1DCD9F' }} />
              )}
            </div>
            <div className="text-[13px]" style={{ color: '#6e767d' }}>
              @{userInfo.nickname}
            </div>
          </div>
          <IconDots className="hidden lg:block w-5 h-5" style={{ color: '#6e767d' }} />
        </div>
        
        {showUserMenu && (
          <div className="absolute bottom-full left-0 mb-2 w-full lg:w-auto min-w-[200px] rounded-lg shadow-lg overflow-hidden z-10" style={{ backgroundColor: '#000000', border: '1px solid #222222' }}>
            <div className="p-2">
              <button 
                className="flex items-center w-full p-2 hover:bg-[#151515] rounded-lg"
                style={{ color: '#d9dadd' }}
                onClick={() => {
                  router.push("/settings");
                  setShowUserMenu(false);
                }}
              >
                <IconSettings className="h-5 w-5 mr-2" />
                Ayarlar
              </button>
              <button 
                className="flex items-center w-full p-2 hover:bg-[#151515] rounded-lg"
                style={{ color: '#d9dadd' }}
                onClick={handleLogout}
              >
                <IconLogout className="h-5 w-5 mr-2" />
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
