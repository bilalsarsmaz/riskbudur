"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postApi } from "@/lib/api";

export default function ContactHelpButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleHelpClick = async () => {
        setIsLoading(true);

        // Check if we are on the help subdomain
        const isHelpSubdomain = window.location.hostname.startsWith('help.');

        if (isHelpSubdomain) {
            // Redirect to main domain with trigger param
            if (window.location.hostname.includes('localhost')) {
                window.location.href = 'http://localhost:3000/home?trigger_help=1';
            } else {
                window.location.href = 'https://riskbudur.net/home?trigger_help=1';
            }
            return;
        }

        // If on main domain, post directly
        try {
            await postApi("/posts", {
                content: "Benim kafam çok karışık. Yardımına ihtiyacım var çünkü ben bir malım. @RiskBudur"
            });
            router.push("/home");
        } catch (error) {
            console.error("Help post failed:", error);
            router.push("/home");
        } finally {
            setIsLoading(false);
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
