"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SecondaryLayout from "@/components/SecondaryLayout";
import ConversationList from "@/components/messages/ConversationList";
import MessageWindow from "@/components/messages/MessageWindow";
import { fetchApi, postApi } from "@/lib/api";

export default function MessagesPage() {
    const searchParams = useSearchParams();
    const selectedId = searchParams.get("id");
    const userParam = searchParams.get("user"); // New: user parameter for new conversations

    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [targetUser, setTargetUser] = useState<any>(null); // New: user to start conversation with

    // Load user info
    useEffect(() => {
        const storedUser = localStorage.getItem("userInfo");
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    // Fetch target user if userParam exists
    useEffect(() => {
        if (!userParam || !currentUser) return;

        fetchApi(`/users/${userParam}`)
            .then((data: any) => {
                setTargetUser(data);
            })
            .catch(console.error);
    }, [userParam, currentUser]);

    // Fetch conversations
    const refreshConversations = async () => {
        if (!currentUser) return;
        try {
            const data = await fetchApi("/conversations");
            setConversations(data.conversations || []);
            setLoading(false);
        } catch (error) {
            console.error("Failed to refresh conversations", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshConversations();
    }, [currentUser]);

    // Fetch messages when conversation is selected
    useEffect(() => {
        if (!selectedId || !currentUser) return;

        fetchApi(`/conversations/${selectedId}/messages`)
            .then((data: any) => {
                setMessages(data.messages || []);
                // Clear unread count locally for this conversation and mark messages as read
                setConversations((prev: any) =>
                    prev.map((c: any) => c.id === selectedId ? {
                        ...c,
                        unreadCount: 0,
                        messages: c.messages.map((m: any) => ({ ...m, isRead: true }))
                    } : c)
                );
                // Dispatch event to refresh sidebar unread count
                window.dispatchEvent(new CustomEvent('messagesRead'));
            })
            .catch(console.error);

        // TODO: Setup polling or socket here for real-time
    }, [selectedId, currentUser]);

    const handleSendMessage = async (content: string, imageUrl?: string | null) => {
        if (!selectedId) return;

        try {
            const res: any = await postApi(`/conversations/${selectedId}/messages`, { content, imageUrl });
            const message = res.message;
            setMessages((prev: any) => [...prev, message]);

            // Update conversation list preview
            setConversations((prev: any) => {
                return prev.map((conv: any) => {
                    if (conv.id === selectedId) {
                        return {
                            ...conv,
                            updatedAt: new Date().toISOString(),
                            messages: [message], // Update preview
                            unreadCount: 0 // Explicitly clear unread since we are sending
                        };
                    }
                    return conv;
                }).sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            });
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    if (loading) {
        return (
            <SecondaryLayout maxWidth="100%">
                <div className="flex h-screen items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1DCD9F]"></div>
                </div>
            </SecondaryLayout>
        );
    }

    const selectedConversation: any = conversations.find((c: any) => c.id === selectedId);
    const recipient: any = selectedConversation
        ? selectedConversation.participants.find((p: any) => p.user.id !== currentUser?.id)?.user || null
        : targetUser;

    return (
        <SecondaryLayout maxWidth="100%">
            <div className="flex w-full h-[calc(100dvh-120px)] lg:h-screen overflow-hidden bg-[var(--app-body-bg)]">
                {/* Sol Alan: 400px Sabit */}
                <div className={`
                    w-full lg:w-[400px] flex-shrink-0 h-full bg-[var(--app-body-bg)]
                    ${selectedId ? "hidden lg:block" : "block"}
                `}>
                    <ConversationList
                        conversations={conversations}
                        selectedConversationId={selectedId || undefined}
                        currentUserId={currentUser?.id || ""}
                        onDelete={refreshConversations}
                    />
                </div>

                {/* Sağ Alan: Esnek (Geriye kalan tüm alan) */}
                <div className={`
                    flex-1 h-full bg-[var(--app-body-bg)]
                    ${selectedId ? "block" : "hidden lg:block"}
                `}>
                    <MessageWindow
                        conversationId={selectedId || null}
                        currentUserId={currentUser?.id || ""}
                        messages={messages}
                        recipient={recipient}
                        onSendMessage={handleSendMessage}
                        onConversationCreated={refreshConversations}
                    />
                </div>
            </div>
        </SecondaryLayout>
    );
}
