"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import { postApi } from "@/lib/api";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { formatRelativeTime } from "@/lib/dateUtils";
import { IconPhoto, IconGif, IconMoodSmile, IconX } from "@tabler/icons-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import GifPicker, { TenorImage } from 'gif-picker-react';
import ErrorBoundary from '../ErrorBoundary';
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

interface MessageWindowProps {
    conversationId: string | null;
    currentUserId: string;
    messages: Message[];
    recipient: User | null;
    onSendMessage: (content: string, imageUrl?: string | null) => void;
    onConversationCreated?: () => void;
}

export default function MessageWindow({
    conversationId,
    currentUserId,
    messages,
    recipient,
    onSendMessage,
    onConversationCreated,
}: MessageWindowProps) {
    const router = useRouter();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sending, setSending] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const gifPickerRef = useRef<HTMLDivElement>(null);

    // Close pickers on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node) && !(event.target as Element).closest('[data-emoji-button]')) {
                setShowEmojiPicker(false);
            }
            if (gifPickerRef.current && !gifPickerRef.current.contains(event.target as Node) && !(event.target as Element).closest('[data-gif-button]')) {
                setShowGifPicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if ((!newMessage.trim() && !previewUrl) || sending || !recipient) return;

        setSending(true);
        try {
            const messageData = {
                content: newMessage.trim(),
                imageUrl: previewUrl
            };
            // If no conversationId, create conversation first
            if (!conversationId) {
                const convRes: any = await postApi("/conversations", { participantId: recipient.id });
                const newConversationId = convRes.conversation?.id;

                if (newConversationId) {
                    // Send first message
                    await postApi(`/conversations/${newConversationId}/messages`, messageData);
                    setNewMessage("");
                    setPreviewUrl(null);

                    // Notify parent to refresh conversation list and navigate to new conversation
                    if (onConversationCreated) {
                        onConversationCreated();
                    }

                    // Navigate to the new conversation
                    router.push(`/messages?id=${newConversationId}`);
                }
            } else {
                // Normal flow - conversation already exists
                await onSendMessage(newMessage.trim(), previewUrl);
                setNewMessage("");
                setPreviewUrl(null);
            }
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Mesaj gönderilemedi.");
        } finally {
            setSending(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setNewMessage(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    const handleGifClick = (gif: TenorImage) => {
        setPreviewUrl(gif.url);
        setShowGifPicker(false);
    };

    if (!recipient) {
        return (
            <div className="flex flex-col h-full bg-[var(--app-body-bg)]">
                <GlobalHeader title="" />
                <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
                    <h3 className="text-xl font-bold mb-2">Mesajlaşmaya Başla</h3>
                    <p>Sol taraftan bir sohbet seç veya yeni birini yeşillendir.</p>
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
                showBackButton={true}
                onBack={() => router.push('/messages')}
                rightContent={
                    <button
                        onClick={() => router.push(`/${recipientUsername}`)}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-sm border border-theme-border rounded-full hover:bg-white/10 transition-colors whitespace-nowrap"
                    >
                        Profilini Gör
                    </button>
                }
            />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 flex flex-col">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <p className="text-sm">Henüz mesaj yok. İlk mesajı sen gönder!</p>
                    </div>
                )}
                {messages.map((msg, index) => {
                    const isMine = msg.senderId === currentUserId;
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

            {/* Input and Features */}
            <div className="p-3 md:p-4 md:border-t border-theme-border relative flex-shrink-0 bg-[var(--app-body-bg)] z-10">
                {/* Previews */}
                {previewUrl && (
                    <div className="mb-2 relative inline-block">
                        <img src={previewUrl} alt="Önizleme" className="max-h-32 rounded-lg border border-theme-border" />
                        <button
                            onClick={() => setPreviewUrl(null)}
                            className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full p-1"
                        >
                            <IconX size={14} />
                        </button>
                    </div>
                )}

                {/* Pickers */}
                {showEmojiPicker && (
                    <div ref={emojiPickerRef} className="absolute bottom-full left-3 mb-2 z-50 shadow-2xl">
                        <EmojiPicker onEmojiClick={handleEmojiClick} searchPlaceHolder="Emoji ara..." width={300} height={350} theme={window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' as any} />
                    </div>
                )}
                {showGifPicker && (
                    <div ref={gifPickerRef} className="absolute bottom-full left-3 mb-2 z-50 shadow-2xl">
                        <ErrorBoundary fallback={<div className="p-4 text-center bg-[#16181c] rounded-lg border border-theme-border text-sm">GIF yüklenemedi.</div>}>
                            <GifPicker tenorApiKey={process.env.NEXT_PUBLIC_TENOR_API_KEY || "LIVDSRZULELA"} clientKey="riskbudur_web" onGifClick={handleGifClick} width={300} height={400} theme={window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' as any} />
                        </ErrorBoundary>
                    </div>
                )}

                <form onSubmit={handleSend} className="flex items-center gap-1 sm:gap-2 bg-[#202327] rounded-full p-0.5 sm:p-1 border border-gray-800 focus-within:ring-1 ring-[var(--app-global-link-color)] transition-all">
                    {/* Left Icons */}
                    <div className="flex items-center gap-0 sm:gap-0.5 pl-0.5 sm:pl-1">
                        <label className="cursor-pointer text-gray-400 hover:text-[var(--app-global-link-color)] p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0">
                            <IconPhoto size={18} className="sm:w-5 sm:h-5" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} ref={fileInputRef} />
                        </label>
                        <button
                            type="button"
                            data-gif-button
                            onClick={() => setShowGifPicker(!showGifPicker)}
                            className="text-gray-400 hover:text-[var(--app-global-link-color)] p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0"
                        >
                            <IconGif size={18} className="sm:w-5 sm:h-5" />
                        </button>
                        <button
                            type="button"
                            data-emoji-button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="text-gray-400 hover:text-[var(--app-global-link-color)] p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0"
                        >
                            <IconMoodSmile size={18} className="sm:w-5 sm:h-5" />
                        </button>
                    </div>

                    {/* Input Field */}
                    <textarea
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 py-2 sm:py-2.5 resize-none h-auto min-h-[38px] sm:min-h-[44px] max-h-32 text-sm sm:text-[15px] leading-tight"
                        placeholder="Bir mesaj yaz..."
                        rows={1}
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />

                    {/* Right Button */}
                    <button
                        type="submit"
                        disabled={(!newMessage.trim() && !previewUrl) || sending}
                        className="bg-white/90 text-black px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-[14px] disabled:opacity-50 hover:bg-white transition-all mr-0.5 sm:mr-1 flex-shrink-0"
                    >
                        {sending ? "..." : "Gönder"}
                    </button>
                </form>
            </div>
            {/* Image Preview Modal */}
            <ImageModal
                imageUrl={selectedImageUrl}
                onClose={() => setSelectedImageUrl(null)}
            />
        </div>
    );
}
