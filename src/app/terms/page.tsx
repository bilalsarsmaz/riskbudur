"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import SecondaryLayout from "@/components/SecondaryLayout";
import GlobalHeader from "@/components/GlobalHeader";
import HelpSidebar from "@/components/HelpSidebar";
import { sanitizeHtml } from "@/lib/sanitize";

export default function TermsPage() {
    const [page, setPage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPage() {
            try {
                const response = await fetch('/api/pages/terms');
                if (response.ok) {
                    const data = await response.json();
                    setPage(data);
                }
            } catch (error) {
                console.error('Error fetching page:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchPage();
    }, []);

    if (loading) {
        return (
            <SecondaryLayout>
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                </div>
            </SecondaryLayout>
        );
    }

    if (!page) {
        notFound();
    }

    return (
        <SecondaryLayout sidebarContent={<HelpSidebar />}>
            <GlobalHeader title={page?.title || 'Kullanım Şartları'} subtitle={page?.subtitle} showBackButton={true} />
            <div className="p-4 static-page-content max-w-none text-[15px] leading-relaxed">
                {page ? (
                    <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }} />
                ) : (
                    <p>İçerik bulunamadı.</p>
                )}
            </div>
        </SecondaryLayout>
    );
}
