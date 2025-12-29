"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { tr } from "date-fns/locale";
import {
    IconHeartFilled, IconMessageCircle,
    IconRepeat,
    IconUserPlus,
    IconInfoCircle,
    IconAlertTriangleFilled,
    IconUserFilled,
    IconAt,
    IconShieldCheckFilled
} from '@tabler/icons-react';

import GlobalHeader from "@/components/GlobalHeader";
import VerificationBadge from "@/components/VerificationBadge";
import PostItem from "@/components/PostItem";
import StandardPageLayout from "@/components/StandardPageLayout";

interface Actor {
    id: string;
    nickname: string;
    fullName: string | null;
    profileImage: string | null;
    verificationTier: 'NONE' | 'GREEN' | 'GOLD' | 'GRAY';
    hasBlueTick: boolean;
    role?: 'USER' | 'MODERATOR' | 'LEAD' | 'ADMIN' | 'ROOTADMIN';
}

interface Notification {
    id: string;
    type: 'LIKE' | 'REPLY' | 'MENTION' | 'QUOTE' | 'FOLLOW' | 'SYSTEM' | 'VERIFICATION_APPROVED' | 'VERIFICATION_REJECTED' | 'ROLE_UPDATED' | 'POST_CENSORED';
    read: boolean;
    createdAt: string;
    actor: Actor;
    recipientId: string;
    recipient?: Actor;
    post?: {
        id: string;
        content: string;
        createdAt: string;
        imageUrl?: string | null;
        mediaUrl?: string | null;
        parentPostId?: string | null;
        isAnonymous?: boolean;
        linkPreview?: any;
        author: {
            nickname: string;
            fullName?: string | null;
            profileImage?: string | null;
            verificationTier?: 'NONE' | 'GREEN' | 'GOLD' | 'GRAY';
            hasBlueTick?: boolean;
        };
        _count: {
            likes: number;
            replies: number;
            quotes: number;
        } | null;
    } | null;
}

interface GroupedNotification {
    id: string;
    type: 'LIKE' | 'REPLY' | 'MENTION' | 'QUOTE' | 'FOLLOW' | 'SYSTEM' | 'VERIFICATION_APPROVED' | 'VERIFICATION_REJECTED' | 'ROLE_UPDATED' | 'POST_CENSORED';
    read: boolean;
    createdAt: string;
    actors: Actor[];
    recipient?: Actor;
    post?: {
        id: string;
        content: string;
        createdAt: string;
        imageUrl?: string | null;
        mediaUrl?: string | null;
        parentPostId?: string | null;
        isAnonymous?: boolean;
        linkPreview?: any;
        author: {
            nickname: string;
            fullName?: string | null;
            profileImage?: string | null;
            verificationTier?: 'NONE' | 'GREEN' | 'GOLD' | 'GRAY';
            hasBlueTick?: boolean;
        };
        _count: {
            likes: number;
            replies: number;
            quotes: number;
        } | null;
    } | null;
    notificationIds: string[];
}

