"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { tr } from "date-fns/locale";
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
  FlagIcon
} from "@heroicons/react/24/outline";
import { 
  HeartIcon as HeartIconSolid,
  ArrowPathIcon as ArrowPathIconSolid,
  CheckBadgeIcon
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
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

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

  const formattedDate = formatCustomDate(new Date(post.createdAt));
    locale: tr
  

  const isPopular = (counts.likes > 30 || counts.comments > 10);
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <>
      <div className={`${!isFirst ? 'border-t border-[#2a2a2a]' : ''} p-4 relative`} style={{zIndex: showMenu ? 9999 : 'auto'}}>
        <div className="flex items-start relative z-10">
          <div className="relative">
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
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex flex-wrap items-center">
                <div className="flex items-center mr-1">
                  <Link href={`/${post.author.nickname}`} className="">
                    <span className="font-bold text-gray-900">
                      {post.author.fullName || post.author.nickname}
                    </span>
                  </Link>
                  {post.author.hasBlueTick && (
                    <CheckBadgeIcon className="w-5 h-5 ml-1 text-blue-500" />
                  )}
                  {isPopular && (
                    <CheckBadgeIconOutline className="w-5 h-5 ml-1 text-orange-500" />
                  )}
                </div>
                <span className="font-light" style={{color: "#808080"}}>@{post.author.nickname}</span>
                <span className="mx-1 font-light" style={{color: "#6a6a6a"}}>·</span>
                <span className="text-sm font-light" style={{color: "#6a6a6a"}}>{formattedDate}</span>
              </div>
              
              <div className="relative">
                <button 
                  ref={buttonRef}
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-700 rounded-full"
                >
                  <EllipsisHorizontalIcon className="w-5 h-5" />
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
              <p className="mb-3 text-gray-800">{post.content}</p>
              
              {(post.mediaUrl || post.imageUrl) && (
                <div className="mb-3 rounded-lg overflow-hidden" style={{border: "0.4px solid #2a2a2a"}}>
                  <img 
                    src={post.imageUrl || post.mediaUrl} 
                    alt="Post görseli" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </Link>
            
            <div className="flex items-center text-gray-500 text-sm">
              <button 
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center mr-4 ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
              >
                {isLiked ? (
                  <HeartIconSolid className="w-5 h-5 mr-1" />
                ) : (
                  <HeartIconOutline className="w-5 h-5 mr-1" />
                )}
                {likeCount > 0 && (
                  <span>{isPopular ? formatNumber(likeCount) : likeCount}</span>
                )}
              </button>
              
              <button 
                onClick={handleCommentClick}
                className="flex items-center mr-4 hover:text-blue-500"
              >
                <ChatBubbleOvalLeftIconOutline className="w-5 h-5 mr-1" />
                {commentCount > 0 && (
                  <span>{isPopular ? formatNumber(commentCount) : commentCount}</span>
                )}
              </button>
              
              <button 
                onClick={handleQuoteClick}
                className={`flex items-center ${quoted ? 'text-green-500' : 'hover:text-green-500'}`}
              >
                {quoted ? (
                  <ArrowPathIconSolid className="w-5 h-5 mr-1" />
                ) : (
                  <ArrowPathIconOutline className="w-5 h-5 mr-1" />
                )}
                {quoteCount > 0 && (
                  <span>{quoteCount}</span>
                )}
              </button>
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
