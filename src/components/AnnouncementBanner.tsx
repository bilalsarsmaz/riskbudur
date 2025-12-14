
"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import FormattedText from "@/components/FormattedText";
import { IconSpeakerphone } from "@tabler/icons-react";

type Announcement = {
    id: string;
    content: string;
    isActive: boolean;
};

export default function AnnouncementBanner() {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);

    useEffect(() => {
        const fetchAnnouncement = async () => {
            try {
                const data = await fetchApi("/announcements/active");
                if (data && data.isActive) {
                    setAnnouncement(data);
                } else {
                    setAnnouncement(null);
                }
            } catch (error) {
                console.error("Duyuru çekilemedi:", error);
            }
        };

        fetchAnnouncement();
    }, []);

    if (!announcement) return null;

    return (
        <div className="w-full border-b border-theme-border bg-theme-bg/80 backdrop-blur-md">
            <div className="px-4 py-3">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold leading-tight" style={{ color: 'var(--app-body-text)' }}>Duyuru</h2>
                        <span className="text-[13px]" style={{ color: 'var(--app-subtitle)' }}>Riskbudur Yönetimi</span>
                    </div>
                    <IconSpeakerphone className="w-7 h-7 text-[var(--app-global-link-color)]" />
                </div>
                <FormattedText text={announcement.content} className="text-[var(--app-body-text)] text-[15px] leading-relaxed whitespace-pre-wrap" />
            </div>
        </div>
    );
}
