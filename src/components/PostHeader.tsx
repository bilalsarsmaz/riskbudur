"use client";

import Link from "next/link";
import {
    IconRosetteDiscountCheckFilled,
    IconDots,
    IconTrash,
    IconChartBar,
    IconCode,
    IconUserPlus,
    IconUserMinus,
    IconBan,
    IconFlag,
    IconAlertTriangleFilled,
    IconTrashX
} from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";
import { EnrichedPost } from "@/types/post";
import { formatCustomDate } from "@/utils/date";
import VerificationBadge from "./VerificationBadge";
import AdminBadge from "./AdminBadge";
import { hasPermission, Permission, Role } from "@/lib/permissions";

interface PostHeaderProps {
    post: EnrichedPost;
    currentUserId?: string;
    currentUserRole?: string;
    isAnonymous: boolean;
    isFollowing: boolean;
    onFollowToggle: () => void;
    onDelete: () => void;
    onBlock: () => void;
    onReport: () => void;
    onViewStats?: () => void;
    onPin?: () => void;
    onMenuOpenChange?: (isOpen: boolean) => void;
    isGold?: boolean;
    language: string;
}

export default function PostHeader({
    post,
    currentUserId,
    currentUserRole,
    isAnonymous,
    isFollowing,
    onFollowToggle,
    onDelete,
    onBlock,
    onReport,
    onViewStats,
    onPin,
    onMenuOpenChange,
    isGold,
    language
}: PostHeaderProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const isOwnPost = currentUserId && post.author?.id === currentUserId;
    // If count is undefined, default to 0 to safely check popularity
    const likes = post._count?.likes || 0;
    const comments = post._count?.comments || 0;
    const isPopular = (likes > 30 || comments > 10);

    const formattedDate = formatCustomDate(post.createdAt, language);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                !buttonRef.current?.contains(event.target as Node)
            ) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        if (onMenuOpenChange) {
            onMenuOpenChange(showMenu);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu, onMenuOpenChange]);

    const handleMenuAction = (action: () => void) => {
        action();
        setShowMenu(false);
    };

    const safeOnViewStats = () => { if (onViewStats) handleMenuAction(onViewStats); else setShowMenu(false); };
    const safeOnPin = () => { if (onPin) handleMenuAction(onPin); else setShowMenu(false); };

    return (
        <div className="post-header flex items-center justify-between mb-1">
            <div className="flex items-center mr-1 min-w-0">
                {isAnonymous ? (
                    <span className="post-author-name font-bold whitespace-nowrap truncate text-sm sm:text-[15px]">
                        Anonim Kullanıcı
                    </span>
                ) : (
                    <Link href={`/${post.author.nickname}`} className="min-w-0 truncate">
                        <span className="post-author-name font-bold whitespace-nowrap truncate text-sm sm:text-[15px]">
                            {post.author.fullName || post.author.nickname}
                        </span>
                    </Link>
                )}
                {!isAnonymous && (
                    <>
                        <VerificationBadge
                            tier={post.author.verificationTier}
                            hasBlueTick={post.author.hasBlueTick}
                            username={post.author.nickname}
                            className="post-badge w-4 h-4 sm:w-5 sm:h-5 ml-0.5"
                        />
                        <AdminBadge
                            role={post.author.role}
                            className="post-badge w-4 h-4 sm:w-5 sm:h-5 ml-0.5"
                        />
                    </>
                )}
                {isPopular && (
                    <IconRosetteDiscountCheckFilled className="post-badge post-badge-orange w-4 h-4 sm:w-5 sm:h-5 ml-0.5 verified-icon" />
                )}
                <span className="post-author-username ml-1 font-normal whitespace-nowrap truncate text-xs sm:text-[15px]" style={{ color: "var(--app-subtitle)" }}>
                    @{isAnonymous ? 'anonimkullanici' : post.author.nickname}
                </span>
                <span className="post-separator mx-1" style={{ color: "var(--app-subtitle)" }}>·</span>
                <span className="post-date text-xs sm:text-sm whitespace-nowrap flex-shrink-0" style={{ color: "var(--app-subtitle)" }}>{formattedDate}</span>

                {post.isThread && (
                    <span className="ml-2 text-[9px] sm:text-[10px] bg-black border px-1 py-0 rounded-full font-medium" style={{ color: "var(--app-global-link-color)", borderColor: "var(--app-global-link-color)" }}>
                        Thread
                    </span>
                )}
            </div>

            <div className="relative">
                {post.isCensored ? (
                    <div className="p-1">
                        <IconAlertTriangleFilled className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#DC5F00" }} />
                    </div>
                ) : (
                    <button
                        ref={buttonRef}
                        onClick={(e) => {
                            e.preventDefault(); // Prevent navigating to post detail if header is clickable
                            setShowMenu(!showMenu);
                        }}
                        className="p-1 hover:bg-gray-700 rounded-full"
                    >
                        <IconDots className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "var(--app-subtitle)" }} />
                    </button>
                )}

                {showMenu && (
                    <div
                        ref={menuRef}
                        className="absolute right-0 mt-2 rounded-xl border border-theme-border overflow-hidden"
                        style={{
                            width: "300px",
                            backgroundColor: "var(--app-body-bg)",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            zIndex: 99999,
                            borderColor: "var(--app-border)"
                        }}
                        onClick={(e) => e.preventDefault()} // Prevent click bubbling
                    >
                        {isOwnPost ? (
                            <>
                                <button
                                    onClick={() => handleMenuAction(onDelete)}
                                    className="w-full text-left px-4 py-3 text-red-500 flex items-center transition-colors"
                                >
                                    <IconTrash className="w-5 h-5 mr-3" />
                                    Gönderiyi sil
                                </button>
                            </>
                        ) : (
                            <>
                                {currentUserId && currentUserRole && post.author.id !== currentUserId && hasPermission(currentUserRole as Role, Permission.DELETE_USER_POST) && (
                                    <button
                                        onClick={() => handleMenuAction(onDelete)}
                                        className="w-full text-left px-4 py-3 text-red-500 flex items-center transition-colors border-b border-theme-border"
                                    >
                                        <IconTrashX className="w-5 h-5 mr-3" />
                                        Gönderiyi sil
                                    </button>
                                )}
                                {!isAnonymous && (
                                    <>
                                        <button
                                            onClick={() => handleMenuAction(onFollowToggle)}
                                            className="w-full text-left px-4 py-3 flex items-center transition-colors"
                                            style={{ color: "var(--app-body-text)" }}
                                        >
                                            {isFollowing ? (
                                                <>
                                                    <IconUserMinus className="w-5 h-5 mr-3" />
                                                    @{post.author.nickname} adlı kişiyi takipten çıkar
                                                </>
                                            ) : (
                                                <>
                                                    <IconUserPlus className="w-5 h-5 mr-3" />
                                                    @{post.author.nickname} adlı kişiyi takip et
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleMenuAction(onBlock)}
                                            className="w-full text-left px-4 py-3 text-red-500 flex items-center transition-colors"
                                        >
                                            <IconBan className="w-5 h-5 mr-3" />
                                            @{post.author.nickname} adlı kişiyi engelle
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleMenuAction(onReport)}
                                    className="w-full text-left px-4 py-3 text-red-500 flex items-center transition-colors"
                                >
                                    <IconFlag className="w-5 h-5 mr-3" />
                                    Gönderiyi bildir
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
