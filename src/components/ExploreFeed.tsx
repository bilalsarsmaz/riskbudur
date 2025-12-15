"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import { fetchApi } from "@/lib/api";
import GlobalHeader from "@/components/GlobalHeader";

interface Hashtag {
    id: string;
    name: string;
    count: number;
}

interface UserPreview {
    id: string;
    nickname: string;
    fullName: string;
    profileImage: string | null;
    verificationTier: string;
    hasBlueTick: boolean;
}

interface ExploreFeedProps {
    activeTab: "gundem" | "kisiler";
}

export default function ExploreFeed({ activeTab }: ExploreFeedProps) {
    const router = useRouter();
    // activeTab is now controlled by prop (URL), not local state

    const [hashtags, setHashtags] = useState<Hashtag[]>([]);
    const [users, setUsers] = useState<UserPreview[]>([]);
    const [loading, setLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/");
            return;
        }

        const fetchTrending = async () => {
            try {
                const data = await fetchApi("/hashtags/trending?limit=15");
                setHashtags(data.hashtags || []);
            } catch (err) {
                console.error("Trending hashtag hatası:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, [router]);

    useEffect(() => {
        if (activeTab === "kisiler" && users.length === 0) {
            const fetchUsers = async () => {
                setUsersLoading(true);
                try {
                    const data = await fetchApi("/users?limit=40");
                    setUsers(data.users || []);
                } catch (err) {
                    console.error("Kullanıcı listesi hatası:", err);
                } finally {
                    setUsersLoading(false);
                }
            };
            fetchUsers();
        }
    }, [activeTab, users.length]);

    if (loading) {
        return (
            <>
                <MobileHeader />
                <div className="hidden lg:flex justify-center w-full">
                    <div className="flex w-full max-w-[1310px]">
                        <header className="left-nav flex-shrink-0 w-[275px] h-screen sticky top-0 overflow-y-auto z-10">
                            <div className="h-full p-0 m-0 border-0">
                                <LeftSidebar />
                            </div>
                        </header>
                        <main className="content flex flex-1 min-h-screen">
                            <section className="timeline flex-1 w-full lg:max-w-[600px] flex flex-col items-stretch lg:border-l lg:border-r border-[#222222]">
                                <div className="flex items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                                </div>
                            </section>
                            <aside className="right-side hidden xl:block w-[350px] flex-shrink-0 ml-[10px] pt-6">
                                <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                                    <RightSidebar hideHashtags={true} />
                                </div>
                            </aside>
                        </main>
                    </div>
                </div>
                <div className="lg:hidden flex flex-col min-h-screen">
                    <main className="content flex-1 pt-14 pb-16">
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                        </div>
                    </main>
                </div>
                <MobileBottomNav />
            </>
        );
    }

    return (
        <>
            {/* Mobil Header */}
            <MobileHeader />

            {/* Desktop Layout Wrapper - ekran ortasında */}
            <div className="hidden lg:flex justify-center w-full">
                <div className="flex w-full max-w-[1310px]">
                    {/* Sol Sidebar */}
                    <header className="left-nav flex-shrink-0 w-[275px] h-screen sticky top-0 overflow-y-auto z-10">
                        <div className="h-full p-0 m-0 border-0">
                            <LeftSidebar />
                        </div>
                    </header>

                    {/* Ana içerik */}
                    <main className="content flex flex-1 min-h-screen">
                        {/* Timeline - Hashtag Listesi */}
                        <section className="timeline flex-1 w-full lg:max-w-[600px] flex flex-col items-stretch lg:border-l lg:border-r border-[#222222]">
                            {/* Başlık */}
                            <GlobalHeader
                                title="Keşfet"
                                subtitle="Mevzu ne tatlım?"
                                showBackButton={true}
                            />

                            {/* Tabs */}
                            <div className="flex border-b border-[#222222]">
                                <Link
                                    href="/i/explore/tabs/trending"
                                    className={`flex-1 py-4 text-center font-medium relative ${activeTab === "gundem" ? "font-bold text-[var(--app-body-text)]" : "text-[#71767b]"}`}
                                >
                                    Gündem
                                    {activeTab === "gundem" && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-[var(--app-global-link-color)]"></div>
                                    )}
                                </Link>
                                <Link
                                    href="/i/explore/tabs/online"
                                    className={`flex-1 py-4 text-center font-medium relative ${activeTab === "kisiler" ? "font-bold text-[var(--app-body-text)]" : "text-[#71767b]"}`}
                                >
                                    Kişiler
                                    {activeTab === "kisiler" && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-[var(--app-global-link-color)]"></div>
                                    )}
                                </Link>
                            </div>

                            {/* İçerik Alanı */}
                            <div className="p-4">
                                {activeTab === "gundem" ? (
                                    // Hashtag Listesi
                                    <div className="flex flex-col">
                                        {hashtags.map((hashtag) => (
                                            <div
                                                key={hashtag.id}
                                                onClick={() => router.push(`/hashtag/${hashtag.name}`)}
                                                className="flex flex-col items-start py-3 px-2 rounded-lg cursor-pointer transition-colors"
                                            >
                                                <span className="font-bold text-[15px]" style={{ color: "var(--app-body-text)" }}>#{hashtag.name}</span>
                                                <span className="text-[13px]" style={{ color: '#71767b' }}>{hashtag.count} gönderi</span>
                                            </div>
                                        ))}

                                        {hashtags.length === 0 && (
                                            <div className="py-8 text-center" style={{ color: '#6e767d' }}>
                                                Henüz gündemde etiket yok.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // Kişiler Grid (8 Column)
                                    <div>
                                        {usersLoading ? (
                                            <div className="flex justify-center py-10">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-8 gap-2">
                                                {users.map((user) => (
                                                    <div
                                                        key={user.id}
                                                        className="aspect-square relative group cursor-pointer"
                                                        onClick={() => router.push(`/${user.nickname}`)}
                                                        title={user.fullName || user.nickname}
                                                    >
                                                        {user.profileImage ? (
                                                            <img
                                                                src={user.profileImage}
                                                                alt={user.nickname}
                                                                className="w-full h-full object-cover rounded-lg border border-[#333] hover:border-[#F4212E] transition-colors"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full rounded-lg bg-[#333] border border-[#333] flex items-center justify-center text-[#71767b] font-bold text-xs hover:border-[#F4212E] transition-colors">
                                                                {user.nickname.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {users.length === 0 && (
                                                    <div className="col-span-8 text-center text-[#71767b] py-8">
                                                        Kullanıcı bulunamadı.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Sağ Sidebar */}
                        <aside className="right-side hidden xl:block w-[350px] flex-shrink-0 ml-[10px] pt-6">
                            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                                <RightSidebar hideHashtags={true} />
                            </div>
                        </aside>
                    </main>
                </div>
            </div>

            {/* Mobil Layout */}
            <div className="lg:hidden flex flex-col min-h-screen">
                <main className="content flex-1 pt-14 pb-16">
                    <section className="timeline w-full flex flex-col items-stretch">
                        {/* Başlık */}
                        <GlobalHeader
                            title="Keşfet"
                            subtitle={activeTab === "gundem" ? "Gündemdeki etiketler" : "Kişiler"}
                            className="!top-14"
                            showBackButton={true}
                        />

                        {/* Mobile Tabs */}
                        <div className="flex border-b border-[#222222]">
                            <Link
                                href="/i/explore/tabs/trending"
                                className={`flex-1 py-4 text-center font-medium relative ${activeTab === "gundem" ? "font-bold text-[var(--app-body-text)]" : "text-[#71767b]"}`}
                            >
                                Gündem
                                {activeTab === "gundem" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-[var(--app-global-link-color)]"></div>
                                )}
                            </Link>
                            <Link
                                href="/i/explore/tabs/online"
                                className={`flex-1 py-4 text-center font-medium relative ${activeTab === "kisiler" ? "font-bold text-[var(--app-body-text)]" : "text-[#71767b]"}`}
                            >
                                Kişiler
                                {activeTab === "kisiler" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full bg-[var(--app-global-link-color)]"></div>
                                )}
                            </Link>
                        </div>

                        {/* Mobile Content */}
                        <div className="p-4">
                            {activeTab === "gundem" ? (
                                <div className="flex flex-col">
                                    {hashtags.map((hashtag) => (
                                        <div
                                            key={hashtag.id}
                                            onClick={() => router.push(`/hashtag/${hashtag.name}`)}
                                            className="flex flex-col items-start py-3 px-2 rounded-lg cursor-pointer transition-colors"
                                        >
                                            <span className="font-bold text-[15px]" style={{ color: "var(--app-body-text)" }}>#{hashtag.name}</span>
                                            <span className="text-[13px]" style={{ color: '#71767b' }}>{hashtag.count} gönderi</span>
                                        </div>
                                    ))}

                                    {hashtags.length === 0 && (
                                        <div className="py-8 text-center" style={{ color: '#6e767d' }}>
                                            Henüz gündemde etiket yok.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {usersLoading ? (
                                        <div className="flex justify-center py-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-4 gap-2"> {/* Mobile: 4 cols */}
                                            {users.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="aspect-square relative group cursor-pointer"
                                                    onClick={() => router.push(`/${user.nickname}`)}
                                                    title={user.fullName || user.nickname}
                                                >
                                                    {user.profileImage ? (
                                                        <img
                                                            src={user.profileImage}
                                                            alt={user.nickname}
                                                            className="w-full h-full object-cover rounded-lg border border-[#333] hover:border-[#F4212E] transition-colors"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full rounded-lg bg-[#333] border border-[#333] flex items-center justify-center text-[#71767b] font-bold text-xs hover:border-[#F4212E] transition-colors">
                                                            {user.nickname.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {users.length === 0 && (
                                                <div className="col-span-4 text-center text-[#71767b] py-8">
                                                    Kullanıcı bulunamadı.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>

            {/* Mobil Bottom Nav */}
            <MobileBottomNav />
        </>
    );
}
