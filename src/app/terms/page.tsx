import SecondaryLayout from "@/components/SecondaryLayout";
import GlobalHeader from "@/components/GlobalHeader";
import { getPage } from '@/lib/pageContent';
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kullanım Şartları | Riskbudur",
    description: "Riskbudur Kullanım Şartları",
};

import { sanitizeHtml } from "@/lib/sanitize";

export default async function TermsPage() {
    const page = await getPage('terms');

    return (
        <SecondaryLayout>
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
