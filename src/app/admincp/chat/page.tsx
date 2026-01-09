
"use client";

import { useState, useEffect, useRef } from "react";
import AdmStandardPageLayout from "@/components/AdmStandardPageLayout";
import AdminSidebar from "@/components/AdminSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import { IconTerminal2, IconSend } from "@tabler/icons-react";
import { fetchApi, postApi } from "@/lib/api";

interface ChatMessage {
    id: string;
    content: string;
    createdAt: string;
    user: {
        nickname: string;
        role: string;
        hasBlueTick: boolean;
        verificationTier: string;
        profileImage?: string;
    };
}

export default function AdminChatPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState(true);

    const clearedAtRef = useRef<Date | null>(null);

    // Load clearedAt from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("admin_chat_cleared_at");
        if (saved) {
            clearedAtRef.current = new Date(saved);
        }
    }, []);

    const [onlineUsers, setOnlineUsers] = useState<ChatMessage['user'][]>([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (autoScroll) {
            scrollToBottom();
        }
    }, [messages, autoScroll]);

    const fetchMessages = async () => {
        try {
            const data = await fetchApi("/admin/chat");
            if (data && data.messages) {
                // Filter out messages older than clearance
                const cutoff = clearedAtRef.current;
                const filtered = cutoff
                    ? data.messages.filter((m: ChatMessage) => new Date(m.createdAt) > cutoff)
                    : data.messages;

                setMessages(prev => {
                    if (JSON.stringify(prev) !== JSON.stringify(filtered)) {
                        return filtered;
                    }
                    return prev;
                });

                // Update online users
                if (data.onlineUsers) {
                    setOnlineUsers(data.onlineUsers);
                }
            }
        } catch (error) {
            console.error("Chat load error", error);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newMessage.trim();
        if (!trimmed) return;

        // Simple Client-side Commands
        if (trimmed === '/clear') {
            const now = new Date();
            clearedAtRef.current = now;
            localStorage.setItem("admin_chat_cleared_at", now.toISOString());
            setMessages([]);
            setNewMessage("");
            return;
        }

        setSending(true);
        try {
            await postApi("/admin/chat", { content: trimmed });
            setNewMessage("");
            fetchMessages();
            setAutoScroll(true);
        } catch (error) {
            console.error("Send error", error);
        } finally {
            setSending(false);
        }
    };

    // Helper to format role domain
    const getRoleDomain = (role: string) => {
        switch (role) {
            case 'ROOTADMIN': return 'root.riskbudur.net';
            case 'ADMIN': return 'admin.riskbudur.net';
            case 'MODERATOR': return 'mod.riskbudur.net';
            default: return 'user.riskbudur.net';
        }
    };

    // Helper valid tiers for badges
    const getBadge = (user: ChatMessage['user']) => {
        if (user.hasBlueTick) return "(verified)";
        if (user.verificationTier === 'GOLD') return "(gold)";
        if (user.verificationTier === 'GRAY') return "(official)";
        if (user.verificationTier === 'GREEN') return "(verified)";
        return "";
    };



    const rightSidebarContent = (
        <div className="rounded-2xl p-4 sticky top-4 bg-[#0a0a0a] border border-[#333] w-64">
            <h2 className="text-sm font-mono font-bold mb-4 text-green-500 uppercase tracking-wider border-b border-[#333] pb-2">
                ONLINE:
            </h2>
            <div className="space-y-1 text-sm font-mono text-gray-400">
                {onlineUsers.map(u => (
                    <div key={u.nickname} className="hover:text-white cursor-pointer transition-colors">
                        <span>@{u.nickname}</span> <span className="text-[#666]">[{u.role.toLowerCase() === 'rootadmin' ? 'root' : u.role.toLowerCase() === 'moderator' ? 'mod' : 'admin'}]</span>
                    </div>
                ))}
                {onlineUsers.length === 0 && <span className="text-gray-600 italic">No active users</span>}
            </div>
        </div>
    );

    return (
        <AdmStandardPageLayout sidebarContent={<AdminSidebar />} rightSidebarContent={rightSidebarContent}>
            <GlobalHeader title="Yönetim Sohbeti" subtitle="Oldskool IRC mevzuları" />

            <div className="flex flex-col h-[calc(100vh-80px)] p-2">

                {/* Chat Window */}
                <div className="flex-1 bg-black border border-[#333] rounded-t-lg p-4 overflow-y-auto font-mono text-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] custom-scrollbar">
                    {loading ? (
                        <div className="text-green-500 animate-pulse">{">"} Initializing connection...</div>
                    ) : (
                        <div className="space-y-1">
                            {/* Welcome Message */}
                            <div className="text-gray-500 mb-4">
                                {">"} RBARC'ye hoş geldiniz!<br />
                                {">"} ----------------------------------------
                            </div>

                            {messages.map((msg) => {
                                const roleDomain = getRoleDomain(msg.user.role);
                                const badge = getBadge(msg.user);
                                const time = new Date(msg.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

                                // Color coding based on role
                                let userColor = "text-gray-300";
                                if (msg.user.role === 'ROOTADMIN') userColor = "text-red-500";
                                if (msg.user.role === 'ADMIN') userColor = "text-yellow-400";
                                if (msg.user.role === 'MODERATOR') userColor = "text-blue-400";

                                return (
                                    <div key={msg.id} className="break-words hover:bg-[#111] px-1 -mx-1 rounded">
                                        <span className="text-gray-600 mr-2">[{time}]</span>
                                        <span className={`${userColor} font-bold hover:underline cursor-pointer`}>
                                            {msg.user.nickname}
                                        </span>
                                        {badge && <span className="text-cyan-600 mx-1 text-xs">{badge}</span>}
                                        <span className="text-gray-500 mx-1">@{roleDomain}:</span>
                                        <span className="text-[#e0e0e0]">{msg.content}</span>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="bg-[#111111] border border-t-0 border-[#333] rounded-b-lg p-3">
                    <form onSubmit={handleSend} className="flex gap-2 items-center">
                        <span className="text-green-500 font-mono font-bold">{">"}</span>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 bg-transparent border-none text-green-500 font-mono focus:ring-0 placeholder-green-900"
                            placeholder="Komut veya mesaj girin..."
                            autoFocus
                        />
                        <button type="submit" disabled={sending} className="text-[#333] hover:text-green-500 transition-colors">
                            <IconSend size={18} />
                        </button>
                    </form>
                </div>

            </div>
        </AdmStandardPageLayout>
    );
}
