import SecondaryLayout from "@/components/SecondaryLayout";
import GlobalHeader from "@/components/GlobalHeader";
import { getPage } from '@/lib/pageContent';
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kullanım Şartları | Riskbudur",
    description: "Riskbudur Kullanım Şartları",
};

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { sanitizeHtml } from "@/lib/sanitize";

export default async function TermsPage() {
    const page = await getPage('terms');
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // Verify validity of the token and check if user actually exists
    const isTokenPresent = !!token;
    console.log(`[TermsPage] Token Present: ${isTokenPresent}, Is Authenticated: ${isAuthenticated}`);
    if (token) {
        const decoded = await verifyToken(token);
        if (decoded?.userId) {
            // Optional: You could check DB here if you want to be 100% sure user isn't deleted/banned
            // const dbUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
            // isAuthenticated = !!dbUser;

            // For now, let's assume valid token signature is enough, OR 
            // if we are seeing 401s, maybe the cookie is valid but the user ID is wrong?
            // Let's force a DB check since the user reported an issue.

            try {
                const prisma = (await import("@/lib/prisma")).default;
                const dbUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
                isAuthenticated = !!dbUser;
            } catch (e) {
                console.error("User check failed", e);
                isAuthenticated = false;
            }
        }
    }

    return (
        <SecondaryLayout
            showLeftSidebar={isAuthenticated}
            hideMobileElements={!isAuthenticated}
        >
            <GlobalHeader title={page?.title || 'Kullanım Şartları'} subtitle={page?.subtitle} showBackButton={true} />
            <div className="p-4 static-page-content">
                {page ? (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }} />
                ) : (
                    <p>İçerik bulunamadı.</p>
                )}
            </div>
        </SecondaryLayout>
    );
}
