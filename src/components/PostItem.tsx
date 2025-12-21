"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EnrichedPost } from "@/types/post";
import { postApi, deleteApi } from "@/lib/api";
import MinimalCommentModal from "./MinimalCommentModal";
import QuoteModal from "./QuoteModal";
import PostHeader from "./PostHeader";
import VerificationBadge from "./VerificationBadge";
import ImageModal from "./ImageModal";
import { formatCustomDate } from "@/utils/date";
import PollDisplay from "@/components/PollDisplay";

import {
  IconHeart,
  IconDots,
  IconHeartFilled,
  IconMessage2,
  IconRepeat,
  IconRosetteDiscountCheckFilled,
  IconTargetArrow,
  IconTimelineEventText,
  IconShare3,
  IconPlayerPlay,
  IconLibraryPlusFilled,
  IconTrash,
  IconChartBar,
  IconCode,
  IconUserPlus,
  IconUserMinus,
  IconBan,
  IconFlag
} from "@tabler/icons-react";

interface PostItemProps {
  post: EnrichedPost;
  isFirst?: boolean;
  currentUserId?: string;
  onPostDeleted?: (post: EnrichedPost) => void;
  onPostCreated?: (post: EnrichedPost) => void;
  onCommentAdded?: (comment: any) => void;
  showThreadLine?: boolean;
  isLastInThread?: boolean;
  isFirstInThread?: boolean;
  isThread?: boolean;
  showThreadFooter?: boolean;
  className?: string;
  isHero?: boolean;
}

