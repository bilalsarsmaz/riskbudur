"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi } from "@/lib/api";
import {
    IconLayoutDashboard,
    IconMessage2Search,
    IconSettings,
    IconLogout,
    IconDots,
    IconArrowLeftToArc,
    IconUsersGroup,
    IconTimelineEventText,
    IconWorldCog,
} from "@tabler/icons-react";
import VerificationBadge from "@/components/VerificationBadge";
import AdminBadge from "@/components/AdminBadge";
import { hasPermission, Permission, Role } from "@/lib/permissions";
import { useTranslation } from "@/components/TranslationProvider";

interface MenuItem {
    id: string;
    label: string;
    icon?: any;
    href?: string;
    visible: boolean;
    children?: MenuItem[];
}

export default function AdminSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        'user-management': false,
        'content-moderation': false,
        'system-technical': false
    });

    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await fetchApi("/users/me");
                if (data) {
                    setUserInfo(data);
                }
            } catch (err) {
                console.error("Kullanıcı bilgileri alınamadı:", err);
            }
        };
        fetchUserData();
    }, []);

    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/settings", { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    setLogoUrl(data.site_logo || "/riskbudurlogo.png?v=2");
                } else {
                    setLogoUrl("/riskbudurlogo.png?v=2");
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                setLogoUrl("/riskbudurlogo.png?v=2");
            }
        };
        fetchSettings();
    }, []);

    const { t } = useTranslation();

    const menuStructure: MenuItem[] = useMemo(() => [
        {
            id: "dashboard",
            label: t("admin.sidebar.dashboard"),
            icon: IconLayoutDashboard,
            href: "/admincp",
            visible: true
        },
        {
            id: "chat",
            label: t("admin.sidebar.chat"),
            icon: IconMessage2Search,
            href: "/admincp/chat",
            visible: true
        },
        {
            id: "user-management",
            label: t("admin.sidebar.users"),
            icon: IconUsersGroup,
            visible: true,
            children: [
                {
                    id: "users-list",
                    label: t("admin.sidebar.users_list"),
                    href: "/admincp/users",
                    visible: hasPermission(userInfo?.role as Role, Permission.MANAGE_USER_FULLNAME) || hasPermission(userInfo?.role as Role, Permission.BAN_USER)
                },
                {
                    id: "approve-users",
                    label: t("admin.sidebar.approve_users"),
                    href: "/admincp/approveuser",
                    visible: hasPermission(userInfo?.role as Role, Permission.APPROVE_USER)
                },
                {
                    id: "badges",
                    label: t("admin.sidebar.badges"),
                    href: "/admincp/badges",
                    visible: hasPermission(userInfo?.role as Role, Permission.GRANT_BADGES)
                },
                {
                    id: "bans",
                    label: t("admin.sidebar.bans"),
                    href: "/admincp/bans",
                    visible: hasPermission(userInfo?.role as Role, Permission.BAN_USER)
                },

            ]
        },
        {
            id: "content-moderation",
            label: t("admin.sidebar.content"),
            icon: IconTimelineEventText,
            visible: true,
            children: [
                {
                    id: "posts",
                    label: t("admin.sidebar.posts"),
                    href: "/admincp/posts",
                    visible: hasPermission(userInfo?.role as Role, Permission.DELETE_USER_POST)
                },
                {
                    id: "reports",
                    label: t("admin.sidebar.reports"),
                    href: "/admincp/reports",
                    visible: hasPermission(userInfo?.role as Role, Permission.BAN_USER) || hasPermission(userInfo?.role as Role, Permission.DELETE_USER_POST)
                },
                {
                    id: "sensitive",
                    label: t("admin.sidebar.sensitive"),
                    href: "/admincp/sensitive-content",
                    visible: hasPermission(userInfo?.role as Role, Permission.MANAGE_SENSITIVE_CONTENT)
                },

            ]
        },
        {
            id: "system-technical",
            label: t("admin.sidebar.system"),
            icon: IconWorldCog,
            visible: true,
            children: [
                {
                    id: "status",
                    label: t("admin.sidebar.status"),
                    href: "/admincp/status",
                    visible: hasPermission(userInfo?.role as Role, Permission.VIEW_SYSTEM_STATUS)
                },
                {
                    id: "announcements",
                    label: t("admin.sidebar.announcements"),
                    href: "/admincp/announcements",
                    visible: hasPermission(userInfo?.role as Role, Permission.MANAGE_ANNOUNCEMENTS)
                },
                {
                    id: "pages",
                    label: t("admin.sidebar.pages"),
                    href: "/admincp/pages",
                    visible: hasPermission(userInfo?.role as Role, Permission.MANAGE_PAGES)
                },
                {
                    id: "ghost-message",
                    label: t("admin.sidebar.ghost_message"),
                    href: "/admincp/ghostmessage",
                    visible: hasPermission(userInfo?.role as Role, Permission.GHOST_MESSAGE)
                },
                {
                    id: "languages",
                    label: t("admin.sidebar.languages"),
                    href: "/admincp/language",
                    visible: userInfo?.role === "ROOTADMIN"
                }
            ]
        },
        {
            id: "settings",
            label: t("admin.sidebar.settings"),
            icon: IconSettings,
            href: "/admincp/settings",
            visible: hasPermission(userInfo?.role as Role, Permission.MANAGE_SETTINGS)
        },
        {
            id: "back-to-platform",
            label: t("admin.sidebar.back_platform"),
            icon: IconArrowLeftToArc,
            href: "/home",
            visible: true
        }
    ], [userInfo, t]);

    // Auto-expand groups based on active path
    useEffect(() => {
        menuStructure.forEach(item => {
            if (item.children) {
                const hasActiveChild = item.children.some(child => child.href === pathname);
                if (hasActiveChild) {
                    setExpandedGroups(prev => ({
                        ...prev,
                        [item.id]: true
                    }));
                }
            }
        });
    }, [pathname, menuStructure]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        setShowUserMenu(false);
        router.push("/");
    };

    const activeMenuId = pathname === "/admincp" ? "dashboard" : pathname.split("/")[2] || "";

    return (
        <div className="flex flex-col h-full bg-black">
            {/* Scrollable Navigation Area */}
            <div className="flex-1 overflow-y-auto px-2 lg:px-4 pb-4 w-[280px]">
                <div className="mb-6 px-2 sticky top-0 bg-black z-20 pt-4">
                    <Link href="/admincp" className="flex items-start justify-center xl:justify-start py-2 xl:pr-2 xl:pl-0">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-[36px] h-auto object-contain mr-[5px] xl:mr-[3px] xl:mt-[2px]" />
                        ) : (
                            <div className="w-[36px] h-[36px] mr-[5px] xl:mr-[3px] xl:mt-[2px]"></div>
                        )}
                        <div className="hidden xl:flex flex-col justify-center mt-[5px]">
                            <h1 className="text-2xl font-extrabold font-montserrat leading-none app-text-primary">
                                {t('common.site_name', 'riskbudur')}
                            </h1>
                            <p className="text-[11px] font-medium font-montserrat text-right app-text-muted mt-0">
                                {t('common.slogan', 'underground sosyal medya')}
                            </p>
                        </div>
                    </Link>
                </div>

                <nav className="space-y-1">
                    {menuStructure.map((item) => {
                        if (!item.visible) return null;
                        if (item.children && item.children.filter(c => c.visible).length === 0) return null; // Hide empty groups

                        const Icon = item.icon;

                        // For simple links (Top Level like Dashboard, Settings)
                        if (!item.children) {
                            const isActive = item.href === "/admincp"
                                ? pathname === "/admincp"
                                : pathname.startsWith(item.href || "");

                            return (
                                <Link
                                    key={item.id}
                                    href={item.href || "#"}
                                    className={`flex items-center justify-center xl:justify-start p-3 xl:p-2 rounded-full xl:rounded-lg transition-all w-fit xl:w-full mb-1 ${isActive ? "font-bold" : ""}`}
                                >
                                    <div className="relative flex items-center w-full justify-center xl:justify-start">
                                        {Icon && <Icon className={`h-7 w-7 xl:h-6 xl:w-6 xl:mr-3 app-text-primary`} stroke={isActive ? 2.5 : 2} />}
                                        <span className={`hidden xl:inline app-body-text-title app-text-primary ${isActive ? "font-bold" : "font-normal"}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                </Link>
                            );
                        }

                        // For groups (Top Level)
                        const isExpanded = expandedGroups[item.id];
                        // Check if any child is active
                        const isChildActive = item.children.some(child =>
                            child.href && pathname.startsWith(child.href)
                        );

                        return (
                            <div key={item.id} className="mb-2">
                                <button
                                    onClick={() => toggleGroup(item.id)}
                                    className={`flex items-center justify-center xl:justify-between w-fit xl:w-full p-3 xl:p-2 rounded-full xl:rounded-lg transition-all ${isChildActive ? "font-bold" : ""}`}
                                >
                                    <div className="flex items-center justify-center xl:justify-start">
                                        {Icon && <Icon className={`h-7 w-7 xl:h-6 xl:w-6 xl:mr-3 app-text-primary`} stroke={isChildActive ? 2.5 : 2} />}
                                        <span className={`hidden xl:inline app-body-text-title app-text-primary ${isChildActive ? "font-bold" : "font-normal"}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    {/* No arrow icon on the right as per user request */}
                                </button>


                                {isExpanded && (
                                    <div className="mt-1 ml-4 xl:ml-3 space-y-1 pl-2">
                                        {item.children.filter(c => c.visible).map(child => {
                                            const isItemActive = pathname === child.href;
                                            return (
                                                <Link
                                                    key={child.id}
                                                    href={child.href || "#"}
                                                    className={`flex items-center px-3 py-2 rounded-full transition-all w-full text-[16px] app-text-primary ${isItemActive ? "font-bold opacity-100" : "font-normal opacity-70 hover:opacity-100"}`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full mr-3 bg-[var(--app-body-text)] ${isItemActive ? "opacity-100" : "opacity-50"}`}></div>
                                                    {child.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );

                    })}
                </nav>
            </div>

            {/* Static Bottom Area - No HR line as requested */}
            <div className="flex-shrink-0 px-2 lg:px-4 pb-4 pt-2 relative w-[280px]">
                <div
                    className="flex items-center justify-center xl:justify-start p-2 rounded-lg cursor-pointer w-full hover:bg-[var(--app-card-hover)] transition-colors"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                >
                    {userInfo?.profileImage ? (
                        <img
                            src={userInfo.profileImage}
                            alt={userInfo.nickname}
                            className="w-10 h-10 rounded-full object-cover xl:mr-3 border-[0.5px] app-border"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center xl:mr-3 border-[0.5px] app-border app-bg-surface app-text-primary">
                            {userInfo?.nickname?.charAt(0).toUpperCase() || 'A'}
                        </div>
                    )}
                    <div className="hidden xl:flex flex-1 flex-col">
                        <div className="flex items-center text-[15px] font-bold app-text-primary">
                            {userInfo?.fullName || userInfo?.nickname || 'Admin'}
                            <VerificationBadge
                                tier={userInfo?.verificationTier}
                                hasBlueTick={userInfo?.hasBlueTick}
                                username={userInfo?.nickname}
                                className="w-5 h-5 ml-1"
                            />
                            <AdminBadge
                                role={userInfo?.role}
                                className="w-5 h-5 ml-1"
                            />
                        </div>
                        <div className="text-[13px] app-text-muted">
                            @{userInfo?.nickname || 'admin'}
                        </div>
                    </div>
                    <IconDots className="hidden xl:block w-5 h-5 app-text-muted" />
                </div>

                {showUserMenu && (
                    <div className="absolute bottom-full left-4 mb-2 w-[calc(100%-32px)] xl:w-full min-w-[200px] rounded-lg shadow-lg overflow-hidden z-50 bg-black app-border border p-2">
                        <div>
                            <button
                                className="flex items-center w-full p-2 rounded-lg app-text-primary hover:bg-[var(--app-card-hover)] transition-colors"
                                onClick={() => {
                                    router.push("/admincp/settings");
                                    setShowUserMenu(false);
                                }}
                            >
                                <IconSettings className="h-5 w-5 mr-2" />
                                Ayarlar
                            </button>

                            <button
                                className="flex items-center w-full p-2 rounded-lg app-text-primary hover:bg-[var(--app-card-hover)] transition-colors"
                                onClick={handleLogout}
                            >
                                <IconLogout className="h-5 w-5 mr-2" />
                                {t("admin.sidebar.logout")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
