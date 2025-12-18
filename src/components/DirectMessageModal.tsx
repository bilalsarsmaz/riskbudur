"use client";

import { useState, useRef, useEffect, useId } from "react";
import { postApi } from "@/lib/api";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { IconPhoto, IconGif, IconMoodSmile, IconX } from "@tabler/icons-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import GifPicker, { TenorImage } from 'gif-picker-react';
import ErrorBoundary from './ErrorBoundary';

interface DirectMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipient: {
        id: string;
        fullName: string;
        username: string;
        profileImage: string | null;
    };
}

export default function DirectMessageModal({ isOpen, onClose, recipient }: DirectMessageModalProps) {
    const uniqueId = useId();
    const photoUploadId = `dm-photo-upload-${uniqueId}`;

    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [isTextareaActive, setIsTextareaActive] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const emojiButtonRef = useRef<HTMLButtonElement>(null);
    const gifPickerRef = useRef<HTMLDivElement>(null);
    const gifButtonRef = useRef<HTMLButtonElement>(null);

    // Close pickers on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target as Node) &&
                !(event.target as Element).closest('[data-emoji-button]')
            ) {
                setShowEmojiPicker(false);
            }

            if (
                gifPickerRef.current &&
                !gifPickerRef.current.contains(event.target as Node) &&
                !(event.target as Element).closest('[data-gif-button]')
            ) {
                setShowGifPicker(false);
            }

            if (
                textareaRef.current &&
                !(event.target as Node).isEqualNode(textareaRef.current) &&
                !textareaRef.current.contains(event.target as Node) &&
                message.trim() === ""
            ) {
                setIsTextareaActive(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [message]);

    if (!isOpen) return null;

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!message.trim() && !previewUrl) return;
        setSending(true);
        try {
            const convRes = await postApi("/conversations", { participantId: recipient.id });
            const conversationId = convRes.conversation?.id;

            if (conversationId) {
                await postApi(`/conversations/${conversationId}/messages`, {
                    content: message,
                    imageUrl: previewUrl
                });
                setMessage("");
                setPreviewUrl(null);
                onClose();
            }
        } catch (error) {
            console.error("Failed to send direct message", error);
            alert("Mesaj gönderilemedi.");
        } finally {
            setSending(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                setPreviewUrl(fileReader.result as string);
            };
            fileReader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setPreviewUrl(null);
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        const emoji = emojiData.emoji;
        const textarea = textareaRef.current;

        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newContent = message.substring(0, start) + emoji + message.substring(end);
            setMessage(newContent);
            setTimeout(() => {
                textarea.selectionStart = start + emoji.length;
                textarea.selectionEnd = start + emoji.length;
                textarea.focus();
            }, 10);
        } else {
            setMessage(message + emoji);
        }
        setShowEmojiPicker(false);
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
        setShowGifPicker(false);
    };

    const toggleGifPicker = () => {
        setShowGifPicker(!showGifPicker);
        setShowEmojiPicker(false);
    };

    const handleGifClick = (gif: TenorImage) => {
        setPreviewUrl(gif.url);
        setShowGifPicker(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            {/* 
                Match ComposeBox container style:
                bg-black, border-theme-border.
                Removed the split Header/Body/Footer design.
             */}
            <div className="bg-black w-full max-w-md rounded-2xl border border-theme-border shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200">

                {/* Recipient Info + Close Button Row */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {recipient.profileImage ? (
                            <img src={recipient.profileImage} alt={recipient.username} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                                <span className="font-bold text-gray-400 text-sm">{recipient.username[0].toUpperCase()}</span>
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="font-bold text-base text-white">{recipient.fullName}</span>
                            <span className="text-sm text-gray-500">@{recipient.username}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Area - Directly mimics ComposeBox structure */}
                <form onSubmit={handleSend} className="relative">
                    <div className="mb-3">
                        <div className="w-full relative">
                            <textarea
                                ref={textareaRef}
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    if (e.target.value.trim() !== "") {
                                        setIsTextareaActive(true);
                                    }
                                }}
                                onClick={() => setIsTextareaActive(true)}
                                placeholder="Bir şeyler yaz..."
                                disabled={sending}
                                className={`w-full bg-transparent text-white text-xl placeholder-gray-500 resize-none outline-none ${isTextareaActive ? 'min-h-[120px]' : 'min-h-[80px]'}`}
                                autoFocus
                            />
                        </div>

                        {previewUrl && (
                            <div className="mt-2 relative">
                                <img
                                    src={previewUrl}
                                    alt="Seçilen görsel"
                                    className="max-h-40 rounded-lg"
                                />
                                <button
                                    type="button"
                                    className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-100"
                                    onClick={removeImage}
                                >
                                    <IconX className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer - No borders, just like ComposeBox */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <label htmlFor={photoUploadId} className="cursor-pointer hover:opacity-80" style={{ color: 'var(--app-global-link-color)' }}>
                                <IconPhoto className="h-5 w-5" />
                                <span className="sr-only">Fotoğraf ekle</span>
                                <input
                                    id={photoUploadId}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                    disabled={sending}
                                />
                            </label>

                            <button
                                type="button"
                                className="cursor-pointer hover:opacity-80 ml-3" style={{ color: 'var(--app-global-link-color)' }}
                                onClick={toggleGifPicker}
                                data-gif-button
                                ref={gifButtonRef}
                            >
                                <IconGif className="h-5 w-5" />
                            </button>

                            <button
                                type="button"
                                className="cursor-pointer hover:opacity-80 ml-3" style={{ color: 'var(--app-global-link-color)' }}
                                onClick={toggleEmojiPicker}
                                data-emoji-button
                                ref={emojiButtonRef}
                            >
                                <IconMoodSmile className="h-5 w-5" />
                            </button>
                        </div>

                        <button
                            type="submit"
                            style={{ backgroundColor: 'var(--app-global-link-color)', color: '#040404', border: 'none' }}
                            className={`px-4 py-2 rounded-full font-bold ${sending
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:opacity-90"
                                }`}
                            disabled={sending || (!message.trim() && !previewUrl)}
                        >
                            {sending ? "Gönderiliyor..." : "Gönder"}
                        </button>
                    </div>

                    {/* Pickers */}
                    {showEmojiPicker && (
                        <div
                            ref={emojiPickerRef}
                            className="absolute top-full left-0 mt-2 z-50 shadow-lg rounded-lg"
                            style={{ width: '320px' }}
                        >
                            <EmojiPicker
                                onEmojiClick={handleEmojiClick}
                                searchPlaceHolder="Emoji ara..."
                                width="100%"
                                height={350}
                                theme="dark"
                            />
                        </div>
                    )}

                    {showGifPicker && (
                        <div
                            ref={gifPickerRef}
                            className="absolute top-full left-0 mt-2 z-50 shadow-lg rounded-lg"
                            style={{ width: '320px' }}
                        >
                            <ErrorBoundary fallback={<div className="p-4 text-center text-gray-500">GIF yüklenemedi.</div>}>
                                <GifPicker
                                    tenorApiKey={process.env.NEXT_PUBLIC_TENOR_API_KEY || "LIVDSRZULELA"}
                                    onGifClick={handleGifClick}
                                    width={320}
                                    height={450}
                                    theme="dark"
                                />
                            </ErrorBoundary>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
