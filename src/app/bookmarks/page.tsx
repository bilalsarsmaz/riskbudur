"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import PostList from "@/components/PostList";
import { fetchApi } from "@/lib/api";

interface Post {
  id: string;
  content: string;
  createdAt: string;
  mediaUrl?: string;
  imageUrl?: string;
  isAnonymous: boolean;
  author: {
    id: string;
    nickname: string;
    fullName?: string;
    hasBlueTick: boolean;
    profileImage?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export default function BookmarksPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    // Token'dan userId çıkar
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.userId) {
        setCurrentUserId(payload.userId);
      }
    } catch (e) {
      console.error("Token parse hatası:", e);
    }

    const fetchBookmarks = async () => {
      try {
        const data = await fetchApi("/bookmarks");
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Bookmarks yüklenirken hata:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [router]);

  const handlePostDeleted = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  // Loading content
  const LoadingContent = () => (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  // Page header
  const PageHeader = ({ sticky = false, top = "top-0" }: { sticky?: boolean; top?: string }) => (
    <div className={`${sticky ? `sticky ${top}` : ''} z-40 border-b border-[#222222] p-4 bg-black`}>
      <h1 className="text-xl font-bold" style={{color: '#d9dadd'}}>Yer İşaretleri</h1>
      <p className="text-sm mt-1" style={{color: '#6e767d'}}>Kaydettiğin gönderiler</p>
    </div>
  );

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
            {/* Timeline - Bookmark Listesi */}
            <section className="timeline flex-1 w-full lg:max-w-[600px] flex flex-col items-stretch lg:border-l lg:border-r border-[#222222]">
              <PageHeader sticky={true} />

              {loading ? (
                <LoadingContent />
              ) : posts.length > 0 ? (
                <PostList 
                  posts={posts} 
                  currentUserId={currentUserId || undefined} 
                  onPostDeleted={handlePostDeleted} 
                />
              ) : (
                <div className="p-8 text-center">
                  <p style={{color: '#6e767d'}}>Henüz kaydettiğin gönderi yok.</p>
                </div>
              )}
            </section>

            {/* Sağ Sidebar */}
            <aside className="right-side hidden xl:block w-[350px] flex-shrink-0 ml-[10px] pt-6">
              <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                <RightSidebar />
              </div>
            </aside>
          </main>
        </div>
      </div>

      {/* Mobil Layout */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <main className="content flex-1 pt-14 pb-16">
          <section className="timeline w-full flex flex-col items-stretch">
            <PageHeader sticky={true} top="top-14" />

            {loading ? (
              <LoadingContent />
            ) : posts.length > 0 ? (
              <PostList 
                posts={posts} 
                currentUserId={currentUserId || undefined} 
                onPostDeleted={handlePostDeleted} 
              />
            ) : (
              <div className="p-8 text-center">
                <p style={{color: '#6e767d'}}>Henüz kaydettiğin gönderi yok.</p>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Mobil Bottom Nav */}
      <MobileBottomNav />
    </>
  );
}
