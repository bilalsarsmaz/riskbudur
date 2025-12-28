"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StandardPageLayout from "@/components/StandardPageLayout";
import GlobalHeader from "@/components/GlobalHeader";
import EditProfileModal from "@/components/EditProfileModal";
import ImageModal from "@/components/ImageModal";
import { LinkIcon, CalendarIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import {
  IconArrowLeft,
  IconCalendar,
  IconLink,
  IconMapPin,
  IconDots,
  IconMessageCircle,
  IconRepeat,
  IconHeart,
  IconChartBar,
  IconShare,
  IconArrowUp,
  IconRosetteDiscountCheckFilled,
  IconUserCancel,
  IconMail,
  IconUserCog
} from "@tabler/icons-react";
// import DirectMessageModal from "@/components/DirectMessageModal";
import { fetchApi, postApi, deleteApi } from "@/lib/api";
import { hasPermission, Permission, Role } from "@/lib/permissions";
import PostList from "@/components/PostList";
import { EnrichedPost } from "@/types/post";
import ReplyThreadPreview from "@/components/ReplyThreadPreview";
import VerificationBadge from "@/components/VerificationBadge";
import AdminBadge from "@/components/AdminBadge";

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
  verificationTier?: 'NONE' | 'GREEN' | 'GOLD' | 'GRAY';
  postsCount?: number;
  isFollowing?: boolean;
  id?: string;
  isBanned?: boolean;
  followsYou?: boolean;
  role?: string;
}

interface Visitor {
  nickname: string;
  fullName: string;
  profileImage: string | null;
}

