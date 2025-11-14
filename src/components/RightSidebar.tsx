"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PopularPostsSlider from "./PopularPostsSlider";
import { fetchApi } from "@/lib/api";

interface Hashtag {
  id: number;
  name: string;
  count: number;
}

interface HashtagsResponse {
  hashtags: Hashtag[];
}

interface RightSidebarProps {
  hideHashtags?: boolean;
}

export default function RightSidebar({ hideHashtags = false }: RightSidebarProps) {
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hideHashtags) {
      setLoading(false);
      return;
    }

    const fetchTrendingHashtags = async () => {
      try {
        const data = await fetchApi("/hashtags/trending") as HashtagsResponse;
        
        if (data.hashtags && data.hashtags.length > 0) {
          setTrendingHashtags(data.hashtags);
        } else {
          setTrendingHashtags([
            { id: 1, name: "teknoloji", count: 45 },
            { id: 2, name: "yazilim", count: 38 },
            { id: 3, name: "sanat", count: 32 },
            { id: 4, name: "spor", count: 29 },
            { id: 5, name: "muzik", count: 24 }
          ]);
        }
      } catch (error) {
        console.error("Trending hashtagler yüklenirken hata oluştu:", error);
        setTrendingHashtags([
          { id: 1, name: "teknoloji", count: 45 },
          { id: 2, name: "yazilim", count: 38 },
          { id: 3, name: "sanat", count: 32 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrendingHashtags();
  }, [hideHashtags]);

  return (
    <div className="space-y-4">
      {/* Trending Hashtags */}
      {!hideHashtags && (
        <div className="border border-[#2a2a2a] p-4 rounded-lg" style={{backgroundColor: '#0a0a0a'}}>
          <h2 className="text-xl font-bold mb-4" style={{color: '#d9dadd'}}>Gündem</h2>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {trendingHashtags.map((hashtag) => (
                <Link 
                  key={hashtag.id}
                  href={`/hashtag/${hashtag.name}`}
                  className="flex items-center justify-between p-2 hover:bg-gray-800 rounded-lg"
                >
                  <span className="text-blue-500">#{hashtag.name}</span>
                  <span className="text-xs" style={{color: '#6e767d'}}>{hashtag.count} post</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Popüler Postlar */}
      <div className="border border-[#2a2a2a] p-4 rounded-lg" style={{backgroundColor: '#0a0a0a'}}>
        <h2 className="text-xl font-bold mb-4" style={{color: '#d9dadd'}}>Popüler Postlar</h2>
        <PopularPostsSlider />
      </div>

      {/* Footer */}
      <div className="border border-[#2a2a2a] p-4 rounded-lg" style={{backgroundColor: '#0a0a0a'}}>
        <div className="text-xs space-y-2" style={{color: '#6e767d'}}>
          <div className="flex flex-wrap gap-2">
            <Link href="/about" className="hover:underline">Hakkında</Link>
            <Link href="/terms" className="hover:underline">Kullanım Şartları</Link>
            <Link href="/privacy" className="hover:underline">Gizlilik</Link>
            <Link href="/contact" className="hover:underline">İletişim</Link>
          </div>
          <p>© 2023 Nown. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
}
