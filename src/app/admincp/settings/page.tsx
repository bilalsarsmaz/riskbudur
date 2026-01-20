"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdmSecondaryLayout from "@/components/AdmSecondaryLayout";
import GlobalHeader from "@/components/GlobalHeader";
import { IconDeviceDesktopAnalytics } from "@tabler/icons-react";
import { fetchApi } from "@/lib/api";
import { hasPermission, Permission, Role } from "@/lib/permissions";

export default function SettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoSuccess, setLogoSuccess] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const me = await fetchApi("/users/me");
                if (me) {
                    if (!hasPermission(me.role as Role, Permission.MANAGE_SETTINGS)) {
                        router.push("/admincp");
                        return;
                    }
                }
            } catch (e) { }
            fetchSettings();
        };
        checkAuth();
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

    const updateSetting = async (key: string, value: string) => {
        const oldValue = settings[key];

        // Optimistic update
        setSettings(prev => ({ ...prev, [key]: value }));

        try {
            const token = localStorage.getItem("token");
            await fetch("/api/admin/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ key, value })
            });
        } catch (error) {
            console.error("Update failed", error);
            // Revert on error
            setSettings(prev => ({ ...prev, [key]: oldValue || "" }));
        }
    };

    const toggleSetting = (key: string, currentValue: boolean) => {
        const newValue = !currentValue;
        updateSetting(key, String(newValue));
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
                    <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden mb-6">
                        <div className="p-4 border-b border-gray-800">
                            <h3 className="font-bold text-white mb-1">Site Logosu</h3>
                            <p className="text-sm text-gray-400">
                                Sol menü ve mobil üst kısımda görünecek logo. (Önerilen: Kare, Şeffaf PNG)
                            </p>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-800 p-2 rounded-lg relative">
                                    <img
                                        src={selectedLogo ? URL.createObjectURL(selectedLogo) : (settings["site_logo"] || "/riskbudurlogo.png?v=2")}
                                        alt="Logo Preview"
                                        className="w-16 h-16 object-contain"
                                    />
                                    {logoSuccess && (
                                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Yeni Logo Seç
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setSelectedLogo(file);
                                                    setLogoSuccess(false);
                                                }
                                            }}
                                            className="block w-full text-sm text-gray-400
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-600 file:text-white
                                                hover:file:bg-blue-700
                                                cursor-pointer
                                            "
                                        />
                                        {selectedLogo && (
                                            <button
                                                onClick={async () => {
                                                    if (!selectedLogo) return;
                                                    setUploadingLogo(true);
                                                    const formData = new FormData();
                                                    formData.append("file", selectedLogo);

                                                    try {
                                                        const token = localStorage.getItem("token");

                                                        // 1. Upload File
                                                        const uploadRes = await fetch("/api/upload", {
                                                            method: "POST",
                                                            headers: { "Authorization": `Bearer ${token}` },
                                                            body: formData
                                                        });

                                                        if (!uploadRes.ok) throw new Error("Upload failed");
                                                        const uploadData = await uploadRes.json();
                                                        const logoUrl = uploadData.url;

                                                        // 2. Save Setting
                                                        setSettings(prev => ({ ...prev, "site_logo": logoUrl }));
                                                        await fetch("/api/admin/settings", {
                                                            method: "PUT",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                                "Authorization": `Bearer ${token}`
                                                            },
                                                            body: JSON.stringify({ key: "site_logo", value: logoUrl })
                                                        });

                                                        setLogoSuccess(true);
                                                        setSelectedLogo(null);

                                                    } catch (error) {
                                                        console.error("Logo upload error:", error);
                                                        alert("Logo yüklenirken bir hata oluştu.");
                                                    } finally {
                                                        setUploadingLogo(false);
                                                    }
                                                }}
                                                disabled={uploadingLogo}
                                                className={`px-4 py-2 rounded-full font-bold text-white transition-colors flex items-center gap-2 ${uploadingLogo ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                                    }`}
                                            >
                                                {uploadingLogo ? 'Yükleniyor...' : 'Kaydet'}
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Dosyayı seçtikten sonra "Kaydet" butonuna basmayı unutmayın.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

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
                                    Sağ menü ve çeşitli alanlarda "Popüler Postlar" kaydırıcısını aktif eder.
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

                        {/* Setting Item: Modern Trending UI */}
                        <div className="p-4 flex items-center justify-between border-b border-gray-800 last:border-0 hover:bg-[#151515] transition-colors">
                            <div>
                                <h3 className="font-bold text-white mb-1">Modern Gündem Kutuları</h3>
                                <p className="text-sm text-gray-400">
                                    WEB görünümündeki gündem bölümünde bulunan hashtag kutusunu aktif ederseniz, görünümü modern etiketler olarak gözükecektir.
                                </p>
                            </div>
                            <div className="pl-4">
                                <ToggleSwitch
                                    checked={settings["modern_trending_ui"] === "true"}
                                    onChange={() => toggleSetting("modern_trending_ui", settings["modern_trending_ui"] === "true")}
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