export default function UserProfilePage() {
  // ... existing code ...

  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [activeTab, setActiveTab] = useState("posts");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [mediaPosts, setMediaPosts] = useState<EnrichedPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<EnrichedPost[]>([]);
  const [replyPosts, setReplyPosts] = useState<EnrichedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isHoveringFollow, setIsHoveringFollow] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);


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
    if (!bio) return [];

    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    const hashtagRegex = /#[\p{L}\p{N}_]+/gu;
    const mentionRegex = /@[\w_]+/g;
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2}(?:\/[^\s]*)?)/g;

    // Basit match yapısı
    const matches: Array<{ type: 'hashtag' | 'mention' | 'link'; start: number; end: number; text: string }> = [];

    let match;

    // Hashtag'leri bul
    while ((match = hashtagRegex.exec(bio)) !== null) {
      matches.push({ type: 'hashtag', start: match.index, end: match.index + match[0].length, text: match[0] });
    }

    // Mention'ları bul
    while ((match = mentionRegex.exec(bio)) !== null) {
      const isEmail = match.index > 0 && bio[match.index - 1] !== ' ' && bio[match.index - 1] !== '\n';
      if (!isEmail) {
        matches.push({ type: 'mention', start: match.index, end: match.index + match[0].length, text: match[0] });
      }
    }

    // Linkleri bul
    while ((match = linkRegex.exec(bio)) !== null) {
      const m = match!;
      // Çakışma kontrolü
      const isOverlapping = matches.some(existing =>
        (existing.start <= m.index && m.index < existing.end) ||
        (existing.start < m.index + m[0].length && m.index + m[0].length <= existing.end) ||
        (m.index <= existing.start && existing.end <= m.index + m[0].length)
      );

      if (!isOverlapping) {
        matches.push({ type: 'link', start: m.index, end: m.index + m[0].length, text: m[0] });
      }
    }

    matches.sort((a, b) => a.start - b.start);

    matches.forEach((match, index) => {
      if (match.start > lastIndex) {
        parts.push(bio.substring(lastIndex, match.start));
      }

      if (match.type === 'hashtag') {
        const hashtag = match.text.slice(1);
        parts.push(
          <Link
            key={`hashtag-${index}`}
            href={`/hashtag/${encodeURIComponent(hashtag.toLowerCase())}`}
            className="hover:underline hover:opacity-80"
            style={{ color: "var(--app-global-link-color)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {match.text}
          </Link>
        );
        lastIndex = match.end;
      } else if (match.type === 'mention') {
        const username = match.text.slice(1);
        parts.push(
          <Link
            key={`mention-${index}`}
            href={`/${username}`}
            className="hover:opacity-80" // Underline removed as per user preference
            style={{ color: "var(--app-global-link-color)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {match.text}
          </Link>
        );
        lastIndex = match.end;
      } else if (match.type === 'link') {
        let url = match.text;
        if (url.startsWith('www.')) {
          url = 'https://' + url;
        } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        parts.push(
          <a
            key={`link-${index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: "var(--app-global-link-color)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {match.text}
          </a>
        );
        lastIndex = match.end;
      }
    });

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

  // Record profile visit using API and fetch visitors for mobile view
  useEffect(() => {
    if (currentUser && currentUser.nickname !== username) {
      postApi(`/users/${username}/visit`, {}).catch(err => console.error("Visit record failed", err));
    }

    // Fetch visitors for mobile view
    fetchApi(`/users/${username}/visitors`)
      .then((data: any) => {
        setVisitors(data.visitors || []);
      })
      .catch(console.error);
  }, [currentUser, username]);

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

  useEffect(() => {
    if (profile) {
      setIsFollowing(profile.isFollowing || false);
    }
  }, [profile]);

  const handleFollow = async () => {
    if (!profile?.id) return;

    try {
      if (isFollowing) {
        setIsFollowing(false);
        setProfile(prev => prev ? ({ ...prev, followers: prev.followers - 1, isFollowing: false }) : null);
        await deleteApi(`/follows?followingId=${profile.id}`);
      } else {
        setIsFollowing(true);
        setProfile(prev => prev ? ({ ...prev, followers: prev.followers + 1, isFollowing: true }) : null);
        await postApi("/follows", { followingId: profile.id });
      }
    } catch (error) {
      console.error("Takip işlemi başarısız:", error);
      // Revert optimization on error
      setIsFollowing(!isFollowing);
      handleProfileUpdated();
    }
  };

  const handleBlock = async () => {
    if (!profile?.id) return;
    const isBlocking = (profile as any).isBlocking;

    if (isBlocking) {
      if (confirm(`@${profile.username} engelini kaldırmak istiyor musunuz?`)) {
        try {
          await deleteApi(`/blocks?userId=${profile.id}`);
          window.location.reload();
        } catch (e) {
          console.error("Engel kaldırılamadı:", e);
          alert('Hata oluştu');
        }
      }
    } else {
      if (confirm(`@${profile.username} kişisini engellemek istiyor musunuz?`)) {
        try {
          await postApi('/blocks', { userId: profile.id });
          window.location.reload();
        } catch (e) {
          console.error("Engellenemedi:", e);
          alert('Hata oluştu');
        }
      }
    }
  };

  const LoadingContent = () => (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1DCD9F]"></div>
    </div>
  );

  const ProfileContent = () => (
    <>

      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-theme-bg/80 backdrop-blur-md flex items-center px-4 h-[50px] sm:h-[60px] border-b border-theme-border">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              // Fallback if no history
              window.location.href = '/home';
            }
          }}
          className="mr-6 p-2 rounded-full hover:bg-[#181818] transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" style={{ color: 'var(--app-body-text)' }} />
        </button>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <h2 className="font-bold text-base sm:text-lg leading-5" style={{ color: 'var(--app-body-text)' }}>{profile!.fullName}</h2>
            <VerificationBadge
              tier={profile!.verificationTier}
              hasBlueTick={profile!.hasBlueTick}
              username={profile!.username}
              className="w-4 h-4 ml-1"
              style={{ width: "20px", height: "20px", marginLeft: "0px" }}
            />
            <AdminBadge
              role={profile!.role}
              className="w-4 h-4 ml-0.5"
            />
          </div>
          <span className="text-xs text-[#71767b]">{profile!.postsCount || 0} gönderi</span>
        </div>
      </div>

      <div className="border-b border-theme-border overflow-hidden">
        {profile!.coverImage ? (
          <div className="w-full h-32 sm:h-48">
            <img
              src={profile!.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-32 sm:h-48 bg-[#333]"></div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="relative -mt-[50px] sm:-mt-[80px]">
              <div
                className="cursor-pointer"
                onClick={() => profile!.profileImage && setSelectedImage(profile!.profileImage)}
              >
                {profile!.profileImage ? (
                  <img
                    src={profile!.profileImage}
                    alt={profile!.username}
                    className="w-20 h-20 sm:w-32 sm:h-32 rounded-full profile-circle object-cover hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full profile-circle bg-gray-300 flex items-center justify-center text-gray-600 text-2xl sm:text-4xl">
                    {profile!.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isOwnProfile && (
                <>
                  <button
                    onClick={() => router.push(`/messages?user=${profile!.username}`)}
                    className="w-10 h-10 rounded-full border border-theme-border flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <IconMail className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleBlock}
                    className={`w-10 h-10 rounded-full border border-theme-border flex items-center justify-center hover:bg-white/10 transition-colors ${(profile as any).isBlocking ? "text-red-500 border-red-500 bg-red-500/10" : ""}`}
                    title={(profile as any).isBlocking ? "Engeli Kaldır" : "Engelle"}
                  >
                    <IconUserCancel className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={() => isOwnProfile ? setIsEditModalOpen(true) : handleFollow()}
                onMouseEnter={() => setIsHoveringFollow(true)}
                onMouseLeave={() => setIsHoveringFollow(false)}
                className={`px-3 py-2 rounded-full font-bold border transition-colors ${isOwnProfile
                  ? "border-theme-border hover:bg-[#151515]"
                  : isFollowing
                    ? "hover:bg-opacity-10 min-w-[140px]"
                    : "border-theme-border text-theme-text hover:bg-white/10"
                  }`}
                style={!isOwnProfile && isFollowing ? {
                  borderColor: 'var(--app-accent)',
                  color: 'var(--app-accent)',
                  backgroundColor: isHoveringFollow ? 'rgba(255, 0, 0, 0.1)' : 'transparent'
                } : {}}
              >
                {isOwnProfile
                  ? "Profili Düzenle"
                  : isFollowing
                    ? (isHoveringFollow ? <span className="text-[#f4212e]">Kovalama</span> : "Kovalanıyor")
                    : "Kovala"
                }
              </button>

              {/* Admin Edit Button for other users */}
              {!isOwnProfile && currentUser && hasPermission(currentUser.role as Role, Permission.MANAGE_USER_FULLNAME) && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-10 h-10 rounded-full border border-theme-border flex items-center justify-center hover:bg-white/10 transition-colors ml-2"
                  title="Kullanıcıyı Düzenle (Admin)"
                >
                  <IconUserCog className="w-5 h-5" style={{ color: 'var(--app-body-text)' }} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center mb-1">
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--app-body-text)' }}>{profile!.fullName}</h1>
              <VerificationBadge
                tier={profile!.verificationTier}
                hasBlueTick={profile!.hasBlueTick}
                username={profile!.username}
                className="w-6 h-6 ml-0.5"
              />
              <AdminBadge
                role={profile!.role}
                className="w-6 h-6 ml-0.5"
              />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-gray-500">@{profile!.username}</p>
              {profile!.followsYou && (
                <span
                  className="text-[11px] px-1.5 py-0.5 rounded font-medium border"
                  style={{
                    backgroundColor: 'var(--app-body-bg)',
                    borderColor: 'var(--app-border)',
                    color: 'var(--app-subtitle)'
                  }}
                >
                  Seni Kovalıyor
                </span>
              )}
            </div>

            {profile!.bio && <p className="mt-2" style={{ color: 'var(--app-body-text)' }}>{parseBioWithMentions(profile!.bio)}</p>}

            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mt-2">
              {profile!.website && (
                <a
                  href={profile!.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                  style={{ color: 'var(--app-global-link-color)' }}
                >
                  <LinkIcon className="w-4 h-4 mr-1" />
                  {profile!.website}
                </a>
              )}
              <div className="flex items-center" style={{ color: "var(--app-subtitle)" }}>
                <CalendarIcon className="w-4 h-4 mr-1" />
                Katılma tarihi: {profile!.joinDate}
              </div>
            </div>

            <div className="flex space-x-4 mt-2">
              <Link
                href={`/${username}/connections?tab=following`}
                className="hover:underline cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <span style={{ color: "var(--app-subtitle)" }}>
                  <strong style={{ color: "var(--app-body-text)" }} className="text-sm sm:text-base">{profile!.following}</strong> Kovalanan
                </span>
              </Link>
              <Link
                href={`/${username}/connections?tab=followers`}
                className="hover:underline cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <span style={{ color: "var(--app-subtitle)" }}>
                  <strong style={{ color: "var(--app-body-text)" }}>{profile!.followers}</strong> Kovalayan
                </span>
              </Link>
            </div>
            {/* Mobile Visitors (Dikizleyenler) Section */}
            <div className="lg:hidden mt-4 border-t border-theme-border pt-4">
              {visitors.length > 0 && (
                <div className="flex flex-col">
                  <div className="flex overflow-x-auto gap-3 scrollbar-hide -mx-4 px-4">
                    {visitors.map((visitor, idx) => (
                      <Link key={idx} href={`/${visitor.nickname}`} className="flex-shrink-0 flex flex-col items-center gap-1 w-[50px]">
                        <div className="w-[40px] h-[40px] relative rounded-lg overflow-hidden border border-theme-border">
                          {visitor.profileImage ? (
                            <img src={visitor.profileImage} alt={visitor.nickname} className="w-full h-full object-cover" />) : (
                            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-400">{visitor?.nickname?.[0]?.toUpperCase() || "?"}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Tabs - Only show if NOT blocked */}
        {!((profile as any).isBlocked || (profile as any).isBlocking) && (profile!.postsCount > 0 || isOwnProfile) && (
          <div className="flex border-t border-theme-border mt-2">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-4 text-center font-medium relative ${activeTab === "posts" ? "font-bold" : "text-theme-text"}`}
              style={{ color: activeTab === "posts" ? "var(--app-global-link-color)" : undefined }}
            >
              Gönderiler
              {activeTab === "posts" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ backgroundColor: "var(--app-global-link-color)" }}></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("replies")}
              className={`flex-1 py-4 text-center font-medium relative ${activeTab === "replies" ? "font-bold" : "text-theme-text"}`}
              style={{ color: activeTab === "replies" ? "var(--app-global-link-color)" : undefined }}
            >
              Yanıtlar
              {activeTab === "replies" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ backgroundColor: "var(--app-global-link-color)" }}></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`flex-1 py-4 text-center font-medium relative ${activeTab === "media" ? "font-bold" : "text-theme-text"}`}
              style={{ color: activeTab === "media" ? "var(--app-global-link-color)" : undefined }}
            >
              Medya
              {activeTab === "media" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ backgroundColor: "var(--app-global-link-color)" }}></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("likes")}
              className={`flex-1 py-4 text-center font-medium relative ${activeTab === "likes" ? "font-bold" : "text-theme-text"}`}
              style={{ color: activeTab === "likes" ? "var(--app-global-link-color)" : undefined }}
            >
              Beğeniler
              {activeTab === "likes" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ backgroundColor: "var(--app-global-link-color)" }}></div>
              )}
            </button>
          </div>
        )}

      </div>

      {/* Blocked Content View */}
      {((profile as any).isBlocked || (profile as any).isBlocking) && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-t border-theme-border">
          <div className="bg-white/5 p-4 rounded-full mb-4">
            <span className="text-3xl">🚫</span>
          </div>
          {(profile as any).isBlocked ? (
            <>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--app-body-text)" }}>Bu kullanıcıyı engelledin</h3>
              <p className="text-[15px] mb-6 max-w-md" style={{ color: "var(--app-subtitle)" }}>
                Engellenen kullanıcıların gönderilerini göremezsin ve onlar da senin gönderilerini göremez.
              </p>
              <button
                onClick={async () => {
                  if (confirm(`@${profile!.username} engelini kaldırmak istiyor musunuz?`)) {
                    try {
                      await deleteApi(`/blocks?userId=${profile!.id}`);
                      window.location.reload();
                    } catch (e) {
                      alert('Hata oluştu');
                    }
                  }
                }}
                className="px-6 py-2 bg-[#ff0000] text-white rounded-full font-bold hover:bg-[#d40000] transition-colors"
              >
                Engeli Kaldır
              </button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--app-body-text)" }}>Bu kullanıcı seni engelledi</h3>
              <p className="text-[15px] mb-6 max-w-md" style={{ color: "var(--app-subtitle)" }}>
                Bu kullanıcının gönderilerini göremezsin.
              </p>
            </>
          )}
        </div>
      )}

      {/* Normal Content (Only if NOT blocked) */}
      {!((profile as any).isBlocked || (profile as any).isBlocking) && (
        <div className="overflow-hidden">
          {activeTab === "posts" && (
            <>
              {posts.length > 0 ? (
                <>

                  <PostList posts={posts} currentUserId={currentUser?.id} currentUserRole={currentUser?.role} />
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
                  <p style={{ color: "#6e767d" }}>Henuz gonderi yok.</p>
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
                          {noThreadReplies.length > 0 && <PostList posts={noThreadReplies} currentUserId={currentUser?.id} currentUserRole={currentUser?.role} />}
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
                  <p style={{ color: "#6e767d" }}>Henuz yanit yok.</p>
                </div>
              )}
            </>
          )}

          {activeTab === "media" && (
            <>
              {mediaPosts.length > 0 ? (
                <>
                  <PostList posts={mediaPosts} currentUserId={currentUser?.id} currentUserRole={currentUser?.role} />
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
                  <p style={{ color: "#6e767d" }}>Henuz medya paylasimi yok.</p>
                </div>
              )}
            </>
          )}

          {activeTab === "likes" && (
            <>
              {likedPosts.length > 0 ? (
                <>
                  <PostList posts={likedPosts} currentUserId={currentUser?.id} currentUserRole={currentUser?.role} />
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
                  <p style={{ color: "#6e767d" }}>Henuz begenilen gonderi yok.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );

  if (loading) {
    return (
      <StandardPageLayout>
        <LoadingContent />
      </StandardPageLayout>
    );
  }

  if (error || !profile) {
    return (
      <StandardPageLayout>
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--app-body-text)" }}>
            Böyle bir şey yok!
          </h2>
          <p className="text-[15px]" style={{ color: "var(--app-subtitle)" }}>
            Belki aradığın farklı bir şeydir...
          </p>
        </div>
      </StandardPageLayout>
    );
  }

  if (profile?.isBanned) {
    return (
      <StandardPageLayout>
        <GlobalHeader
          title="Hesap Askıya Alındı"
          subtitle={`@${username}`}
          showBackButton={true}
        />
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <IconUserCancel size={40} className="text-gray-500" />
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ color: "var(--app-body-text)" }}>
            Bu hesap sınır dışı edildi!
          </h2>
          <p className="text-[15px] max-w-md" style={{ color: "var(--app-subtitle)" }}>
            Kuralla uymadığı için RiskBudur Özel Tim'i tarafından yaka paça sınır dışı edildi.
          </p>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <>
      <StandardPageLayout>
        <ProfileContent />
      </StandardPageLayout>

      {/* Modal condition: Own Profile OR Admin with Permission */}
      {(isOwnProfile || (currentUser && hasPermission(currentUser.role as Role, Permission.MANAGE_USER_FULLNAME))) && profile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentProfile={{
            fullName: profile.fullName,
            bio: profile.bio || "",
            website: profile.website || "",
            // location: profile.location, // Location not in Profile interface currently in this file, ignoring
            profileImage: profile.profileImage,
            coverImage: profile.coverImage,
          }}
          onProfileUpdated={handleProfileUpdated}
          targetUserId={!isOwnProfile ? profile.id : undefined}
        />
      )}

      {/* Image Preview Modal */}
      <ImageModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      {/* {profile && (
        <DirectMessageModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          recipient={{
            id: profile.id!,
            fullName: profile.fullName,
            username: profile.username,
            profileImage: profile.profileImage
          }}
        />
      )} */}
    </>
  );
}
