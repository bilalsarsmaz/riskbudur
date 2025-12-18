"use client";

import { useState } from "react";
import Link from "next/link";
import { IconTrash } from "@tabler/icons-react";
import { formatRelativeTime } from "@/lib/dateUtils";
import GlobalHeader from "@/components/GlobalHeader";
import { deleteApi } from "@/lib/api";
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

interface ConversationListProps {
    conversations: Conversation[];
    currentUserId: string;
    selectedConversationId?: string;
    onDelete?: () => void;
}

export default function ConversationList({
    conversations,
    currentUserId,
    selectedConversationId,
    onDelete
}: ConversationListProps) {
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteConfirmId(conversationId);
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmId) return;

        setDeleting(true);
        try {
            await deleteApi(`/conversations/${deleteConfirmId}`);
            setDeleteConfirmId(null);

            // Call parent callback to refresh list
            if (onDelete) {
                onDelete();
            }

            // If deleted conversation was selected, redirect to messages home
            if (deleteConfirmId === selectedConversationId) {
                window.location.href = '/messages';
            }
        } catch (error) {
            console.error("Failed to delete conversation", error);
            alert("Konuşma silinemedi.");
        } finally {
            setDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmId(null);
    };

    return (
        <>
            <div className="flex flex-col h-full border-r border-theme-border">
                <GlobalHeader title="Mesajlar" subtitle="Kimler yeşillendirmiş?" />

                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Mezara mı saklıyorsun?
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
                                    href={`/messages?id=${conv.id}`}
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
                                                <span>·</span>
                                                <button
                                                    onClick={(e) => handleDeleteClick(e, conv.id)}
                                                    className="hover:text-red-500 transition-colors p-1 rounded hover:bg-red-500/10"
                                                    title="Konuşmayı sil"
                                                >
                                                    <IconTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {conv.unreadCount && conv.unreadCount > 0 && !isSelected ? (
                                            <p className="text-sm sm:text-[15px] font-bold mt-2 sm:mt-3 text-[var(--app-global-link-color)]">
                                                {conv.unreadCount} yeni mesaj
                                            </p>
                                        ) : (
                                            <p className={`text-sm sm:text-[15px] truncate mt-2 sm:mt-3 ${lastMessage && !lastMessage.isRead && lastMessage.senderId !== currentUserId ? "font-bold text-white" : "text-gray-500"}`}>
                                                {lastMessage ? (
                                                    <>
                                                        {lastMessage.senderId === currentUserId && <span className="mr-1">Siz:</span>}
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

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--app-body-bg)] w-full max-w-sm rounded-2xl border border-theme-border shadow-2xl p-6">
                        <h3 className="text-lg font-bold mb-4 text-white">Konuşmayı Sil</h3>
                        <p className="text-gray-400 mb-6">
                            Konuşmayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleCancelDelete}
                                disabled={deleting}
                                className="px-4 py-2 rounded-full border border-theme-border hover:bg-white/10 transition-colors disabled:opacity-50"
                            >
                                Hayır
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                                className="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                            >
                                {deleting ? "Siliniyor..." : "Evet"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
