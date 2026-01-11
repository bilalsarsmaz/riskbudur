"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi } from "@/lib/api";
import {
    IconLayoutDashboard,
    IconSpeakerphone,
    IconUserSearch,
    IconMessage2Search,
    IconTerminal2,
    IconMessageReport,
    IconRosetteDiscountCheck,
    IconSitemap,
    IconSettings,
    IconLogout,
    IconDots,
    IconArrowLeftToArc,
    IconUserCheck,
    IconMailSpark,
    IconSun,
    IconMoon,
    IconSunFilled,
    IconMoonFilled,
    IconUsersGroup,
    IconTimelineEventText,
    IconWorldCog,
    IconBan,
    IconVocabulary,
    IconEyeOff,
    IconServer
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

    const { t } = useTranslation();

    const menuStructure: MenuItem[] = useMemo(() => [
        {
            id: "dashboard",
            label: t("sidebar.dashboard"),
            icon: IconLayoutDashboard,
            href: "/admincp",
            visible: true
        },
        {
            id: "chat",
            label: t("sidebar.chat"),
            icon: IconMessage2Search,
            href: "/admincp/chat",
            visible: true
        },
        {
            id: "user-management",
            label: t("sidebar.users"),
            icon: IconUsersGroup,
            visible: true,
            children: [
                {
                    id: "users-list",
                    label: t("sidebar.users_list"),
                    href: "/admincp/users",
                    visible: hasPermission(userInfo?.role as Role, Permission.MANAGE_USER_FULLNAME) || hasPermission(userInfo?.role as Role, Permission.BAN_USER)
                },
                {
                    id: "approve-users",
                    label: t("sidebar.approve_users"),
                    href: "/admincp/approveuser",
                    visible: hasPermission(userInfo?.role as Role, Permission.APPROVE_USER)
                },
                {
                    id: "badges",
                    label: t("sidebar.badges"),
                    href: "/admincp/badges",
                    visible: hasPermission(userInfo?.role as Role, Permission.GRANT_BADGES)
                },
                {
                    id: "bans",
                    label: t("sidebar.bans"),
                    href: "/admincp/bans",
                    visible: hasPermission(userInfo?.role as Role, Permission.BAN_USER)
                },

            ]
        },
        {
            id: "content-moderation",
            label: t("sidebar.content"),
            icon: IconTimelineEventText,
            visible: true,
            children: [
                {
                    id: "posts",
                    label: t("sidebar.posts"),
                    href: "/admincp/posts",
                    visible: hasPermission(userInfo?.role as Role, Permission.DELETE_USER_POST)
                },
                {
                    id: "reports",
                    label: t("sidebar.reports"),
                    href: "/admincp/reports",
                    visible: hasPermission(userInfo?.role as Role, Permission.BAN_USER) || hasPermission(userInfo?.role as Role, Permission.DELETE_USER_POST)
                },
                {
                    id: "sensitive",
                    label: t("sidebar.sensitive"),
                    href: "/admincp/sensitive-content",
                    visible: hasPermission(userInfo?.role as Role, Permission.MANAGE_SENSITIVE_CONTENT)
                },

            ]
        },
        {
            id: "system-technical",
            label: t("sidebar.system"),
            icon: IconWorldCog,
            visible: true,
            children: [
                {
                    id: "status",
                    label: t("sidebar.status"),
                    href: "/admincp/status",
                    visible: hasPermission(userInfo?.role as Role, Permission.VIEW_SYSTEM_STATUS)
                },
                {
                    id: "announcements",
                    label: t("sidebar.announcements"),
                    href: "/admincp/announcements",
                    visible: hasPermission(userInfo?.role as Role, Permission.MANAGE_ANNOUNCEMENTS)
                },
                {
                    id: "pages",
                    label: t("sidebar.pages"),
                    href: "/admincp/pages",
                    visible: hasPermission(userInfo?.role as Role, Permission.MANAGE_PAGES)
                },
                {
                    id: "ghost-message",
                    label: t("sidebar.ghost_message"),
                    href: "/admincp/ghostmessage",
                    visible: hasPermission(userInfo?.role as Role, Permission.GHOST_MESSAGE)
                },
                {
                    id: "languages",
                    label: t("sidebar.languages"),
                    href: "/admincp/language",
                    visible: userInfo?.role === "ROOTADMIN"
                }
            ]
        },
        {
            id: "settings",
            label: t("sidebar.settings"),
            icon: IconSettings,
            href: "/admincp/settings",
            visible: hasPermission(userInfo?.role as Role, Permission.MANAGE_SETTINGS)
        },
        {
            id: "back-to-platform",
            label: t("sidebar.back_platform"),
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
        <div className="px-2 lg:px-4 pb-4 sticky top-0 flex flex-col h-screen overflow-y-auto w-[280px]">
            <div className="flex-1">
                <div className="mb-6 px-2">
                    <Link href="/admincp" className="flex items-start justify-center xl:justify-start py-2 xl:pr-2 xl:pl-0">
                        <img src="/riskbudurlogo.png?v=2" alt="Logo" className="w-[40px] h-auto object-contain mr-[5px] xl:mr-[3px] xl:mt-[2px]" />
                        <div className="hidden xl:flex flex-col justify-center mt-[5px]">
                            <h1 className="text-xl font-extrabold font-montserrat leading-none text-theme-text">
                                riskbudur
                            </h1>
                            <p className="text-[9px] font-medium font-montserrat text-right text-theme-subtitle mt-0">
                                underground sosyal medya
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
                                    className={`flex items-center px-3 py-3 rounded-full transition-all w-fit xl:w-full mb-1 ${isActive ? "font-bold" : ""}`}
                                >
                                    <div className="relative flex items-center w-full">
                                        {Icon && <Icon className={`w-[26.25px] h-[26.25px] mr-4 text-theme-text`} stroke={isActive ? 2.5 : 2} />}
                                        <span className={`hidden xl:block text-[20px] text-theme-text ${isActive ? "font-bold" : "font-normal"}`}>
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
                                    className={`flex items-center justify-between w-full px-3 py-3 rounded-full transition-all ${isChildActive ? "font-bold" : ""}`}
                                >
                                    <div className="flex items-center">
                                        {Icon && <Icon className={`w-[26.25px] h-[26.25px] mr-4 text-theme-text`} stroke={isChildActive ? 2.5 : 2} />}
                                        <span className={`hidden xl:block text-[20px] text-theme-text ${isChildActive ? "font-bold" : "font-normal"}`}>
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
                                                    className={`flex items-center px-3 py-2 rounded-full transition-all w-full text-[16px] text-theme-text ${isItemActive ? "font-bold opacity-100" : "font-normal opacity-70 hover:opacity-100"}`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full mr-3 bg-theme-text ${isItemActive ? "opacity-100" : "opacity-50"}`}></div>
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

            {/* HR Separator */}
            <div className="w-full px-2 my-2 xl:my-2 hidden xl:block mt-auto">
                <div className="border-t border-theme-border"></div>
            </div>

            <div
                className="flex items-center justify-center xl:justify-start p-2 rounded-lg cursor-pointer w-full"
                onClick={() => setShowUserMenu(!showUserMenu)}
            >
                {userInfo?.profileImage ? (
                    <img
                        src={userInfo.profileImage}
                        alt={userInfo.nickname}
                        className="w-10 h-10 rounded-full object-cover xl:mr-3 border-[0.5px] border-theme-border"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center xl:mr-3 border-[0.5px] border-theme-border bg-theme-surface text-theme-text">
                        {userInfo?.nickname?.charAt(0).toUpperCase() || 'A'}
                    </div>
                )}
                <div className="hidden xl:flex flex-1 flex-col">
                    <div className="flex items-center text-[15px] font-bold text-theme-text">
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
                    <div className="text-[13px] text-theme-subtitle">
                        @{userInfo?.nickname || 'admin'}
                    </div>
                </div>
                <IconDots className="hidden xl:block w-5 h-5 text-theme-subtitle" />
            </div>

            {showUserMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-full xl:w-auto min-w-[200px] rounded-lg shadow-lg overflow-hidden z-10 bg-theme-bg border border-theme-border">
                    <div className="p-2">
                        <button
                            className="flex items-center w-full p-2 rounded-lg text-theme-text"
                            onClick={() => {
                                router.push("/admincp/settings");
                                setShowUserMenu(false);
                            }}
                        >
                            <IconSettings className="h-5 w-5 mr-2" />
                            Ayarlar
                        </button>



                        <button
                            className="flex items-center w-full p-2 rounded-lg text-theme-text"
                            onClick={handleLogout}
                        >
                            <IconLogout className="h-5 w-5 mr-2" />
                            {t("sidebar.logout")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
