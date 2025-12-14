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
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 animate-fade-in"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all text-white z-[10000]"
                aria-label="Close"
            >
                <IconX size={24} />
            </button>

            {/* Image */}
            <div
                className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    alt="Full size preview"
                    className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
                />
            </div>
        </div>
    );
}
