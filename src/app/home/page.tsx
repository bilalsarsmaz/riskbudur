"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ComposeBox from "@/components/ComposeBox";
import PostList from "@/components/PostList";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import MobileComposeModal from "@/components/MobileComposeModal";
import TimelineTabs from "@/components/TimelineTabs";
import AutoPostHandler from "@/components/AutoPostHandler";
import { Suspense } from "react";
import StandardPageLayout from "@/components/StandardPageLayout";

import { EnrichedPost } from "@/types/post";
import { fetchApi, postApi } from "@/lib/api";
import { feedCache } from "@/lib/feedCache";

type TimelineType = "all" | "following";

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState<TimelineType>("all");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newPostCount, setNewPostCount] = useState(0);
  const [isMobileComposeOpen, setIsMobileComposeOpen] = useState(false);
  const loadingRef = useRef(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const scrollRef = useRef(0);
  const activeTimelineRef = useRef<TimelineType>("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    setIsAuthenticated(true);

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.userId) {
        setCurrentUserId(payload.userId);
      }
    } catch (e) {
      console.error("Token parse hatası:", e);
    }
  }, [router]);




  const loadPosts = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      if (loadingRef.current) {
        return;
      }

      loadingRef.current = true;
      setLoading(true);

      try {
        const timelineParam = activeTimelineRef.current === "following" ? "&timeline=following" : "";
        const data = (await fetchApi(`/posts?skip=${pageNum * 20}&take=20${timelineParam}`)) as EnrichedPost[];
        const newPosts = Array.isArray(data) ? data : [];

        if (newPosts.length === 0) {
          setHasMore(false);
          hasMoreRef.current = false;
        } else {
          setPosts((prev) => {
            if (reset || pageNum === 0) {
              return newPosts;
            }
            return [...prev, ...newPosts];
          });

          setPage(pageNum);
          pageRef.current = pageNum;
        }
      } catch (error) {
        console.error("Postlar yüklenirken hata:", error);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    []
  );

  useEffect(() => {
    if (isAuthenticated) {
      loadPosts(0, true);
    }
  }, [isAuthenticated, loadPosts]);





  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (loadingRef.current || !hasMoreRef.current) return;

      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 500) {
        loadPosts(pageRef.current + 1);
      }

      scrollRef.current = scrollTop;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadPosts]);

  // Check for new posts
  useEffect(() => {
    if (!isAuthenticated || posts.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const latestPostId = posts[0]?.id;
        if (!latestPostId) return;

        const timelineParam = activeTimelineRef.current === "following" ? "?timeline=following" : "";
        const data = await fetchApi(`/posts/check-new?latestId=${latestPostId}${timelineParam ? `&timeline=following` : ""}`);

        if (data.count > 0) {
          setNewPostCount(data.count);
        }
      } catch (err) {
        console.error("Yeni post kontrolü hatası:", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, posts]);

  const handleShowNewPosts = () => {
    setNewPostCount(0);
    feedCache.clear();
    loadPosts(0, true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePostCreated = useCallback((newPost: EnrichedPost) => {
    setPosts((prevPosts) => {
      const updatedPosts = [newPost, ...prevPosts];
      if (newPost.quotedPostId) {
        return updatedPosts.map((p) => {
          if (p.id === newPost.quotedPostId) {
            return {
              ...p,
              isQuoted: true,
              _count: {
                ...p._count,
                quotes: (p._count?.quotes || 0) + 1,
              },
            };
          }
          return p;
        });
      }
      return updatedPosts;
    });
  }, []);

  // Listen for posts created from MobileBottomNav
  useEffect(() => {
    const handleMobilePostCreated = (event: CustomEvent<EnrichedPost>) => {
      handlePostCreated(event.detail);
    };

    window.addEventListener('mobilePostCreated', handleMobilePostCreated as EventListener);
    return () => {
      window.removeEventListener('mobilePostCreated', handleMobilePostCreated as EventListener);
    };
  }, [handlePostCreated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StandardPageLayout>
        <Suspense fallback={null}>
          <AutoPostHandler
            isAuthenticated={isAuthenticated}
            onPostComplete={() => loadPosts(0, true)}
          />
        </Suspense>
        <AnnouncementBanner />

        {/* Desktop ComposeBox */}
        <div className="hidden lg:block">
          <ComposeBox
            onPostCreated={handlePostCreated}
            className="border-t-0"
          />
        </div>

        <TimelineTabs
          activeTab={activeTimeline}
          onTabChange={(tab: TimelineType) => {
            setActiveTimeline(tab);
            activeTimelineRef.current = tab;
            feedCache.clear();
            loadPosts(0, true);
          }}
        />

        {newPostCount > 0 && (
          <div
            onClick={handleShowNewPosts}
            className="w-full h-[50px] border-b border-theme-border flex items-center justify-center cursor-pointer hover:bg-[#151515] transition-colors text-[15px]"
            style={{ color: "var(--app-global-link-color)" }}
          >
            {newPostCount} yeni gönderiyi göster
          </div>
        )}

        {loading && posts.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">Postlar yükleniyor...</p>
          </div>
        ) : (
          <>
            <PostList
              posts={posts}
              currentUserId={currentUserId || undefined}
              onPostDeleted={(deletedPost) => {
                setPosts(prevPosts => {
                  const filtered = prevPosts.filter(p => p.id !== deletedPost.id);
                  if (deletedPost.quotedPostId) {
                    return filtered.map(p => {
                      if (p.id === deletedPost.quotedPostId) {
                        return {
                          ...p,
                          isQuoted: false,
                          _count: {
                            ...p._count,
                            quotes: Math.max(0, (p._count?.quotes || 0) - 1)
                          }
                        };
                      }
                      return p;
                    });
                  }
                  return filtered;
                });
              }}
              onPostCreated={handlePostCreated}
            />

            {hasMore && loading && (
              <div className="flex justify-center py-4">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-sm text-gray-500">Daha fazla post yükleniyor...</p>
                </div>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="flex justify-center py-4 text-gray-500 text-sm">Tüm postlar yüklendi</div>
            )}
          </>
        )}
      </StandardPageLayout>

      {/* Mobile Compose Modal */}
      <MobileComposeModal
        isOpen={isMobileComposeOpen}
        onClose={() => setIsMobileComposeOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </>
  );
}
