"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import ComposeBox from "@/components/ComposeBox";
import PostList from "@/components/PostList";
import { Post } from "@/components/PostList";
import { fetchApi } from "@/lib/api";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import TimelineTabs from "@/components/TimelineTabs";

type TimelineType = "all" | "following";

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState<TimelineType>("all");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    setIsAuthenticated(true);
    
    // Token'dan userId çıkar
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
      if (loadingRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const data = (await fetchApi(`/posts?skip=${pageNum * 20}&take=20`)) as Post[];
        const newPosts = Array.isArray(data) ? data : [];

        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setPosts((prev) => (reset || pageNum === 0 ? newPosts : [...prev, ...newPosts]));
          setPage(pageNum);
        }
      } catch (error) {
        console.error("Postlar yüklenirken hata oluştu:", error);
        if (error instanceof Error && error.message.includes("401")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/");
          return;
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [router]
  );

  useEffect(() => {
    if (isAuthenticated) {
      loadPosts(0, true);
    }
  }, [isAuthenticated, loadPosts]);

  useEffect(() => {
    if (!isAuthenticated || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingRef.current) {
          loadPosts(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, page, loadPosts, isAuthenticated]);

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
      {/* Mobil Header - sadece mobilde görünür */}
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
          {/* Timeline */}
          <section className="timeline flex-1 w-full lg:max-w-[600px] flex flex-col items-stretch lg:border-l lg:border-r border-[#222222] pt-14 pb-16 lg:pt-0 lg:pb-0">
            {/* Timeline Tabs */}
            <TimelineTabs activeTab={activeTimeline} onTabChange={setActiveTimeline} />
            
            <ComposeBox onPostCreated={(newPost: Post) => setPosts([newPost, ...posts])} />

            {loading && posts.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-500">Postlar yükleniyor...</p>
              </div>
            ) : (
              <>
                <PostList posts={posts} currentUserId={currentUserId || undefined} onPostDeleted={(postId) => setPosts(posts.filter(p => p.id !== postId))} />

                {hasMore && (
                  <div ref={observerTarget} className="flex justify-center py-4">
                    {loading && (
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-sm text-gray-500">Daha fazla post yükleniyor...</p>
                      </div>
                    )}
                  </div>
                )}

                {!hasMore && posts.length > 0 && (
                  <div className="flex justify-center py-4 text-gray-500 text-sm">Tüm postlar yüklendi</div>
                )}
              </>
            )}
          </section>

          {/* Sağ taraf – çok geniş ekranlarda */}
          <aside className="right-side hidden xl:block w-[350px] flex-shrink-0 ml-[10px] pt-6">
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
              <RightSidebar />
            </div>
          </aside>
        </main>
        </div>
      </div>

      {/* Mobil Layout - lg altında görünür */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <main className="content flex-1">
          <section className="timeline w-full flex flex-col items-stretch pt-14 pb-16">
            <TimelineTabs activeTab={activeTimeline} onTabChange={setActiveTimeline} />
            <ComposeBox onPostCreated={(newPost: Post) => setPosts([newPost, ...posts])} />
            {loading && posts.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-500">Postlar yükleniyor...</p>
              </div>
            ) : (
              <>
                <PostList posts={posts} currentUserId={currentUserId || undefined} onPostDeleted={(postId) => setPosts(posts.filter(p => p.id !== postId))} />
                {hasMore && (
                  <div ref={observerTarget} className="flex justify-center py-4">
                    {loading && (
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-sm text-gray-500">Daha fazla post yükleniyor...</p>
                      </div>
                    )}
                  </div>
                )}
                {!hasMore && posts.length > 0 && (
                  <div className="flex justify-center py-4 text-gray-500 text-sm">Tüm postlar yüklendi</div>
                )}
              </>
            )}
          </section>
        </main>
      </div>

      {/* Mobil Bottom Nav - sadece mobilde görünür */}
      <MobileBottomNav />
    </>
  );
}
