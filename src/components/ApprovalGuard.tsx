"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { IconLockAccess } from "@tabler/icons-react";

export default function ApprovalGuard({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isApproved, setIsApproved] = useState<boolean | null>(null);
    const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    // Whitelisted paths that don't need approval check
    const publicPaths = ["/login", "/register", "/", "/api"];
    const setupPath = "/setup";

    useEffect(() => {
        // If public path, skip check (but wait, "/" might be the landing which is public)
        // Actually, if user is NOT logged in, this guard shouldn't block public pages.
        // Assuming auth is handled elsewhere or we check for token first.

        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        // If path starts with /admincp, we assume admin check handles it (admins are likely approved)
        if (pathname?.startsWith("/admincp")) {
            setLoading(false);
            return;
        }

        const checkApproval = async () => {
            try {
                const user = await fetchApi("/users/me");
                if (user) {
                    setIsApproved(user.isApproved);
                    setIsSetupComplete(user.isSetupComplete);
                } else {
                    // Token invalid?
                    setIsApproved(false);
                }
            } catch (e) {
                console.error("Approval check failed", e);
            } finally {
                setLoading(false);
            }
        };

        checkApproval();
    }, [pathname]);

    // If loading or no token (public access), render children
    // Note: If no token, we rely on other guards for protected pages.
    if (loading) {
        return <div className="min-h-screen bg-black" />; // Prevent flash
    }

    if (isApproved === null && !localStorage.getItem("token")) {
        return <>{children}</>;
    }

    // 1. ENFORCE SETUP: If approved but setup not complete -> Force /setup
    // But check if we are already on /setup to facilitate the process
    if (isApproved && isSetupComplete === false) {
        if (pathname !== setupPath) {
            router.push(setupPath);
            return <div className="min-h-screen bg-black flex items-center justify-center text-white">Kuruluma Yönlendiriliyor...</div>;
        }
        return <>{children}</>;
    }

    // 2. BLOCK SETUP: If setup is complete -> Block /setup
    if (isSetupComplete === true && pathname === setupPath) {
        router.push("/home");
        return <div className="min-h-screen bg-black flex items-center justify-center text-white">Yönlendiriliyor...</div>;
    }

    // 3. APPROVAL CHECK
    if (isApproved === true) {
        return <>{children}</>;
    }

    // If NOT approved
    // Allow setup page? No, they must be approved first.
    // If they are not approved, they can't do setup.

    // Allow public paths if logic flows here (though specific checks might be needed)
    if (publicPaths.some(p => pathname === p || pathname?.startsWith("/api") || pathname?.startsWith("/help"))) {
        return <>{children}</>;
    }

    // BLOCK ACCESS
    const handleLogout = () => {
        localStorage.removeItem("token");
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        router.push("/login");
    };

    return (
        <div className="relative min-h-screen">
            {/* Background (Blurred Content) */}
            <div className="absolute inset-0 filter blur-xl opacity-30 pointer-events-none overflow-hidden" aria-hidden="true">
                {children}
            </div>

            {/* Overlay */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-500">
                <div className="bg-[#111] border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                    <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-800">
                        <IconLockAccess size={40} className="text-[#DC5F00]" />
                    </div>

                    <h2 className="text-2xl font-bold mb-3 text-white">Hesabınız Oluşturuldu</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        Kaydınız başarıyla alındı. Hesabınız şu an <strong>yönetici onayı</strong> beklemektedir. Onaylandıktan sonra giriş yapabilirsiniz.
                    </p>

                    <button
                        onClick={handleLogout}
                        className="w-full py-3 bg-[#DC5F00] text-white rounded-xl font-bold hover:bg-[#b04c00] transition-all transform active:scale-95"
                    >
                        Tamam, Çıkış Yap
                    </button>
                </div>
            </div>
        </div>
    );
}
