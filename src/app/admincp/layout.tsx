"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Token kontrolü
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                // Profil ve rol kontrolü
                const user = await fetchApi("/users/me");
                const authorizedRoles = ['ADMIN', 'MODERATOR', 'ROOTADMIN'];

                if (user && user.role && authorizedRoles.includes(user.role)) {
                    setIsAuthorized(true);
                } else {
                    router.push("/home"); // Yetkisiz giriş denemesi -> Ana sayfaya
                }
            } catch (error) {
                console.error("Admin yetki kontrolü hatası:", error);
                router.push("/home");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#adc1c6]"></div>
                    <p className="mt-4 text-gray-400">Yetki kontrol ediliyor...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Redirecting...
    }

    return <>{children}</>;
}
