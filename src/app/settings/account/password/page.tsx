"use client";
import { useState } from "react";
import { postApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";

export default function PasswordPage() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "Yeni şifreler eşleşmiyor!" });
            return;
        }
        try {
            await postApi("/users/me", { currentPassword, newPassword });
            setMessage({ type: 'success', text: "Şifre başarıyla güncellendi!" });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Şifre güncellenirken bir hata oluştu." });
        }
    };

    return (
        <div className="flex flex-col min-h-full bg-[var(--app-body-bg)] text-[var(--app-body-text)]">
            <GlobalHeader
                title="Şifreni değiştir"
                showBackButton={true}
                className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)]"
            />

            <div className="p-4 md:p-8 max-w-2xl">
                <p className="text-[var(--app-subtitle)] text-sm mb-6">Hesabının güvenliği için güçlü bir şifre kullan.</p>

                {message && (
                    <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[var(--app-subtitle)] mb-2">Mevcut Şifre</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[var(--app-body-bg)] border border-[var(--app-border)] rounded text-[var(--app-body-text)] px-3 py-3 focus:outline-none focus:border-[var(--app-global-link-color)] focus:ring-1 focus:ring-[var(--app-global-link-color)] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--app-subtitle)] mb-2">Yeni Şifre</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[var(--app-body-bg)] border border-[var(--app-border)] rounded text-[var(--app-body-text)] px-3 py-3 focus:outline-none focus:border-[var(--app-global-link-color)] focus:ring-1 focus:ring-[var(--app-global-link-color)] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--app-subtitle)] mb-2">Yeni Şifre (Tekrar)</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[var(--app-body-bg)] border border-[var(--app-border)] rounded text-[var(--app-body-text)] px-3 py-3 focus:outline-none focus:border-[var(--app-global-link-color)] focus:ring-1 focus:ring-[var(--app-global-link-color)] transition-colors"
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-[var(--app-border)]">
                        <button type="submit" className="px-6 py-2.5 bg-[#eff3f4] text-black font-bold rounded-full hover:opacity-90 transition-colors text-[15px]">
                            Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