function groupNotifications(notifications: Notification[]): GroupedNotification[] {
    const grouped: GroupedNotification[] = [];
    const likeGroups = new Map<string, number>(); // postId -> index in grouped
    let lastFollowGroupIndex = -1;
    const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

    console.log("Grouping Notifications. Total:", notifications.length);

    for (const notif of notifications) {
        if (notif.type === 'LIKE' && notif.post) {
            if (likeGroups.has(notif.post.id)) {
                const index = likeGroups.get(notif.post.id)!;
                const existing = grouped[index];

                // Add actor if not already present
                if (!existing.actors.some(a => a.id === notif.actor.id)) {
                    existing.actors.push(notif.actor);
                }

                // Always add the notification ID to the list
                existing.notificationIds.push(notif.id);

                // Update read status (Group is unread if ANY item looks unread)
                existing.read = existing.read && notif.read;

                // Update timestamp to latest
                if (new Date(notif.createdAt) > new Date(existing.createdAt)) {
                    existing.createdAt = notif.createdAt;
                    existing.id = notif.id;
                }
            } else {
                const newGroup: GroupedNotification = {
                    id: notif.id,
                    type: 'LIKE',
                    read: notif.read,
                    createdAt: notif.createdAt,
                    actors: [notif.actor],
                    recipient: notif.recipient,
                    post: notif.post,
                    notificationIds: [notif.id],
                };
                const newIndex = grouped.push(newGroup) - 1;
                likeGroups.set(notif.post.id, newIndex);
            }
        } else if (notif.type === 'FOLLOW') {
            let addedToGroup = false;

            if (lastFollowGroupIndex !== -1) {
                const existing = grouped[lastFollowGroupIndex];
                // Check time difference (assuming notifications are sorted desc)
                const d1 = new Date(existing.createdAt).getTime();
                const d2 = new Date(notif.createdAt).getTime();
                const timeDiff = Math.abs(d1 - d2);

                if (timeDiff < THREE_HOURS_MS) {
                    if (!existing.actors.some(a => a.id === notif.actor.id)) {
                        existing.actors.push(notif.actor);
                    }
                    existing.notificationIds.push(notif.id);
                    // Update read status
                    existing.read = existing.read && notif.read;

                    addedToGroup = true;
                }
            }

            if (!addedToGroup) {
                const newGroup: GroupedNotification = {
                    id: notif.id,
                    type: 'FOLLOW',
                    read: notif.read,
                    createdAt: notif.createdAt,
                    actors: [notif.actor],
                    post: notif.post,
                    notificationIds: [notif.id],
                };
                lastFollowGroupIndex = grouped.push(newGroup) - 1;
            }
        } else {
            // Non-groupable notifications
            grouped.push({
                id: notif.id,
                type: notif.type,
                read: notif.read,
                createdAt: notif.createdAt,
                actors: [notif.actor],
                recipient: notif.recipient,
                post: notif.post,
                notificationIds: [notif.id],
            });
        }
    }

    // Sort by createdAt desc just in case
    return grouped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default function Notifications() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<GroupedNotification[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchNotifications = async (pageNum: number) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/");
                return;
            }

            const res = await fetch(`/api/notifications?page=${pageNum}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                const newNotifications = groupNotifications(data.notifications);

                if (data.notifications.length === 0) {
                    setHasMore(false);
                } else {
                    setNotifications(prev => pageNum === 1 ? newNotifications : [...prev, ...newNotifications]);
                    setHasMore(true);
                }
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchNotifications(1);
    }, []);

    // Scroll handler for infinite loading
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading && !loadingMore && hasMore) {
                setPage(prev => {
                    const nextPage = prev + 1;
                    fetchNotifications(nextPage);
                    return nextPage;
                });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, loadingMore, hasMore]);

    const formatDate = (dateString: string) => {
        return formatDistanceToNowStrict(new Date(dateString), { addSuffix: true, locale: tr });
    };

    return (
        <StandardPageLayout>
            <GlobalHeader title="Bildirimler" subtitle="Tehlike çanlarını görüntüle" showBackButton={true} />
            <div className="divide-y divide-[#2f3336]">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Henüz bildirim yok.</div>
                ) : (
                    notifications.map((group) => {
                        const isUnread = !group.read;

                        // Unread styles based on type
                        let unreadClass = 'bg-[#080808]'; // Default unread (dark gray)
                        if (isUnread) {
                            switch (group.type) {
                                case 'LIKE':
                                    unreadClass = 'bg-[#F91880]/10 border-l-4 border-l-[#F91880]';
                                    break;
                                case 'FOLLOW':
                                    unreadClass = 'bg-[#1d9bf0]/10 border-l-4 border-l-[#1d9bf0]';
                                    break;
                                case 'REPLY':
                                    unreadClass = 'bg-[#1d9bf0]/10 border-l-4 border-l-[#1d9bf0]';
                                    break;
                                case 'QUOTE':
                                    unreadClass = 'bg-[#00ba7c]/10 border-l-4 border-l-[#00ba7c]';
                                    break;
                                case 'MENTION':
                                    unreadClass = 'bg-[#1d9bf0]/10 border-l-4 border-l-[#1d9bf0]';
                                    break;
                                case 'SYSTEM':
                                    unreadClass = 'bg-[#1d9bf0]/10 border-l-4 border-l-gray-500'; // Default System
                                    break;
                                case 'VERIFICATION_APPROVED':
                                case 'VERIFICATION_REJECTED':
                                    unreadClass = 'bg-orange-500/10 border-l-4 border-l-orange-500'; // Orange for Verification
                                    break;
                                case 'ROLE_UPDATED':
                                    unreadClass = 'bg-[#1DCD9F]/10 border-l-4 border-l-[#1DCD9F]'; // Green for Role
                                    break;
                                case 'POST_CENSORED':
                                    unreadClass = 'bg-gray-500/10 border-l-4 border-l-gray-500'; // Gray for Censored
                                    break;
                            }
                        }

                        // Determine styling and content based on type

                        let icon = null;
                        let actionText = "";
                        let contentBody = null;


                        // For System notifications, we want to show the User (Recipient) as the actor
                        // because the text is phrased as "User's application was accepted"
                        const isSystemUserCentric = group.type === 'VERIFICATION_APPROVED' ||
                            group.type === 'VERIFICATION_REJECTED' ||
                            group.type === 'ROLE_UPDATED' ||
                            group.type === 'POST_CENSORED';

                        const displayActor = (isSystemUserCentric && group.recipient)
                            ? group.recipient
                            : group.actors[0];


                        switch (group.type) {
                            case 'LIKE':
                                icon = <IconHeartFilled className="w-7 h-7 text-[#F91880]" />;
                                actionText = group.post?.parentPostId ? 'yanıtını beğendi' : 'gönderini beğendi';
                                contentBody = group.post?.content ? (
                                    <div className="text-[15px] text-theme-subtitle mt-0.5 max-w-full line-clamp-2">
                                        {group.post.content}
                                    </div>
                                ) : null;
                                break;
                            case 'FOLLOW':
                                icon = <IconUserFilled className="w-7 h-7 text-[#1d9bf0]" />;
                                actionText = 'seni takip etti';
                                break;
                            case 'SYSTEM':
                                icon = (
                                    <VerificationBadge
                                        tier="GREEN"
                                        hasBlueTick={true}
                                        className="w-7 h-7"
                                        style={{ color: 'inherit' }} // Let it handle its own color 
                                    />
                                );
                                actionText = 'kapsamında bir bildirim.';
                                break;
                            case 'VERIFICATION_APPROVED':
                                icon = (
                                    <VerificationBadge
                                        tier="GREEN"
                                        hasBlueTick={true}
                                        className="w-7 h-7"
                                        style={{ color: 'inherit' }}
                                    />
                                );
                                actionText = 'başvurunuz Riskbudur Özel Tim tarafından kabul edildi.';
                                break;
                            case 'VERIFICATION_REJECTED':
                                icon = (
                                    <VerificationBadge
                                        tier="NONE"
                                        hasBlueTick={false}
                                        className="w-7 h-7 text-gray-500" // Grey icon for rejection
                                        style={{ color: 'gray' }}
                                    />
                                );
                                actionText = 'başvurunuz Riskbudur Özel Tim tarafından reddedildi.';
                                break;
                            case 'ROLE_UPDATED':
                                icon = <IconShieldCheckFilled className="w-7 h-7 app-adminbadge" style={{ color: '#1DCD9F' }} />;
                                const isUserRole = group.recipient?.role === 'USER';
                                actionText = isUserRole
                                    ? "RiskBudur Özel Tim'den emekli oldun. Artık sen de sıradan birisin..."
                                    : "RiskBudur Özel Tim'e hoş geldin! İçeceğini hazırla, işte şimdi başlıyorsun...";
                                break;
                            case 'POST_CENSORED':
                                icon = <IconAlertTriangleFilled className="w-7 h-7" style={{ color: 'var(--app-subtitle)' }} />;
                                actionText = 'gönderin RiskBudur insansız hava aracıyla imha edildi! Bu bir uyarıydı, tekrarında bu diyarlardan göç edeceksin!';
                                break;
                            case 'REPLY':
                                icon = <IconMessageCircle className="w-7 h-7 text-[#1d9bf0]" />;
                                actionText = 'sana yanıt verdi';
                                contentBody = group.post ? (
                                    <div className="mt-2 border border-theme-border rounded-xl overflow-hidden">
                                        <PostItem
                                            post={{
                                                id: group.post.id,
                                                content: group.post.content,
                                                createdAt: group.post.createdAt,
                                                parentPostId: group.post.parentPostId || undefined,
                                                linkPreview: group.post.linkPreview,
                                                author: {
                                                    id: group.post.author.nickname,
                                                    nickname: group.post.author.nickname,
                                                    fullName: group.post.author.fullName || undefined,
                                                    profileImage: group.post.author.profileImage || undefined,
                                                    verificationTier: group.post.author.verificationTier || 'NONE',
                                                    hasBlueTick: group.post.author.hasBlueTick || false,
                                                },
                                                _count: {
                                                    likes: group.post._count?.likes || 0,
                                                    comments: group.post._count?.replies || 0,
                                                    quotes: group.post._count?.quotes || 0,
                                                },
                                                mediaUrl: group.post.mediaUrl || undefined,
                                                imageUrl: group.post.imageUrl || undefined,
                                                isLiked: false,
                                                isBookmarked: false,
                                                isCommented: false,
                                                isQuoted: false,
                                                quoteCount: group.post._count.quotes || 0
                                            }}
                                            isFirst={false}
                                            showThreadLine={false}
                                            showThreadFooter={false}
                                            className="border-b-0"
                                        />
                                    </div>
                                ) : null;
                                break;
                            case 'QUOTE':
                                icon = <IconRepeat className="w-7 h-7 text-[#00ba7c]" />;
                                actionText = 'gönderini alıntıladı';
                                contentBody = group.post ? (
                                    <div className="mt-2 border border-theme-border rounded-xl overflow-hidden">
                                        <PostItem
                                            post={{
                                                id: group.post.id,
                                                content: group.post.content,
                                                createdAt: group.post.createdAt,
                                                parentPostId: group.post.parentPostId || undefined,
                                                linkPreview: group.post.linkPreview,
                                                author: {
                                                    id: group.post.author.nickname,
                                                    nickname: group.post.author.nickname,
                                                    fullName: group.post.author.fullName || undefined,
                                                    profileImage: group.post.author.profileImage || undefined,
                                                    verificationTier: group.post.author.verificationTier || 'NONE',
                                                    hasBlueTick: group.post.author.hasBlueTick || false,
                                                },
                                                _count: {
                                                    likes: group.post._count?.likes || 0,
                                                    comments: group.post._count?.replies || 0,
                                                    quotes: group.post._count?.quotes || 0,
                                                },
                                                mediaUrl: group.post.mediaUrl || undefined,
                                                imageUrl: group.post.imageUrl || undefined,
                                                isLiked: false,
                                                isBookmarked: false,
                                                isCommented: false,
                                                isQuoted: false,
                                                quoteCount: group.post._count.quotes || 0
                                            }}
                                            isFirst={false}
                                            showThreadLine={false}
                                            showThreadFooter={false}
                                            className="border-b-0"
                                        />
                                    </div>
                                ) : null;
                                break;
                            case 'MENTION':
                                icon = <IconAt className="w-7 h-7 text-[#1d9bf0]" />;
                                actionText = 'senden bahsetti';
                                contentBody = group.post ? (
                                    <div className="mt-2 border border-theme-border rounded-xl overflow-hidden">
                                        <PostItem
                                            post={{
                                                id: group.post.id,
                                                content: group.post.content,
                                                createdAt: group.post.createdAt,
                                                parentPostId: group.post.parentPostId || undefined,
                                                linkPreview: group.post.linkPreview,
                                                author: {
                                                    id: group.post.author.nickname,
                                                    nickname: group.post.author.nickname,
                                                    fullName: group.post.author.fullName || undefined,
                                                    profileImage: group.post.author.profileImage || undefined,
                                                    verificationTier: group.post.author.verificationTier || 'NONE',
                                                    hasBlueTick: group.post.author.hasBlueTick || false,
                                                },
                                                _count: {
                                                    likes: group.post._count?.likes || 0,
                                                    comments: group.post._count?.replies || 0,
                                                    quotes: group.post._count?.quotes || 0,
                                                },
                                                mediaUrl: group.post.mediaUrl || undefined,
                                                imageUrl: group.post.imageUrl || undefined,
                                                isLiked: false,
                                                isBookmarked: false,
                                                isCommented: false,
                                                isQuoted: false,
                                                quoteCount: group.post._count.quotes || 0
                                            }}
                                            isFirst={false}
                                            showThreadLine={false}
                                            showThreadFooter={false}
                                            className="border-b-0"
                                        />
                                    </div>
                                ) : null;
                                break;
                        }

                        /* Extracted handler for marking read */
                        const handleMarkAsRead = async (group: GroupedNotification) => {
                            if (!group.read) {
                                // Update locally immediately
                                const newNotifications = notifications.map(n =>
                                    n.id === group.id ? { ...n, read: true } : n
                                );
                                setNotifications(newNotifications);

                                // Send to server
                                try {
                                    const token = localStorage.getItem("token");
                                    if (token) {
                                        await fetch("/api/notifications/read", {
                                            method: "PUT",
                                            headers: {
                                                "Content-Type": "application/json",
                                                "Authorization": `Bearer ${token}`
                                            },
                                            body: JSON.stringify({ notificationIds: group.notificationIds })
                                        });
                                    }
                                } catch (error) {
                                    console.error("Failed to mark as read", error);
                                }
                            }
                        };

                        return (
                            <div
                                key={group.id}
                                onClick={() => {
                                    handleMarkAsRead(group);

                                    // Default Navigation
                                    const isSystemType = group.type === 'SYSTEM' ||
                                        group.type === 'VERIFICATION_APPROVED' ||
                                        group.type === 'VERIFICATION_REJECTED' ||
                                        group.type === 'ROLE_UPDATED' ||
                                        group.type === 'POST_CENSORED';

                                    if (isSystemType) {
                                        router.push('/home');
                                    } else if (group.type === 'FOLLOW') {
                                        router.push(`/${group.actors[0].nickname}`);
                                    } else if (group.post) {
                                        router.push(`/${group.post.author?.nickname || 'user'}/status/${group.post.id}`);
                                    } else {
                                        router.push(`/${group.actors[0].nickname}`);
                                    }
                                }}
                                className={`p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-theme-border ${isUnread ? unreadClass : ''}`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Left Icon */}
                                    <div className="flex-shrink-0">
                                        {icon}
                                    </div>

                                    {/* Main Content */}
                                    <div className="flex-1 min-w-0">
                                        {group.type === 'SYSTEM' || group.type === 'VERIFICATION_APPROVED' || group.type === 'VERIFICATION_REJECTED' || group.type === 'ROLE_UPDATED' || group.type === 'POST_CENSORED' ? (
                                            /* SYSTEM Notification Layout */
                                            <div className="flex flex-col gap-1">
                                                {/* Header: Badge + Info + System Notification + Date */}
                                                <div className="flex items-center justify-between text-theme-subtitle text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <IconInfoCircle className="w-4 h-4 text-theme-subtitle" />
                                                        <span className="font-medium">Sistem Bildirimi</span>
                                                    </div>
                                                    <span className="text-sm whitespace-nowrap" style={{ color: "var(--app-subtitle)" }}>
                                                        {formatDate(group.createdAt)}
                                                    </span>
                                                </div>

                                                {/* Content: Avatar + Text */}
                                                <div className="flex items-start gap-3 mt-1">
                                                    {/* Profile Photo - Displays User/Recipient for System messages */}
                                                    <div className="flex-shrink-0">
                                                        <div className="w-9 h-9 rounded-full border border-black bg-gray-800">
                                                            {displayActor.profileImage ? (
                                                                <img src={displayActor.profileImage} alt={displayActor.nickname} className="w-full h-full object-cover rounded-full" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-gray-700">
                                                                    {displayActor.nickname[0].toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Message Body */}
                                                    <div className="flex-1 text-[15px] leading-5 text-theme-text">
                                                        <span className="font-bold">
                                                            {displayActor.nickname}
                                                        </span>
                                                        {/* Only show badge if it's NOT a verification/system notification about the user themselves, 
                                                            OR if we want to show the user's current badge status. 
                                                            Screenshot shows NO badge next to name, just the name in bold. */}

                                                        {/* Text Body */}
                                                        {/* For Verification, we hardcoded 'profil onay rozeti' prefix in the code previously. 
                                                            Let's keep it if it matches the screenshot logic. */}
                                                        <span> {group.type === 'VERIFICATION_APPROVED' || group.type === 'VERIFICATION_REJECTED' ? 'profil onay rozeti ' : ''}{actionText}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : group.actors.length === 1 ? (
                                            /* Single Actor: Everything on one line */
                                            <div className="flex items-center gap-2">
                                                {/* Profile Photo */}
                                                <div className="flex-shrink-0">
                                                    <div className="w-7 h-7 rounded-full border border-black bg-gray-800">
                                                        {group.actors[0].profileImage ? (
                                                            <img src={group.actors[0].profileImage} alt={group.actors[0].nickname} className="w-full h-full object-cover rounded-full" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-gray-700">
                                                                {group.actors[0].nickname[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Name + Action Text */}
                                                <div className="flex-1 text-[15px] leading-5 text-theme-text min-w-0">
                                                    <span className="font-bold hover:underline">
                                                        {group.actors[0].nickname}
                                                    </span>
                                                    <VerificationBadge
                                                        tier={group.actors[0].verificationTier}
                                                        hasBlueTick={group.actors[0].hasBlueTick}
                                                        username={group.actors[0].nickname}
                                                        className="ml-0.5 inline-block align-bottom"
                                                        style={{ width: '18px', height: '18px', marginBottom: '1px' }}
                                                    />
                                                    <span className="text-theme-subtitle"> {actionText}</span>
                                                </div>

                                                {/* Date */}
                                                <span className="text-sm text-theme-subtitle whitespace-nowrap flex-shrink-0" style={{ color: "var(--app-subtitle)" }}>
                                                    {formatDate(group.createdAt)}
                                                </span>
                                            </div>
                                        ) : (
                                            /* Multiple Actors: Side by Side & Clickable */
                                            <>
                                                {/* First Row: Avatars + Date */}
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    {/* Profile Photos */}
                                                    <div className="flex items-center gap-0.5 flex-shrink-0 flex-wrap">
                                                        {group.actors.slice(0, 8).map((actor, i) => (
                                                            <div
                                                                key={i}
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Don't trigger parent click
                                                                    handleMarkAsRead(group); // Mark as read anyway
                                                                    router.push(`/${actor.nickname}`); // Go to THIS user
                                                                }}
                                                                className="w-7 h-7 rounded-full border border-black bg-gray-800 cursor-pointer hover:opacity-80 transition-opacity relative z-10"
                                                                title={actor.nickname}
                                                            >
                                                                {actor.profileImage ? (
                                                                    <img src={actor.profileImage} alt={actor.nickname} className="w-full h-full object-cover rounded-full" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-gray-700">
                                                                        {actor.nickname[0].toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {group.actors.length > 8 && (
                                                            <div className="w-7 h-7 rounded-full border border-black bg-gray-700 flex items-center justify-center text-xs text-white">
                                                                +{group.actors.length - 8}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Spacer */}
                                                    <div className="flex-1"></div>

                                                    {/* Date */}
                                                    <span className="text-sm text-theme-subtitle whitespace-nowrap flex-shrink-0" style={{ color: "var(--app-subtitle)" }}>
                                                        {formatDate(group.createdAt)}
                                                    </span>
                                                </div>

                                                {/* Second Row: Name + Action Text */}
                                                <div className="text-[15px] leading-5 text-theme-text">
                                                    <span className="font-bold hover:underline">
                                                        {group.actors[0].nickname}
                                                    </span>
                                                    <VerificationBadge
                                                        tier={group.actors[0].verificationTier}
                                                        hasBlueTick={group.actors[0].hasBlueTick}
                                                        username={group.actors[0].nickname}
                                                        className="ml-0.5 inline-block align-bottom"
                                                        style={{ width: '18px', height: '18px', marginBottom: '1px' }}
                                                    />
                                                    <span>
                                                        {" ve diğer "}
                                                        <span className="font-bold">{group.actors.length - 1} kişi</span>
                                                    </span>
                                                    <span className="text-theme-subtitle"> {actionText}</span>
                                                </div>
                                            </>
                                        )}

                                        {/* Post Content (Always on separate row) */}
                                        {contentBody && (
                                            <div className="mt-1">
                                                {contentBody}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </StandardPageLayout>
    );
}
