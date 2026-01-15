import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    IconLayoutDashboard,
    IconUsers,
    IconFileText,
    IconSettings,
    IconBell,
    IconSearch,
    IconLogout,
    IconUserCircle,
    IconFlag,
    IconMessageCircle,
    IconChevronDown
} from '@tabler/icons-react';

interface TopNavigationProps {
    activeTab?: string;
    user?: {
        fullName: string;
        profileImage?: string;
        role: string;
    };
}

export default function TopNavigation({ activeTab = 'dashboard', user }: TopNavigationProps) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const router = useRouter();

    const mainTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: IconLayoutDashboard, href: '/admincp' },
        { id: 'users', label: 'Users', icon: IconUsers, href: '/admincp/users' },
        { id: 'content', label: 'Content', icon: IconFileText, href: '/admincp/posts' },
        { id: 'reports', label: 'Reports', icon: IconFlag, href: '/admincp/reports' },
        { id: 'chat', label: 'Chat', icon: IconMessageCircle, href: '/admincp/chat' },
        { id: 'settings', label: 'Settings', icon: IconSettings, href: '/admincp/settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const CONTAINER_CLASS = "max-w-[1200px] mx-auto px-6 h-full";

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-800" style={{ height: '60px', backgroundColor: 'var(--app-body-bg)' }}>
            <div className={CONTAINER_CLASS}>
                <div className="flex items-center justify-between h-full">
                    {/* Left Side: Logo & Tabs */}
                    <div className="flex items-center gap-8 h-full">
                        <Link href="/admincp" className="flex items-center gap-3 mr-2">
                            <div className="w-8 h-8 rounded-lg bg-[#DC5F00] flex items-center justify-center">
                                <img src="/riskbudurlogo.png?v=2" alt="Logo" className="w-5 h-5 brightness-0 invert" />
                            </div>
                            <span className="font-bold text-lg tracking-tight text-white hidden sm:block">Admin</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center h-full gap-1">
                            {mainTabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <Link
                                        key={tab.id}
                                        href={tab.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive
                                                ? 'text-white bg-white/10'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <tab.icon size={18} />
                                        <span>{tab.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side: Simple User & Actions */}
                    <div className="flex items-center gap-4">
                        {/* Simple Search Icon */}
                        <button className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors">
                            <IconSearch size={20} />
                        </button>

                        {/* Notifications */}
                        <button className="text-gray-400 hover:text-white relative p-2 rounded-full hover:bg-white/5 transition-colors">
                            <IconBell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
                        </button>

                        {/* Divider */}
                        <div className="h-6 w-[1px] bg-gray-800 mx-1"></div>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 hover:bg-white/5 px-2 py-1.5 rounded-lg transition-colors"
                            >
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt={user.fullName} className="w-8 h-8 rounded-full object-cover border border-gray-800" />
                                ) : (
                                    <IconUserCircle className="w-8 h-8 text-gray-400" />
                                )}
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-bold text-white leading-none mb-0.5">{user?.fullName?.split(' ')[0] || 'Admin'}</p>
                                    <p className="text-[10px] text-gray-500 uppercase leading-none">{user?.role || 'Admin'}</p>
                                </div>
                                <IconChevronDown size={14} className="text-gray-500 ml-1" />
                            </button>

                            {showUserMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                                    <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-800 bg-[#111] shadow-xl overflow-hidden py-1 z-50">
                                        <div className="px-4 py-3 border-b border-gray-800">
                                            <p className="font-bold text-white truncate">{user?.fullName || 'Admin'}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.role || 'Role'}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                        >
                                            <IconLogout size={16} />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
