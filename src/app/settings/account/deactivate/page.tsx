"use client";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function DeactivatePage() {
    const handleDeactivateAccount = async () => {
        if (window.confirm("Hesabınızı devre dışı bırakmak istediğinizden emin misiniz?")) {
            alert("Hesap devre dışı bırakma özelliği yakında aktif olacak.");
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-2xl">
            <h2 className="text-xl font-bold mb-1 flex items-center text-red-500">
                <ExclamationTriangleIcon className="w-6 h-6 mr-2" />
                Hesabı Devre Dışı Bırak
            </h2>
            <p className="text-gray-500 text-sm mb-6">Tehlikeli Bölge</p>

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
        </div>
    );
}
