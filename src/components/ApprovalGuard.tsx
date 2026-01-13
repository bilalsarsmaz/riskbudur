"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi } from "@/lib/api";

export default function ApprovalGuard() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Hangi sayfalarda kontrol YAPILMAMALI?
        const publicPaths = [
            "/login",
            "/register",
            // "/pending-approval", // Burası artık kontrol edilmeli ki onaylanınca çıksınlar
            "/setup",
            "/forgot-password",
            "/" // Landing page
        ];

        // Eğer public bir sayfadaysak veya admin panelindeysek kontrol etme (Admin paneli kendi korumasına sahip)
        if (publicPaths.includes(pathname) || pathname.startsWith("/admincp") || pathname.startsWith("/admin")) {
            return;
        }

        const checkApproval = async () => {
            try {
                // Kullanıcı durumunu çek
                const user = await fetchApi("/users/me");

                if (!user) {
                    // Kullanıcı giriş yapmamışsa zaten Auth guardlar veya API 401 halleder
                    // Ama yine de login'e atmak isterseniz:
                    // router.push("/login");
                    return;
                }

                // Eğer kullanıcı onaylı DEĞİLSE ve Setup'ı bitmişse -> Bekleme sayfasına
                if (!user.isApproved && user.isSetupComplete) {
                    router.push("/pending-approval");
                }
            } catch (error) {
                // Hata durumunda (örneğin 401) bir şey yapma, diğer mekanizmalar halleder
            }
        };

        checkApproval();

        // Periyodik kontrol gerekirse eklenebilir ama sayfa geçişlerinde kontrol yeterli olabilir
        // Ancak SPA (Single Page App) olduğu için sayfa içi gezinmelerde bu effect tetiklenir (pathname dependency)

    }, [pathname, router]);

    return null; // Görünür bir UI yok
}
