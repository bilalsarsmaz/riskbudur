"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PostList from "@/components/PostList";
import { fetchApi } from "@/lib/api";
import { EnrichedPost } from "@/types/post";
import GlobalHeader from "@/components/GlobalHeader";
import StandardPageLayout from "@/components/StandardPageLayout";

export default function HashtagPage() {
  const params = useParams();
  const router = useRouter();
  const rawTag = params.tag as string;
  const tag = decodeURIComponent(rawTag);
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [hashtagInfo, setHashtagInfo] = useState<{ name: string; count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchHashtagPosts = async () => {
      try {
        setLoading(true);
        const data = await fetchApi(`/hashtags/${tag}`);
        setHashtagInfo(data.hashtag);
        setPosts(data.posts || []);
        setError(null);
      } catch (err) {
        console.error("Hashtag postları yüklenirken hata:", err);
        setError("Postlar yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    if (tag) {
      fetchHashtagPosts();
    }
  }, [tag, router]);

  const headerTitle = (
    <span style={{ color: 'var(--app-body-text)' }} className="leading-tight">
      #{hashtagInfo?.name || tag}
    </span>
  );

  return (
    <StandardPageLayout>
      <GlobalHeader
        title={headerTitle}
        subtitle={hashtagInfo ? `${hashtagInfo.count} gönderi` : undefined}
        onBack={() => router.back()}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : error || !hashtagInfo ? (
        <div className="p-8 text-center">
          <p style={{ color: '#d9dadd' }}>{error || "Hashtag bulunamadı"}</p>
        </div>
      ) : posts.length > 0 ? (
        <PostList posts={posts} />
      ) : (
        <div className="p-8 text-center">
          <p style={{ color: '#6e767d' }}>Bu etiketle henüz gönderi yok.</p>
        </div>
      )}
    </StandardPageLayout>
  );
}
