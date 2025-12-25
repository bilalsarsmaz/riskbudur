"use client";

import { useState } from "react";
import { IconX } from "@tabler/icons-react";
import ComposeBox from "./ComposeBox";
import { EnrichedPost } from "@/types/post";

interface MobileComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated?: (post: EnrichedPost) => void;
}

export default function MobileComposeModal({
    isOpen,
    onClose,
    onPostCreated,
}: MobileComposeModalProps) {
    if (!isOpen) return null;

    const handlePostCreated = (post: EnrichedPost) => {
        onPostCreated?.(post);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] bg-[var(--app-body-bg)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--app-border)" }}>
                <div className="flex items-center gap-2">
                    <img
                        src="/riskbudurlogo.png?v=2"
                        alt="riskbudur"
                        className="h-5"
                    />
                    <span className="text-[15px] font-medium" style={{ color: "var(--app-body-text)" }}>
                        Gönderi Oluştur
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-[#151515] transition-colors"
                >
                    <IconX className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* ComposeBox Wrapper - shrink to fit content */}
            <div className="flex-shrink-0">
                <ComposeBox
                    onPostCreated={handlePostCreated}
                    className="!bg-transparent !border-none !rounded-none"
                    isMobileFullscreen={true}
                />
                {/* Bottom Border - tam ComposeBox altında */}
                <div className="w-full border-b" style={{ borderColor: "var(--app-border)" }} />
            </div>

            {/* Empty space */}
            <div className="flex-1" />
        </div>
    );
}
