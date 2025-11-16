"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Post } from "./PostList";
import { postApi, deleteApi } from "@/lib/api";
import { 
  HeartIcon as HeartIconOutline,
  ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconOutline,
  ArrowPathIcon as ArrowPathIconOutline,
  CheckBadgeIcon as CheckBadgeIconOutline,
  EllipsisHorizontalIcon,
  UserPlusIcon,
  UserMinusIcon,
  NoSymbolIcon,
  ChartBarSquareIcon,
  CodeBracketSquareIcon,
  FlagIcon,
  BookmarkIcon as BookmarkIconOutline,
  ArrowUpTrayIcon
} from "@heroicons/react/24/outline";
import { 
  HeartIcon as HeartIconSolid,
  CheckBadgeIcon,
  ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconSolid,
  BookmarkIcon as BookmarkIconSolid
} from "@heroicons/react/24/solid";
import MinimalCommentModal from "./MinimalCommentModal";
import QuoteModal from "./QuoteModal";

interface PostItemProps {
  post: Post;
  isFirst?: boolean;
}

export default function PostItem({ post, isFirst = false }: PostItemProps) {
  const defaultCounts = { likes: 0, comments: 0 };
  const counts = post._count || defaultCounts;
  
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(counts.likes);
  const [commentCount, setCommentCount] = useState(counts.comments);
  const [quoteCount, setQuoteCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [quoted, setQuoted] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isCommented, setIsCommented] = useState(false);
  const [linkedPosts, setLinkedPosts] = useState<any[]>([]);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

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
    setIsCommented(true);
  };

  const handleCommentAdded = () => {
    setCommentCount(prev => prev + 1);
    setIsCommented(true);
  };

  const handleQuoteClick = () => {
    setIsQuoteModalOpen(true);
  };

  const handleQuoteAdded = () => {
    setQuoteCount(prev => prev + 1);
    setQuoted(true);
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

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("Token bulunamadı");
        return;
      }
      
      if (isBookmarked) {
        // TODO: Bookmark silme API çağrısı
        console.log("Bookmark kaldırıldı:", post.id);
      } else {
        // TODO: Bookmark ekleme API çağrısı
        console.log("Bookmark eklendi:", post.id);
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
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;

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
      const remaining = content.substring(lastIndex).trim();
      if (remaining) {
        parts.push(remaining);
      }
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <>
      <div className={`post ${!isFirst ? 'border-t border-[#2a2a2a]' : ''} p-4 relative`} style={{zIndex: showMenu ? 9999 : 'auto'}}>
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
                    <span className="post-author-name font-bold text-gray-900">
                      Anonim Kullanıcı
                    </span>
                  ) : (
                    <Link href={`/${post.author.nickname}`} className="">
                      <span className="post-author-name font-bold text-gray-900">
                        {post.author.fullName || post.author.nickname}
                      </span>
                    </Link>
                  )}
                  {!isAnonymous && post.author.hasBlueTick && (
                    <CheckBadgeIcon className="post-badge post-badge-blue w-5 h-5 ml-1 text-blue-500" />
                  )}
                  {isPopular && (
                    <CheckBadgeIconOutline className="post-badge post-badge-orange w-5 h-5 ml-1 text-orange-500" />
                  )}
                </div>
                {!isAnonymous && (
                  <span className="post-author-nickname font-light" style={{color: "#4a4a4a"}}>@{post.author.nickname}</span>
                )}
                <span className="post-separator mx-1 font-light" style={{color: "#4a4a4a"}}>·</span>
                <span className="post-date text-sm font-light" style={{color: "#4a4a4a"}}>{formattedDate}</span>
              </div>
              
              <div className="relative">
                <button 
                  ref={buttonRef}
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-700 rounded-full"
                >
                  <EllipsisHorizontalIcon className="w-5 h-5" style={{color: "#4a4a4a"}} />
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
                    <button
                      onClick={handleFollowToggle}
                      className="w-full text-left px-4 py-3 hover:bg-gray-800 first:rounded-t-lg flex items-center"
                    >
                      {isFollowing ? (
                        <>
                          <UserMinusIcon className="w-5 h-5 mr-3" />
                          @{post.author.nickname} adlı kişinin takibini bırak
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="w-5 h-5 mr-3" />
                          @{post.author.nickname} adlı kişiyi takip et
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleBlock}
                      className="w-full text-left px-4 py-3 hover:bg-gray-800 text-red-500 flex items-center"
                    >
                      <NoSymbolIcon className="w-5 h-5 mr-3" />
                      @{post.author.nickname} adlı kişiyi engelle
                    </button>
                    <button
                      onClick={handleViewStats}
                      className="w-full text-left px-4 py-3 hover:bg-gray-800 flex items-center"
                    >
                      <ChartBarSquareIcon className="w-5 h-5 mr-3" />
                      Gönderi etkileşimlerini görüntüle
                    </button>
                    <button
                      onClick={handlePin}
                      className="w-full text-left px-4 py-3 hover:bg-gray-800 flex items-center"
                    >
                      <CodeBracketSquareIcon className="w-5 h-5 mr-3" />
                      Gönderiyi yerleştir
                    </button>
                    <button
                      onClick={handleReport}
                      className="w-full text-left px-4 py-3 hover:bg-gray-800 last:rounded-b-lg text-red-500 flex items-center"
                    >
                      <FlagIcon className="w-5 h-5 mr-3" />
                      Gönderiyi bildir
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <Link href={`/status/${post.id}`} className="block">
              <p className="post-content mb-3 text-gray-800">{parseContent(post.content)}</p>
              
              {(post.mediaUrl || post.imageUrl) && (
                <div className="post-media mb-3 rounded-lg overflow-hidden" style={{border: "0.4px solid #2a2a2a"}}>
                  <img 
                    src={post.imageUrl || post.mediaUrl} 
                    alt="Post görseli" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </Link>
            
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
                          <span className="post-quote-author font-medium text-gray-900 text-sm">
                            Anonim Kullanıcı
                          </span>
                        ) : (
                          <Link href={`/${(post as any).quotedPost.author.nickname}`}>
                            <span className="post-quote-author font-medium text-gray-900 text-sm">
                              {(post as any).quotedPost.author.fullName || (post as any).quotedPost.author.nickname}
                            </span>
                          </Link>
                        )}
                        {!quotedPostIsAnonymous && (post as any).quotedPost.author.hasBlueTick && (
                          <CheckBadgeIcon className="post-quote-badge post-quote-badge-blue w-4 h-4 ml-1 text-blue-500" />
                        )}
                        {(post as any).quotedPost.isPopular && (
                          <CheckBadgeIconOutline className="post-quote-badge post-quote-badge-orange w-4 h-4 ml-1 text-orange-500" />
                        )}
                        <span className="post-quote-separator mx-1 font-light text-xs" style={{color: "#4a4a4a"}}>·</span>
                        <span className="post-quote-date text-xs font-light" style={{color: "#4a4a4a"}}>{formatCustomDate(new Date((post as any).quotedPost.createdAt))}</span>
                      </div>
                      
                      {/* Post içeriği */}
                      <Link href={`/status/${(post as any).quotedPost.id}`}>
                        {(post as any).quotedPost.content && (
                          <div className="post-quote-text text-gray-800 text-sm line-clamp-3">
                            {parseContent((post as any).quotedPost.content)}
                          </div>
                        )}
                        
                        {/* Alıntılanan postun medyası varsa */}
                        {((post as any).quotedPost.mediaUrl || (post as any).quotedPost.imageUrl) && (
                          <div className={`post-quote-media rounded-lg overflow-hidden ${(post as any).quotedPost.content ? 'mt-2' : ''}`} style={{border: "0.4px solid #2a2a2a"}}>
                            <img 
                              src={(post as any).quotedPost.imageUrl || (post as any).quotedPost.mediaUrl} 
                              alt="Alıntılanan post görseli" 
                              className="w-full h-auto object-cover"
                            />
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
                          <span className="post-quote-author font-medium text-gray-900 text-sm">
                            Anonim Kullanıcı
                          </span>
                        ) : (
                          <Link href={`/${linkedPost.author?.nickname || ''}`}>
                            <span className="post-quote-author font-medium text-gray-900 text-sm">
                              {linkedPost.author?.fullName || linkedPost.author?.nickname || 'Bilinmeyen'}
                            </span>
                          </Link>
                        )}
                        {!linkedPostIsAnonymous && linkedPost.author?.hasBlueTick && (
                          <CheckBadgeIcon className="post-quote-badge post-quote-badge-blue w-4 h-4 ml-1 text-blue-500" />
                        )}
                        <span className="post-quote-separator mx-1 font-light text-xs" style={{color: "#4a4a4a"}}>·</span>
                        <span className="post-quote-date text-xs font-light" style={{color: "#4a4a4a"}}>{formatCustomDate(new Date(linkedPost.createdAt))}</span>
                      </div>
                      
                      {/* Post içeriği */}
                      <Link href={`/status/${linkedPost.id}`}>
                        {linkedPost.content && (
                          <div className="post-quote-text text-gray-800 text-sm line-clamp-3">
                            {parseContent(linkedPost.content)}
                          </div>
                        )}
                        
                        {/* Alıntılanan postun medyası varsa */}
                        {(linkedPost.mediaUrl || linkedPost.imageUrl) && (
                          <div className={`post-quote-media rounded-lg overflow-hidden ${linkedPost.content ? 'mt-2' : ''}`} style={{border: "0.4px solid #2a2a2a"}}>
                            <img 
                              src={linkedPost.imageUrl || linkedPost.mediaUrl} 
                              alt="Alıntılanan post görseli" 
                              className="w-full h-auto object-cover"
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
                className={`post-action post-action-like flex items-center mr-4 ${isLiked ? 'text-red-500' : ''}`}
                style={!isLiked ? {color: "#4a4a4a"} : {}}
              >
                {isLiked ? (
                  <HeartIconSolid className="w-5 h-5 mr-1" />
                ) : (
                  <HeartIconOutline className="w-5 h-5 mr-1" />
                )}
                {likeCount > 0 && (
                  <span className="post-action-count" style={isLiked ? {} : {color: "#4a4a4a"}}>{isPopular ? formatNumber(likeCount) : likeCount}</span>
                )}
              </button>
              
              <button 
                onClick={handleCommentClick}
                className={`post-action post-action-comment flex items-center mr-4 ${isCommented ? 'text-blue-500' : ''}`}
                style={!isCommented ? {color: "#4a4a4a"} : {}}
              >
                {isCommented ? (
                  <ChatBubbleOvalLeftIconSolid className="w-5 h-5 mr-1" />
                ) : (
                  <ChatBubbleOvalLeftIconOutline className="w-5 h-5 mr-1" />
                )}
                {commentCount > 0 && (
                  <span className="post-action-count" style={isCommented ? {} : {color: "#4a4a4a"}}>{isPopular ? formatNumber(commentCount) : commentCount}</span>
                )}
              </button>
              
              <button 
                onClick={handleQuoteClick}
                className={`post-action post-action-quote flex items-center mr-4 ${quoted ? 'text-green-500' : ''}`}
                style={!quoted ? {color: "#4a4a4a"} : {}}
              >
                <ArrowPathIconOutline className="w-5 h-5 mr-1" />
                {quoteCount > 0 && (
                  <span className="post-action-count" style={quoted ? {} : {color: "#4a4a4a"}}>{quoteCount}</span>
                )}
              </button>

              {/* Bookmark ve Paylaşım butonları */}
              <div className="ml-auto flex items-center gap-2">
                {/* Bookmark butonu */}
                <button 
                  onClick={handleBookmark}
                  className={`post-action post-action-bookmark p-1 rounded-full transition-colors ${isBookmarked ? 'text-orange-500' : ''}`}
                  style={!isBookmarked ? {color: "#4a4a4a"} : {}}
                >
                  {isBookmarked ? (
                    <BookmarkIconSolid className="w-5 h-5" />
                  ) : (
                    <BookmarkIconOutline className="w-5 h-5" />
                  )}
                </button>

                {/* Paylaşım butonu */}
                <div className="relative">
                  <button 
                    ref={shareButtonRef}
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="post-action post-action-share p-1 rounded-full transition-colors"
                    style={{color: "#4a4a4a"}}
                  >
                    <ArrowUpTrayIcon className="w-5 h-5" />
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
                        <svg className="w-5 h-5 mr-3" style={{color: "#4a4a4a"}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
