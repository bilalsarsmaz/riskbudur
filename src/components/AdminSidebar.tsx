"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  IconUsers,
  IconUser,
  IconFileText,
  IconFlag,
  IconSettings,
  IconChartBar,
  IconShield,
  IconLogout,
  IconDots
} from "@tabler/icons-react";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (err) {
        console.error("Kullanıcı bilgileri alınamadı:", err);
      }
    };
    fetchUserData();
  }, []);
  
  const menuItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: IconChartBar, 
      href: "/admincp"
    },
    { 
      id: "users", 
      label: "Kullanıcılar", 
      icon: IconUsers, 
      href: "/admincp/users"
    },
    { 
      id: "posts", 
      label: "Gönderiler", 
      icon: IconFileText, 
      href: "/admincp/posts"
    },
    { 
      id: "reports", 
      label: "Şikayetler", 
      icon: IconFlag, 
      href: "/admincp/reports"
    },
    { 
      id: "settings", 
      label: "Ayarlar", 
      icon: IconSettings, 
      href: "/admincp/settings"
    }
  ];
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setShowUserMenu(false);
    router.push("/");
  };

  const activeMenuId = pathname === "/admincp" ? "dashboard" : pathname.split("/")[2] || "";

  return (
    <div className="px-2 sm:px-4 pb-4 sticky top-4 flex flex-col h-[calc(100vh-2rem)]" style={{ backgroundColor: '#000000' }}>
      <div className="flex-1">
        <div className="mb-6 pt-4">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenuId === item.id;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "font-bold"
                    : "hover:bg-gray-800"
                }`}
                style={{ color: isActive ? '#d9dadd' : '#6e767d' }}
              >
                <Icon className="w-6 h-6 mr-3" />
                <span className="text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto relative">
        <div 
          className="flex items-center justify-center lg:justify-start p-2 rounded-lg hover:bg-gray-800 cursor-pointer"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          {userInfo?.profileImage ? (
            <img
              src={userInfo.profileImage}
              alt={userInfo.nickname}
              className="w-10 h-10 rounded-full object-cover lg:mr-3"
              style={{ border: '0.5px solid #222222' }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center lg:mr-3" style={{ border: '0.5px solid #222222', color: '#d9dadd' }}>
              {userInfo?.nickname?.charAt(0).toUpperCase() || 'A'}
            </div>
          )}
          <div className="hidden lg:flex flex-1 flex-col">
            <div className="flex items-center text-[15px] font-bold" style={{ color: '#d9dadd' }}>
              {userInfo?.fullName || userInfo?.nickname || 'Admin'}
            </div>
            <div className="text-[13px]" style={{ color: '#6e767d' }}>
              @{userInfo?.nickname || 'admin'}
            </div>
          </div>
          <IconDots className="hidden lg:block w-5 h-5" style={{ color: '#6e767d' }} />
        </div>
        
        {showUserMenu && (
          <div className="absolute bottom-full left-0 mb-2 w-full lg:w-auto min-w-[200px] rounded-lg shadow-lg overflow-hidden z-10" style={{ backgroundColor: '#000000', border: '1px solid #222222' }}>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 hover:bg-gray-800 flex items-center text-red-500"
            >
              <IconLogout className="w-5 h-5 mr-3" />
              Çıkış Yap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
