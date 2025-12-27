import { useState } from "react";
import { postApi } from "@/lib/api";
import { CheckBadgeIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface VerificationSettingsProps {
    showMessage: (type: 'success' | 'error', text: string) => void;
}

export default function VerificationSettings({ showMessage }: VerificationSettingsProps) {
    const [verificationFullName, setVerificationFullName] = useState("");
    const [verificationCategory, setVerificationCategory] = useState("media");
    const [verificationText, setVerificationText] = useState("");
    const [verificationImage, setVerificationImage] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

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
            showMessage('success', "Başvurunuz alındı! İncelendikten sonra size dönüş yapılacaktır.");
            setVerificationFullName("");
            setVerificationText("");
            setVerificationImage(null);
        } catch (err: any) {
            showMessage('error', err.message || "Başvuru sırasında hata oluştu.");
        }
    };

    return (
        <section className="max-w-2xl">
            <h2 className="text-xl font-bold mb-1 flex items-center">
                <CheckBadgeIcon className="w-6 h-6 mr-2 text-blue-500" />
                Onaylanmış Hesap (Mavi Tik)
            </h2>
            <p className="text-gray-500 text-sm mb-6">Topluluk tarafından tanınan bir kişi veya markaysanız onay rozeti alabilirsiniz.</p>

            <form onSubmit={handleVerificationRequest} className="space-y-6 bg-gradient-to-br from-[var(--app-card-bg)] to-blue-900/10 p-6 rounded-2xl border border-blue-900/30">
                <div>
                    <label className="block text-sm font-medium text-theme-text-secondary mb-2">Gerçek İsim ve Soyisim</label>
                    <input
                        type="text"
                        required
                        value={verificationFullName}
                        onChange={(e) => setVerificationFullName(e.target.value)}
                        placeholder="Kimlikte yazan isminiz"
                        className="w-full bg-[var(--app-body-bg)] border border-theme-border rounded-lg px-4 py-3 text-theme-text focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-theme-text-secondary mb-2">Kategori</label>
                    <div className="relative">
                        <select
                            value={verificationCategory}
                            onChange={(e) => setVerificationCategory(e.target.value)}
                            className="w-full bg-[var(--app-body-bg)] border border-theme-border rounded-lg px-4 py-3 text-theme-text appearance-none focus:outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="media">Medya ve Haberler</option>
                            <option value="brand">Marka ve İşletme</option>
                            <option value="creator">İçerik Üreticisi</option>
                            <option value="entertainment">Eğlence</option>
                            <option value="other">Diğer</option>
                        </select>
                        <ChevronRightIcon className="w-5 h-5 absolute right-4 top-3.5 text-gray-500 rotate-90 pointer-events-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-theme-text-secondary mb-2">Neden onaylanmalısınız?</label>
                    <textarea
                        required
                        value={verificationText}
                        onChange={(e) => setVerificationText(e.target.value)}
                        placeholder="Bize kendinizden veya markanızdan kısaca bahsedin..."
                        className="w-full bg-[var(--app-body-bg)] border border-theme-border rounded-lg px-4 py-3 text-theme-text min-h-[100px] focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-theme-text-secondary mb-2">Kimlik Fotoğrafı veya Belge</label>
                    <div className="border border-dashed border-theme-border rounded-lg p-6 flex flex-col items-center justify-center bg-[var(--app-body-bg)] hover:bg-[var(--app-bg-hover)] transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept="image/*"
                            onChange={handleImageChange}
                            required
                        />
                        {verificationImage ? (
                            <div className="relative w-full h-32">
                                <img src={verificationImage} alt="Preview" className="w-full h-full object-contain rounded" />
                                <p className="text-center text-xs text-green-500 mt-2">Görsel seçildi</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center mb-3">
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                                <p className="text-gray-400 text-sm">Fotoğraf yüklemek için tıklayın</p>
                                <p className="text-gray-600 text-xs mt-1">Sadece PNG, JPG.</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitted}
                        className={`px-6 py-2 font-semibold rounded-full transition-colors shadow-lg ${isSubmitted ? 'bg-green-600 text-white cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/20'}`}
                    >
                        {isSubmitted ? "Başarılı! ✅" : "Başvuruyu Gönder"}
                    </button>
                </div>
            </form>
        </section>
    );
}
