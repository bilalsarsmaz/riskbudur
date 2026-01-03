"use client";

import { useState, useEffect } from "react";
import AdmSecondaryLayout from "@/components/AdmSecondaryLayout";
import GlobalHeader from "@/components/GlobalHeader";
import { IconDeviceDesktopAnalytics } from "@tabler/icons-react";

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/settings", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSetting = async (key: string, currentValue: boolean) => {
        const newValue = !currentValue;

        // Optimistic update
        setSettings(prev => ({ ...prev, [key]: String(newValue) }));

        try {
            const token = localStorage.getItem("token");
            await fetch("/api/admin/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ key, value: String(newValue) })
            });
        } catch (error) {
            console.error("Update failed", error);
            // Revert on error
            setSettings(prev => ({ ...prev, [key]: String(currentValue) }));
        }
    };

    const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
        <button
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-green-500' : 'bg-gray-700'
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );

    const isTimelineTabsEnabled = settings["enable_timeline_tabs"] !== "false"; // Default true if not set

    return (
        <AdmSecondaryLayout>
            <GlobalHeader title="Ayarlar" subtitle="Sistem yapılandırması" />

            <div className="p-4 text-[var(--app-body-text)]">

                {/* General Settings Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <IconDeviceDesktopAnalytics size={24} className="text-blue-500" />
                        Genel Özellikler
                    </h2>

                    <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">

                        {/* Setting Item: Timeline Tabs */}
                        <div className="p-4 flex items-center justify-between border-b border-gray-800 last:border-0 hover:bg-[#151515] transition-colors">
                            <div>
                                <h3 className="font-bold text-white mb-1">Zaman Tüneli Sekmelerini Göster</h3>
                                <p className="text-sm text-gray-400">
                                    Ana sayfada "Senin İçin" ve "Takip Ettiklerin" sekmelerini aktif eder.
                                    Kapatılırsa sadece varsayılan akış görünür.
                                </p>
                            </div>
                            <div className="pl-4">
                                <ToggleSwitch
                                    checked={isTimelineTabsEnabled}
                                    onChange={() => toggleSetting("enable_timeline_tabs", isTimelineTabsEnabled)}
                                />
                            </div>
                        </div>


                        {/* Setting Item: Popular Posts */}
                        <div className="p-4 flex items-center justify-between border-b border-gray-800 last:border-0 hover:bg-[#151515] transition-colors">
                            <div>
                                <h3 className="font-bold text-white mb-1">Popüler Postlar Bölümünü Göster</h3>
                                <p className="text-sm text-gray-400">
                                    Sağ menüde ve çeşitli alanlarda "Popüler Postlar" kaydırıcısını aktif eder.
                                </p>
                            </div>
                            <div className="pl-4">
                                <ToggleSwitch
                                    checked={settings["enable_popular_posts"] !== "false"}
                                    onChange={() => toggleSetting("enable_popular_posts", settings["enable_popular_posts"] !== "false")}
                                />
                            </div>
                        </div>


                        {/* Setting Item: Anonymous Posting */}
                        <div className="p-4 flex items-center justify-between border-b border-gray-800 last:border-0 hover:bg-[#151515] transition-colors">
                            <div>
                                <h3 className="font-bold text-white mb-1">Anonim Gönderi Oluşturma</h3>
                                <p className="text-sm text-gray-400">
                                    Kullanıcıların anonim olarak içerik paylaşmasına izin verir.
                                    Kapatılırsa gönderi oluştururken anonim seçeneği gizlenir.
                                </p>
                            </div>
                            <div className="pl-4">
                                <ToggleSwitch
                                    checked={settings["enable_anonymous_posting"] !== "false"}
                                    onChange={() => toggleSetting("enable_anonymous_posting", settings["enable_anonymous_posting"] !== "false")}
                                />
                            </div>
                        </div>

                        {/* More settings can be added here */}

                    </div>
                </div>

                {loading && (
                    <div className="text-center text-gray-500 py-4">Ayarlar yükleniyor...</div>
                )}
            </div>
        </AdmSecondaryLayout>
    );
}
