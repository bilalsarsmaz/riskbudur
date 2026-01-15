import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    IconLayoutDashboard,
    IconUsers,
    IconFileText,
    IconSettings,
    IconBell,
    IconSearch,
    IconChevronDown,
    IconLogout,
    IconUserCircle,
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
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const router = useRouter();

    const mainTabs = [
        { id: 'dashboard', label: 'Dashboard', icon: IconLayoutDashboard, href: '/admintest' },
        { id: 'users', label: 'Users', icon: IconUsers, href: '/admintest/users' },
        { id: 'content', label: 'Content', icon: IconFileText, href: '/admintest/content' },
        { id: 'settings', label: 'Settings', icon: IconSettings, href: '/admintest/settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'var(--app-body-bg)', borderColor: 'var(--app-border)' }}>
            {/* Top Bar */}
            <div className="px-6 py-4">
                <div className="flex items-center justify-between max-w-[1600px] mx-auto">
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-8">
                        <Link href="/admintest" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                <img src="/riskbudurlogo.png?v=2" alt="Logo" className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold" style={{ color: 'var(--app-body-text)' }}>Riskbudur</h1>
                                <p className="text-xs" style={{ color: 'var(--app-subtitle)' }}>Admin Panel</p>
                            </div>
                        </Link>

                        {/* Main Navigation Tabs */}
                        <div className="hidden md:flex items-center gap-2">
                            {mainTabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <Link
                                        key={tab.id}
                                        href={tab.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isActive
                                                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 shadow-lg'
                                                : 'hover:bg-white/5'
                                            }`}
                                        style={{ color: isActive ? undefined : 'var(--app-subtitle)' }}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{tab.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Side - Search, Notifications, User */}
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <button className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg border transition-all hover:border-purple-500/50" style={{ borderColor: 'var(--app-border)', backgroundColor: 'var(--app-surface)' }}>
                            <IconSearch className="w-4 h-4" style={{ color: 'var(--app-subtitle)' }} />
                            <span className="text-sm" style={{ color: 'var(--app-subtitle)' }}>Search...</span>
                            <kbd className="px-2 py-0.5 rounded text-xs border" style={{ borderColor: 'var(--app-border)', color: 'var(--app-subtitle)' }}>⌘K</kbd>
                        </button>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <IconBell className="w-5 h-5" style={{ color: 'var(--app-subtitle)' }} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt={user.fullName} className="w-8 h-8 rounded-full" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <IconUserCircle className="w-5 h-5 text-white" />
                                    </div>
                                )}
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium" style={{ color: 'var(--app-body-text)' }}>{user?.fullName || 'Admin'}</p>
                                    <p className="text-xs" style={{ color: 'var(--app-subtitle)' }}>{user?.role || 'ADMIN'}</p>
                                </div>
                                <IconChevronDown className="w-4 h-4" style={{ color: 'var(--app-subtitle)' }} />
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-56 rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)' }}>
                                    <div className="p-3 border-b" style={{ borderColor: 'var(--app-border)' }}>
                                        <p className="text-sm font-medium" style={{ color: 'var(--app-body-text)' }}>{user?.fullName || 'Admin User'}</p>
                                        <p className="text-xs" style={{ color: 'var(--app-subtitle)' }}>{user?.role || 'ADMIN'}</p>
                                    </div>
                                    <div className="p-2">
                                        <Link href="/admincp" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                                            <IconLayoutDashboard className="w-4 h-4" style={{ color: 'var(--app-subtitle)' }} />
                                            <span className="text-sm" style={{ color: 'var(--app-body-text)' }}>Old Admin Panel</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors text-red-500"
                                        >
                                            <IconLogout className="w-4 h-4" />
                                            <span className="text-sm">Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
