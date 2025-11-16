"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import ComposeBox from "@/components/ComposeBox";
import PostList from "@/components/PostList";
import Announcements from "@/components/Announcements";
import { Post } from "@/components/PostList";
import { fetchApi } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    // Kullanıcı girişi kontrolü
    const token = localStorage.getItem("token");
    if (!token) {
      // Token yoksa ana sayfaya yönlendir
      router.push("/");
      return;
    }
    
    setIsAuthenticated(true);
  }, [router]);

  const loadPosts = useCallback(async (pageNum: number, reset: boolean = false) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);

    try {
      const data = await fetchApi(`/posts?skip=${pageNum * 20}&take=20`) as Post[];
      
      // API response formatını kontrol et
      const newPosts = Array.isArray(data) ? data : [];
      
      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        if (reset || pageNum === 0) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Postlar yüklenirken hata oluştu:", error);
      
      // Eğer 401 hatası alınırsa (token geçersiz), çıkış yap
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
  }, [router]);

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

  // Duyuru görünürlüğü değiştiğinde çağrılacak fonksiyon
  const handleAnnouncementVisibilityChange = (visible: boolean) => {
    setIsAnnouncementVisible(visible);
  };

  // Kullanıcı girişi yapmamışsa içeriği gösterme
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
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-center">
        {/* Sol Sidebar - 260px */}
        <div className="hidden lg:block w-[260px] shrink-0">
          <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <LeftSidebar />
          </div>
        </div>

        {/* Orta Bölüm - 600px */}
        <div className="w-full max-w-[600px] flex flex-col items-center">
          <div className="w-full">
            {/* Duyurular */}
            <div className={isAnnouncementVisible ? "mb-[15px]" : ""}>
              <Announcements onVisibilityChange={handleAnnouncementVisibilityChange} />
            </div>

            {/* Post Oluşturma */}
            <div className="mb-0">
              <ComposeBox onPostCreated={(newPost: Post) => setPosts([newPost, ...posts])} />
            </div>

            {/* Post Listesi */}
            <div>
              {loading && posts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-500">Postlar yükleniyor...</p>
                </div>
              ) : (
                <>
                  <PostList posts={posts} />
                  
                  {/* Sonsuz scroll için gözlemci */}
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
                    <div className="flex justify-center py-4 text-gray-500 text-sm">
                      Tüm postlar yüklendi
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Sidebar - 300px */}
        <div className="hidden lg:block w-[300px] shrink-0 ml-[10px]">
          <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
