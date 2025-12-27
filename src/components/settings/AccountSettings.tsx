import { useState, useEffect } from "react";
import { postApi } from "@/lib/api";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

interface AccountSettingsProps {
    user: any;
    showMessage: (type: 'success' | 'error', text: string) => void;
}

export default function AccountSettings({ user, showMessage }: AccountSettingsProps) {
    const [fullName, setFullName] = useState("");
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [gender, setGender] = useState("unspecified");
    const [birthday, setBirthday] = useState("");

    useEffect(() => {
        if (user) {
            setFullName(user.fullName || "");
            setNickname(user.nickname || "");
            setEmail(user.email || "");
            setGender(user.gender || "unspecified");
            setBirthday(user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : "");
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await postApi("/users/me", {
                fullName,
                nickname,
                email,
                gender,
                birthday: birthday || null
            });
            showMessage('success', "Hesap bilgileri güncellendi!");
        } catch (err: any) {
            showMessage('error', err.message || "Güncelleme sırasında hata oluştu.");
        }
    };

    return (
        <section className="max-w-2xl">
            <h2 className="text-xl font-bold mb-1 flex items-center">
                Hesap Bilgileri
            </h2>
            <p className="text-gray-500 text-sm mb-6">Temel hesap bilgilerinizi buradan yönetebilirsiniz.</p>

            <form onSubmit={handleUpdateProfile} className="space-y-6 bg-[var(--app-card-bg)] p-6 rounded-2xl border border-theme-border">
                <div>
                    <label className="block text-sm font-medium text-theme-text-secondary mb-2">Tam Adınız</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ad Soyad"
                        className="w-full bg-[var(--app-body-bg)] border border-theme-border rounded-lg px-4 py-3 text-theme-text focus:outline-none focus:border-[var(--app-global-link-color)] transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-theme-text-secondary mb-2">Kullanıcı Adı</label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full bg-[var(--app-body-bg)] border border-theme-border rounded-lg px-4 py-3 text-theme-text focus:outline-none focus:border-[var(--app-global-link-color)] transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-theme-text-secondary mb-2">E-posta Adresi</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[var(--app-body-bg)] border border-theme-border rounded-lg px-4 py-3 text-theme-text focus:outline-none focus:border-[var(--app-global-link-color)] transition-colors"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-theme-text-secondary mb-2">Cinsiyet</label>
                        <div className="relative">
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full bg-[var(--app-body-bg)] border border-theme-border rounded-lg px-4 py-3 text-theme-text appearance-none focus:outline-none focus:border-[var(--app-global-link-color)] transition-colors"
                            >
                                <option value="unspecified">Belirtmek İstemiyorum</option>
                                <option value="male">Erkek</option>
                                <option value="female">Kadın</option>
                                <option value="other">Diğer</option>
                            </select>
                            <ChevronRightIcon className="w-5 h-5 absolute right-4 top-3.5 text-gray-500 rotate-90 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-theme-text-secondary mb-2">Doğum Günü</label>
                        <input
                            type="date"
                            value={birthday}
                            onChange={(e) => setBirthday(e.target.value)}
                            className="w-full bg-[var(--app-body-bg)] border border-theme-border rounded-lg px-4 py-3 text-theme-text focus:outline-none focus:border-[var(--app-global-link-color)] transition-colors [color-scheme:dark]"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors">
                        Bilgileri Güncelle
                    </button>
                </div>
            </form>
        </section>
    );
}
