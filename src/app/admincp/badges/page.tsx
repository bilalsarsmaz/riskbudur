"use client";

import { useState, useEffect } from "react";
import AdmStandardPageLayout from "@/components/AdmStandardPageLayout";
import AdminSidebar from "@/components/AdminSidebar";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

interface VerificationRequest {
    id: string;
    fullName: string;
    category: string;
    description: string;
    identityImageUrl: string;
    status: string;
    createdAt: string;
    user: {
        nickname: string;
        fullName: string | null;
        email: string;
        profileImage: string;
    };
}

function VerificationRequestCard({ req, onDecision }: { req: VerificationRequest; onDecision: (id: string, decision: 'APPROVED' | 'REJECTED') => void }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Map to profile object as requested
    const profile = {
        fullName: req.user.fullName!,
        username: req.user.nickname,
        profileImage: req.user.profileImage
    };

    return (
        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden transition-all duration-200">
            {/* Header - Always Visible */}
            <div
                className="p-5 flex items-center gap-4 cursor-pointer hover:bg-[#151515] transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* 1. Profile Photo */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                    {profile.profileImage ? (
                        <img src={profile.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold">{profile.username[0]}</div>
                    )}
                </div>

                {/* 2. Initials/Name and Username (Stacked) */}
                <div className="flex flex-col leading-tight">
                    <div className="font-bold text-[15px] text-white">{profile.fullName}</div>
                    <div className="text-sm text-[#1d9bf0]">@{profile.username}</div>
                </div>

                {/* 3. Spacer to push Email to right */}
                <div className="flex-1"></div>

                {/* 4. Email Info */}
                <div className="hidden md:block text-sm text-gray-400 mr-4">
                    {req.user.email}
                </div>

                {/* 5. Chevron */}
                <div className="text-gray-500">
                    {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                </div>
            </div>

            {/* Collapsible Body */}
            {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-gray-800/50">
                    <div className="space-y-4 pt-4">
                        {/* Real Name (Moved here) */}
                        <div>
                            <span className="text-gray-500 text-sm block mb-1">Gerçek İsim:</span>
                            <span className="font-medium text-white">{req.fullName}</span>
                        </div>

                        {/* Category (Moved here) */}
                        <div>
                            <span className="text-gray-500 text-sm block mb-1">Kategori:</span>
                            <span className="inline-block bg-blue-900/30 text-blue-400 text-xs px-2 py-0.5 rounded border border-blue-900/50">
                                {req.category}
                            </span>
                        </div>
                        <span className="text-gray-500 text-sm block mb-1">Açıklama:</span>
                        <p className="text-sm text-gray-300 bg-[#0a0a0a] p-3 rounded border border-gray-800">
                            {req.description}
                        </p>
                    </div>

                    {/* ID Photo */}
                    {req.identityImageUrl && (
                        <div>
                            <span className="text-gray-500 text-sm block mb-2">Kimlik Fotoğrafı:</span>
                            <div
                                className="h-64 bg-black rounded border border-gray-800 overflow-hidden relative group cursor-pointer w-full md:w-1/2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(req.identityImageUrl)
                                }}
                            >
                                <img
                                    src={req.identityImageUrl}
                                    alt="Identity"
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-bold text-white">Büyütmek için tıkla</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDecision(req.id, 'REJECTED');
                            }}
                            className="flex-1 py-2 rounded-lg border border-red-900 text-red-500 hover:bg-red-900/20 transition-colors"
                        >
                            Reddet
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDecision(req.id, 'APPROVED');
                            }}
                            className="flex-1 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors shadow-lg shadow-green-900/20"
                        >
                            Onayla
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminBadgesPage() {
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const res = await fetch("/api/admin/badges", {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
        if (!confirm(`Bu başvuruyu ${decision === 'APPROVED' ? 'ONAYLAMAK' : 'REDDETMEK'} istediğinize emin misiniz?`)) return;

        try {
            await fetch("/api/admin/badges", {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ requestId: id, status: decision })
            });

            // Remove from list
            setRequests(prev => prev.filter(r => r.id !== id));

        } catch (error) {
            alert("İşlem başarısız oldu.");
        }
    };

    if (loading) return (
        <AdmStandardPageLayout sidebarContent={<AdminSidebar />}>
            <div className="p-10 text-white flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        </AdmStandardPageLayout>
    );

    return (
        <AdmStandardPageLayout sidebarContent={<AdminSidebar />}>
            <div className="text-white">
                <div className="p-4 border-b border-theme-border sticky top-0 bg-black/80 backdrop-blur-md z-10">
                    <h1 className="text-xl font-bold">Mavi Tik Başvuruları</h1>
                </div>

                <div className="p-4">
                    {requests.length === 0 ? (
                        <div className="text-gray-500 text-center py-10">Bekleyen başvuru yok.</div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((req) => (
                                <VerificationRequestCard
                                    key={req.id}
                                    req={req}
                                    onDecision={handleDecision}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdmStandardPageLayout>
    );
}
