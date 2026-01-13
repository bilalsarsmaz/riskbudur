"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from 'js-cookie';

export default function GoogleCallbackHandler() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <Suspense fallback={
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <p>Yükleniyor...</p>
                </div>
            }>
                <GoogleCallbackContent />
            </Suspense>
        </div>
    );
}

function GoogleCallbackContent() {
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

            // 3. Fetch user data to check approval status
            const checkUserStatus = async () => {
                try {
                    const response = await fetch("/api/users/me", {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const user = await response.json();

                        // Redirect based on setup completion and approval status
                        if (!isSetupComplete) {
                            router.push("/setup");
                        } else if (!user.isApproved) {
                            router.push("/pending-approval");
                        } else {
                            router.push("/home");
                        }
                    } else {
                        // If user fetch fails, fallback to old logic
                        if (isSetupComplete) {
                            router.push("/home");
                        } else {
                            router.push("/setup");
                        }
                    }
                } catch (error) {
                    console.error("Error checking user status:", error);
                    // Fallback to old logic
                    if (isSetupComplete) {
                        router.push("/home");
                    } else {
                        router.push("/setup");
                    }
                }
            };

            checkUserStatus();
        } else {
            router.push("/login?error=no_token");
        }
    }, [router, searchParams]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            <p>Giriş yapılıyor...</p>
        </div>
    );
}
