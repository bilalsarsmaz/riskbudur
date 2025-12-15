"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PostList from "@/components/PostList";
import { fetchApi } from "@/lib/api";
import { EnrichedPost } from "@/types/post";
import GlobalHeader from "@/components/GlobalHeader";
import StandardPageLayout from "@/components/StandardPageLayout";

export default function BookmarksPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
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

  const handlePostDeleted = (post: EnrichedPost) => {
    setPosts(posts.filter(p => p.id !== post.id));
  };

  return (
    <StandardPageLayout>
      <GlobalHeader title="Çivilenenler" subtitle="Çaktığın gönderiler" />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : posts.length > 0 ? (
        <PostList
          posts={posts}
          currentUserId={currentUserId || undefined}
          onPostDeleted={handlePostDeleted}
        />
      ) : (
        <div className="p-8 text-center">
          <p style={{ color: '#6e767d' }}>Henüz kaydettiğin gönderi yok.</p>
        </div>
      )}
    </StandardPageLayout>
  );
}
