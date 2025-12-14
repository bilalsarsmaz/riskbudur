"use client";

import AdmStandardPageLayout from "@/components/AdmStandardPageLayout";
import AdminSidebar from "@/components/AdminSidebar";
import GlobalHeader from "@/components/GlobalHeader";

export default function AdminBadgesPage() {
    return (
        <AdmStandardPageLayout sidebarContent={<AdminSidebar />}>
            <GlobalHeader title="Rozet Talepleri" subtitle="Popülerite Sevdalıları" />
            <div className="p-4">
                <p>Kullanıcı rozet ve onay talepleri burada listelenecek.</p>
            </div>
        </AdmStandardPageLayout>
    );
}
