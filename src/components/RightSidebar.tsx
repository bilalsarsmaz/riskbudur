"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { IconChevronRight, IconBoltFilled } from "@tabler/icons-react";
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

interface Visitor {
  nickname: string;
  fullName: string;
  profileImage: string | null;
}

interface RightSidebarProps {
  hideHashtags?: boolean;
}

export default function RightSidebar({ hideHashtags = false }: RightSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const profileUsername = params?.username as string | undefined;
  // If there is an 'id' param, we are likely on a post detail page, not the main profile page.
  // We only want to show visitors on the main profile page.
  const isProfilePage = profileUsername && !params?.id;

  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitorsLoading, setVisitorsLoading] = useState(false);
  const [showPopularPosts, setShowPopularPosts] = useState(true);
  const [isModernTrending, setIsModernTrending] = useState(false);

  useEffect(() => {
    if (isProfilePage) {
      setVisitorsLoading(true);
      fetchApi(`/users/${profileUsername}/visitors`)
        .then((data: any) => {
          setVisitors(data.visitors || []);
        })
        .catch(console.error)
        .finally(() => setVisitorsLoading(false));
    }
  }, [profileUsername]);

  useEffect(() => {
    if (hideHashtags) {
      setLoading(false);
      return;
    }

    const fetchTrendingHashtags = async () => {
      try {
        const data = await fetchApi("/hashtags/trending?limit=10") as HashtagsResponse;

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

    // Fetch System Settings
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/settings", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const settings = await res.json();
          if (settings["enable_popular_posts"] === "false") {
            setShowPopularPosts(false);
          }
          if (settings["modern_trending_ui"] === "true") {
            setIsModernTrending(true);
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();

  }, [hideHashtags, pathname]); // pathname degisince de guncelle

  return (
    <div className="space-y-4">
      {/* Trending Hashtags */}
      {!hideHashtags && (
        <>
          {isModernTrending ? (
            <div className="mb-8">
              <h2 className="app-body-text-title mb-4 flex items-center gap-2" style={{ color: 'var(--app-body-text)' }}>
                <IconBoltFilled size={24} className="text-orange-500" />
                Gündem
              </h2>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2">
                    {trendingHashtags.map((hashtag) => (
                      <Link
                        key={hashtag.id}
                        href={`/hashtag/${hashtag.name}`}
                        className="px-2 py-1 rounded-full border text-[14px] font-bold transition-colors truncate max-w-full"
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: 'var(--app-border)',
                          color: 'var(--app-body-text)',
                        }}
                      >
                        {hashtag.name}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/i/explore"
                    className="flex items-center gap-1 pt-2"
                    style={{ fontSize: '13px', color: 'var(--app-global-link-color)' }}
                  >
                    <span>Daha fazla göster</span>
                    <IconChevronRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="app-box-style p-4" style={{ backgroundColor: 'var(--app-surface)' }}>
              <h2 className="app-body-text-title mb-4" style={{ color: 'var(--app-body-text)' }}>Gündem</h2>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <div className="space-y-1">
                  {trendingHashtags.slice(0, 5).map((hashtag) => (
                    <Link
                      key={hashtag.id}
                      href={`/hashtag/${hashtag.name}`}
                      className="flex flex-col items-start py-2 px-2 -mx-2 rounded-2xl hover:bg-white/5 transition-colors"
                    >
                      <span className="font-bold" style={{ color: 'var(--app-body-text)' }}>#{hashtag.name}</span>
                      <span className="text-xs" style={{ color: 'var(--app-subtitle)' }}>{hashtag.count} gönderi</span>
                    </Link>
                  ))}

                  <Link
                    href="/i/explore"
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
        </>
      )}

      {/* Dikizleyenler (Profile Page Only) OR Popular Posts (Other Pages) */}
      {isProfilePage ? (
        <div className="app-box-style p-4" style={{ backgroundColor: 'var(--app-surface)' }}>
          <h2 className="app-body-text-title mb-4" style={{ color: 'var(--app-body-text)' }}>Dikizleyenler</h2>
          {visitorsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#1DCD9F]"></div>
            </div>
          ) : (
            <>
              {visitors.length > 0 ? (
                <div className="grid grid-cols-6 gap-2">
                  {visitors.map((visitor, idx) => (
                    <Link href={`/${visitor.nickname}`} key={idx} className="block aspect-square group relative">
                      {visitor.profileImage ? (
                        <div className="w-full h-full app-box-style overflow-hidden hover:border-[var(--app-global-link-color)] transition-colors">
                          <img src={visitor.profileImage} alt={visitor.nickname} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-full h-full app-box-style bg-gray-800 flex items-center justify-center hover:border-[var(--app-global-link-color)] transition-colors">
                          <span className="text-sm font-bold text-gray-400">{visitor.nickname[0].toUpperCase()}</span>
                        </div>
                      )}



                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm py-4 text-center">Henüz kimse dikizlemedi...</div>
              )}
            </>
          )}
        </div>
      ) : showPopularPosts ? (
        <div className="app-box-style p-4" style={{ backgroundColor: 'var(--app-surface)' }}>
          <h2 className="app-body-text-title mb-4" style={{ color: 'var(--app-body-text)' }}>Popüler Postlar</h2>
          <PopularPostsSlider />
        </div>
      ) : null}

      {/* Footer */}
      <div className="app-box-style p-4" style={{ backgroundColor: 'var(--app-footer-bg)' }}>
        <div className="text-xs space-y-2" style={{ color: 'var(--app-subtitle)' }}>
          <div className="flex flex-wrap gap-2">
            <Link href="/help/about" className="hover:underline">Hakkında</Link>
            <Link href="/help/terms" className="hover:underline">Kullanım Şartları</Link>
            <Link href="/help/privacy" className="hover:underline">Gizlilik</Link>
            <Link href="/help/contact" className="hover:underline">İletişim</Link>
          </div>
          <p>© 2026 RiskBudur</p>
        </div>
      </div>
    </div >
  );
}
