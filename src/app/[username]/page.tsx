"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import EditProfileModal from "@/components/EditProfileModal";
import { LinkIcon, CalendarIcon } from "@heroicons/react/24/solid";
import { IconRosetteDiscountCheckFilled } from "@tabler/icons-react";
import { fetchApi } from "@/lib/api";
import PostList from "@/components/PostList";
import ReplyThreadPreview from "@/components/ReplyThreadPreview";

interface Profile {
  username: string;
  fullName: string;
  bio: string;
  website: string;
  joinDate: string;
  following: number;
  followers: number;
  coverImage: string | null;
  profileImage: string | null;
  hasBlueTick: boolean;
}

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
    hasBlueTick: boolean;
    profileImage?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [activeTab, setActiveTab] = useState("posts");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaPosts, setMediaPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [replyPosts, setReplyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [validUsernames, setValidUsernames] = useState<string[]>([]);

  // Pagination state'leri
  const [postsPage, setPostsPage] = useState(0);
  const [postsHasMore, setPostsHasMore] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [mediaPage, setMediaPage] = useState(0);
  const [mediaHasMore, setMediaHasMore] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [likesPage, setLikesPage] = useState(0);
  const [likesHasMore, setLikesHasMore] = useState(true);
  const [likesLoading, setLikesLoading] = useState(false);
  const [repliesPage, setRepliesPage] = useState(0);
  const [repliesHasMore, setRepliesHasMore] = useState(true);
  const [repliesLoading, setRepliesLoading] = useState(false);

  // Ref'ler
  const postsPageRef = useRef(0);
  const mediaPageRef = useRef(0);
  const likesPageRef = useRef(0);
  const repliesPageRef = useRef(0);
  const postsHasMoreRef = useRef(true);
  const mediaHasMoreRef = useRef(true);
  const likesHasMoreRef = useRef(true);
  const repliesHasMoreRef = useRef(true);
  const postsLoadingRef = useRef(false);
  const mediaLoadingRef = useRef(false);
  const likesLoadingRef = useRef(false);
  const repliesLoadingRef = useRef(false);

  const parseBioWithMentions = (bio: string): React.ReactNode[] => {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let key = 0;
    
    while ((match = mentionRegex.exec(bio)) !== null) {
      if (match.index > lastIndex) {
        parts.push(bio.substring(lastIndex, match.index));
      }
      const mentionedUsername = match[1];
      if (validUsernames.includes(mentionedUsername.toLowerCase())) {
        parts.push(
          <Link key={key++} href={`/${mentionedUsername}`} className="text-[#1DCD9F]">
            @{mentionedUsername}
          </Link>
        );
      } else {
        parts.push(`@${mentionedUsername}`);
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < bio.length) {
      parts.push(bio.substring(lastIndex));
    }
    return parts;
  };

  // Load more functions
  const loadMorePosts = useCallback(async () => {
    if (postsLoadingRef.current || !postsHasMoreRef.current) return;
    postsLoadingRef.current = true;
    setPostsLoading(true);

    try {
      const data = await fetchApi(`/users/${username}/posts?skip=${(postsPageRef.current + 1) * 20}&take=20`);
      const newPosts = data.posts || [];
      
      if (newPosts.length === 0) {
        setPostsHasMore(false);
        postsHasMoreRef.current = false;
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setPostsPage(postsPageRef.current + 1);
        postsPageRef.current += 1;
      }
    } catch (err) {
      console.error("Postlar yuklenirken hata olustu:", err);
      setPostsHasMore(false);
      postsHasMoreRef.current = false;
    } finally {
      setPostsLoading(false);
      postsLoadingRef.current = false;
    }
  }, [username]);

  const loadMoreMedia = useCallback(async () => {
    if (mediaLoadingRef.current || !mediaHasMoreRef.current) return;
    mediaLoadingRef.current = true;
    setMediaLoading(true);

    try {
      const data = await fetchApi(`/users/${username}/media?skip=${(mediaPageRef.current + 1) * 20}&take=20`);
      const newPosts = data.posts || [];
      
      if (newPosts.length === 0) {
        setMediaHasMore(false);
        mediaHasMoreRef.current = false;
      } else {
        setMediaPosts((prev) => [...prev, ...newPosts]);
        setMediaPage(mediaPageRef.current + 1);
        mediaPageRef.current += 1;
      }
    } catch (err) {
      console.error("Medya postlari yuklenirken hata olustu:", err);
      setMediaHasMore(false);
      mediaHasMoreRef.current = false;
    } finally {
      setMediaLoading(false);
      mediaLoadingRef.current = false;
    }
  }, [username]);

  const loadMoreLikes = useCallback(async () => {
    if (likesLoadingRef.current || !likesHasMoreRef.current) return;
    likesLoadingRef.current = true;
    setLikesLoading(true);

    try {
      const data = await fetchApi(`/users/${username}/likes?skip=${(likesPageRef.current + 1) * 20}&take=20`);
      const newPosts = data.posts || [];
      
      if (newPosts.length === 0) {
        setLikesHasMore(false);
        likesHasMoreRef.current = false;
      } else {
        setLikedPosts((prev) => [...prev, ...newPosts]);
        setLikesPage(likesPageRef.current + 1);
        likesPageRef.current += 1;
      }
    } catch (err) {
      console.error("Begenilen postlar yuklenirken hata olustu:", err);
      setLikesHasMore(false);
      likesHasMoreRef.current = false;
    } finally {
      setLikesLoading(false);
      likesLoadingRef.current = false;
    }
  }, [username]);

  const loadMoreReplies = useCallback(async () => {
    if (repliesLoadingRef.current || !repliesHasMoreRef.current) return;
    repliesLoadingRef.current = true;
    setRepliesLoading(true);

    try {
      const data = await fetchApi(`/users/${username}/replies?skip=${(repliesPageRef.current + 1) * 20}&take=20`);
      const newPosts = data.posts || [];
      
      if (newPosts.length === 0) {
        setRepliesHasMore(false);
        repliesHasMoreRef.current = false;
      } else {
        setReplyPosts((prev) => [...prev, ...newPosts]);
        setRepliesPage(repliesPageRef.current + 1);
        repliesPageRef.current += 1;
      }
    } catch (err) {
      console.error("Yanıtlar yuklenirken hata olustu:", err);
      setRepliesHasMore(false);
      repliesHasMoreRef.current = false;
    } finally {
      setRepliesLoading(false);
      repliesLoadingRef.current = false;
    }
  }, [username]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const data = await fetchApi("/users/me");
        setCurrentUser(data);
      } catch (err) {
        console.error("Mevcut kullanici alinamadi:", err);
      }
    };

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchApi(`/users/${username}`);
        setProfile(data);
        setError(null);
        
        if (data.bio) {
          const mentionRegex = /@([a-zA-Z0-9_]+)/g;
          const mentions: string[] = [];
          let match;
          while ((match = mentionRegex.exec(data.bio)) !== null) {
            mentions.push(match[1]);
          }
          
          const validUsers: string[] = [];
          for (const mention of mentions) {
            try {
              const checkData = await fetchApi(`/users/check/${mention}`);
              if (checkData.exists) {
                validUsers.push(mention.toLowerCase());
              }
            } catch (e) {}
          }
          setValidUsernames(validUsers);
        }
      } catch (err) {
        setError("Profil yuklenirken bir hata olustu.");
        console.error("Profil yukleme hatasi:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPosts = async () => {
      try {
        const data = await fetchApi(`/users/${username}/posts?skip=0&take=20`);
        setPosts(data.posts || []);
        postsPageRef.current = 0;
        postsHasMoreRef.current = (data.posts || []).length === 20;
        setPostsHasMore((data.posts || []).length === 20);
      } catch (err) {
        console.error("Postlar yuklenirken hata olustu:", err);
      }
    };

    const fetchUserMediaPosts = async () => {
      try {
        const data = await fetchApi(`/users/${username}/media?skip=0&take=20`);
        setMediaPosts(data.posts || []);
        mediaPageRef.current = 0;
        mediaHasMoreRef.current = (data.posts || []).length === 20;
        setMediaHasMore((data.posts || []).length === 20);
      } catch (err) {
        console.error("Medya postlari yuklenirken hata olustu:", err);
      }
    };

    const fetchUserLikedPosts = async () => {
      try {
        const data = await fetchApi(`/users/${username}/likes?skip=0&take=20`);
        setLikedPosts(data.posts || []);
        likesPageRef.current = 0;
        likesHasMoreRef.current = (data.posts || []).length === 20;
        setLikesHasMore((data.posts || []).length === 20);
      } catch (err) {
        console.error("Begenilen postlar yuklenirken hata olustu:", err);
      }
    };

    const fetchUserReplies = async () => {
      try {
        const data = await fetchApi(`/users/${username}/replies?skip=0&take=20`);
        setReplyPosts(data.posts || []);
        repliesPageRef.current = 0;
        repliesHasMoreRef.current = (data.posts || []).length === 20;
        setRepliesHasMore((data.posts || []).length === 20);
      } catch (err) {
        console.error("Yanıtlar yuklenirken hata olustu:", err);
      }
    };

    fetchCurrentUser();
    fetchProfile();
    fetchUserPosts();
    fetchUserMediaPosts();
    fetchUserLikedPosts();
    fetchUserReplies();
  }, [username]);

  // Scroll event listener
  useEffect(() => {
    if (!profile) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollHeight = document.documentElement.scrollHeight;
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const clientHeight = document.documentElement.clientHeight;
          
          if (scrollHeight - scrollTop - clientHeight < 500) {
            if (activeTab === "posts" && postsHasMoreRef.current && !postsLoadingRef.current) {
              loadMorePosts();
            } else if (activeTab === "media" && mediaHasMoreRef.current && !mediaLoadingRef.current) {
              loadMoreMedia();
            } else if (activeTab === "likes" && likesHasMoreRef.current && !likesLoadingRef.current) {
              loadMoreLikes();
            } else if (activeTab === "replies" && repliesHasMoreRef.current && !repliesLoadingRef.current) {
              loadMoreReplies();
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [profile, activeTab, loadMorePosts, loadMoreMedia, loadMoreLikes, loadMoreReplies]);

  const isOwnProfile = currentUser?.nickname === username;

  const handleProfileUpdated = async () => {
    try {
      const data = await fetchApi(`/users/${username}`);
      setProfile(data);
    } catch (err) {
      console.error("Profil bilgileri yenilenemedi:", err);
      window.location.reload();
    }
  };

  const LoadingContent = () => (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1DCD9F]"></div>
    </div>
  );

  const ProfileContent = () => (
    <>
      <div className="border-b border-[#222222] overflow-hidden">
        {profile!.coverImage ? (
          <div className="w-full h-48">
            <img
              src={profile!.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-[#333]"></div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="relative" style={{marginTop: "-80px"}}>
              {profile!.profileImage ? (
                <img
                  src={profile!.profileImage}
                  alt={profile!.username}
                  className="w-32 h-32 rounded-full border-4 border-black object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-black bg-gray-300 flex items-center justify-center text-gray-600 text-4xl">
                  {profile!.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => isOwnProfile ? setIsEditModalOpen(true) : null}
              className="px-4 py-2 rounded-full font-medium border border-[#222222] hover:bg-[#151515]"
            >
              {isOwnProfile ? "Profili Düzenle" : "Takip Et"}
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-center mb-1">
              <h1 className="text-2xl font-bold">{profile!.fullName}</h1>
              {profile!.hasBlueTick && (
                <IconRosetteDiscountCheckFilled className="post-badge post-badge-blue w-6 h-6 ml-0.5 verified-icon" />
              )}
            </div>
            <p className="text-gray-500">@{profile!.username}</p>
            
            {profile!.bio && <p className="mt-2" style={{color: '#d9dadd'}}>{parseBioWithMentions(profile!.bio)}</p>}
            
            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mt-2">
              {profile!.website && (
                <a
                  href={profile!.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                  style={{color: '#1DCD9F'}}
                >
                  <LinkIcon className="w-4 h-4 mr-1" />
                  {profile!.website}
                </a>
              )}
              <div className="flex items-center" style={{color: "#6e767d"}}>
                <CalendarIcon className="w-4 h-4 mr-1" />
                Katilma tarihi: {profile!.joinDate}
              </div>
            </div>

            <div className="flex space-x-4 mt-2">
              <span>
                <strong>{profile!.following}</strong> <span style={{color: "#6e767d"}}>Takip Edilen</span>
              </span>
              <span>
                <strong>{profile!.followers}</strong> <span style={{color: "#6e767d"}}>Takipci</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex border-t border-[#222222]">
          <button
            onClick={() => setActiveTab("posts")}
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === "posts" ? "border-b-2 border-[#1DCD9F]" : ""
            }`}
          >
            Gönderiler
          </button>
          <button
            onClick={() => setActiveTab("replies")}
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === "replies" ? "border-b-2 border-[#1DCD9F]" : ""
            }`}
          >
            Yanıtlar
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === "media" ? "border-b-2 border-[#1DCD9F]" : ""
            }`}
          >
            Medya
          </button>
          <button
            onClick={() => setActiveTab("likes")}
            className={`flex-1 py-4 text-center font-medium ${
              activeTab === "likes" ? "border-b-2 border-[#1DCD9F]" : ""
            }`}
          >
            Beğeniler
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        {activeTab === "posts" && (
          <>
            {posts.length > 0 ? (
              <>
                <PostList posts={posts} />
                {postsHasMore && postsLoading && (
                  <div className="flex justify-center py-4">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                      <p className="mt-2 text-sm text-gray-500">Daha fazla post yükleniyor...</p>
                    </div>
                  </div>
                )}
                {!postsHasMore && posts.length > 0 && (
                  <div className="flex justify-center py-4 text-gray-500 text-sm">Tüm postlar yüklendi</div>
                )}
              </>
            ) : (
              <div className="p-4">
                <p style={{color: "#6e767d"}}>Henuz gonderi yok.</p>
              </div>
            )}
          </>
        )}

        {activeTab === "replies" && (
          <>
            {replyPosts.length > 0 ? (
              <>
                <div>
                  {(() => {
                    const threadGroups: { [key: string]: any[] } = {};
                    const noThreadReplies: any[] = [];
                    
                    replyPosts.forEach((reply: any) => {
                      if (reply.threadRoot) {
                        const rootId = reply.threadRoot.id;
                        if (!threadGroups[rootId]) {
                          threadGroups[rootId] = [];
                        }
                        threadGroups[rootId].push(reply);
                      } else {
                        noThreadReplies.push(reply);
                      }
                    });
                    
                    const groupedPreviews = Object.values(threadGroups).sort((a: any[], b: any[]) => new Date(b[0].createdAt).getTime() - new Date(a[0].createdAt).getTime()).map((replies: any[]) => {
                      const latestReply = replies[0];
                      return (
                        <ReplyThreadPreview
                          key={latestReply.threadRoot.id}
                          threadRoot={latestReply.threadRoot}
                          userReply={latestReply}
                          middlePostsCount={latestReply.middlePostsCount || 0}
                          threadRepliesCount={latestReply.threadRepliesCount || 0}
                        />
                      );
                    });
                    
                    return (
                      <>
                        {groupedPreviews}
                        {noThreadReplies.length > 0 && <PostList posts={noThreadReplies} />}
                      </>
                    );
                  })()}
                </div>
                {repliesHasMore && repliesLoading && (
                  <div className="flex justify-center py-4">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                      <p className="mt-2 text-sm text-gray-500">Daha fazla yanıt yükleniyor...</p>
                    </div>
                  </div>
                )}
                {!repliesHasMore && replyPosts.length > 0 && (
                  <div className="flex justify-center py-4 text-gray-500 text-sm">Tüm yanıtlar yüklendi</div>
                )}
              </>
            ) : (
              <div className="p-4">
                <p style={{color: "#6e767d"}}>Henuz yanit yok.</p>
              </div>
            )}
          </>
        )}

        {activeTab === "media" && (
          <>
            {mediaPosts.length > 0 ? (
              <>
                <PostList posts={mediaPosts} />
                {mediaHasMore && mediaLoading && (
                  <div className="flex justify-center py-4">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                      <p className="mt-2 text-sm text-gray-500">Daha fazla medya yükleniyor...</p>
                    </div>
                  </div>
                )}
                {!mediaHasMore && mediaPosts.length > 0 && (
                  <div className="flex justify-center py-4 text-gray-500 text-sm">Tüm medya yüklendi</div>
                )}
              </>
            ) : (
              <div className="p-4">
                <p style={{color: "#6e767d"}}>Henuz medya paylasimi yok.</p>
              </div>
            )}
          </>
        )}

        {activeTab === "likes" && (
          <>
            {likedPosts.length > 0 ? (
              <>
                <PostList posts={likedPosts} />
                {likesHasMore && likesLoading && (
                  <div className="flex justify-center py-4">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                      <p className="mt-2 text-sm text-gray-500">Daha fazla beğeni yükleniyor...</p>
                    </div>
                  </div>
                )}
                {!likesHasMore && likedPosts.length > 0 && (
                  <div className="flex justify-center py-4 text-gray-500 text-sm">Tüm beğeniler yüklendi</div>
                )}
              </>
            ) : (
              <div className="p-4">
                <p style={{color: "#6e767d"}}>Henuz begenilen gonderi yok.</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );

  if (loading) {
    return (
      <>
        <MobileHeader />
        <div className="hidden lg:flex justify-center w-full">
          <div className="flex w-full max-w-[1310px]">
            <header className="left-nav flex-shrink-0 w-[275px] h-screen sticky top-0 overflow-y-auto z-10">
              <div className="h-full p-0 m-0 border-0">
                <LeftSidebar />
              </div>
            </header>
            <main className="content flex flex-1 min-h-screen">
              <section className="timeline flex-1 w-full lg:max-w-[600px] flex flex-col items-stretch lg:border-l lg:border-r border-[#222222]">
                <LoadingContent />
              </section>
              <aside className="right-side hidden xl:block w-[350px] flex-shrink-0 ml-[10px] pt-6">
                <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                  <RightSidebar />
                </div>
              </aside>
            </main>
          </div>
        </div>
        <div className="lg:hidden flex flex-col min-h-screen">
          <main className="content flex-1 pt-14 pb-16">
            <LoadingContent />
          </main>
        </div>
        <MobileBottomNav />
      </>
    );
  }

  if (error || !profile) {
    return (
      <>
        <MobileHeader />
        <div className="hidden lg:flex justify-center w-full">
          <div className="flex w-full max-w-[1310px]">
            <header className="left-nav flex-shrink-0 w-[275px] h-screen sticky top-0 overflow-y-auto z-10">
              <div className="h-full p-0 m-0 border-0">
                <LeftSidebar />
              </div>
            </header>
            <main className="content flex flex-1 min-h-screen">
              <section className="timeline flex-1 w-full lg:max-w-[600px] flex flex-col items-stretch lg:border-l lg:border-r border-[#222222]">
                <div className="p-8 text-center">
                  <p className="text-red-500">{error || "Profil bulunamadi"}</p>
                </div>
              </section>
              <aside className="right-side hidden xl:block w-[350px] flex-shrink-0 ml-[10px] pt-6">
                <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                  <RightSidebar />
                </div>
              </aside>
            </main>
          </div>
        </div>
        <div className="lg:hidden flex flex-col min-h-screen">
          <main className="content flex-1 pt-14 pb-16">
            <div className="p-8 text-center">
              <p className="text-red-500">{error || "Profil bulunamadi"}</p>
            </div>
          </main>
        </div>
        <MobileBottomNav />
      </>
    );
  }

  return (
    <>
      <MobileHeader />
      
      <div className="hidden lg:flex justify-center w-full">
        <div className="flex w-full max-w-[1310px]">
          <header className="left-nav flex-shrink-0 w-[275px] h-screen sticky top-0 overflow-y-auto z-10">
            <div className="h-full p-0 m-0 border-0">
              <LeftSidebar />
            </div>
          </header>

          <main className="content flex flex-1 min-h-screen">
            <section className="timeline flex-1 w-full lg:max-w-[600px] flex flex-col items-stretch lg:border-l lg:border-r border-[#222222]">
              <ProfileContent />
            </section>

            <aside className="right-side hidden xl:block w-[350px] flex-shrink-0 ml-[10px] pt-6">
              <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                <RightSidebar />
              </div>
            </aside>
          </main>
        </div>
      </div>

      <div className="lg:hidden flex flex-col min-h-screen">
        <main className="content flex-1 pt-14 pb-16">
          <section className="timeline w-full flex flex-col items-stretch">
            <ProfileContent />
          </section>
        </main>
      </div>

      <MobileBottomNav />

      {isOwnProfile && profile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentProfile={{
            fullName: profile.fullName,
            bio: profile.bio || "",
            website: profile.website || "",
            profileImage: profile.profileImage,
            coverImage: profile.coverImage,
          }}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </>
  );
}
