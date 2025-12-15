"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from 'js-cookie';

export default function GoogleCallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        const isSetupComplete = searchParams.get("setup") === 'true';

        if (token) {
            // 1. Set LocalStorage
            localStorage.setItem("token", token);

            // 2. Set Cookie (Duplicate safeguard, usually server sets HttpOnly, but client script might need it readable)
            Cookies.set('token', token, { expires: 365 });

            // 3. Redirect
            if (isSetupComplete) {
                router.push("/home");
            } else {
                router.push("/setup");
            }
        } else {
            router.push("/login?error=no_token");
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                <p>Giriş yapılıyor...</p>
            </div>
        </div>
    );
}
