"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import AdminConversationList from "@/components/admin/AdminConversationList";
import AdminMessageWindow from "@/components/admin/AdminMessageWindow";
import { fetchApi } from "@/lib/api";
import AdmSecondaryLayout from "@/components/AdmSecondaryLayout";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdmGhostMessage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedId = searchParams.get("id");
    const nicknameParam = searchParams.get("nickname");

    // State
    const [targetNicknameInput, setTargetNicknameInput] = useState(nicknameParam || "");
    const [targetUserId, setTargetUserId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState(false);
    const [error, setError] = useState("");

    // 1. Handle Search Submit -> Update URL
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetNicknameInput.trim()) return;
        router.push(`/admincp/ghostmessage?nickname=${targetNicknameInput}`);
    };

    // 2. Fetch Conversations when nicknameParam changes
    useEffect(() => {
        if (!nicknameParam) return;

        const loadConversations = async () => {
            setLoading(true);
            setError("");
            setTargetUserId(null); // Reset
            setConversations([]);

            try {
                const data = await fetchApi(`/admin/conversations?nickname=${nicknameParam}`);

                if (data.conversations) {
                    setConversations(data.conversations);
                    setTargetUserId(data.targetUserId);
                }
            } catch (err: any) {
                console.error("Failed to load admin conversations", err);
                if (err.message && err.message.includes("404")) {
                    setError("Böyle bir kullanıcı bulunamadı.");
                } else {
                    setError(err.message || "Bir hata oluştu.");
                }
            } finally {
                setLoading(false);
            }
        };

        loadConversations();
    }, [nicknameParam]);

    // 3. Fetch Messages when a conversation is selected
    useEffect(() => {
        if (!selectedId || !targetUserId) return;

        const loadMessages = async () => {
            setMessageLoading(true);
            try {
                const data = await fetchApi(`/admin/conversations/${selectedId}/messages`);
                setMessages(data.messages || []);
            } catch (err) {
                console.error("Failed to load admin messages", err);
            } finally {
                setMessageLoading(false);
            }
        };

        loadMessages();
    }, [selectedId, targetUserId]);

    // Find recipient for the window
    const selectedConversation: any = conversations.find((c: any) => c.id === selectedId);
    const recipient: any = selectedConversation && targetUserId
        ? selectedConversation.participants.find((p: any) => p.user.id !== targetUserId)?.user || null
        : null;

    return (
        <AdmSecondaryLayout sidebarContent={<AdminSidebar />} maxWidth="100%">
            <div className="flex h-screen lg:h-[calc(100vh)] bg-[var(--app-body-bg)] overflow-hidden">
                {/* Left Column: Search + List */}
                <div className={`w-full lg:w-[400px] flex flex-col border-r border-theme-border ${selectedId ? 'hidden lg:flex' : 'flex'}`}>
                    <GlobalHeader title="Ghost Message" subtitle="Shadow View" />

                    {/* Search Area */}
                    <div className="p-4 border-b border-theme-border">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={targetNicknameInput}
                                onChange={(e) => setTargetNicknameInput(e.target.value)}
                                placeholder="Kullanıcı ara (@nickname)..."
                                className="bg-[var(--app-surface)] border border-theme-border rounded-full px-4 py-2 text-[var(--app-body-text)] flex-1 focus:outline-none focus:border-[var(--app-global-link-color)] transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-white text-black font-bold px-4 py-2 rounded-full disabled:opacity-50 hover:bg-gray-200 transition-colors"
                            >
                                {loading ? "..." : "Ara"}
                            </button>
                        </form>
                        {error && <p className="text-red-500 text-xs mt-2 ml-1">{error}</p>}
                        <p className="text-xs text-gray-500 mt-2 ml-1">
                            Tamamen gizlidir. Kullanıcıya bildirim gitmez.
                        </p>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-hidden">
                        {targetUserId ? (
                            <AdminConversationList
                                conversations={conversations}
                                selectedConversationId={selectedId || undefined}
                                currentUserId={targetUserId}
                                targetNickname={nicknameParam || ""}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
                                <p>Bir kullanıcı arayın.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Message Window */}
                <div className={`flex-1 flex flex-col ${selectedId ? 'flex' : 'hidden lg:flex'}`}>
                    {selectedId ? (
                        messageLoading ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1DCD9F]"></div>
                            </div>
                        ) : (
                            <AdminMessageWindow
                                conversationId={selectedId}
                                messages={messages}
                                targetUserId={targetUserId || ""}
                                recipient={recipient}
                            />
                        )
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 border-b border-theme-border">
                            <div className="text-center">
                                <h3 className="text-xl font-bold mb-2">Mesaj Seçin</h3>
                                <p className="text-sm">Görüntülemek için soldan bir sohbete tıklayın.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdmSecondaryLayout>
    );
}
