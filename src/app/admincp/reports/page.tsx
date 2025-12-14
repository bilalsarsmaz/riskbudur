"use client";

import AdmStandardPageLayout from "@/components/AdmStandardPageLayout";
import AdminSidebar from "@/components/AdminSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import { IconAlertCircle } from "@tabler/icons-react";

export default function AdminReportsPage() {
    return (
        <AdmStandardPageLayout sidebarContent={<AdminSidebar />}>
            <GlobalHeader title="Şikayetler" subtitle="Kimler İspiyonlanmış?" />
            <div className="p-4">
                <div className="text-center py-12">
                    <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--app-surface)' }}>
                        <IconAlertCircle className="w-8 h-8" style={{ color: 'var(--app-subtitle)' }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--app-body-text)' }}>Henüz şikayet yok</h3>
                    <p style={{ color: 'var(--app-subtitle)' }}>Şikayet edilen içerikler burada listelenecek.</p>
                </div>
            </div>
        </AdmStandardPageLayout>
    );
}
