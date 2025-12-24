
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdmStandardPageLayout from "@/components/AdmStandardPageLayout";
import AdminSidebar from "@/components/AdminSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import AdminBadge from "@/components/AdminBadge";
import PostItem from "@/components/PostItem";
import {
    IconSearch,
    IconRosetteDiscountCheckFilled,
    IconMapPin,
    IconMail
} from "@tabler/icons-react";
import { fetchApi } from "@/lib/api";
import { EnrichedPost } from "@/types/post";

interface User {
    id: string;
    nickname: string;
    fullName: string | null;
    email: string;
    profileImage: string | null;
    hasBlueTick: boolean;
    isBanned: boolean;
    verificationTier: 'NONE' | 'GREEN' | 'GOLD' | 'GRAY';
    ipAddress?: string | null;
    role?: string;
    _count?: { // Optional counts if API returns them
        posts: number;
        followers: number;
        following: number;
    };
}

export default function AdminPosts() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Tabs
    const [activeTab, setActiveTab] = useState<'POSTS' | 'REPLIES' | 'MEDIA' | 'HIDDEN'>('POSTS');

    // Content
    const [posts, setPosts] = useState<EnrichedPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);

    // Initial user fetch (reused from Users page mostly for search)
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const token = localStorage.getItem("token");
            const response = await fetch("/api/admin/users", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Kullanıcılar yüklenirken hata:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Filter users for search
    const filteredUsers = searchTerm.length > 0 ? users.filter(user =>
        user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

    // Fetch posts when tab or user changes
    useEffect(() => {
        if (selectedUser) {
            fetchUserContent();
        }
    }, [selectedUser, activeTab]);

    const fetchUserContent = async () => {
        if (!selectedUser) return;

        setLoadingPosts(true);
        setPosts([]); // Clear previous

        try {
            let endpoint = "";
            switch (activeTab) {
                case 'POSTS':
                    endpoint = `/api/users/${selectedUser.nickname}/posts`;
                    break;
                case 'REPLIES':
                    endpoint = `/api/users/${selectedUser.nickname}/replies`;
                    break;
                case 'MEDIA':
                    endpoint = `/api/users/${selectedUser.nickname}/media`;
                    break;
                case 'HIDDEN':
                    endpoint = `/api/admin/users/${selectedUser.nickname}/hidden`;
                    break;
            }

            const token = localStorage.getItem("token");
            const response = await fetch(endpoint, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                let fetchedPosts = data.posts || [];

                // Filter out censored posts for standard tabs - they belong in 'HIDDEN' tab only
                if (activeTab !== 'HIDDEN') {
                    fetchedPosts = fetchedPosts.filter((p: any) => !p.isCensored);
                }

                setPosts(fetchedPosts);
            }
        } catch (error) {
            console.error("İçerik yüklenirken hata:", error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        setSearchTerm(""); // Clear search to show selected user view cleanly
        setActiveTab('POSTS'); // Reset tab
    };


    // Right Sidebar Content (Summary)
    const rightSidebarContent = (
        <div className="rounded-2xl p-4 sticky top-4" style={{ backgroundColor: 'var(--app-surface)' }}>
            <h2 className="text-xl font-extrabold mb-4" style={{ color: 'var(--app-body-text)' }}>İstatistikler</h2>
            <div className="text-sm text-[#71767b]">
                Kullanıcı seçerek gönderilerini, yanıtlarını ve gizlenmiş içeriklerini görüntüleyebilirsiniz.
            </div>
        </div>
    );

    return (
        <AdmStandardPageLayout sidebarContent={<AdminSidebar />} rightSidebarContent={rightSidebarContent}>
            <GlobalHeader title="Gönderi Yönetimi" subtitle="Kullanıcı İçerikleri" />

            {/* Arama Alanı */}
            <div className="px-4 py-4 border-b border-theme-border relative z-20">
                <div className="relative">
                    <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-subtitle)' }} />
                    <input
                        type="text"
                        placeholder="Kullanıcı ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-theme-surface border-none rounded-full placeholder-theme-subtitle focus:outline-none focus:ring-1 focus:ring-theme-accent"
                        style={{ backgroundColor: 'var(--app-input-bg)', color: 'var(--app-body-text)', colorScheme: 'dark' }}
                    />
                </div>

                {/* Arama Sonuçları Dropdown */}
                {searchTerm.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-black border border-theme-border mt-1 max-h-[300px] overflow-y-auto shadow-2xl z-50">
                        {loadingUsers ? (
                            <div className="p-4 text-center text-sm text-[#71767b]">Aranıyor...</div>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => handleUserSelect(user)}
                                    className="flex items-center p-3 hover:bg-white/5 cursor-pointer border-b border-theme-border last:border-0"
                                >
                                    <img src={user.profileImage || "/Riskbudur-first.png"} className="w-10 h-10 rounded-full object-cover mr-3" />
                                    <div>
                                        <div className="font-bold text-white text-sm">{user.fullName || user.nickname}</div>
                                        <div className="text-[#71767b] text-xs">@{user.nickname}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-[#71767b]">Kullanıcı bulunamadı.</div>
                        )}
                    </div>
                )}
            </div>

            {/* Seçili Kullanıcı Kartı (Varsa) */}
            {selectedUser && (
                <div className="px-4 py-4 border-b border-theme-border bg-white/5">
                    <div className="flex items-center space-x-3">
                        <div>
                            {selectedUser.profileImage ? (
                                <img
                                    src={selectedUser.profileImage}
                                    alt={selectedUser.nickname}
                                    className="w-12 h-12 object-cover border-[0.5px] border-theme-border"
                                />
                            ) : (
                                <div className="w-12 h-12 flex items-center justify-center font-bold text-lg border-[0.5px] border-theme-border" style={{ backgroundColor: 'var(--app-surface)', color: 'var(--app-body-text)' }}>
                                    {selectedUser.nickname.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-1">
                                <span className="font-bold text-[15px]" style={{ color: 'var(--app-body-text)' }}>
                                    {selectedUser.fullName || selectedUser.nickname}
                                </span>
                                {(selectedUser.verificationTier !== 'NONE' || selectedUser.hasBlueTick) && (
                                    <IconRosetteDiscountCheckFilled className={`w-[18px] h-[18px] verified-icon ${selectedUser.verificationTier === 'GOLD' ? 'gold' :
                                        selectedUser.verificationTier === 'GRAY' ? 'gray' :
                                            selectedUser.verificationTier === 'GREEN' ? 'green' :
                                                selectedUser.nickname === 'riskbudur' ? 'gold' : 'green'
                                        }`} />
                                )}
                                <AdminBadge role={selectedUser.role} className="w-[18px] h-[18px] ml-0.5" />
                            </div>
                            <div className="text-[14px]" style={{ color: 'var(--app-subtitle)' }}>
                                @{selectedUser.nickname}
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-[#536471] mt-1">
                                <span className="flex items-center"><IconMail size={12} className="mr-1" /> {selectedUser.email}</span>
                                {selectedUser.ipAddress && <span className="flex items-center"><IconMapPin size={12} className="mr-1" /> {selectedUser.ipAddress}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs - Sadece kullanıcı seçiliyse göster */}
            {selectedUser ? (
                <>
                    <div className="flex border-b border-theme-border">
                        {[
                            { id: 'POSTS', label: 'Gönderiler' },
                            { id: 'REPLIES', label: 'Yanıtlar' },
                            { id: 'MEDIA', label: 'Medya' },
                            { id: 'HIDDEN', label: 'Sansürlü' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 py-4 text-center font-medium relative transition-colors hover:bg-white/5 ${activeTab === tab.id ? 'font-bold' : ''}`}
                                style={{
                                    color: activeTab === tab.id ? 'var(--app-accent)' : 'var(--app-subtitle)'
                                }}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[4px] rounded-t-full" style={{ backgroundColor: 'var(--app-accent)' }}></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* İçerik */}
                    <div>
                        {loadingPosts ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d9bf0]"></div>
                                <p className="mt-2 text-[#71767b]">Yükleniyor...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12 text-[#71767b]">
                                Bu kategoride içerik bulunamadı.
                            </div>
                        ) : (
                            <div>
                                {posts
                                    .filter(post => activeTab === 'HIDDEN' ? true : !post.isCensored)
                                    .map(post => (
                                        <PostItem
                                            key={post.id}
                                            post={post}
                                            isAdminView={activeTab === 'HIDDEN'} // Only enable admin view features for hidden tab specifically
                                        />
                                    ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Kullanıcı Seçilmediyse Placeholder */
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <div className="w-16 h-16 bg-[#1d9bf0]/10 rounded-full flex items-center justify-center mb-4 text-[#1d9bf0]">
                        <IconSearch size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">Kullanıcı Seçin</h3>
                    <p className="text-[#71767b] max-w-sm">
                        Gönderileri yönetmek ve gizlenmiş içerikleri görmek için yukarıdan bir kullanıcı arayın ve seçin.
                    </p>
                </div>
            )}

        </AdmStandardPageLayout>
    );
}
