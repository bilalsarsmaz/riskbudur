"use client";

import { useEffect } from "react";

export default function ThemeInitializer() {
    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light' || savedTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', savedTheme);
            } else {
                // Default to dark if nothing saved
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        } catch (e) {
            console.error("Theme initialization error:", e);
        }
    }, []);

    return null; // This component renders nothing
}
