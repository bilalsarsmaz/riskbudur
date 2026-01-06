
"use client";

import { useEffect } from "react";
import { fetchApi } from "@/lib/api";

export default function BanChecker() {
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const checkStatus = async () => {
            // Don't check if tab is hidden (save server resources)
            if (typeof document !== 'undefined' && document.hidden) {
                return;
            }

            // Don't check on public paths
            const pathname = window.location.pathname;
            if (['/', '/login', '/register'].includes(pathname) || pathname.startsWith('/help')) {
                return;
            }

            try {
                await fetchApi('/auth/status');
            } catch (error) {
                // Ignore errors
            }
        };

        // Check every 30 seconds (down from 10s)
        const startPolling = () => {
            checkStatus(); // Initial check
            timeoutId = setInterval(checkStatus, 30000);
        };

        // Handle visibility changes
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // User left tab -> Stop polling to save server
                clearInterval(timeoutId);
            } else {
                // User came back -> Check immediately and restart polling
                checkStatus();
                clearInterval(timeoutId); // Clear just in case
                timeoutId = setInterval(checkStatus, 30000);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Start initial
        startPolling();

        return () => {
            clearInterval(timeoutId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    return null;
}
