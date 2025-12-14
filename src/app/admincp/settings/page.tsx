
"use client";

import AdmSecondaryLayout from "@/components/AdmSecondaryLayout";
import GlobalHeader from "@/components/GlobalHeader";

export default function SettingsPage() {
    return (
        <AdmSecondaryLayout>
            <GlobalHeader title="Ayarlar" subtitle="Sistem ayarları" />
            <div className="p-4 text-[var(--app-body-text)]">
                <h2 className="text-xl font-bold mb-4">Genel Ayarlar</h2>
                <p className="text-[var(--app-subtitle)]">Ayarlar sayfası yapım aşamasındadır.</p>

                {/* Placeholder for future settings content */}
                <div className="mt-6 p-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)]">
                    <p>Buraya sistem ayarları eklenecek.</p>
                </div>
            </div>
        </AdmSecondaryLayout>
    );
}
