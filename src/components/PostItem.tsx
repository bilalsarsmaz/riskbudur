"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Post } from "./PostList";
import { postApi, deleteApi } from "@/lib/api";
import MinimalCommentModal from "./MinimalCommentModal";
import QuoteModal from "./QuoteModal";

import {
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconMessageCircleFilled,
  IconRepeat,
  IconRosetteDiscountCheckFilled,
  IconDots,
  IconUserPlus,
  IconUserMinus,
  IconBan,
  IconChartBar,
  IconCode,
  IconFlag,
  IconTargetArrow,
  IconTimelineEventText,
  IconShare3,
  IconPlayerPlay,
  IconTrash
} from "@tabler/icons-react";

interface PostItemProps {
  post: Post;
  isFirst?: boolean;
  currentUserId?: string;
  onPostDeleted?: (postId: string) => void;
  showThreadLine?: boolean;
  isLastInThread?: boolean;
  isFirstInThread?: boolean;
  isThread?: boolean;
  showThreadFooter?: boolean;
}

export default function PostItem({ post, isFirst = false, currentUserId, onPostDeleted, showThreadLine = false, isLastInThread = false, isFirstInThread = false, isThread = false, showThreadFooter = true }: PostItemProps) {
  const defaultCounts = { likes: 0, comments: 0 };
  const counts = post._count || defaultCounts;
  
  // Kendi postu mu kontrolü
  const isOwnPost = currentUserId && post.author?.id === currentUserId;
  
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(counts.likes);
  const [commentCount, setCommentCount] = useState(counts.comments);
  const [quoteCount, setQuoteCount] = useState(counts.quotes || (post as any).quoteCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [quoted, setQuoted] = useState((post as any).isQuoted || false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState((post as any).isBookmarked || false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isCommented, setIsCommented] = useState((post as any).isCommented || false);
  const [linkedPosts, setLinkedPosts] = useState<any[]>([]);
  const [youtubeEmbedOpen, setYoutubeEmbedOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  // Post prop'u değiştiğinde state'leri güncelle
  useEffect(() => {
    const defaultCounts = { likes: 0, comments: 0, quotes: 0 };
    const counts = post._count || defaultCounts;
    
    setIsLiked(post.isLiked || false);
    setLikeCount(counts.likes);
    setCommentCount(counts.comments);
    setQuoteCount(counts.quotes || (post as any).quoteCount || 0);
    setQuoted((post as any).isQuoted || false);
    setIsCommented((post as any).isCommented || false);
    setIsBookmarked((post as any).isBookmarked || false);
  }, [post.id, post.isLiked, post._count, (post as any).isQuoted, (post as any).isCommented, (post as any).isBookmarked]);


  // Post prop\'u değiştiğinde state\'leri güncelle
  useEffect(() => {
    const defaultCounts = { likes: 0, comments: 0, quotes: 0 };
    const counts = post._count || defaultCounts;
    
    setIsLiked(post.isLiked || false);
    setLikeCount(counts.likes);
    setCommentCount(counts.comments);
    setQuoteCount(counts.quotes || (post as any).quoteCount || 0);
    setQuoted((post as any).isQuoted || false);
    setIsCommented((post as any).isCommented || false);
  }, [post.id, post.isLiked, post._count, (post as any).isQuoted, (post as any).isCommented]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
      if (
        shareMenuRef.current && 
        !shareMenuRef.current.contains(event.target as Node) &&
        !shareButtonRef.current?.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }
    };

    if (showMenu || showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu, showShareMenu]);

  // Post içeriğindeki post linklerini tespit et ve çek
  useEffect(() => {
    const extractPostLinks = (content: string): string[] => {
      if (!content) return [];
      
      const postLinkRegex = /(?:https?:\/\/)?(?:www\.)?ultraswall\.com\/status\/(\d+)/gi;
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

  const handleCommentAdded = () => {
    setCommentCount(prev => prev + 1);
    setIsCommented(true);
    setIsCommentModalOpen(false);
  };

  const handleQuoteClick = () => {
    setIsQuoteModalOpen(true);
  };

  const handleQuoteAdded = () => {
    setQuoteCount(prev => prev + 1);
    setQuoted(true);
    setIsQuoteModalOpen(false);
  };

  const formatCustomDate = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "şimdi";
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}d`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}s`;
    }
    
    if (date.getFullYear() === now.getFullYear()) {
      const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
      return `${date.getDate()} ${months[date.getMonth()]}`;
    }
    
    const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
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
    setShowMenu(false);
  };

  const handleBlock = async () => {
    if (confirm(`@${post.author.nickname} adlı kullanıcıyı engellemek istediğinize emin misiniz?`)) {
      console.log("Engelle:", post.author.nickname);
    }
    setShowMenu(false);
  };

  const handleViewStats = () => {
    console.log("Etkileşimleri görüntüle:", post.id);
    setShowMenu(false);
  };

  const handlePin = () => {
    console.log("Gönderiyi yerleştir:", post.id);
    setShowMenu(false);
  };

  const handleReport = () => {
    console.log("Gönderiyi bildir:", post.id);
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) {
      try {
        await deleteApi(`/posts/${post.id}`);
        if (onPostDeleted) {
          onPostDeleted(post.id);
        }
      } catch (error) {
        console.error("Silme hatası:", error);
        alert("Gönderi silinirken bir hata oluştu");
      }
    }
    setShowMenu(false);
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

  const handleCopyLink = () => {
    const postUrl = `https://ultraswall.com/status/${post.id}`;
    navigator.clipboard.writeText(postUrl).then(() => {
      console.log("Link kopyalandı:", postUrl);
      alert("Gönderi bağlantısı kopyalandı!");
    }).catch(err => {
      console.error("Kopyalama hatası:", err);
    });
    setShowShareMenu(false);
  };

  const formattedDate = formatCustomDate(new Date(post.createdAt));

  const isPopular = (counts.likes > 30 || counts.comments > 10);
  
  // Anonim post kontrolü
  const isAnonymous = (post as any).isAnonymous || false;
  
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

    // Post link regex: ultraswall.com/status/[id] formatında
    const postLinkRegex = /(?:https?:\/\/)?(?:www\.)?ultraswall\.com\/status\/\d+/gi;
    
    // Önce içeriğin sadece post linki(leri) ve boşluklardan oluşup oluşmadığını kontrol et
    const tempContent = content.trim();
    const postLinks: string[] = [];
    let match;
    while ((match = postLinkRegex.exec(content)) !== null) {
      postLinks.push(match[0]);
    }
    
    // Eğer içerik sadece post linkleri ve boşluklardan oluşuyorsa, boş döndür
    if (postLinks.length > 0) {
      let contentWithoutLinks = content;
      postLinks.forEach(link => {
        contentWithoutLinks = contentWithoutLinks.replace(link, '');
      });
      if (!contentWithoutLinks.trim()) {
        return null; // Sadece post linkleri varsa, içerik gösterilmesin
      }
    }

    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;

    // Hashtag regex: # ile başlayan, harf/rakam/alt çizgi içeren
    const hashtagRegex = /#[\p{L}\p{N}_]+/gu;
    // Link regex: http://, https://, www. veya domain.com formatında (post linkleri hariç)
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2}(?:\/[^\s]*)?)/g;

    // Önce tüm eşleşmeleri bul
    const matches: Array<{ type: 'hashtag' | 'link' | 'postlink'; start: number; end: number; text: string }> = [];

    // Hashtag'leri bul
    while ((match = hashtagRegex.exec(content)) !== null) {
      matches.push({
        type: 'hashtag',
        start: match.index,
        end: match.index + match[0].length,
        text: match[0]
      });
    }

    // Post linklerini bul (bunları içerikten çıkaracağız)
    while ((match = postLinkRegex.exec(content)) !== null) {
      // Hashtag ile çakışmıyorsa ekle
      const isOverlapping = matches.some(m => 
        m.start <= match.index && match.index < m.end ||
        m.start < match.index + match[0].length && match.index + match[0].length <= m.end
      );
      
      if (!isOverlapping) {
        matches.push({
          type: 'postlink',
          start: match.index,
          end: match.index + match[0].length,
          text: match[0]
        });
      }
    }

    // Diğer linkleri bul
    while ((match = linkRegex.exec(content)) !== null) {
      // Post linki değilse ve hashtag ile çakışmıyorsa ekle
      const isPostLink = /ultraswall\.com\/status\/\d+/i.test(match[0]);
      const isOverlapping = matches.some(m => 
        m.start <= match.index && match.index < m.end ||
        m.start < match.index + match[0].length && match.index + match[0].length <= m.end
      );
      
      if (!isPostLink && !isOverlapping) {
        matches.push({
          type: 'link',
          start: match.index,
          end: match.index + match[0].length,
          text: match[0]
        });
      }
    }

    // Eşleşmeleri başlangıç pozisyonuna göre sırala
    matches.sort((a, b) => a.start - b.start);

    // İçeriği parçalara ayır
    matches.forEach((match, index) => {
      // Eşleşmeden önceki metni ekle
      if (match.start > lastIndex) {
        parts.push(content.substring(lastIndex, match.start));
      }

      // Eşleşmeyi ekle (post linklerini atla, onlar alıntılanan post olarak gösterilecek)
      if (match.type === 'hashtag') {
        const hashtag = match.text.slice(1); // # işaretini kaldır
        parts.push(
          <Link 
            key={`hashtag-${index}`}
            href={`/hashtag/${encodeURIComponent(hashtag.toLowerCase())}`}
            className="text-blue-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {match.text}
          </Link>
        );
        lastIndex = match.end;
      } else if (match.type === 'link') {
        let url = match.text;
        // www. ile başlıyorsa http:// ekle
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
            className="text-blue-500 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {match.text}
          </a>
        );
        lastIndex = match.end;
      } else if (match.type === 'postlink') {
        // Post linklerini içerikten çıkar (alıntılanan post olarak gösterilecek)
        lastIndex = match.end;
      }
    });

    // Kalan metni ekle
    if (lastIndex < content.length) {
      const remaining = content.substring(lastIndex);
      if (remaining) {
        parts.push(remaining);
      }
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <>
      <div className={`post p-4 relative ${isThread ? "" : "border-b border-[#2a2a2a]"}`} style={{zIndex: showMenu ? 9999 : 'auto'}}>
        {/* Thread cizgisi - post'un yuksekligine gore */}
        {(showThreadLine && !isThread) && (
          <>
            {/* Ilk post (root) - sadece profil fotosunun altindan asagiya */}
            {isFirstInThread && !isLastInThread && (
              <div 
                className="absolute bg-[#1DCD9F]" 
                style={{ 
                  left: '35px', 
                  top: '56px',
                  bottom: '0',
                  width: '2px',
                  zIndex: 0,
                }} 
              />
            )}
            {/* Ara postlar - tam cizgi (ustten alta) */}
            {!isFirstInThread && !isLastInThread && (
              <div 
                className="absolute bg-[#1DCD9F]" 
                style={{ 
                  left: '35px', 
                  top: '0',
                  bottom: '0',
                  width: '2px',
                  zIndex: 0,
                }} 
              />
            )}
            {/* Son post - sadece profil fotosunun ustune kadar */}
            {isLastInThread && !isFirstInThread && (
              <div 
                className="absolute bg-[#1DCD9F]" 
                style={{ 
                  left: '35px', 
                  top: '0',
                  height: '36px',
                  width: '2px',
                  zIndex: 0,
                }} 
              />
            )}
          </>
        )}
        <div className="post-container flex items-start relative z-10">
          <div className="post-avatar relative">
            {isAnonymous ? (
              <div className="w-10 h-10 rounded-full mr-3 relative z-10 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Anonim" 
                  className="w-10 h-10 rounded-full object-cover" 
                  onError={(e) => {
                    // Logo yüklenemezse varsayılan avatar göster
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">A</div>';
                    }
                  }}
                />
              </div>
            ) : (
              <Link href={`/${post.author.nickname}`}>
                {post.author.profileImage ? (
                  <img 
                    src={post.author.profileImage} 
                    alt={post.author.nickname} 
                    className="w-10 h-10 rounded-full object-cover mr-3 relative z-10 cursor-pointer hover:opacity-80" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3 relative z-10 cursor-pointer hover:opacity-80">
                    {post.author.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            )}
          </div>
          
          <div className="post-content-wrapper flex-1">
            <div className="post-header flex items-center justify-between mb-1">
              <div className="flex flex-wrap items-center">
                <div className="flex items-center mr-1">
                  {isAnonymous ? (
                    <span className="post-author-name font-bold">
                      Anonim Kullanıcı
                    </span>
                  ) : (
                    <Link href={`/${post.author.nickname}`} className="">
                      <span className="post-author-name font-bold">
                        {post.author.fullName || post.author.nickname}
                      </span>
                    </Link>
                  )}
                  {!isAnonymous && post.author.hasBlueTick && (
                    <IconRosetteDiscountCheckFilled className="post-badge post-badge-blue w-5 h-5 ml-0.5 verified-icon" />
                  )}
                  {isPopular && (
                    <IconRosetteDiscountCheckFilled className="post-badge post-badge-orange w-5 h-5 ml-0.5 verified-icon" />
                  )}
                </div>
                {!isAnonymous && (
                  <span className="post-author-nickname font-light" style={{color: "#686D76"}}>@{post.author.nickname}</span>
                )}
                <span className="post-separator mx-1 font-light" style={{color: "#686D76"}}>·</span>
                <span className="post-date text-sm font-light" style={{color: "#686D76"}}>{formattedDate}</span>
                {/* Thread badge - tarihin hemen yaninda */}
                {isThread && (
                  <span className="ml-2 text-[10px] bg-black text-[#1DCD9F] border border-[#1DCD9F] px-1 py-0 rounded-full font-medium">
                    Thread
                  </span>
                )}
              </div>
              
              <div className="relative">
                <button 
                  ref={buttonRef}
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-700 rounded-full"
                >
                  <IconDots className="w-5 h-5" style={{color: "#686D76"}} />
                </button>
                
                {showMenu && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 mt-2 rounded-lg border border-[#2a2a2a]" 
                    style={{
                      width: "350px", 
                      backgroundColor: "#0a0a0a",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
                      zIndex: 9999
                    }}
                  >
                    {isOwnPost ? (
                      <>
                        {/* Kendi postum - Sil, Etkileşimler, Yerleştir */}
                        <button
                          onClick={handleDelete}
                          className="w-full text-left px-4 py-3 hover:bg-gray-800 first:rounded-t-lg text-red-500 flex items-center"
                        >
                          <IconTrash className="w-5 h-5 mr-3" />
                          Gönderiyi sil
                        </button>
                        <button
                          onClick={handleViewStats}
                          className="w-full text-left px-4 py-3 hover:bg-gray-800 flex items-center"
                        >
                          <IconChartBar className="w-5 h-5 mr-3" />
                          Gönderi etkileşimlerini görüntüle
                        </button>
                        <button
                          onClick={handlePin}
                          className="w-full text-left px-4 py-3 hover:bg-gray-800 last:rounded-b-lg flex items-center"
                        >
                          <IconCode className="w-5 h-5 mr-3" />
                          Gönderiyi yerleştir
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Başkasının postu - Takip, Engelle, Etkileşimler, Yerleştir, Bildir */}
                        <button
                          onClick={handleFollowToggle}
                          className="w-full text-left px-4 py-3 hover:bg-gray-800 first:rounded-t-lg flex items-center"
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
                          onClick={handleBlock}
                          className="w-full text-left px-4 py-3 hover:bg-gray-800 text-red-500 flex items-center"
                        >
                          <IconBan className="w-5 h-5 mr-3" />
                          @{post.author.nickname} adlı kişiyi engelle
                        </button>
                        <button
                          onClick={handleViewStats}
                          className="w-full text-left px-4 py-3 hover:bg-gray-800 flex items-center"
                        >
                          <IconChartBar className="w-5 h-5 mr-3" />
                          Gönderi etkileşimlerini görüntüle
                        </button>
                        <button
                          onClick={handlePin}
                          className="w-full text-left px-4 py-3 hover:bg-gray-800 flex items-center"
                        >
                          <IconCode className="w-5 h-5 mr-3" />
                          Gönderiyi yerleştir
                        </button>
                        <button
                          onClick={handleReport}
                          className="w-full text-left px-4 py-3 hover:bg-gray-800 last:rounded-b-lg text-red-500 flex items-center"
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
            
            <Link href={`/status/${post.id}`} className="block">
              <p className="post-content mb-3">{parseContent(post.content)}</p>
              
              {(post.mediaUrl || post.imageUrl) && (
                <div className="post-media mb-3 rounded-lg overflow-hidden flex justify-center" style={{border: "0.4px solid #2a2a2a"}}>
                  <img 
                    src={post.imageUrl || post.mediaUrl} 
                    alt="Post görseli" 
                    className="w-full h-auto"
                    style={{maxWidth: "518px", maxHeight: "518px", objectFit: "contain", width: "auto", height: "auto"}}
                  />
                </div>
              )}
            </Link>
            
            {/* YouTube/Link Preview - X.com Style */}
            {(post as any).linkPreview && (
              <div className="mb-3">
                {(post as any).linkPreview.type === 'youtube' && (post as any).linkPreview.videoId ? (
                  youtubeEmbedOpen ? (
                    // YouTube Embed Player - Tam genişlik
                    <div className="relative w-full rounded-xl overflow-hidden border border-[#333]" style={{paddingBottom: '56.25%'}}>
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${(post as any).linkPreview.videoId}?autoplay=1`}
                        title={(post as any).linkPreview.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    // X.com Style - Yatay Kart
                    <div 
                      className="flex rounded-xl overflow-hidden border border-[#333] cursor-pointer hover:bg-[#111] transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setYoutubeEmbedOpen(true);
                      }}
                    >
                      {/* Sol - Thumbnail */}
                      <div className="relative flex-shrink-0" style={{width: "130px", height: "130px", minWidth: "130px"}}>
                        <img 
                          src={(post as any).linkPreview.thumbnail}
                          alt={(post as any).linkPreview.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black bg-opacity-80 rounded-full p-2">
                            <IconPlayerPlay className="h-6 w-6 text-white" fill="white" />
                          </div>
                        </div>
                      </div>
                      {/* Sağ - Bilgiler */}
                      <div className="flex flex-col justify-center p-3 flex-1 min-w-0">
                        <div className="text-xs text-gray-500 mb-1">{(post as any).linkPreview.siteName || 'youtube.com'}</div>
                        <div className="text-sm font-medium text-white line-clamp-2 mb-1">{(post as any).linkPreview.title}</div>
                        {(post as any).linkPreview.description && (
                          <div className="text-xs text-gray-400 line-clamp-2">{(post as any).linkPreview.description}</div>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  // Genel Link Preview - X.com Style Yatay Kart
                  <a 
                    href={(post as any).linkPreview.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex rounded-xl overflow-hidden border border-[#333] hover:bg-[#111] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(post as any).linkPreview.thumbnail && (
                      <div className="relative flex-shrink-0" style={{width: "130px", height: "130px", minWidth: "130px"}}>
                        <img 
                          src={(post as any).linkPreview.thumbnail} 
                          alt={(post as any).linkPreview.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-col justify-center p-3 flex-1 min-w-0">
                      <div className="text-xs text-gray-500 mb-1">{(post as any).linkPreview.siteName}</div>
                      <div className="text-sm font-medium text-white line-clamp-2 mb-1">{(post as any).linkPreview.title}</div>
                      {(post as any).linkPreview.description && (
                        <div className="text-xs text-gray-400 line-clamp-2">{(post as any).linkPreview.description}</div>
                      )}
                    </div>
                  </a>
                )}
              </div>
            )}
            
            {/* Alıntılanan post */}
            {(post as any).quotedPost && (() => {
              const quotedPostIsAnonymous = (post as any).quotedPost.isAnonymous || false;
              return (
              <div className="post-quote mb-3 rounded-lg overflow-hidden" style={{border: "0.4px solid #2a2a2a"}}>
                <div className="p-3">
                  <div className="flex items-start">
                    {/* Profil resmi */}
                    <div className="post-quote-avatar">
                      {quotedPostIsAnonymous ? (
                        <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center">
                          <img 
                            src="/logo.png" 
                            alt="Anonim" 
                            className="w-8 h-8 rounded-full object-cover" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">A</div>';
                              }
                            }}
                          />
                        </div>
                      ) : (post as any).quotedPost.author.profileImage ? (
                        <img 
                          src={(post as any).quotedPost.author.profileImage} 
                          alt={(post as any).quotedPost.author.nickname} 
                          className="w-8 h-8 rounded-full object-cover mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2">
                          {(post as any).quotedPost.author.nickname.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="post-quote-content flex-1">
                      {/* Kullanıcı bilgisi ve tarih */}
                      <div className="post-quote-header flex items-center mb-1">
                        {quotedPostIsAnonymous ? (
                          <span className="post-quote-author font-medium text-sm">
                            Anonim Kullanıcı
                          </span>
                        ) : (
                          <Link href={`/${(post as any).quotedPost.author.nickname}`}>
                            <span className="post-quote-author font-medium text-sm">
                              {(post as any).quotedPost.author.fullName || (post as any).quotedPost.author.nickname}
                            </span>
                          </Link>
                        )}
                        {!quotedPostIsAnonymous && (post as any).quotedPost.author.hasBlueTick && (
                          <IconRosetteDiscountCheckFilled className="post-quote-badge post-quote-badge-blue w-4 h-4 ml-0.5 verified-icon" />
                        )}
                        {(post as any).quotedPost.isPopular && (
                          <IconRosetteDiscountCheckFilled className="post-quote-badge post-quote-badge-orange w-4 h-4 ml-0.5 verified-icon" />
                        )}
                        <span className="post-quote-separator mx-1 font-light text-xs" style={{color: "#686D76"}}>·</span>
                        <span className="post-quote-date text-xs font-light" style={{color: "#686D76"}}>{formatCustomDate(new Date((post as any).quotedPost.createdAt))}</span>
                      </div>
                      
                      {/* Post içeriği */}
                      <Link href={`/status/${(post as any).quotedPost.id}`}>
                        {(post as any).quotedPost.content && (
                          <div className="post-quote-text text-sm line-clamp-3">
                            {parseContent((post as any).quotedPost.content)}
                          </div>
                        )}
                        
                        {/* Alıntılanan postun medyası varsa */}
                        {((post as any).quotedPost.mediaUrl || (post as any).quotedPost.imageUrl) && (
                          <div className={`post-quote-media rounded-lg overflow-hidden flex justify-center ${(post as any).quotedPost.content ? 'mt-2' : ''}`} style={{border: "0.4px solid #2a2a2a"}}>
                            <img 
                              src={(post as any).quotedPost.imageUrl || (post as any).quotedPost.mediaUrl} 
                              alt="Alıntılanan post görseli" 
                              className="w-full h-auto"
                              style={{maxWidth: "518px", maxHeight: "518px", objectFit: "contain", width: "auto", height: "auto"}}
                            />
                          </div>
                        )}
                        
                        {/* Alıntılanan postun YouTube/Link Preview */}
                        {(post as any).quotedPost.linkPreview && (
                          <div className={`mt-2 flex rounded-xl overflow-hidden border border-[#333] ${(post as any).quotedPost.content ? 'mt-2' : ''}`}>
                            {(post as any).quotedPost.linkPreview.thumbnail && (
                              <div className="relative flex-shrink-0" style={{width: '100px', height: '100px'}}>
                                <img 
                                  src={(post as any).quotedPost.linkPreview.thumbnail}
                                  alt={(post as any).quotedPost.linkPreview.title}
                                  className="w-full h-full object-cover"
                                />
                                {(post as any).quotedPost.linkPreview.type === 'youtube' && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-black bg-opacity-80 rounded-full p-1">
                                      <IconPlayerPlay className="h-4 w-4 text-white" fill="white" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="flex flex-col justify-center p-2 flex-1 min-w-0">
                              <div className="text-xs text-gray-500">{(post as any).quotedPost.linkPreview.siteName}</div>
                              <div className="text-xs font-medium text-white line-clamp-2">{(post as any).quotedPost.linkPreview.title}</div>
                            </div>
                          </div>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              );
            })()}
            
            {/* İçerikteki post linklerinden alıntılanan postlar */}
            {linkedPosts.map((linkedPost, index) => {
              const linkedPostIsAnonymous = linkedPost.isAnonymous || false;
              return (
              <div key={`linked-post-${index}`} className="post-quote mb-3 rounded-lg overflow-hidden" style={{border: "0.4px solid #2a2a2a"}}>
                <div className="p-3">
                  <div className="flex items-start">
                    {/* Profil resmi */}
                    <div className="post-quote-avatar">
                      {linkedPostIsAnonymous ? (
                        <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center">
                          <img 
                            src="/logo.png" 
                            alt="Anonim" 
                            className="w-8 h-8 rounded-full object-cover" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">A</div>';
                              }
                            }}
                          />
                        </div>
                      ) : linkedPost.author?.profileImage ? (
                        <img 
                          src={linkedPost.author.profileImage} 
                          alt={linkedPost.author.nickname} 
                          className="w-8 h-8 rounded-full object-cover mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2">
                          {linkedPost.author?.nickname?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    
                    <div className="post-quote-content flex-1">
                      {/* Kullanıcı bilgisi ve tarih */}
                      <div className="post-quote-header flex items-center mb-1">
                        {linkedPostIsAnonymous ? (
                          <span className="post-quote-author font-medium text-sm">
                            Anonim Kullanıcı
                          </span>
                        ) : (
                          <Link href={`/${linkedPost.author?.nickname || ''}`}>
                            <span className="post-quote-author font-medium text-sm">
                              {linkedPost.author?.fullName || linkedPost.author?.nickname || 'Bilinmeyen'}
                            </span>
                          </Link>
                        )}
                        {!linkedPostIsAnonymous && linkedPost.author?.hasBlueTick && (
                          <IconRosetteDiscountCheckFilled className="post-quote-badge post-quote-badge-blue w-4 h-4 ml-0.5 verified-icon" />
                        )}
                        <span className="post-quote-separator mx-1 font-light text-xs" style={{color: "#686D76"}}>·</span>
                        <span className="post-quote-date text-xs font-light" style={{color: "#686D76"}}>{formatCustomDate(new Date(linkedPost.createdAt))}</span>
                      </div>
                      
                      {/* Post içeriği */}
                      <Link href={`/status/${linkedPost.id}`}>
                        {linkedPost.content && (
                          <div className="post-quote-text text-sm line-clamp-3">
                            {parseContent(linkedPost.content)}
                          </div>
                        )}
                        
                        {/* Alıntılanan postun medyası varsa */}
                        {(linkedPost.mediaUrl || linkedPost.imageUrl) && (
                          <div className={`post-quote-media rounded-lg overflow-hidden flex justify-center ${linkedPost.content ? 'mt-2' : ''}`} style={{border: "0.4px solid #2a2a2a"}}>
                            <img 
                              src={linkedPost.imageUrl || linkedPost.mediaUrl} 
                              alt="Alıntılanan post görseli" 
                              className="w-full h-auto"
                              style={{maxWidth: "518px", maxHeight: "518px", objectFit: "contain", width: "auto", height: "auto"}}
                            />
                          </div>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
            
            <div className="post-actions flex items-center text-sm">
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className="post-action post-action-like flex items-center mr-4"
                style={{color: isLiked ? "#FF0066" : "#686D76"}}
              >
                {isLiked ? (
                  <IconHeartFilled className="w-5 h-5 mr-1" style={{color: isLiked ? "#FF0066" : "#686D76"}} />
                ) : (
                  <IconHeart className="w-5 h-5 mr-1" style={{color: isLiked ? "#FF0066" : "#686D76"}} />
                )}
                {likeCount > 0 && (
                  <span className="post-action-count" style={{color: isLiked ? "#FF0066" : "#686D76"}}>{isPopular ? formatNumber(likeCount) : likeCount}</span>
                )}
              </button>
              
              <button 
                onClick={handleCommentClick}
                className="post-action post-action-comment flex items-center mr-4"
                style={{color: isCommented ? "#1d9bf0" : "#686D76"}}
              >
                <IconMessageCircle className="w-5 h-5 mr-1" style={{color: isCommented ? "#1d9bf0" : "#686D76"}} />
                {commentCount > 0 && (
                  <span className="post-action-count" style={{color: isCommented ? "#1d9bf0" : "#686D76"}}>{isPopular ? formatNumber(commentCount) : commentCount}</span>
                )}
              </button>
              
              <button 
                onClick={handleQuoteClick}
                className="post-action post-action-quote flex items-center mr-4"
                style={{color: quoted ? "#1DCD9F" : "#686D76"}}
              >
                <IconRepeat className="w-5 h-5 mr-1" style={{color: quoted ? "#1DCD9F" : "#686D76"}} />
                {quoteCount > 0 && (
                  <span className="post-action-count" style={{color: quoted ? "#1DCD9F" : "#686D76"}}>{quoteCount}</span>
                )}
              </button>

              {/* Bookmark ve Paylaşım butonları */}
              <div className="ml-auto flex items-center gap-2">
                {/* Bookmark butonu */}
                <button 
                  onClick={handleBookmark}
                  className="post-action post-action-bookmark p-1 rounded-full transition-colors"
                  style={{color: isBookmarked ? "#DC5F00" : "#686D76"}}
                >
                  <IconTargetArrow className="w-5 h-5" style={{color: isBookmarked ? "#DC5F00" : "#686D76"}} />
                </button>

                {/* Paylaşım butonu */}
                <div className="relative">
                  <button 
                    ref={shareButtonRef}
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="post-action post-action-share p-1 rounded-full transition-colors"
                    style={{color: "#686D76"}}
                  >
                    <IconShare3 className="interaction-icon w-5 h-5" />
                  </button>
                  
                  {showShareMenu && (
                    <div 
                      ref={shareMenuRef}
                      className="absolute right-0 bottom-full mb-2 rounded-lg border border-[#2a2a2a]" 
                      style={{
                        width: "200px", 
                        backgroundColor: "#0a0a0a",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
                        zIndex: 9999
                      }}
                    >
                      <button
                        onClick={handleCopyLink}
                        className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded-lg flex items-center"
                      >
                        <svg className="w-5 h-5 mr-3" style={{color: "#686D76"}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Gönderi bağlantısını kopyala
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isThread && showThreadFooter && (
        <>
          <hr className="border-[#2a2a2a] mx-4" />
          <div className="px-4 py-3 border-b border-[#2a2a2a] flex justify-center">
            <Link 
              href={`/status/${post.id}`}
              className="inline-flex items-center gap-2 text-[#1DCD9F] hover:opacity-80"
            >
              <span className="text-xs">Tümünü gör</span>
              <IconTimelineEventText size={14} />
            </Link>
          </div>
        </>
      )}

      <MinimalCommentModal 
        post={{
          id: post.id,
          content: post.content,
          username: post.author.nickname,
          createdAt: post.createdAt,
          isAnonymous: false
        }}
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onCommentAdded={handleCommentAdded}
      />

      <QuoteModal 
        post={post}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        onQuoteAdded={handleQuoteAdded}
      />
    </>
  );
}
