"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postApi } from "@/lib/api";

export default function ContactHelpButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleHelpClick = async () => {
        setIsLoading(true);
        try {
            // Background post
            await postApi("/posts", {
                content: "Benim kafam çok karışık. Yardımına ihtiyacım var çünkü ben bir malım. @RiskBudur"
            });
            // Redirect immediately (or after post initiates) - User asked for "tiklandigi an... ama arkaplanda da..."
            // To be safe and ensure post goes through, await is strictly better, but fast enough.
            router.push("/home");
        } catch (error) {
            console.error("Help post failed:", error);
            // Redirect anyway? Probably yes.
            router.push("/home");
        } finally {
            // No need to set loading false really as we redirect
        }
    };

    return (
        <div className="mt-8 flex justify-start w-full">
            <button
                onClick={handleHelpClick}
                disabled={isLoading}
                style={{ backgroundColor: "var(--app-global-link-color)", color: "#040404" }}
                className="px-6 py-2 rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? "İşleniyor..." : "Yardım İste"}
            </button>
        </div>
    );
}
