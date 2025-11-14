"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import ComposeBox from "@/components/ComposeBox";
import PostList from "@/components/PostList";
import Announcements from "@/components/Announcements";
import { Post } from "@/components/PostList";
import { fetchApi } from "@/lib/api";

interface PostsResponse {
  posts: Post[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);

  useEffect(() => {
    // Kullanıcı girişi kontrolü
    const token = localStorage.getItem("token");
    if (!token) {
      // Token yoksa ana sayfaya yönlendir
      router.push("/");
      return;
    }
    
    setIsAuthenticated(true);

    // API'den postları çek
    const fetchPosts = async () => {
      try {
        const data = await fetchApi("/posts") as PostsResponse;
        setPosts(data.posts || []);
      } catch (error) {
        console.error("Postlar yüklenirken hata oluştu:", error);
        
        // Eğer 401 hatası alınırsa (token geçersiz), çıkış yap
        if (error instanceof Error && error.message.includes("401")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/");
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [router]);

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
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-500">Postlar yükleniyor...</p>
                </div>
              ) : (
                <PostList posts={posts} />
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