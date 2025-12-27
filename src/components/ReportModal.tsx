"use client";

import { useState } from "react";
import { IconX, IconAlertCircle } from "@tabler/icons-react";
import { postApi } from "@/lib/api";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
}

const reportReasons = [
    {
        id: 'hate',
        label: 'Nefret',
        description: 'İftiralar, ırkçı veya cinsiyetçi stereotipler, canavarlaştırma, korku yayma ya da ayrımcılık yapma, nefret içerikli referanslar, nefret sembol ve logoları'
    },
    {
        id: 'harassment',
        label: 'Taciz',
        description: 'Hakaret, İstenmeyen Cinsel İçerik ve Rahatsız Edici Objeleştirme, İstenmeyen Uygunsuz İçerik ve Rahatsız Edici İçerik, Şiddet Olayı İnkarı, Hedef Gösterici Taciz ve Tacizi Kışkırtma'
    },
    {
        id: 'violence',
        label: 'Şiddet Söylemi',
        description: 'Şiddet İçeren Tehditler, Başkalarının Zarar Görmesini Dileme, Şiddeti Yüceltme, Şiddete Teşvik, İmayla Şiddete Teşvik'
    },
    {
        id: 'child_safety',
        label: 'Çocuk Güvenliği',
        description: 'Çocuk cinsel istismarı, kandırma amacıyla güven kazanma, fiziksel çocuk istismarı, reşit olmayan kullanıcı'
    },
    {
        id: 'privacy',
        label: 'Gizlilik',
        description: 'Gizli bilgi paylaşıyor, gizli bilgileri paylaşmakla/ifşa etmekle tehdit ediyor, rızaya dayalı olmayan mahrem resimler paylaşıyor, platformda olmasını istemediğim görüntülerimi paylaşıyor'
    },
    {
        id: 'illegal',
        label: 'Yasa Dışı ve Düzenlemeye Tabi Davranışlar',
        description: 'İnsan sömürüsü, cinsel hizmetler, uyuşturucu, silah, nesli tükenmekte olan türler, yasa dışı faaliyetlere destek olma'
    },
    {
        id: 'spam',
        label: 'Spam',
        description: 'Sahte etkileşimler, dolandırıcılıklar, sahte hesaplar, kötü amaçlı bağlantılar'
    },
    {
        id: 'self_harm',
        label: 'İntihar veya kendi kendine zarar verme',
        description: 'Kendine zarar vermeye cesaretlendirmek, teşvik etmek, bununla ilgili talimatlar sağlamak veya strateji paylaşmak.'
    },
    {
        id: 'sensitive',
        label: 'Hassas veya rahatsız edici medya',
        description: 'Rahatsız Edici İçerik, Sebepsiz Yere Ürkütücü İçerik, Yetişkinlere Yönelik Çıplaklık ve Cinsel Davranış, Şiddet İçeren Cinsel Davranış, Hayvanlarla Cinsel İlişki ve Nekrofili, Vefat etmiş bir kişiyi tasvir eden medya'
    },
    {
        id: 'impersonation',
        label: 'Taklitçilik',
        description: 'Uyumlu olmayan parodi/hayran hesapları dahil olmak üzere başka birini taklit etme'
    },
    {
        id: 'terror',
        label: 'Şiddet ve nefret yanlısı örgütler',
        description: 'Şiddet içeren aşırılık ve terörizm, nefret grupları ve ağlar'
    },
    {
        id: 'safety',
        label: 'Toplum Güvenliği',
        description: 'Seçimlerde ve diğer sivil süreçlerde seçmen katılımı, baskı veya sindirme ile ilgili yanıltıcı içerik'
    }
];

export default function ReportModal({ isOpen, onClose, postId }: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!selectedReason) return;

        setIsSubmitting(true);
        try {
            const reasonObj = reportReasons.find(r => r.id === selectedReason);
            await postApi("/reports", {
                postId: postId,
                reason: reasonObj?.label,
                details: reasonObj?.description
            });
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setSelectedReason(null);
            }, 2000);
        } catch (error) {
            console.error("Report error:", error);
            alert("Bildirim gönderilirken bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-[#1e1e1e] border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
                    <h2 className="text-xl font-bold text-white">Gönderiyi Bildir</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-800 text-gray-400 transition-colors"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {isSuccess ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                                <IconAlertCircle size={32} className="text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Teşekkürler</h3>
                            <p className="text-gray-400">
                                Bildiriminiz alındı. İçeriği inceleyip gerekeni yapacağız.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-300 mb-6 font-medium">
                                Ne tür bir sorun bildiriyorsun?
                            </p>

                            <div className="space-y-4">
                                {reportReasons.map((item) => (
                                    <label
                                        key={item.id}
                                        className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${selectedReason === item.id
                                                ? 'border-[var(--app-global-link-color)] bg-[var(--app-global-link-color)]/10'
                                                : 'border-gray-800 hover:border-gray-600'
                                            }`}
                                    >
                                        <div className="mt-0.5 mr-3 shrink-0">
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedReason === item.id
                                                    ? 'border-[var(--app-global-link-color)]'
                                                    : 'border-gray-500'
                                                }`}>
                                                {selectedReason === item.id && (
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--app-global-link-color)]" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="radio"
                                                name="reportReason"
                                                value={item.id}
                                                className="hidden"
                                                onChange={() => setSelectedReason(item.id)}
                                            />
                                            <div className="font-bold text-white text-sm mb-1">{item.label}</div>
                                            <div className="text-xs text-gray-400 leading-relaxed">{item.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!isSuccess && (
                    <div className="px-6 py-4 border-t border-gray-800 shrink-0 bg-[#1e1e1e]">
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedReason || isSubmitting}
                            className={`w-full py-3 rounded-full font-bold text-white transition-all ${!selectedReason || isSubmitting
                                    ? 'bg-gray-700 opacity-50 cursor-not-allowed'
                                    : 'bg-[var(--app-global-link-color)] hover:opacity-90 active:scale-[0.98]'
                                }`}
                        >
                            {isSubmitting ? 'Bildiriliyor...' : 'Bildir'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
