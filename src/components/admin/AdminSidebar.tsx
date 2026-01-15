"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    IconLayoutDashboard,
    IconUsers,
    IconFileText,
    IconSettings,
    IconFlag,
    IconMessageCircle,
    IconMenu2, // For mobile
    IconX,
    IconChevronRight,
    IconSmartHome,
    IconUserShield,
    IconBan,
    IconUserCheck,
    IconRosetteDiscountCheck,
    IconPhoto,
    IconMessage,
    IconEyeOff
} from '@tabler/icons-react';

interface SidebarProps {
    user?: any;
}

export default function AdminSidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const [activeCategory, setActiveCategory] = useState<'dashboard' | 'users' | 'content' | 'reports' | 'chat' | 'settings'>('dashboard');

    // Sync active category with path
    React.useEffect(() => {
        if (pathname.includes('/users') || pathname === '/admincp/bans' || pathname === '/admincp/approveuser' || pathname === '/admincp/badges') setActiveCategory('users');
        else if (pathname.includes('/posts') || pathname.includes('/content')) setActiveCategory('content');
        else if (pathname.includes('/reports')) setActiveCategory('reports');
        else if (pathname.includes('/chat')) setActiveCategory('chat');
        else if (pathname.includes('/settings')) setActiveCategory('settings');
        else setActiveCategory('dashboard');
    }, [pathname]);

    const categories = [
        { id: 'dashboard', icon: IconLayoutDashboard, label: 'Overview' },
        { id: 'users', icon: IconUsers, label: 'Account' },
        { id: 'content', icon: IconFileText, label: 'Content' },
        { id: 'reports', icon: IconFlag, label: 'Safety' },
        { id: 'chat', icon: IconMessageCircle, label: 'Support' },
        { id: 'settings', icon: IconSettings, label: 'System' },
    ];

    const subMenus = {
        dashboard: [
            { label: 'Dashboard', href: '/admincp', icon: IconSmartHome },
            { label: 'System Status', href: '/admincp/status', icon: IconPhoto }, // Placeholder/Example
        ],
        users: [
            { label: 'All Users', href: '/admincp/users', icon: IconUsers },
            { label: 'Pending Approval', href: '/admincp/approveuser', icon: IconUserCheck },
            { label: 'Banned Users', href: '/admincp/bans', icon: IconBan },
            { label: 'Badge Requests', href: '/admincp/badges', icon: IconRosetteDiscountCheck },
        ],
        content: [
            { label: 'Posts & Feed', href: '/admincp/posts', icon: IconFileText },
            { label: 'Media Gallery', href: '/admincp/media', icon: IconPhoto }, // Future
        ],
        reports: [
            { label: 'Active Reports', href: '/admincp/reports', icon: IconFlag },
            { label: 'Hidden Content', href: '/admincp/hidden', icon: IconEyeOff }, // Future
        ],
        chat: [
            { label: 'Messages', href: '/admincp/chat', icon: IconMessageCircle },
        ],
        settings: [
            { label: 'General Settings', href: '/admincp/settings', icon: IconSettings },
            { label: 'Security', href: '/admincp/security', icon: IconUserShield }, // Future
        ]
    };

    return (
        <div className="flex h-screen sticky top-0">
            {/* 1. Primary Icon Sidebar */}
            <div className="w-[70px] flex flex-col items-center py-6 border-r border-gray-800 bg-[#040404] z-20">
                {/* Logo */}
                <div className="mb-8 w-10 h-10 bg-[#DC5F00] rounded-xl flex items-center justify-center shrink-0">
                    <img src="/riskbudurlogo.png?v=2" className="w-6 h-6 brightness-0 invert" alt="RB" />
                </div>

                {/* Categories */}
                <div className="flex flex-col gap-4 w-full px-2">
                    {categories.map(cat => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id as any)}
                                className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all relative group ${isActive
                                        ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                        : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <cat.icon size={22} stroke={isActive ? 2 : 1.5} />

                                {/* Tooltip */}
                                <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    {cat.label}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* User / Bottom */}
                <div className="mt-auto">
                    <button className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 flex items-center justify-center text-gray-400 hover:border-[#DC5F00] transition-colors">
                        <img src={user?.profileImage || "/Riskbudur-first.png"} className="w-full h-full rounded-full object-cover" />
                    </button>
                </div>
            </div>

            {/* 2. Secondary Sub-menu Sidebar */}
            <div className="w-[240px] border-r border-gray-800 bg-[#040404] flex flex-col py-6 px-4">
                <div className="mb-8 pl-2">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Module</h2>
                    <p className="text-xl font-bold text-white capitalize">{categories.find(c => c.id === activeCategory)?.label}</p>
                </div>

                <div className="flex flex-col gap-1">
                    {subMenus[activeCategory as keyof typeof subMenus]?.map((item: any) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${isActive
                                        ? 'bg-[var(--app-global-link-color)] text-white shadow-lg shadow-orange-900/20'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                                {isActive && <IconChevronRight size={14} className="ml-auto opacity-70" />}
                            </Link>
                        )
                    })}
                </div>

                <div className="mt-auto px-4 py-4 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-gray-800">
                    <h3 className="text-white font-bold text-sm mb-1">Need Help?</h3>
                    <p className="text-xs text-gray-500 mb-3">Check the docs or contact support.</p>
                    <button className="text-xs text-white bg-gray-800 hover:bg-gray-700 py-1.5 px-3 rounded-lg w-full transition-colors">
                        Docs
                    </button>
                </div>
            </div>
        </div>
    );
}
