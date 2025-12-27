import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import AccountSettings from "./AccountSettings";
import SecuritySettings from "./SecuritySettings";
import VerificationSettings from "./VerificationSettings";

interface SettingsDetailProps {
    activeCategory: string;
    user: any;
    showMessage: (type: 'success' | 'error', text: string) => void;
}

export default function SettingsDetail({ activeCategory, user, showMessage }: SettingsDetailProps) {
    const handleDeactivateAccount = async () => {
        if (window.confirm("Hesabınızı devre dışı bırakmak istediğinizden emin misiniz?")) {
            showMessage('error', "Hesap devre dışı bırakma özelliği yakında aktif olacak.");
        }
    };

    if (activeCategory === "account") {
        return <AccountSettings user={user} showMessage={showMessage} />;
    }

    if (activeCategory === "security") {
        return <SecuritySettings showMessage={showMessage} />;
    }

    if (activeCategory === "verification") {
        return <VerificationSettings showMessage={showMessage} />;
    }

    if (activeCategory === "danger") {
        return (
            <section className="max-w-2xl">
                <h2 className="text-xl font-bold mb-1 flex items-center text-red-500">
                    <ExclamationTriangleIcon className="w-6 h-6 mr-2" />
                    Tehlikeli Bölge
                </h2>
                <div className="mt-4 bg-red-900/10 border border-red-900/30 p-6 rounded-2xl flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-white">Hesabı Devre Dışı Bırak</h3>
                        <p className="text-sm text-gray-500 mt-1">Bu işlem hesabınızı geçici olarak kapatır.</p>
                    </div>
                    <button
                        onClick={handleDeactivateAccount}
                        className="px-5 py-2 border border-red-800 text-red-500 rounded-lg hover:bg-red-900/20 transition-colors text-sm font-medium"
                    >
                        Devre Dışı Bırak
                    </button>
                </div>
            </section>
        );
    }

    return <div>Seçim yapınız</div>;
}
