"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, CheckBadgeIcon as CheckBadgeIconOutline } from "@heroicons/react/24/outline";
import { IconPlayerPlay } from "@tabler/icons-react";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import {
  HeartIcon as HeartIconOutline,
  ChatBubbleOvalLeftIcon,
  ArrowPathIcon as ArrowPathIconOutline,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartIconSolid,
  ArrowPathIcon as ArrowPathIconSolid,
} from "@heroicons/react/24/solid";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import CommentComposeBox from "@/components/CommentComposeBox";
import { fetchApi } from "@/lib/api";
import { Post } from "@/components/PostList";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    nickname: string;
    hasBlueTick: boolean;
    profileImage?: string;
  };
}

interface PostWithComments extends Post {
  comments: Comment[];
  quotedPost?: any;
}

interface CurrentUser {
  nickname: string;
  profileImage?: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<PostWithComments | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCommentBoxFocused, setIsCommentBoxFocused] = useState(false);
  const [linkedPosts, setLinkedPosts] = useState<any[]>([]);

  // Post içeriğindeki post linklerini tespit et ve çek
  useEffect(() => {
    if (!post?.content) return;

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
  }, [post?.content]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await fetchApi(`/posts/${postId}`);
        setPost(data);
        setError(null);
      } catch (err) {
        setError("Post yüklenirken bir hata oluştu.");
        console.error("Post yükleme hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const userData = await fetchApi("/users/me");
        setCurrentUser(userData);
      } catch (err) {
        console.error("Kullanıcı bilgileri alınamadı:", err);
      }
    };

    if (postId) {
      fetchPost();
      fetchCurrentUser();
    }
  }, [postId]);

  const handleCommentAdded = () => {
    window.location.reload();
  };

  const handleProfileClick = (nickname: string) => {
    router.push(`/${nickname}`);
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

  // Post içeriğini parse edip hashtag ve linkleri tıklanabilir hale getir
  const parseContent = (content: string) => {
    if (!content) return null;

    // Post link regex: ultraswall.com/status/[id] formatında
    const postLinkRegex = /(?:https?:\/\/)?(?:www\.)?ultraswall\.com\/status\/\d+/gi;
    
    // Önce içeriğin sadece post linki(leri) ve boşluklardan oluşup oluşmadığını kontrol et
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

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center">
          <div className="w-full max-w-[600px]">
            <div className="border border-[#222222] rounded-lg p-8 text-center" style={{backgroundColor: '#0a0a0a'}}>
              <p className="text-red-500 mb-4">{error || "Post bulunamadı"}</p>
              <button
                onClick={() => router.push("/home")}
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{backgroundColor: 'oklch(0.71 0.24 43.55)'}}
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Anonim post kontrolü
  const isAnonymous = (post as any).isAnonymous || false;
  const formattedDate = formatCustomDate(new Date(post.createdAt));

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-center">
        <div className="hidden lg:block w-[260px] shrink-0">
          <LeftSidebar />
        </div>

        <div className="w-full max-w-[600px]">
          <div className="border border-[#222222] rounded-t-lg p-4 mb-0 flex items-center" style={{backgroundColor: '#0a0a0a'}}>
            <button
              onClick={() => router.push("/home")}
              className="p-2 hover:bg-gray-800 rounded-full mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Gönderi Detayı</h1>
          </div>

          <div className="border-x border-b border-[#222222] p-4 mb-0" style={{backgroundColor: '#0a0a0a'}}>
            <div className="flex items-start mb-4">
              {isAnonymous ? (
                <div className="w-12 h-12 rounded-full mr-3 flex items-center justify-center">
                  <img 
                    src="/logo.png" 
                    alt="Anonim" 
                    className="w-12 h-12 rounded-full object-cover" 
                    onError={(e) => {
                      // Logo yüklenemezse varsayılan avatar göster
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">A</div>';
                      }
                    }}
                  />
                </div>
              ) : (
                post.author.profileImage ? (
                  <img
                    src={post.author.profileImage}
                    alt={post.author.nickname}
                    className="w-12 h-12 rounded-full object-cover cursor-pointer hover:opacity-80"
                    onClick={() => handleProfileClick(post.author.nickname)}
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 cursor-pointer hover:opacity-80"
                    onClick={() => handleProfileClick(post.author.nickname)}
                  >
                    {post.author.nickname.charAt(0).toUpperCase()}
                  </div>
                )
              )}
              <div className="ml-3">
                <div className="flex items-center">
                  {isAnonymous ? (
                    <span className="font-bold text-base">
                      Anonim Kullanıcı
                    </span>
                  ) : (
                    <span
                      className="font-bold text-base cursor-pointer hover:underline"
                      onClick={() => handleProfileClick(post.author.nickname)}
                    >
                      {post.author.fullName || post.author.nickname}
                    </span>
                  )}
                  {!isAnonymous && post.author.hasBlueTick && (
                    <CheckBadgeIcon className="w-5 h-5 ml-1 text-blue-500" />
                  )}
                </div>
                {!isAnonymous && (
                  <span
                    className="text-sm cursor-pointer hover:underline"
                    style={{color: "#6e767d"}}
                    onClick={() => handleProfileClick(post.author.nickname)}
                  >
                    @{post.author.nickname}
                  </span>
                )}
                {!isAnonymous && (
                  <span className="mx-1" style={{color: "#6e767d"}}>·</span>
                )}
                <span className="text-sm" style={{color: "#6e767d"}}>{formattedDate}</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-lg whitespace-pre-wrap break-words">{parseContent(post.content)}</p>
            </div>

            {(post.mediaUrl || post.imageUrl) && (
              <div className="mb-4 rounded-lg overflow-hidden" style={{border: "0.4px solid #222222"}}>
                <img
                  src={post.mediaUrl || post.imageUrl || ""}
                  alt="Post media"
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* YouTube/Link Preview */}
            {(post as any).linkPreview && (
              <div className="mb-4 flex rounded-xl overflow-hidden border border-[#333]">
                {(post as any).linkPreview.thumbnail && (
                  <div className="relative flex-shrink-0" style={{width: '130px', height: '130px'}}>
                    <img 
                      src={(post as any).linkPreview.thumbnail}
                      alt={(post as any).linkPreview.title}
                      className="w-full h-full object-cover"
                    />
                    {(post as any).linkPreview.type === 'youtube' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-80 rounded-full p-2">
                          <IconPlayerPlay className="h-6 w-6 text-white" fill="white" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-col justify-center p-3 flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">{(post as any).linkPreview.siteName}</div>
                  <div className="text-sm font-medium text-white line-clamp-2 mb-1">{(post as any).linkPreview.title}</div>
                  {(post as any).linkPreview.description && (
                    <div className="text-xs text-gray-400 line-clamp-2">{(post as any).linkPreview.description}</div>
                  )}
                </div>
              </div>
            )}

            {/* Alıntılanan post */}
            {post.quotedPost && (
              <div className="post-quote mb-4 rounded-lg overflow-hidden" style={{border: "0.4px solid #222222"}}>
                <div className="p-3">
                  <div className="flex items-start">
                    {/* Profil resmi */}
                    <div className="post-quote-avatar">
                      {post.quotedPost.author.profileImage ? (
                        <img 
                          src={post.quotedPost.author.profileImage} 
                          alt={post.quotedPost.author.nickname} 
                          className="w-8 h-8 rounded-full object-cover mr-2"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2">
                          {post.quotedPost.author.nickname.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <div className="post-quote-content flex-1">
                      {/* Kullanıcı bilgisi ve tarih */}
                      <div className="post-quote-header flex items-center mb-1">
                        <Link href={`/${post.quotedPost.author.nickname}`}>
                          <span className="post-quote-author font-medium text-gray-900 text-sm">
                            {post.quotedPost.author.fullName || post.quotedPost.author.nickname}
                          </span>
                        </Link>
                        {post.quotedPost.author.hasBlueTick && (
                          <CheckBadgeIcon className="post-quote-badge post-quote-badge-blue w-4 h-4 ml-1 text-blue-500" />
                        )}
                        <span className="post-quote-separator mx-1 font-light text-xs" style={{color: "#4a4a4a"}}>·</span>
                        <span className="post-quote-date text-xs font-light" style={{color: "#4a4a4a"}}>{formatCustomDate(new Date(post.quotedPost.createdAt))}</span>
                      </div>
                      
                      {/* Post içeriği */}
                      <Link href={`/status/${post.quotedPost.id}`}>
                        {post.quotedPost.content && (
                          <div className="post-quote-text text-gray-800 text-sm line-clamp-3">
                            {parseContent(post.quotedPost.content)}
                          </div>
                        )}
                        
                        {/* Alıntılanan postun medyası varsa */}
                        {(post.quotedPost.mediaUrl || post.quotedPost.imageUrl) && (
                          <div className={`post-quote-media rounded-lg overflow-hidden ${post.quotedPost.content ? 'mt-2' : ''}`} style={{border: "0.4px solid #222222"}}>
                            <img 
                              src={post.quotedPost.imageUrl || post.quotedPost.mediaUrl} 
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
            )}

            {/* İçerikteki post linklerinden alıntılanan postlar */}
            {linkedPosts.map((linkedPost, index) => (
              <div key={`linked-post-${index}`} className="post-quote mb-4 rounded-lg overflow-hidden" style={{border: "0.4px solid #222222"}}>
                <div className="p-3">
                  <div className="flex items-start">
                    {/* Profil resmi */}
                    <div className="post-quote-avatar">
                      {linkedPost.author?.profileImage ? (
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
                        <Link href={`/${linkedPost.author?.nickname || ''}`}>
                          <span className="post-quote-author font-medium text-gray-900 text-sm">
                            {linkedPost.author?.fullName || linkedPost.author?.nickname || 'Bilinmeyen'}
                          </span>
                        </Link>
                        {linkedPost.author?.hasBlueTick && (
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
                          <div className={`post-quote-media rounded-lg overflow-hidden ${linkedPost.content ? 'mt-2' : ''}`} style={{border: "0.4px solid #222222"}}>
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
            ))}

            <div className="text-sm mb-3" style={{color: "#6e767d"}}>
              {new Date(post.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} · {new Date(post.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} · <span className="font-semibold" style={{color: "#d9dadd"}}>{Math.floor(Math.random() * 1000) + 100}</span> Görüntülenme
            </div>

            <hr className="border-[#222222] mb-3" />

            <div className="flex items-center">
              <button className="flex items-center mr-4 hover:text-red-500">
                <HeartIconOutline className="w-5 h-5 mr-1" />
                {post._count.likes > 0 && <span>{post._count.likes}</span>}
              </button>

              <button
                onClick={() => setIsCommentBoxFocused(true)}
                className="flex items-center mr-4 hover:text-blue-500"
              >
                <ChatBubbleOvalLeftIcon className="w-5 h-5 mr-1" />
                {post._count.comments > 0 && <span>{post._count.comments}</span>}
              </button>

              <button className="flex items-center hover:text-green-500">
                <ArrowPathIconOutline className="w-5 h-5 mr-1" />
              </button>
            </div>
          </div>

          {!isCommentBoxFocused ? (
            <div
              className="border-x border-[#222222] p-4"
              style={{backgroundColor: '#0a0a0a'}}
            >
              <div className="flex items-center justify-between">
                <div
                  onClick={() => setIsCommentBoxFocused(true)}
                  className="flex items-center flex-1 cursor-pointer hover:bg-gray-900 p-2 rounded-lg"
                >
                  {currentUser?.profileImage ? (
                    <img
                      src={currentUser.profileImage}
                      alt={currentUser.nickname}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3">
                      {currentUser?.nickname?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                  <span style={{color: "#6e767d"}}>Yanıtını yaz...</span>
                </div>
                <button
                  disabled
                  className="px-4 py-2 rounded-full text-white font-medium opacity-50 cursor-not-allowed"
                  style={{backgroundColor: 'oklch(0.71 0.24 43.55)'}}
                >
                  Yanıtla
                </button>
              </div>
            </div>
          ) : (
            <div className="border-x border-[#222222] p-4" style={{backgroundColor: '#0a0a0a'}}>
              <CommentComposeBox
                postId={postId}
                onCommentAdded={handleCommentAdded}
                onCancel={() => setIsCommentBoxFocused(false)}
                hideAvatar={true}
                textareaClassName="border-0 focus:ring-0"
              />
            </div>
          )}

          <div className="border border-[#222222] rounded-b-lg" style={{backgroundColor: '#0a0a0a'}}>

            {post.comments && post.comments.length > 0 ? (
              <div>
                {post.comments.map((comment, index) => (
                  <div
                    key={comment.id}
                    className={`p-4 ${index !== post.comments.length - 1 ? 'border-b border-[#222222]' : ''}`}
                  >
                    <div className="flex items-start">
                      {comment.author.profileImage ? (
                        <img
                          src={comment.author.profileImage}
                          alt={comment.author.nickname}
                          className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer hover:opacity-80"
                          onClick={() => handleProfileClick(comment.author.nickname)}
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3 cursor-pointer hover:opacity-80"
                          onClick={() => handleProfileClick(comment.author.nickname)}
                        >
                          {comment.author.nickname.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <span
                            className="font-medium cursor-pointer hover:underline"
                            onClick={() => handleProfileClick(comment.author.nickname)}
                          >
                            {comment.author.nickname}
                          </span>
                          <span className="mx-2" style={{color: "#222222"}}>•</span>
                          <span className="text-sm" style={{color: "#222222"}}>
                            {new Date(comment.createdAt).toLocaleDateString("tr-TR")}
                          </span>
                        </div>
                        <p>{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center" style={{color: "#222222"}}>
                Henüz yorum yok. İlk yorumu sen yap!
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block w-[300px] shrink-0 ml-[10px]">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
