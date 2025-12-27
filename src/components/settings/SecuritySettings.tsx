import { useState } from "react";
import { postApi } from "@/lib/api";
import { KeyIcon } from "@heroicons/react/24/outline";

interface SecuritySettingsProps {
    showMessage: (type: 'success' | 'error', text: string) => void;
}

export default function SecuritySettings({ showMessage }: SecuritySettingsProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showMessage('error', "Yeni şifreler eşleşmiyor!");
            return;
        }
        try {
            await postApi("/users/me", { currentPassword, newPassword });
            showMessage('success', "Şifre başarıyla güncellendi!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            showMessage('error', err.message || "Şifre güncellenirken bir hata oluştu.");
        }
    };

    return (
        <section className="max-w-2xl">
            <h2 className="text-xl font-bold mb-1 flex items-center">
                <KeyIcon className="w-6 h-6 mr-2 text-[var(--app-global-link-color)]" />
                Güvenlik ve Şifre
            </h2>
            <p className="text-gray-500 text-sm mb-6">Hesabınızın güvenliği için güçlü bir şifre kullanın.</p>

            <form onSubmit={handleUpdatePassword} className="space-y-6 bg-[var(--app-card-bg)] p-6 rounded-2xl border border-theme-border">
                <div>
                    <label className="block text-sm font-medium text-theme-text-secondary mb-2">Mevcut Şifre</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[var(--app-body-bg)] border border-theme-border rounded-lg px-4 py-3 text-theme-text focus:outline-none focus:border-[var(--app-global-link-color)] transition-colors"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-theme-text-secondary mb-2">Yeni Şifre</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[var(--app-body-bg)] border border-theme-border rounded-lg px-4 py-3 text-theme-text focus:outline-none focus:border-[var(--app-global-link-color)] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-theme-text-secondary mb-2">Yeni Şifre (Tekrar)</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-[var(--app-body-bg)] border border-theme-border rounded-lg px-4 py-3 text-theme-text focus:outline-none focus:border-[var(--app-global-link-color)] transition-colors"
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-[var(--app-global-link-color)] text-white font-semibold rounded-full hover:brightness-90 transition-colors">
                        Şifreyi Değiştir
                    </button>
                </div>
            </form>
        </section>
    );
}
