"use client";
import { useState } from "react";
import { postApi } from "@/lib/api";
import { CheckBadgeIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";

export default function VerificationPage() {
    const router = useRouter();
    const [verificationFullName, setVerificationFullName] = useState("");
    const [verificationCategory, setVerificationCategory] = useState("media");
    const [verificationText, setVerificationText] = useState("");
    const [verificationImage, setVerificationImage] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVerificationImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVerificationRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await postApi("/verification-requests", {
                fullName: verificationFullName,
                category: verificationCategory,
                description: verificationText,
                identityImage: verificationImage
            });
            setIsSubmitted(true);
            setMessage({ type: 'success', text: "Başvurunuz alındı! İncelendikten sonra size dönüş yapılacaktır." });
            setVerificationFullName("");
            setVerificationText("");
            setVerificationImage(null);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Başvuru sırasında hata oluştu." });
        }
    };

    return (
        <div className="flex flex-col min-h-full bg-[var(--app-body-bg)] text-[var(--app-body-text)]">
            <GlobalHeader
                title="Onaylanmış Hesap"
                showBackButton={true}
                className="bg-[var(--app-header-bg)] border-b border-[var(--app-border)]"
            />

            <div className="p-4 md:p-8 max-w-2xl">
                <p className="text-[var(--app-subtitle)] text-sm mb-6 flex items-center">
                    <CheckBadgeIcon className="w-5 h-5 mr-2 text-[var(--app-global-link-color)]" />
                    Topluluk tarafından tanınan bir kişi veya markaysanız onay rozeti alabilirsiniz.
                </p>

                {message && (
                    <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleVerificationRequest} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[var(--app-subtitle)] mb-2">Gerçek İsim ve Soyisim</label>
                        <input
                            type="text"
                            required
                            value={verificationFullName}
                            onChange={(e) => setVerificationFullName(e.target.value)}
                            placeholder="Kimlikte yazan isminiz"
                            className="w-full bg-[var(--app-body-bg)] border border-[var(--app-border)] rounded text-[var(--app-body-text)] px-3 py-3 focus:outline-none focus:border-[var(--app-global-link-color)] focus:ring-1 focus:ring-[var(--app-global-link-color)] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--app-subtitle)] mb-2">Kategori</label>
                        <div className="relative">
                            <select
                                value={verificationCategory}
                                onChange={(e) => setVerificationCategory(e.target.value)}
                                className="w-full bg-[var(--app-body-bg)] border border-[var(--app-border)] rounded text-[var(--app-body-text)] px-3 py-3 appearance-none focus:outline-none focus:border-[var(--app-global-link-color)] focus:ring-1 focus:ring-[var(--app-global-link-color)] transition-colors"
                            >
                                <option value="media">Medya ve Haberler</option>
                                <option value="brand">Marka ve İşletme</option>
                                <option value="creator">İçerik Üreticisi</option>
                                <option value="entertainment">Eğlence</option>
                                <option value="other">Diğer</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                <ChevronRightIcon className="w-5 h-5 text-[var(--app-subtitle)] rotate-90" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--app-subtitle)] mb-2">Neden onaylanmalısınız?</label>
                        <textarea
                            required
                            value={verificationText}
                            onChange={(e) => setVerificationText(e.target.value)}
                            placeholder="Bize kendinizden veya markanızdan kısaca bahsedin..."
                            className="w-full bg-[var(--app-body-bg)] border border-[var(--app-border)] rounded text-[var(--app-body-text)] px-3 py-3 min-h-[100px] focus:outline-none focus:border-[var(--app-global-link-color)] focus:ring-1 focus:ring-[var(--app-global-link-color)] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--app-subtitle)] mb-2">Kimlik Fotoğrafı veya Belge</label>
                        <div className="border border-dashed border-[var(--app-border)] rounded-lg p-6 flex flex-col items-center justify-center bg-[var(--app-body-bg)] hover:bg-[var(--app-card-hover)] transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={handleImageChange}
                                required={!verificationImage}
                            />
                            {verificationImage ? (
                                <div className="relative w-full h-32">
                                    <img src={verificationImage} alt="Preview" className="w-full h-full object-contain rounded" />
                                    <p className="text-center text-xs text-green-500 mt-2">Görsel seçildi</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-[var(--app-border)] rounded-full flex items-center justify-center mb-3">
                                        <svg className="w-6 h-6 text-[var(--app-subtitle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <p className="text-[var(--app-subtitle)] text-sm">Fotoğraf yüklemek için tıklayın</p>
                                    <p className="text-[var(--app-subtitle)] opacity-70 text-xs mt-1">Sadece PNG, JPG.</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-[var(--app-border)]">
                        <button
                            type="submit"
                            disabled={isSubmitted}
                            className={`px-6 py-2.5 font-bold rounded-full transition-colors ${isSubmitted ? 'bg-green-600 text-white cursor-default' : 'bg-[var(--app-global-link-color)] text-white hover:opacity-90'}`}
                        >
                            {isSubmitted ? "Başarılı! ✅" : "Başvuruyu Gönder"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
