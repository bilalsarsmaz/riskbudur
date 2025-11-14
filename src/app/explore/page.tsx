"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { fetchApi } from "@/lib/api";
import { HashtagIcon } from "@heroicons/react/24/outline";

interface Hashtag {
  id: string;
  name: string;
  count: number;
}

export default function ExplorePage() {
  const router = useRouter();
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await fetchApi("/hashtags/trending");
        setHashtags(data.hashtags || []);
      } catch (err) {
        console.error("Trending hashtag hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-center">
        <div className="hidden lg:block w-[260px] shrink-0">
          <LeftSidebar />
        </div>

        <div className="w-full max-w-[600px]">
          <div className="border border-[#2a2a2a] rounded-t-lg p-4 mb-0" style={{backgroundColor: '#0a0a0a'}}>
            <h1 className="text-2xl font-bold" style={{color: '#d9dadd'}}>Keşfet</h1>
            <p className="text-sm mt-1" style={{color: '#6e767d'}}>Gündemdeki etiketler</p>
          </div>

          <div style={{backgroundColor: '#0a0a0a'}}>
            {hashtags.map((hashtag, index) => (
              <div
                key={hashtag.id}
                onClick={() => router.push(`/hashtag/${hashtag.name}`)}
                className="p-4 border-x border-b border-[#2a2a2a] hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <HashtagIcon className="w-6 h-6" style={{color: 'oklch(0.71 0.24 43.55)'}} />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{color: '#6e767d'}}>
                        {index + 1} · Gündemde
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mt-1" style={{color: '#d9dadd'}}>
                      #{hashtag.name}
                    </h3>
                    <p className="text-sm mt-1" style={{color: '#6e767d'}}>
                      {hashtag.count} gönderi
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block w-[300px] shrink-0 ml-[10px]">
          <RightSidebar hideHashtags={true} />
        </div>
      </div>
    </div>
  );
}
