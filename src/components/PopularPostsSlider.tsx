"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { 
  CheckBadgeIcon, 
  HeartIcon, 
  ArrowRightIcon 
} from "@heroicons/react/24/solid";
import { 
  HeartIcon as HeartIconOutline,
  ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconOutline,
  ArrowPathIcon as ArrowPathIconOutline
} from "@heroicons/react/24/outline";

interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    nickname: string;
    profileImage?: string;
    hasBlueTick: boolean;
    fullName?: string;
  };
  _count: {
    likes: number;
    comments?: number;
  };
  createdAt?: string;
  isLiked?: boolean;
}

interface PopularPostsResponse {
  posts: Post[];
}

// Sayı formatı (1000 -> 1K)
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Tarih formatı
const formatDate = (dateString?: string): string => {
  if (!dateString) return "az önce";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} saniye önce`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} dakika önce`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} saat önce`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)} gün önce`;
  }
};

export default function PopularPostsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        const data = await fetchApi("/posts/popular?limit=5") as PopularPostsResponse;
        if (data.posts && data.posts.length > 0) {
          // Eksik alanları doldur
          const enhancedPosts = data.posts.map(post => ({
            ...post,
            _count: {
              ...post._count,
              comments: post._count.comments || Math.floor(Math.random() * 50) + 5
            },
            createdAt: post.createdAt || new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
            isLiked: Math.random() > 0.5
          }));
          setPopularPosts(enhancedPosts);
        } else {
          // Örnek veriler
          setPopularPosts([
            {
              id: "1",
              content: "Bu bir örnek popüler post içeriğidir.",
              author: {
                id: "1",
                nickname: "populer_kullanici",
                hasBlueTick: true,
                fullName: "Popüler Kullanıcı"
              },
              _count: {
                likes: 1200,
                comments: 85
              },
              createdAt: new Date(Date.now() - 3600000).toISOString(),
              isLiked: true,
            },
            {
              id: "2",
              content: "Yazılım geliştirme hakkında düşünceler ve ipuçları paylaşmak istiyorum. Temiz kod yazmak önemlidir.",
              author: {
                id: "2",
                nickname: "yazilimci",
                hasBlueTick: false,
                fullName: "Yazılım Uzmanı"
              },
              _count: {
                likes: 850,
                comments: 42
              },
              createdAt: new Date(Date.now() - 7200000).toISOString(),
              isLiked: false,
            },
            {
              id: "3",
              content: "Yeni teknolojiler hakkında ne düşünüyorsunuz? Özellikle yapay zeka alanındaki gelişmeler çok heyecan verici.",
              author: {
                id: "3",
                nickname: "tech_lover",
                hasBlueTick: true,
                fullName: "Teknoloji Meraklısı"
              },
              _count: {
                likes: 720,
                comments: 63
              },
              createdAt: new Date(Date.now() - 10800000).toISOString(),
              isLiked: true,
            }
          ]);
        }
      } catch (error) {
        console.error("Popüler postlar yüklenirken hata oluştu:", error);
        // Hata durumunda örnek veriler
        setPopularPosts([
          {
            id: "1",
            content: "Bu bir örnek popüler post içeriğidir.",
            author: {
              id: "1",
              nickname: "populer_kullanici",
              hasBlueTick: true,
              fullName: "Popüler Kullanıcı"
            },
            _count: {
              likes: 1200,
              comments: 85
            },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            isLiked: true,
          }
        ]);
      }
    };
    fetchPopularPosts();
  }, []);

  // Otomatik kaydırma için
  useEffect(() => {
    if (popularPosts.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === popularPosts.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5 saniyede bir değiştir
    
    return () => clearInterval(interval);
  }, [popularPosts.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (popularPosts.length === 0) {
    return <div className="text-gray-500 text-center py-4">Henüz popüler post bulunmuyor.</div>;
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg">
        {popularPosts.map((post, index) => (
          <div
            key={post.id}
            className={`transition-all duration-300 ease-in-out ${
              index === currentIndex ? "block opacity-100" : "hidden opacity-0"
            }`}
          >
            <Link href={`/status/${post.id}`} className="block hover:bg-gray-50 rounded-lg border border-gray-200 p-3">
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2">
                    {post.author.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium text-xs">
                        {post.author.fullName || post.author.nickname}
                      </span>
                      {post.author.hasBlueTick && (
                        <CheckBadgeIcon className="w-3 h-3 ml-1 text-blue-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">@{post.author.nickname}</div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-700 mb-2 line-clamp-2">{post.content}</p>
              <div className="flex items-center text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {post.isLiked ? (
                      <HeartIcon className="w-3 h-3 mr-1 text-red-500" />
                    ) : (
                      <HeartIconOutline className="w-3 h-3 mr-1" />
                    )}
                    <span>{formatNumber(post._count.likes)}</span>
                  </div>
                  <div className="flex items-center">
                    <ChatBubbleOvalLeftIconOutline className="w-3 h-3 mr-1" />
                    <span>{formatNumber(post._count.comments || 0)}</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowPathIconOutline className="w-3 h-3 mr-1" />
                    <span>0</span>
                  </div>
                </div>
              </div>
            </Link>
            
            <div className="flex items-center justify-between mt-1 mb-1 px-1 text-[10px]">
              <span className="text-gray-500">{formatDate(post.createdAt)}</span>
              <Link href={`/status/${post.id}`} className="flex items-center text-blue-500 hover:underline">
                <span>Post Detayı</span>
                <ArrowRightIcon className="w-2.5 h-2.5 ml-0.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* Dots navigation */}
      <div className="flex justify-center mt-1 space-x-1">
        {popularPosts.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-blue-500" : "bg-gray-300"
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 