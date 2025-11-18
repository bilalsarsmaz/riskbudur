"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import PostList from "@/components/PostList";
import { fetchApi } from "@/lib/api";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface Post {
  id: string;
  content: string;
  createdAt: string;
  mediaUrl?: string;
  isAnonymous: boolean;
  author: {
    id: string;
    nickname: string;
    fullName: string;
    hasBlueTick: boolean;
    profileImage?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

export default function HashtagPage() {
  const params = useParams();
  const router = useRouter();
  const tag = params.tag as string;
  const [posts, setPosts] = useState<Post[]>([]);
  const [hashtagInfo, setHashtagInfo] = useState<{ name: string; count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [tag]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center">
          <div className="w-full max-w-[600px] flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hashtagInfo) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center">
          <div className="w-full max-w-[600px]">
            <div className="rounded-lg p-8 text-center" style={{backgroundColor: '#0a0a0a', border: '1px solid #222222'}}>
              <p style={{color: '#d9dadd'}}>{error || "Hashtag bulunamadı"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-center">
        <div className="hidden lg:block w-[260px] shrink-0">
          <LeftSidebar />
        </div>

        <div className="w-full max-w-[600px]">
          <div className="border border-[#222222] rounded-t-lg p-4 mb-0 flex items-center" style={{backgroundColor: '#0a0a0a'}}>
            <button
              onClick={() => router.push("/explore")}
              className="p-2 hover:bg-gray-800 rounded-full mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">#{hashtagInfo.name}</h1>
          </div>

          {posts.length > 0 ? (
            <PostList posts={posts} />
          ) : (
            <div className="p-8 text-center border-x border-b border-[#222222]" style={{backgroundColor: '#0a0a0a'}}>
              <p style={{color: '#6e767d'}}>Bu etiketle henüz gönderi yok.</p>
            </div>
          )}
        </div>

        <div className="hidden lg:block w-[300px] shrink-0 ml-[10px]">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
