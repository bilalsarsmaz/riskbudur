"use client";

import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";

interface ImageModalProps {
    imageUrl: string | null;
    onClose: () => void;
}

export default function ImageModal({ imageUrl, onClose }: ImageModalProps) {
    useEffect(() => {
        if (!imageUrl) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleEsc);
        // Prevent body scroll when modal open
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [imageUrl, onClose]);

    if (!imageUrl) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in"
            onClick={onClose}
        >
            {/* Backdrop Layer - Standard Dark Blur */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-md transition-all" />

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full cursor-pointer transition-all z-[10000] hover:bg-white/10"
                aria-label="Close"
            >
                <IconX size={24} style={{ color: "var(--app-icon-nav)" }} />
            </button>

            {/* Image */}
            <div
                className="relative max-w-[95vw] max-h-[80vh] flex items-center justify-center z-10"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    alt="Full size preview"
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                />
            </div>
        </div>
    );
}
