"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import StandardPageLayout from "@/components/StandardPageLayout";
import GlobalHeader from "@/components/GlobalHeader";
import UserListItem from "@/components/UserListItem";
import { fetchApi, postApi, deleteApi } from "@/lib/api";

interface User {
    id: string;
    nickname: string;
    fullName: string;
    profileImage?: string | null;
    verificationTier: "NONE" | "GREEN" | "GOLD" | "GRAY";
    hasBlueTick: boolean;
    bio?: string | null;
    isFollowing: boolean;
}

export default function ConnectionsPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const username = params.username as string;
    const activeTab = searchParams.get("tab") || "followers";

    const [profileName, setProfileName] = useState("");
    const [currentUserId, setCurrentUserId] = useState<string | undefined>();

    // Separate states for each tab
    const [followers, setFollowers] = useState<User[]>([]);
    const [verifiedFollowers, setVerifiedFollowers] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);

    // Loading states
    const [followersLoading, setFollowersLoading] = useState(false);
    const [verifiedLoading, setVerifiedLoading] = useState(false);
    const [followingLoading, setFollowingLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Pagination states
    const [followersPage, setFollowersPage] = useState(1);
    const [verifiedPage, setVerifiedPage] = useState(1);
    const [followingPage, setFollowingPage] = useState(1);

    const [followersHasMore, setFollowersHasMore] = useState(true);
    const [verifiedHasMore, setVerifiedHasMore] = useState(true);
    const [followingHasMore, setFollowingHasMore] = useState(true);

    // Refs for infinite scroll
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Get current user
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchApi("/auth/me")
                .then((data) => setCurrentUserId(data.id))
                .catch(() => { });
        }
    }, []);

    // Get profile name
    useEffect(() => {
        fetchApi(`/users/${username}`)
            .then((data) => {
                setProfileName(data.fullName || data.username);
                setInitialLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch profile:", err);
                setInitialLoading(false);
            });
    }, [username]);

    // Fetch followers
    const fetchFollowers = useCallback(
        async (page: number, reset = false) => {
            if (followersLoading) return;
            setFollowersLoading(true);

            try {
                const data = await fetchApi(
                    `/users/${username}/followers?verified=false&page=${page}&limit=20`
                );

                setFollowers((prev) =>
                    reset ? data.followers : [...prev, ...data.followers]
                );
                setFollowersHasMore(data.hasMore);
            } catch (error) {
                console.error("Failed to fetch followers:", error);
            } finally {
                setFollowersLoading(false);
            }
        },
        [username, followersLoading]
    );

    // Fetch verified followers
    const fetchVerifiedFollowers = useCallback(
        async (page: number, reset = false) => {
            if (verifiedLoading) return;
            setVerifiedLoading(true);

            try {
                const data = await fetchApi(
                    `/users/${username}/followers?verified=true&page=${page}&limit=20`
                );

                setVerifiedFollowers((prev) =>
                    reset ? data.followers : [...prev, ...data.followers]
                );
                setVerifiedHasMore(data.hasMore);
            } catch (error) {
                console.error("Failed to fetch verified followers:", error);
            } finally {
                setVerifiedLoading(false);
            }
        },
        [username, verifiedLoading]
    );

    // Fetch following
    const fetchFollowing = useCallback(
        async (page: number, reset = false) => {
            if (followingLoading) return;
            setFollowingLoading(true);

            try {
                const data = await fetchApi(
                    `/users/${username}/following?page=${page}&limit=20`
                );

                setFollowing((prev) =>
                    reset ? data.following : [...prev, ...data.following]
                );
                setFollowingHasMore(data.hasMore);
            } catch (error) {
                console.error("Failed to fetch following:", error);
            } finally {
                setFollowingLoading(false);
            }
        },
        [username, followingLoading]
    );

    // Initial fetch based on active tab
    useEffect(() => {
        if (activeTab === "followers" && followers.length === 0) {
            fetchFollowers(1, true);
        } else if (activeTab === "verified_followers" && verifiedFollowers.length === 0) {
            fetchVerifiedFollowers(1, true);
        } else if (activeTab === "following" && following.length === 0) {
            fetchFollowing(1, true);
        }
    }, [activeTab, username]);

    // Infinite scroll
    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    if (activeTab === "followers" && followersHasMore && !followersLoading) {
                        const nextPage = followersPage + 1;
                        setFollowersPage(nextPage);
                        fetchFollowers(nextPage);
                    } else if (activeTab === "verified_followers" && verifiedHasMore && !verifiedLoading) {
                        const nextPage = verifiedPage + 1;
                        setVerifiedPage(nextPage);
                        fetchVerifiedFollowers(nextPage);
                    } else if (activeTab === "following" && followingHasMore && !followingLoading) {
                        const nextPage = followingPage + 1;
                        setFollowingPage(nextPage);
                        fetchFollowing(nextPage);
                    }
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        observerRef.current = observer;

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [
        activeTab,
        followersHasMore,
        followersLoading,
        followersPage,
        verifiedHasMore,
        verifiedLoading,
        verifiedPage,
        followingHasMore,
        followingLoading,
        followingPage,
    ]);

    // Handle follow/unfollow
    const handleFollowToggle = async (userId: string, currentlyFollowing: boolean) => {
        try {
            if (currentlyFollowing) {
                await deleteApi(`/follows?followingId=${userId}`);
            } else {
                await postApi("/follows", { followingId: userId });
            }

            // Update the user in all lists
            const updateUser = (users: User[]) =>
                users.map((u) =>
                    u.id === userId ? { ...u, isFollowing: !currentlyFollowing } : u
                );

            setFollowers(updateUser);
            setVerifiedFollowers(updateUser);
            setFollowing(updateUser);
        } catch (error) {
            console.error("Follow toggle failed:", error);
            throw error;
        }
    };

    const changeTab = (tab: string) => {
        router.push(`/${username}/connections?tab=${tab}`);
    };

    const getCurrentList = () => {
        switch (activeTab) {
            case "verified_followers":
                return verifiedFollowers;
            case "following":
                return following;
            default:
                return followers;
        }
    };

    const getCurrentLoading = () => {
        switch (activeTab) {
            case "verified_followers":
                return verifiedLoading;
            case "following":
                return followingLoading;
            default:
                return followersLoading;
        }
    };

    const getCurrentHasMore = () => {
        switch (activeTab) {
            case "verified_followers":
                return verifiedHasMore;
            case "following":
                return followingHasMore;
            default:
                return followersHasMore;
        }
    };

    if (initialLoading) {
        return (
            <StandardPageLayout>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1DCD9F]"></div>
                </div>
            </StandardPageLayout>
        );
    }

    const currentList = getCurrentList();
    const isLoading = getCurrentLoading();
    const hasMore = getCurrentHasMore();

    return (
        <StandardPageLayout>
            {/* Header */}
            <GlobalHeader
                title={profileName}
                subtitle={`@${username}`}
                onBack={() => router.back()}
            />

            {/* Tabs */}
            <div className="flex border-b border-theme-border sticky top-[60px] z-10 bg-theme-bg">
                <button
                    onClick={() => changeTab("verified_followers")}
                    className={`flex-1 py-4 text-center font-medium text-[15px] relative ${activeTab === "verified_followers"
                        ? "font-bold"
                        : ""
                        }`}
                    style={{
                        color:
                            activeTab === "verified_followers"
                                ? "var(--app-accent)"
                                : "var(--app-subtitle)",
                    }}
                >
                    Onaylı Takipçiler
                    {activeTab === "verified_followers" && (
                        <div
                            className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
                            style={{ backgroundColor: "var(--app-accent)" }}
                        ></div>
                    )}
                </button>
                <button
                    onClick={() => changeTab("followers")}
                    className={`flex-1 py-4 text-center font-medium text-[15px] relative ${activeTab === "followers" ? "font-bold" : ""
                        }`}
                    style={{
                        color:
                            activeTab === "followers"
                                ? "var(--app-accent)"
                                : "var(--app-subtitle)",
                    }}
                >
                    Takipçiler
                    {activeTab === "followers" && (
                        <div
                            className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
                            style={{ backgroundColor: "var(--app-accent)" }}
                        ></div>
                    )}
                </button>
                <button
                    onClick={() => changeTab("following")}
                    className={`flex-1 py-4 text-center font-medium text-[15px] relative ${activeTab === "following" ? "font-bold" : ""
                        }`}
                    style={{
                        color:
                            activeTab === "following"
                                ? "var(--app-accent)"
                                : "var(--app-subtitle)",
                    }}
                >
                    Takip Edilenler
                    {activeTab === "following" && (
                        <div
                            className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
                            style={{ backgroundColor: "var(--app-accent)" }}
                        ></div>
                    )}
                </button>
            </div>

            {/* User List */}
            <div>
                {currentList.length === 0 && !isLoading ? (
                    <div className="p-8 text-center" style={{ color: "var(--app-subtitle)" }}>
                        {activeTab === "verified_followers"
                            ? "Henüz onaylı takipçi yok."
                            : activeTab === "followers"
                                ? "Henüz takipçi yok."
                                : "Henüz kimseyi takip etmiyor."}
                    </div>
                ) : (
                    <>
                        {currentList.map((user) => (
                            <UserListItem
                                key={user.id}
                                user={user}
                                currentUserId={currentUserId}
                                onFollowToggle={handleFollowToggle}
                            />
                        ))}
                    </>
                )}

                {/* Loading indicator */}
                {isLoading && currentList.length > 0 && (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#1DCD9F]"></div>
                    </div>
                )}

                {/* Load more trigger */}
                {hasMore && !isLoading && <div ref={loadMoreRef} className="h-4"></div>}

                {/* End of list */}
                {!hasMore && currentList.length > 0 && (
                    <div
                        className="flex justify-center py-4 text-sm"
                        style={{ color: "var(--app-subtitle)" }}
                    >
                        Tüm liste yüklendi
                    </div>
                )}
            </div>
        </StandardPageLayout>
    );
}
