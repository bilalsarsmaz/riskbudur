"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import { formatRelativeTime } from "@/lib/dateUtils";
import ImageModal from "@/components/ImageModal";

interface Message {
    id: string;
    content: string;
    imageUrl?: string | null;
    createdAt: string;
    senderId: string;
    isRead: boolean;
    sender: {
        id: string;
        nickname: string;
        profileImage: string | null;
    };
}

interface User {
    id: string;
    nickname: string;
    username?: string;
    fullName: string | null;
    profileImage: string | null;
    hasBlueTick?: boolean;
    verificationTier?: 'NONE' | 'GREEN' | 'GOLD' | 'GRAY';
}

interface AdminMessageWindowProps {
    conversationId: string | null;
    targetUserId: string; // The user we are "shadowing"
    messages: Message[];
    recipient: User | null; // The person the target user is talking to
}

export default function AdminMessageWindow({
    conversationId,
    targetUserId,
    messages,
    recipient,
}: AdminMessageWindowProps) {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!recipient) {
        return (
            <div className="flex flex-col h-full bg-[var(--app-body-bg)]">
                <GlobalHeader title="Sohbet Görüntüleyici" />
                <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
                    <h3 className="text-xl font-bold mb-2">Sohbet Seçilmedi</h3>
                    <p>Soldan bir sohbet seçin.</p>
                </div>
            </div>
        );
    }

    const recipientUsername = recipient.username || recipient.nickname;

    return (
        <div className="flex flex-col h-full bg-[var(--app-body-bg)]">
            {/* Header */}
            <GlobalHeader
                title={
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="px-2 py-0.5 rounded bg-red-900/50 border border-red-500 text-xs text-red-200 font-bold mr-2">
                            ADMIN VIEW
                        </div>
                        {recipient.profileImage ? (
                            <img
                                src={recipient.profileImage}
                                alt={recipient.nickname}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <span className="font-bold text-gray-400 text-[10px] sm:text-xs">
                                    {recipient.nickname[0].toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm sm:text-base truncate">{recipient.fullName || recipient.nickname}</span>
                            <span className="text-[10px] sm:text-xs text-gray-500 truncate">@{recipientUsername}</span>
                        </div>
                    </div>
                }
                showBackButton={false} // No back button needed in split view usually
            />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 flex flex-col">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p className="text-sm">Bu sohbette mesaj yok.</p>
                    </div>
                )}
                {messages.map((msg, index) => {
                    const isMine = msg.senderId === targetUserId; // "Mine" means the Target User
                    const showAvatar = !isMine && (index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId);

                    return (
                        <div
                            key={msg.id}
                            className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}
                        >
                            <div className={`flex max-w-[85%] sm:max-w-[70%] ${isMine ? "flex-row-reverse" : "flex-row"} items-end gap-2`}>
                                {!isMine && (
                                    <div className="w-8 flex-shrink-0">
                                        {showAvatar && (
                                            msg.sender.profileImage ? (
                                                <img src={msg.sender.profileImage} className="w-8 h-8 rounded-full bg-gray-800 object-cover" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">
                                                    {msg.sender.nickname[0]}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}

                                <div
                                    className={`
                                        overflow-hidden rounded-2xl flex flex-col border border-theme-border
                                        ${isMine ? "rounded-br-none bg-[var(--app-body-bg)]" : "rounded-bl-none bg-[var(--app-global-link-color)]"}
                                    `}
                                >
                                    {msg.imageUrl && (
                                        <div className="w-full cursor-pointer" onClick={() => setSelectedImageUrl(msg.imageUrl!)}>
                                            <img
                                                src={msg.imageUrl}
                                                alt="Resim"
                                                className="w-full h-auto object-cover max-h-[300px] sm:max-h-[400px] block"
                                            />
                                        </div>
                                    )}

                                    <div className={`
                                        ${msg.imageUrl ? "p-3 border-t border-theme-border" : "px-4 py-2.5"}
                                        flex flex-col min-w-[150px]
                                    `}>
                                        {msg.content && (
                                            <p className="text-sm break-words whitespace-pre-wrap text-[var(--app-body-text)] mb-1 font-medium">
                                                {msg.content}
                                            </p>
                                        )}
                                        <div className={`flex items-center gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                                            <p className="text-[10px] text-[var(--app-subtitle)] font-medium">
                                                {formatRelativeTime(msg.createdAt)}
                                            </p>
                                            {isMine && msg.isRead && (
                                                <span className="text-[10px] text-[var(--app-global-link-color)] font-bold">Okundu</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Read Only Footer */}
            <div className="p-4 border-t border-theme-border bg-[#16181c] text-center text-gray-500 text-sm">
                <p>⚠️ Salt Okunur Mod (Admin)</p>
            </div>

            {/* Image Preview Modal */}
            <ImageModal
                imageUrl={selectedImageUrl}
                onClose={() => setSelectedImageUrl(null)}
            />
        </div>
    );
}
