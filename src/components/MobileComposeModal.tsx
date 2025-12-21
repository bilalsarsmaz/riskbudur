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
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
                onClick={onClose}
            />

            {/* Bottom Sheet Modal */}
            <div className="fixed inset-x-0 bottom-0 z-[60] animate-slide-up">
                <div className="bg-black rounded-t-3xl h-auto max-h-[85vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--app-border)" }}>
                        <div className="flex items-center gap-2">
                            <img
                                src="/riskbudurlogo.png"
                                alt="riskbudur"
                                className="h-6"
                            />
                            <span className="text-[15px] font-medium" style={{ color: "var(--app-body-text)" }}>Gönderi Oluştur</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-[#151515] transition-colors"
                        >
                            <IconX className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* ComposeBox - Scrollable */}
                    <div className="overflow-y-auto">
                        <ComposeBox
                            onPostCreated={handlePostCreated}
                            className="!bg-transparent !border-none !p-2 !pb-2"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
