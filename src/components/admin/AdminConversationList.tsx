"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/lib/dateUtils";
import GlobalHeader from "@/components/GlobalHeader";
import VerificationBadge from "@/components/VerificationBadge";

interface Conversation {
    id: string;
    updatedAt: string;
    participants: {
        user: {
            id: string;
            nickname: string;
            fullName: string | null;
            profileImage: string | null;
            hasBlueTick?: boolean;
            verificationTier?: 'NONE' | 'GREEN' | 'GOLD' | 'GRAY';
        };
    }[];
    messages: {
        content: string;
        createdAt: string;
        isRead: boolean;
        senderId: string;
    }[];
    unreadCount?: number;
}

interface AdminConversationListProps {
    conversations: Conversation[];
    currentUserId: string; // The "Target" user we are shadowing
    targetNickname: string; // Needed for the URL
    selectedConversationId?: string;
}

export default function AdminConversationList({
    conversations,
    currentUserId,
    targetNickname,
    selectedConversationId,
}: AdminConversationListProps) {
    return (
        <div className="flex flex-col h-full border-r border-theme-border">
            <GlobalHeader title="Sohbetler" subtitle={`${targetNickname} adına görüntüleniyor`} />

            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Bu kullanıcının hiç sohbeti yok.
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const otherParticipant = conv.participants.find(p => p.user.id !== currentUserId)?.user;
                        const lastMessage = conv.messages[0];
                        const isSelected = conv.id === selectedConversationId;

                        if (!otherParticipant) return null;

                        return (
                            <Link
                                key={conv.id}
                                href={`/admincp/ghostmessage?nickname=${targetNickname}&id=${conv.id}`}
                                className={`flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 transition-colors cursor-pointer relative border-b border-theme-border app-card-item ${isSelected ? "active border-r-3 app-active-border" : ""}`}
                            >
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    {otherParticipant.profileImage ? (
                                        <img
                                            src={otherParticipant.profileImage}
                                            alt={otherParticipant.nickname}
                                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                            <span className="font-bold text-gray-400 text-sm sm:text-base">
                                                {otherParticipant.nickname[0].toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-1 min-w-0">
                                                <span className="font-bold text-sm sm:text-[15px] text-[var(--app-body-text)] leading-tight truncate">
                                                    {otherParticipant.fullName || otherParticipant.nickname}
                                                </span>
                                                <VerificationBadge
                                                    tier={otherParticipant.verificationTier}
                                                    hasBlueTick={otherParticipant.hasBlueTick}
                                                    username={otherParticipant.nickname}
                                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                                                />
                                            </div>
                                            <span className="text-[11px] sm:text-[13px] text-[var(--app-subtitle)] leading-tight mt-0.5 truncate">
                                                @{otherParticipant.nickname}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1 sm:gap-1.5 text-gray-500 text-[11px] sm:text-[13px] mt-0.5 flex-shrink-0">
                                            {lastMessage && (
                                                <span>{formatRelativeTime(lastMessage.createdAt)}</span>
                                            )}
                                        </div>
                                    </div>

                                    {conv.unreadCount && conv.unreadCount > 0 && !isSelected ? (
                                        <p className="text-sm sm:text-[15px] font-bold mt-2 sm:mt-3 text-[var(--app-global-link-color)]">
                                            {conv.unreadCount} okunmamış (Target)
                                        </p>
                                    ) : (
                                        <p className={`text-sm sm:text-[15px] truncate mt-2 sm:mt-3 ${lastMessage && !lastMessage.isRead && lastMessage.senderId !== currentUserId ? "font-bold text-white" : "text-gray-500"}`}>
                                            {lastMessage ? (
                                                <>
                                                    {lastMessage.senderId === currentUserId && <span className="mr-1">O:</span>}
                                                    {lastMessage.content}
                                                </>
                                            ) : (
                                                "Sohbet başlatıldı"
                                            )}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}