export default function PostItem({
  post,
  isFirst = false,
  currentUserId,
  onPostDeleted,
  onPostCreated,
  onCommentAdded,
  showThreadLine = false,
  isLastInThread = false,
  isFirstInThread = false,
  isThread = false,
  showThreadFooter = true,
  className = "",
  isHero = false
}: PostItemProps) {
  const router = useRouter();
  const defaultCounts = { likes: 0, comments: 0, quotes: 0 };
  const counts = post._count || defaultCounts;

  const [showCopiedToast, setShowCopiedToast] = useState(false);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Fallback to window.location if navigator or specialized logic fails, 
    // but usually construction from nickname/id is safest
    const url = `${window.location.origin}/${post.author.nickname}/status/${post.id}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  };

  const [isLiked, setIsLiked] = useState(post.isLiked || false);

  const [likeCount, setLikeCount] = useState(counts.likes);
  const [commentCount, setCommentCount] = useState(counts.comments);
  const [quoteCount, setQuoteCount] = useState(counts.quotes || post.quoteCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [quoted, setQuoted] = useState(post.isQuoted || false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [isCommented, setIsCommented] = useState(post.isCommented || false);
  const [linkedPosts, setLinkedPosts] = useState<any[]>([]);
  const [youtubeEmbedOpen, setYoutubeEmbedOpen] = useState(false);

  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const heroMenuRef = useRef<HTMLDivElement>(null);
  const heroMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const defaultCounts = { likes: 0, comments: 0, quotes: 0 };
    const counts = post._count || defaultCounts;

    setIsLiked(post.isLiked || false);
    setLikeCount(counts.likes);
    setCommentCount(counts.comments);
    setQuoteCount(counts.quotes || post.quoteCount || 0);
    setQuoted(post.isQuoted || false);
    setIsCommented(post.isCommented || false);
    setIsBookmarked(post.isBookmarked || false);
  }, [post.id, post.isLiked, post._count, post.isQuoted, post.isCommented, post.isBookmarked]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Share Menu
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node) &&
        !shareButtonRef.current?.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }

      // Hero Menu
      if (
        heroMenuRef.current &&
        !heroMenuRef.current.contains(event.target as Node) &&
        !heroMenuButtonRef.current?.contains(event.target as Node)
      ) {
        setHeaderMenuOpen(false);
      }
    };

    if (showShareMenu || headerMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showShareMenu, headerMenuOpen]);

  useEffect(() => {
    const extractPostLinks = (content: string): string[] => {
      if (!content) return [];

      const postLinkRegex = /(?:https?:\/\/)?(?:www\.)?riskbudur\.com\/(?:[^\/]+\/)?status\/(\d+)/gi;
      const matches: string[] = [];
      let match;

      while ((match = postLinkRegex.exec(content)) !== null) {
        if (match[1] && !matches.includes(match[1])) {
          matches.push(match[1]);
        }
      }

      return matches;
    };

    const postIds = extractPostLinks(post.content);

    if (postIds.length > 0) {
      const fetchLinkedPosts = async () => {
        try {
          const posts = await Promise.all(
            postIds.map(async (id) => {
              const response = await fetch(`/api/posts/${id}`);
              if (response.ok) {
                return await response.json();
              }
              return null;
            })
          );

          setLinkedPosts(posts.filter(p => p !== null));
        } catch (error) {
          console.error("Linked posts fetch error:", error);
        }
      };

      fetchLinkedPosts();
    }
  }, [post.content]);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token bulunamadı");
        return;
      }
      if (isLiked) {
        await deleteApi(`/likes?postId=${post.id}`);
      } else {
        await postApi("/likes", { postId: post.id });
      }
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error("Beğeni hatası:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentClick = () => {
    setIsCommentModalOpen(true);
  };

  const handleCommentAdded = (newComment?: any) => {
    setCommentCount(prev => prev + 1);
    setIsCommented(true);
    setIsCommentModalOpen(false);
    if (onCommentAdded && newComment) {
      onCommentAdded(newComment);
    }
  };

  const handleQuoteClick = () => {
    setIsQuoteModalOpen(true);
  };

  const handleQuoteAdded = (newPost?: EnrichedPost) => {
    setQuoteCount(prev => prev + 1);
    setQuoted(true);
    setIsQuoteModalOpen(false);
    if (newPost && onPostCreated) {
      onPostCreated(newPost);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await deleteApi(`/follows?userId=${post.author.id}`);
        setIsFollowing(false);
      } else {
        await postApi("/follows", { followingId: post.author.id });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Takip hatası:", error);
    }
  };

  const handleBlock = async () => {
    if (confirm(`@${post.author.nickname} adlı kullanıcıyı engellemek istediğinize emin misiniz?`)) {
      console.log("Engelle:", post.author.nickname);
    }
  };

  const handleReport = () => {
    console.log("Gönderiyi bildir:", post.id);
  };

  const handleDelete = async () => {
    if (confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) {
      try {
        await deleteApi(`/posts/${post.id}`);
        if (onPostDeleted) {
          onPostDeleted(post);
        }
      } catch (error) {
        console.error("Silme hatası:", error);
        alert("Gönderi silinirken bir hata oluştu");
      }
    }
  };

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token bulunamadı");
        return;
      }
      if (isBookmarked) {
        await deleteApi(`/bookmarks?postId=${post.id}`);
      } else {
        await postApi("/bookmarks", { postId: post.id });
      }
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Bookmark hatası:", error);
    }
  };



  const isPopular = (counts.likes > 30 || counts.comments > 10);
  const isAnonymous = post.isAnonymous || false;

  const handlePostClick = (e: React.MouseEvent) => {
    // Eğer tıklanan element link veya buton ise yönlendirme yapma
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.closest('button') || target.closest('[role="button"]')) {
      return;
    }

    // Metin seçimi varsa yönlendirme yapma
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    router.push(`/${post.author.nickname}/status/${post.id}`);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Post içeriğini parse edip hashtag ve linkleri tıklanabilir hale getir
  const parseContent = (content: string) => {
    if (!content) return null;
    const postLinkRegex = /(?:https?:\/\/)?(?:www\.)?riskbudur\.net\/(?:[^\/]+\/)?status\/\d+/gi;

    // Önce içeriğin sadece post linki(leri) ve boşluklardan oluşup oluşmadığını kontrol et
    const tempContent = content.trim();
    const postLinks: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = postLinkRegex.exec(content)) !== null) {
      postLinks.push(match[0]);
    }

    if (postLinks.length > 0) {
      let contentWithoutLinks = content;
      postLinks.forEach(link => {
        contentWithoutLinks = contentWithoutLinks.replace(link, '');
      });
      if (!contentWithoutLinks.trim()) {
        return null;
      }
    }

    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    const hashtagRegex = /#[\p{L}\p{N}_]+/gu;
    const mentionRegex = /@[\w_]+/g;
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2}(?:\/[^\s]*)?)/g;
    const matches: Array<{ type: 'hashtag' | 'mention' | 'link' | 'postlink'; start: number; end: number; text: string }> = [];

    // Hashtag'leri bul
    while ((match = hashtagRegex.exec(content)) !== null) {
      matches.push({ type: 'hashtag', start: match.index, end: match.index + match[0].length, text: match[0] });
    }

    // Mention'ları bul
    while ((match = mentionRegex.exec(content)) !== null) {
      // Mention bir email adresi parcası mı kontrol et (basit bir kontrol)
      const isEmail = match.index > 0 && content[match.index - 1] !== ' ' && content[match.index - 1] !== '\n';
      if (!isEmail) {
        matches.push({ type: 'mention', start: match.index, end: match.index + match[0].length, text: match[0] });
      }
    }

    // Post linklerini bul
    while ((match = postLinkRegex.exec(content)) !== null) {
      const m = match!;
      const isOverlapping = matches.some(existing =>
        existing.start <= m.index && m.index < existing.end ||
        existing.start < m.index + m[0].length && m.index + m[0].length <= existing.end
      );
      if (!isOverlapping) {
        matches.push({ type: 'postlink', start: m.index, end: m.index + m[0].length, text: m[0] });
      }
    }

    // Diğer linkleri bul
    while ((match = linkRegex.exec(content)) !== null) {
      const m = match!;
      const isPostLink = /riskbudur\.net\/(?:[^\/]+\/)?status\/\d+/i.test(m[0]);

      // Çakışma kontrolü
      const isOverlapping = matches.some(existing =>
        (existing.start <= m.index && m.index < existing.end) || // Yeni link eskisiyle başlıyor
        (existing.start < m.index + m[0].length && m.index + m[0].length <= existing.end) || // Yeni link eskisiyle bitiyor
        (m.index <= existing.start && existing.end <= m.index + m[0].length) // Yeni link eskisini kapsıyor
      );

      if (!isPostLink && !isOverlapping) {
        matches.push({ type: 'link', start: m.index, end: m.index + m[0].length, text: m[0] });
      }
    }

    matches.sort((a, b) => a.start - b.start);

    matches.forEach((match, index) => {
      if (match.start > lastIndex) {
        parts.push(content.substring(lastIndex, match.start));
      }

      if (match.type === 'hashtag') {
        const hashtag = match.text.slice(1);
        parts.push(
          <Link
            key={`hashtag-${index}`}
            href={`/hashtag/${encodeURIComponent(hashtag.toLowerCase())}`}
            className="text-[var(--app-global-link-color)]"
            onClick={(e) => e.stopPropagation()}
          >
            {match.text}
          </Link>
        );
        lastIndex = match.end;
      } else if (match.type === 'mention') {
        const username = match.text.slice(1);
        const isValidMention = post.mentionedUsers ? post.mentionedUsers.includes(username) : true;

        if (isValidMention) {
          parts.push(
            <Link
              key={`mention-${index}`}
              href={`/${username}`}
              className="text-[var(--app-global-link-color)]"
              onClick={(e) => e.stopPropagation()}
            >
              {match.text}
            </Link>
          );
        } else {
          parts.push(
            <span
              key={`mention-${index}`}
              className="text-[var(--app-body-text)]"
            >
              {match.text}
            </span>
          );
        }
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
            className="text-[var(--app-global-link-color)] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {match.text}
          </a>
        );
        lastIndex = match.end;
      } else if (match.type === 'postlink') {
        lastIndex = match.end;
      }
    });

    if (lastIndex < content.length) {
      const remaining = content.substring(lastIndex);
      if (remaining) {
        parts.push(remaining);
      }
    }

    return parts.length > 0 ? parts : content;
  };

  // HERO LAYOUT RENDER
  if (isHero) {
    return (
      <>
        {/* Hero Post Container */}
        <div className={`post-hero px-4 pt-3 pb-4 border-b border-theme-border bg-theme-bg relative ${className} ${post.poll ? 'postcard-vote' : ''}`} onClick={handlePostClick}>

          {/* Thread Line (Above Avatar) - only if connected to parent */}
          {/* Note: This relies on props. We might need to ensure page.tsx passes correct showThreadLine or similar for the top connection */}
          {showThreadLine && isThread && !isFirstInThread && (
            <div
              className="absolute bg-[var(--app-global-link-color)]"
              style={{ left: '35px', top: '0', height: '12px', width: '2px', zIndex: 0 }}
            />
          )}

          {/* Header: Avatar + User Info + Menu */}
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <Link href={isAnonymous ? '/Riskbudur' : `/${post.author.nickname}`} className="block relative">
                {post.isAnonymous ? (
                  <div className="w-10 h-10 rounded-full bg-[#151515] flex items-center justify-center border border-theme-border">
                    <img src="/Riskbudur-pp.png" alt="Anonim" className="w-10 h-10 rounded-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#151515] flex items-center justify-center border border-theme-border overflow-hidden">
                    {post.author.profileImage ? (
                      <img
                        src={post.author.profileImage}
                        alt={post.author.nickname}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/Riskbudur-first.png'; }}
                      />
                    ) : (
                      <img src="/Riskbudur-first.png" alt={post.author.nickname} className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
              </Link>

              {/* Name & Handle (Stacked) */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="post-author-name font-bold text-[15px] leading-tight">
                    {isAnonymous ? 'Anonim Kullanıcı' : (post.author.fullName || post.author.nickname)}
                  </span>
                  {!isAnonymous && (
                    <VerificationBadge
                      tier={post.author.verificationTier}
                      hasBlueTick={post.author.hasBlueTick}
                      username={post.author.nickname}
                      className="w-5 h-5 ml-0.5"
                    />
                  )}
                </div>
                <span className="post-author-username text-[15px] leading-tight mt-0.5" style={{ color: "var(--app-subtitle)" }}>@{isAnonymous ? 'anonimkullanici' : post.author.nickname}</span>
              </div>
            </div>

            {/* Menu (3 dots) */}
            <div className="relative">
              <button
                ref={heroMenuButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setHeaderMenuOpen(!headerMenuOpen);
                }}
                className="p-1 rounded-full transition-colors"
              >
                <IconDots size={20} className="text-theme-subtitle" />
              </button>

              {headerMenuOpen && (
                <div
                  ref={heroMenuRef}
                  className="absolute right-0 mt-2 rounded-xl border border-theme-border overflow-hidden"
                  style={{
                    width: "300px",
                    backgroundColor: "var(--app-body-bg)",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    zIndex: 99999,
                    borderColor: "var(--app-border)"
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {(currentUserId && post.author.id === currentUserId) ? (
                    <>
                      <button
                        onClick={() => { handleDelete(); setHeaderMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-red-500 flex items-center transition-colors"
                      >
                        <IconTrash className="w-5 h-5 mr-3" />
                        Gönderiyi sil
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { handleFollowToggle(); setHeaderMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 flex items-center transition-colors"
                        style={{ color: "var(--app-body-text)" }}
                      >
                        {isFollowing ? (
                          <>
                            <IconUserMinus className="w-5 h-5 mr-3" />
                            @{post.author.nickname} adlı kişiyi takipten çıkar
                          </>
                        ) : (
                          <>
                            <IconUserPlus className="w-5 h-5 mr-3" />
                            @{post.author.nickname} adlı kişiyi takip et
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => { handleBlock(); setHeaderMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-red-500 flex items-center transition-colors"
                      >
                        <IconBan className="w-5 h-5 mr-3" />
                        @{post.author.nickname} adlı kişiyi engelle
                      </button>
                      <button
                        onClick={() => { handleReport(); setHeaderMenuOpen(false); }}
                        className="w-full text-left px-4 py-3 text-red-500 flex items-center transition-colors"
                      >
                        <IconFlag className="w-5 h-5 mr-3" />
                        Gönderiyi bildir
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="mt-4 mb-3">
            <p className="post-content text-xl leading-normal whitespace-pre-wrap">
              {parseContent(post.content)}
            </p>

            {post.poll && (
              <PollDisplay
                poll={post.poll}
                className="mb-3"
                onVote={(updatedPoll) => {
                  // Update local state if necessary or let parent/page handle it via re-fetch?
                  // Ideally we should update the post object but PostItem props are read-only-ish.
                  // But we can mutate the object or force re-render if we had state.
                  // For now, simple vote will reflect in UI of PollDisplay itself.
                }}
              />
            )}

            {(post.mediaUrl || post.imageUrl) && (
              <div
                className="mt-3 rounded-2xl overflow-hidden border border-theme-border cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setImageModalUrl(post.imageUrl || post.mediaUrl || null);
                }}
              >
                <img
                  src={post.imageUrl || post.mediaUrl}
                  alt="Media"
                  className="w-full h-auto max-h-[600px] object-contain bg-black"
                />
              </div>
            )}

            {/* Alıntılanan post - Hero layout için */}
            {post.quotedPost && (() => {
              const quotedPostIsAnonymous = post.quotedPost.isAnonymous || false;
              return (
                <div className="mt-3 post-quote rounded-xl overflow-hidden border border-theme-border">
                  <div className="post-quote-header flex items-center p-3 pb-2">
                    {quotedPostIsAnonymous ? (
                      <div className="w-5 h-5 rounded-full mr-2 flex items-center justify-center">
                        <img
                          src="/Riskbudur-pp.png"
                          alt="Anonim"
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      </div>
                    ) : post.quotedPost.author.profileImage ? (
                      <img
                        src={post.quotedPost.author.profileImage}
                        alt={post.quotedPost.author.nickname}
                        className="w-5 h-5 rounded-full object-cover mr-2"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/Riskbudur-first.png'; }}
                      />
                    ) : (
                      <img
                        src="/Riskbudur-first.png"
                        alt={post.quotedPost.author.nickname}
                        className="w-5 h-5 rounded-full object-cover mr-2"
                      />
                    )}

                    {quotedPostIsAnonymous ? (
                      <span className="post-quote-author font-bold text-[15px] text-white">
                        Anonim Kullanıcı
                      </span>
                    ) : (
                      <Link href={`/${post.quotedPost.author.nickname}`}>
                        <span className="post-quote-author font-bold text-[15px] text-white">
                          {post.quotedPost.author.fullName || post.quotedPost.author.nickname}
                        </span>
                      </Link>
                    )}
                    {!quotedPostIsAnonymous && (
                      <VerificationBadge
                        tier={post.quotedPost.author.verificationTier}
                        hasBlueTick={post.quotedPost.author.hasBlueTick}
                        username={post.quotedPost.author.nickname}
                        className="post-quote-badge w-4 h-4 ml-0.5"
                      />
                    )}
                    <span className="post-quote-username text-[15px] font-normal ml-1" style={{ color: "var(--app-subtitle)" }}>@{post.quotedPost.author.nickname}</span>
                    <span className="post-quote-separator mx-1 text-[15px]" style={{ color: "var(--app-subtitle)" }}>·</span>
                    <span className="post-quote-date text-[15px]" style={{ color: "var(--app-subtitle)" }}>{formatCustomDate(post.quotedPost.createdAt)}</span>
                  </div>

                  <div className="post-quote-content px-3 pb-2" onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/${post.quotedPost?.author.nickname}/status/${post.quotedPost?.id}`);
                  }}>
                    <div className="post-quote-text text-[15px] line-clamp-3 cursor-pointer" style={{ color: "var(--app-body-text)" }}>
                      {parseContent(post.quotedPost.content)}
                    </div>
                  </div>
                  {(post.quotedPost.imageUrl || post.quotedPost.mediaUrl) && (
                    <img
                      src={post.quotedPost.imageUrl || post.quotedPost.mediaUrl}
                      alt="Quoted post media"
                      className="w-full object-cover max-h-[300px] cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageModalUrl(post.quotedPost?.imageUrl || post.quotedPost?.mediaUrl || null);
                      }}
                    />
                  )}
                </div>
              );
            })()}

            {/* YouTube/Link Preview for Hero Layout */}
            {post.linkPreview && (() => {
              const getYoutubeId = (url: string) => {
                const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                const match = url.match(regex);
                return match ? match[1] : null;
              };

              const isYoutube = post.linkPreview.type === 'youtube' || post.linkPreview.url.includes('youtube') || post.linkPreview.url.includes('youtu.be');
              const videoId = post.linkPreview.videoId || (isYoutube ? getYoutubeId(post.linkPreview.url) : null);
              const thumbnail = post.linkPreview.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);

              return (
                <div className="mt-3 mb-3">
                  {isYoutube && videoId ? (
                    youtubeEmbedOpen ? (
                      <div className="relative w-full rounded-xl overflow-hidden border border-theme-border" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                          title={post.linkPreview.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div
                        className="flex rounded-xl overflow-hidden border border-theme-border cursor-pointer transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setYoutubeEmbedOpen(true);
                        }}
                      >
                        <div className="relative flex-shrink-0" style={{ width: "130px", height: "130px", minWidth: "130px" }}>
                          <img
                            src={thumbnail || ''}
                            alt={post.linkPreview.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-80 rounded-full p-2">
                              <IconPlayerPlay className="h-6 w-6 text-white" fill="white" />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center p-3 flex-1 min-w-0">
                          <div className="text-xs mb-1" style={{ color: "var(--app-subtitle)" }}>{post.linkPreview.siteName || 'youtube.com'}</div>
                          <div className="text-sm font-medium line-clamp-2 mb-1" style={{ color: "var(--app-subtitle)" }}>{post.linkPreview.title}</div>
                          {post.linkPreview.description && (
                            <div className="text-xs line-clamp-2" style={{ color: "var(--app-subtitle)" }}>{post.linkPreview.description}</div>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    <a
                      href={post.linkPreview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex rounded-xl overflow-hidden border border-theme-border transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {thumbnail && (
                        <div className="relative flex-shrink-0" style={{ width: "130px", height: "130px", minWidth: "130px" }}>
                          <img
                            src={thumbnail}
                            alt={post.linkPreview.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col justify-center p-3 flex-1 min-w-0">
                        <div className="text-xs mb-1" style={{ color: "var(--app-subtitle)" }}>{post.linkPreview.siteName}</div>
                        <div className="text-sm font-medium line-clamp-2 mb-1" style={{ color: "var(--app-subtitle)" }}>{post.linkPreview.title}</div>
                        {post.linkPreview.description && (
                          <div className="text-xs line-clamp-2" style={{ color: "var(--app-subtitle)" }}>{post.linkPreview.description}</div>
                        )}
                      </div>
                    </a>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Meta: Time & Date */}
          <div className="py-4 border-b border-theme-border flex items-center gap-1 text-[15px] post-date" style={{ color: "var(--app-subtitle)" }}>
            <span>
              {(() => {
                const d = new Date(post.createdAt);
                const time = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false });
                const day = d.getDate();
                const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
                const month = months[d.getMonth()];
                const year = d.getFullYear();
                return `${time} · ${day} ${month}, ${year}`;
              })()}
            </span>
          </div>

          {/* Stats removed as per user request */}

          {/* Action Buttons: Split Groups */}
          {/* Action Buttons: Standard Timeline Style */}
          <div className="py-2 border-b border-theme-border flex items-center text-sm">
            <button
              onClick={handleCommentClick}
              className="post-action post-action-comment flex items-center mr-6"
              style={{ color: isCommented ? "#1d9bf0" : undefined }}
            >
              <IconMessage2 className={`w-5 h-5 mr-1 ${!isCommented ? 'interaction-icon' : ''}`} style={{ color: isCommented ? "#1d9bf0" : undefined }} />
              {commentCount > 0 && (
                <span className={`post-action-count ${!isCommented ? 'interaction-icon' : ''}`} style={{ color: isCommented ? "#1d9bf0" : undefined }}>{isPopular ? formatNumber(commentCount) : commentCount}</span>
              )}
            </button>

            <button
              onClick={handleLike}
              disabled={isLiking}
              className="post-action post-action-like flex items-center mr-6"
              style={{ color: isLiked ? "#FF0066" : undefined }}
            >
              {isLiked ? (
                <IconHeartFilled className="w-5 h-5 mr-1" style={{ color: "#FF0066" }} />
              ) : (
                <IconHeart className="interaction-icon w-5 h-5 mr-1" />
              )}
              {likeCount > 0 && (
                <span className={`post-action-count ${!isLiked ? 'interaction-icon' : ''}`} style={{ color: isLiked ? "#FF0066" : undefined }}>{isPopular ? formatNumber(likeCount) : likeCount}</span>
              )}
            </button>

            <button
              onClick={handleQuoteClick}
              className="post-action post-action-quote flex items-center mr-6"
              style={{ color: quoted ? "#1DCD9F" : undefined }}
            >
              <IconRepeat className={`w-5 h-5 mr-1 ${!quoted ? 'interaction-icon' : ''}`} style={{ color: quoted ? "#1DCD9F" : undefined }} />
              {quoteCount > 0 && (
                <span className={`post-action-count ${!quoted ? 'interaction-icon' : ''}`} style={{ color: quoted ? "#1DCD9F" : undefined }}>{quoteCount}</span>
              )}
            </button>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleBookmark}
                className="post-action post-action-bookmark p-1 rounded-full transition-colors"
                style={{ color: isBookmarked ? "#DC5F00" : undefined }}
              >
                <IconTargetArrow className={`w-5 h-5 ${!isBookmarked ? 'interaction-icon' : ''}`} style={{ color: isBookmarked ? "#DC5F00" : undefined }} />
              </button>

              <div className="relative">
                <button
                  onClick={handleCopyLink}
                  className="post-action post-action-share p-1 rounded-full transition-colors relative"
                >
                  <IconLibraryPlusFilled className="interaction-icon w-5 h-5" />
                  {showCopiedToast && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#1DCD9F] text-black text-xs font-bold rounded shadow-lg whitespace-nowrap z-50 animate-fade-in-out">
                      Kopyalandı!
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>


        </div >

        <MinimalCommentModal
          post={post}
          isOpen={isCommentModalOpen}
          onClose={() => setIsCommentModalOpen(false)}
          onCommentAdded={onPostCreated || (() => { })}
          currentUserId={currentUserId}
        />
        <QuoteModal
          post={post}
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          onQuoteAdded={(newPost) => newPost && onPostCreated?.(newPost)}
        />

        <ImageModal
          imageUrl={imageModalUrl}
          onClose={() => setImageModalUrl(null)}
        />
      </>
    );
  }

  return (
    <>
      <div
        className={`post p-3 sm:p-4 relative cursor-pointer transition-colors ${isThread ? "" : "border-b border-theme-border"} ${className}`}
        style={{ zIndex: (showShareMenu || headerMenuOpen) ? 9999 : 'auto' }}
        onClick={handlePostClick}
      >
        {/* Thread cizgisi - post'un yuksekligine gore */}
        {(showThreadLine) && (
          <>
            {isFirstInThread && !isLastInThread && (
              <div
                className="absolute bg-[var(--app-global-link-color)] w-[2px] z-0 left-[28px] sm:left-[36px] top-[44px] sm:top-[56px] bottom-0"
              />
            )}
            {!isFirstInThread && !isLastInThread && (
              <div
                className="absolute bg-[var(--app-global-link-color)] w-[2px] z-0 left-[28px] sm:left-[36px] top-0 bottom-0"
              />
            )}
            {isLastInThread && !isFirstInThread && (
              <div
                className="absolute bg-[var(--app-global-link-color)] w-[2px] z-0 left-[28px] sm:left-[36px] top-0 h-[28px] sm:h-[36px]"
              />
            )}
          </>
        )}
        <div className="post-container flex items-start relative z-10">
          <div className="post-avatar relative flex-shrink-0">
            {isAnonymous ? (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 relative z-10 flex items-center justify-center">
                <img
                  src="/Riskbudur-pp.png"
                  alt="Anonim"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/Riskbudur-first.png';
                  }}
                />
              </div>
            ) : (
              <Link href={isAnonymous ? '/Riskbudur' : `/${post.author.nickname}`}>
                {post.author.profileImage ? (
                  <img
                    src={post.author.profileImage}
                    alt={post.author.nickname}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover mr-2 sm:mr-3 relative z-10 cursor-pointer hover:opacity-80"
                  />
                ) : (
                  <img
                    src="/Riskbudur-first.png"
                    alt={post.author.nickname}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover mr-2 sm:mr-3 relative z-10 cursor-pointer hover:opacity-80"
                  />
                )}
              </Link>
            )}
          </div>

          <div className="post-content-wrapper flex-1 min-w-0">
            <PostHeader
              post={post}
              currentUserId={currentUserId}
              isAnonymous={isAnonymous}
              isFollowing={isFollowing}
              onFollowToggle={handleFollowToggle}
              onDelete={handleDelete}
              onBlock={handleBlock}
              onReport={handleReport}
              onMenuOpenChange={setHeaderMenuOpen}
            />

            <div className="block">
              <p className="post-content mb-3 whitespace-pre-wrap break-words text-sm sm:text-[15px]">{parseContent(post.content)}</p>

              {post.poll && (
                <PollDisplay
                  poll={post.poll}
                  className="mb-3"
                  onVote={(updatedPoll) => { }}
                />
              )}

              {(post.mediaUrl || post.imageUrl) && (
                <div className="post-media mb-3 rounded-lg overflow-hidden flex justify-center cursor-pointer" style={{ border: "0.4px solid #2a2a2a" }} onClick={(e) => {
                  e.stopPropagation();
                  setImageModalUrl(post.imageUrl || post.mediaUrl || null);
                }}>
                  <img
                    src={post.imageUrl || post.mediaUrl}
                    alt="Post görseli"
                    className="w-full h-auto"
                    style={{ maxWidth: "518px", maxHeight: "518px", objectFit: "contain" }}
                  />
                </div>
              )}
            </div>

            {/* YouTube/Link Preview - X.com Style */}
            {post.linkPreview && (() => {
              const getYoutubeId = (url: string) => {
                const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                const match = url.match(regex);
                return match ? match[1] : null;
              };

              const isYoutube = post.linkPreview.type === 'youtube' || post.linkPreview.url.includes('youtube') || post.linkPreview.url.includes('youtu.be');
              const videoId = post.linkPreview.videoId || (isYoutube ? getYoutubeId(post.linkPreview.url) : null);
              const thumbnail = post.linkPreview.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);

              return (
                <div className="mb-3">
                  {isYoutube && videoId ? (
                    youtubeEmbedOpen ? (
                      <div className="relative w-full rounded-xl overflow-hidden border border-theme-border" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                          title={post.linkPreview.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div
                        className="flex rounded-xl overflow-hidden border border-theme-border cursor-pointer hover:bg-[#111] transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setYoutubeEmbedOpen(true);
                        }}
                      >
                        <div className="relative flex-shrink-0" style={{ width: "130px", height: "130px", minWidth: "130px" }}>
                          <img
                            src={thumbnail || ''}
                            alt={post.linkPreview.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-80 rounded-full p-2">
                              <IconPlayerPlay className="h-6 w-6 text-white" fill="white" />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center p-3 flex-1 min-w-0">
                          <div className="text-xs mb-1" style={{ color: "var(--app-subtitle)" }}>{post.linkPreview.siteName || 'youtube.com'}</div>
                          <div className="text-sm font-medium line-clamp-2 mb-1" style={{ color: "var(--app-subtitle)" }}>{post.linkPreview.title}</div>
                          {post.linkPreview.description && (
                            <div className="text-xs line-clamp-2" style={{ color: "var(--app-subtitle)" }}>{post.linkPreview.description}</div>
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    <a
                      href={post.linkPreview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex rounded-xl overflow-hidden border border-theme-border hover:bg-[#111] transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {thumbnail && (
                        <div className="relative flex-shrink-0" style={{ width: "130px", height: "130px", minWidth: "130px" }}>
                          <img
                            src={thumbnail}
                            alt={post.linkPreview.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col justify-center p-3 flex-1 min-w-0">
                        <div className="text-xs mb-1" style={{ color: "var(--app-subtitle)" }}>{post.linkPreview.siteName}</div>
                        <div className="text-sm font-medium line-clamp-2 mb-1" style={{ color: "var(--app-subtitle)" }}>{post.linkPreview.title}</div>
                        {post.linkPreview.description && (
                          <div className="text-xs line-clamp-2" style={{ color: "var(--app-subtitle)" }}>{post.linkPreview.description}</div>
                        )}
                      </div>
                    </a>
                  )}
                </div>
              );
            })()}

            {/* Alıntılanan post */}
            {post.quotedPost && (() => {
              const quotedPostIsAnonymous = post.quotedPost.isAnonymous || false;
              return (
                <div className="post-quote mb-3 rounded-xl overflow-hidden border border-theme-border">
                  <div className="post-quote-header flex items-center p-3 pb-2">
                    {quotedPostIsAnonymous ? (
                      <div className="w-5 h-5 rounded-full mr-2 flex items-center justify-center">
                        <img
                          src="/Riskbudur-pp.png"
                          alt="Anonim"
                          className="w-5 h-5 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/Riskbudur-first.png';
                          }}
                        />
                      </div>
                    ) : post.quotedPost.author.profileImage ? (
                      <img
                        src={post.quotedPost.author.profileImage}
                        alt={post.quotedPost.author.nickname}
                        className="w-5 h-5 rounded-full object-cover mr-2"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/Riskbudur-first.png'; }}
                      />
                    ) : (
                      <img
                        src="/Riskbudur-first.png"
                        alt={post.quotedPost.author.nickname}
                        className="w-5 h-5 rounded-full object-cover mr-2"
                      />
                    )}

                    {quotedPostIsAnonymous ? (
                      <span className="post-quote-author font-bold text-[15px] text-white">
                        Anonim Kullanıcı
                      </span>
                    ) : (
                      <Link href={`/${post.quotedPost.author.nickname}`}>
                        <span className="post-quote-author font-bold text-[15px] text-white">
                          {post.quotedPost.author.fullName || post.quotedPost.author.nickname}
                        </span>
                      </Link>
                    )}
                    {!quotedPostIsAnonymous && (
                      <VerificationBadge
                        tier={post.quotedPost.author.verificationTier}
                        hasBlueTick={post.quotedPost.author.hasBlueTick}
                        username={post.quotedPost.author.nickname}
                        className="post-quote-badge w-4 h-4 ml-0.5"
                      />
                    )}
                    {post.quotedPost.isPopular && (
                      <IconRosetteDiscountCheckFilled className="post-quote-badge post-quote-badge-orange w-4 h-4 ml-0.5 verified-icon" />
                    )}
                    <span className="post-quote-username text-[15px] font-normal ml-1" style={{ color: "var(--app-subtitle)" }}>@{post.quotedPost.author.nickname}</span>
                    <span className="post-quote-separator mx-1 text-[15px]" style={{ color: "var(--app-subtitle)" }}>·</span>
                    <span className="post-quote-date text-[15px]" style={{ color: "var(--app-subtitle)" }}>{formatCustomDate(post.quotedPost.createdAt)}</span>
                  </div>

                  <div
                    className="post-quote-content cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (post.quotedPost) {
                        router.push(`/${post.quotedPost.author.nickname}/status/${post.quotedPost.id}`);
                      }
                    }}
                  >
                    {post.quotedPost.content && (
                      <div className="post-quote-text text-[15px] px-3 pb-2">
                        {parseContent(post.quotedPost.content)}
                      </div>
                    )}
                  </div>

                  {(post.quotedPost.imageUrl || post.quotedPost.mediaUrl) && (
                    <div className="w-full flex justify-center overflow-hidden cursor-pointer border-t border-theme-border" onClick={(e) => {
                      e.stopPropagation();
                      setImageModalUrl(post.quotedPost?.imageUrl || post.quotedPost?.mediaUrl || null);
                    }}>
                      <img
                        src={post.quotedPost.imageUrl || post.quotedPost.mediaUrl}
                        alt="Alıntılanan post görseli"
                        className="w-full h-auto object-cover"
                        style={{ maxHeight: "350px", minHeight: "150px" }}
                      />
                    </div>
                  )}

                  {post.quotedPost.linkPreview && (() => {
                    const getYoutubeThumbnail = (url: string) => {
                      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
                      const match = url.match(regex);
                      return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
                    };

                    const thumbnail = post.quotedPost.linkPreview.thumbnail ||
                      (post.quotedPost.linkPreview.type === 'youtube' || post.quotedPost.linkPreview.url.includes('youtube') || post.quotedPost.linkPreview.url.includes('youtu.be')
                        ? getYoutubeThumbnail(post.quotedPost.linkPreview.url)
                        : null);

                    return (
                      <div className="mt-2 border-t border-theme-border">
                        {thumbnail ? (
                          <div className="relative w-full aspect-video">
                            <img
                              src={thumbnail}
                              alt={post.quotedPost.linkPreview.title}
                              className="w-full h-full object-cover"
                            />
                            {(post.quotedPost.linkPreview.type === 'youtube' || post.quotedPost.linkPreview.url.includes('youtube') || post.quotedPost.linkPreview.url.includes('youtu.be')) && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                <div className="bg-[#1D9BF0] text-white rounded-full p-3 shadow-lg">
                                  <IconPlayerPlay className="h-6 w-6" fill="white" />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (post.quotedPost.linkPreview.type === 'youtube' || post.quotedPost.linkPreview.url.includes('youtube') || post.quotedPost.linkPreview.url.includes('youtu.be')) && (
                          <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                            <IconPlayerPlay className="h-12 w-12 text-gray-500" />
                          </div>
                        )}
                        <div className="p-3 bg-black/50">
                          <div className="text-xs mb-1 uppercase" style={{ color: "var(--app-subtitle)" }}>{post.quotedPost.linkPreview.siteName || 'YouTube'}</div>
                          <div className="text-[15px] font-medium line-clamp-2 leading-5" style={{ color: "var(--app-subtitle)" }}>{post.quotedPost.linkPreview.title}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

              );
            })()}

            {/* İçerikteki post linklerinden alıntılanan postlar */}
            {linkedPosts.map((linkedPost, index) => {
              const linkedPostIsAnonymous = linkedPost.isAnonymous || false;
              return (
                <div key={`linked-post-${index}`} className="post-quote mb-3 rounded-xl overflow-hidden border border-theme-border">
                  <div className="post-quote-header flex items-center p-3 pb-2">
                    <div className="post-quote-avatar">
                      {linkedPostIsAnonymous ? (
                        <div className="w-5 h-5 rounded-full mr-2 flex items-center justify-center">
                          <img
                            src="/logo.png"
                            alt="Anonim"
                            className="w-5 h-5 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-[10px]">A</div>';
                              }
                            }}
                          />
                        </div>
                      ) : linkedPost.author?.profileImage ? (
                        <img
                          src={linkedPost.author.profileImage}
                          alt={linkedPost.author.nickname}
                          className="w-5 h-5 rounded-full object-cover mr-2"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/Riskbudur-first.png'; }}
                        />
                      ) : (
                        <img
                          src="/Riskbudur-first.png"
                          alt={linkedPost.author?.nickname || 'Bilinmeyen'}
                          className="w-5 h-5 rounded-full object-cover mr-2"
                        />
                      )}
                    </div>

                    {linkedPostIsAnonymous ? (
                      <span className="post-quote-author font-bold text-[15px] text-white">
                        Anonim Kullanıcı
                      </span>
                    ) : (
                      <Link href={`/${linkedPost.author?.nickname || ''}`}>
                        <span className="post-quote-author font-bold text-[15px] text-white">
                          {linkedPost.author?.fullName || linkedPost.author?.nickname || 'Bilinmeyen'}
                        </span>
                      </Link>
                    )}
                    {!linkedPostIsAnonymous && (
                      <VerificationBadge
                        tier={linkedPost.author?.verificationTier}
                        hasBlueTick={linkedPost.author?.hasBlueTick}
                        username={linkedPost.author?.nickname}
                        className="post-quote-badge w-4 h-4 ml-0.5"
                      />
                    )}
                    <span className="post-quote-separator mx-1 text-[15px]" style={{ color: "var(--app-subtitle)" }}>·</span>
                    <span className="post-quote-date text-[15px]" style={{ color: "var(--app-subtitle)" }}>{formatCustomDate(linkedPost.createdAt)}</span>
                  </div>

                  <div
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/${linkedPost.author?.nickname || 'user'}/status/${linkedPost.id}`);
                    }}
                  >
                    {linkedPost.content && (
                      <div className="post-quote-text text-[15px] px-3 pb-3">
                        {parseContent(linkedPost.content)}
                      </div>
                    )}

                    {(linkedPost.mediaUrl || linkedPost.imageUrl) && (
                      <div className="post-quote-media flex justify-center w-full bg-black/5" style={{ borderTop: "0.4px solid #2a2a2a" }}>
                        <img
                          src={linkedPost.imageUrl || linkedPost.mediaUrl}
                          alt="Alıntılanan post görseli"
                          className="w-full h-auto object-cover"
                          style={{ maxHeight: "350px", minHeight: "150px" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="post-actions flex items-center text-sm">
              <button
                onClick={handleCommentClick}
                className="post-action post-action-comment flex items-center mr-4"
                style={{ color: isCommented ? "#1d9bf0" : undefined }}
              >
                <IconMessage2 className={`w-5 h-5 mr-1 ${!isCommented ? 'interaction-icon' : ''}`} style={{ color: isCommented ? "#1d9bf0" : undefined }} />
                {commentCount > 0 && (
                  <span className={`post-action-count ${!isCommented ? 'interaction-icon' : ''}`} style={{ color: isCommented ? "#1d9bf0" : undefined }}>{isPopular ? formatNumber(commentCount) : commentCount}</span>
                )}
              </button>

              <button
                onClick={handleLike}
                disabled={isLiking}
                className="post-action post-action-like flex items-center mr-4"
                style={{ color: isLiked ? "#FF0066" : undefined }}
              >
                {isLiked ? (
                  <IconHeartFilled className="w-5 h-5 mr-1" style={{ color: "#FF0066" }} />
                ) : (
                  <IconHeart className="interaction-icon w-5 h-5 mr-1" />
                )}
                {likeCount > 0 && (
                  <span className={`post-action-count ${!isLiked ? 'interaction-icon' : ''}`} style={{ color: isLiked ? "#FF0066" : undefined }}>{isPopular ? formatNumber(likeCount) : likeCount}</span>
                )}
              </button>

              <button
                onClick={handleQuoteClick}
                className="post-action post-action-quote flex items-center mr-4"
                style={{ color: quoted ? "#1DCD9F" : undefined }}
              >
                <IconRepeat className={`w-5 h-5 mr-1 ${!quoted ? 'interaction-icon' : ''}`} style={{ color: quoted ? "#1DCD9F" : undefined }} />
                {quoteCount > 0 && (
                  <span className={`post-action-count ${!quoted ? 'interaction-icon' : ''}`} style={{ color: quoted ? "#1DCD9F" : undefined }}>{quoteCount}</span>
                )}
              </button>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={handleBookmark}
                  className="post-action post-action-bookmark p-1 rounded-full transition-colors"
                  style={{ color: isBookmarked ? "#DC5F00" : undefined }}
                >
                  <IconTargetArrow className={`w-5 h-5 ${!isBookmarked ? 'interaction-icon' : ''}`} style={{ color: isBookmarked ? "#DC5F00" : undefined }} />
                </button>

                <div className="relative">
                  <button
                    onClick={handleCopyLink}
                    className="post-action post-action-share p-1 rounded-full transition-colors relative"
                  >
                    <IconLibraryPlusFilled className="interaction-icon w-5 h-5" />
                    {showCopiedToast && (
                      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-[#1DCD9F] text-black text-xs font-bold rounded shadow-lg whitespace-nowrap z-50 animate-fade-in-out">
                        Kopyalandı!
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div >
      </div >

      {isThread && showThreadFooter && (
        <>
          <hr className="border-theme-border mx-4" />
          <div className="px-4 py-3 border-b border-theme-border flex justify-center">
            <Link
              href={`/${post.author.nickname}/status/${post.id}`}
              className="inline-flex items-center gap-2 hover:opacity-80"
              style={{ color: "var(--app-global-link-color)" }}
            >
              <span className="text-xs">Tümünü gör</span>
              <IconTimelineEventText size={14} />
            </Link>
          </div>
        </>
      )
      }

      <MinimalCommentModal
        post={post}
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onCommentAdded={handleCommentAdded}
        currentUserId={currentUserId}
      />

      <QuoteModal
        post={post}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onQuoteAdded={handleQuoteAdded}
      />

      <ImageModal
        imageUrl={imageModalUrl}
        onClose={() => setImageModalUrl(null)}
      />
    </>
  );
}
