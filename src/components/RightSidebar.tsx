"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";
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
        <div className="border border-theme-border p-4 rounded-lg" style={{ backgroundColor: 'var(--app-surface)' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--app-body-text)' }}>Gündem</h2>
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
                  className="flex flex-col items-start py-2 rounded-lg"
                >
                  <span className="font-bold" style={{ color: 'var(--app-body-text)' }}>#{hashtag.name}</span>
                  <span className="text-xs" style={{ color: 'var(--app-subtitle)' }}>{hashtag.count} gönderi</span>
                </Link>
              ))}

              {/* Daha fazla göster */}
              <Link
                href="/explore"
                className="flex items-center gap-1 pt-3"
                style={{ fontSize: '13px', color: 'var(--app-global-link-color)' }}
              >
                <span>Daha fazla göster</span>
                <IconChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Popüler Postlar */}
      <div className="border border-theme-border p-4 rounded-lg" style={{ backgroundColor: 'var(--app-surface)' }}>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--app-body-text)' }}>Popüler Postlar</h2>
        <PopularPostsSlider />
      </div>

      {/* Footer */}
      <div className="border border-theme-border p-4 rounded-lg" style={{ backgroundColor: 'var(--app-footer-bg)' }}>
        <div className="text-xs space-y-2" style={{ color: 'var(--app-subtitle)' }}>
          <div className="flex flex-wrap gap-2">
            <Link href="/about" >Hakkında</Link>
            <Link href="/terms">Kullanım Şartları</Link>
            <Link href="/privacy">Gizlilik</Link>
            <Link href="/contact">İletişim</Link>
          </div>
          <p>© 2025 Geyik</p>
        </div>
      </div>
    </div>
  );
}
