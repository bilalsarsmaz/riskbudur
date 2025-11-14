"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckBadgeIcon, HeartIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { 
  HeartIcon as HeartIconOutline,
  ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconOutline,
  ArrowPathIcon as ArrowPathIconOutline
} from "@heroicons/react/24/outline";

// Örnek post verisi
interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    nickname: string;
    hasBlueTick: boolean;
    fullName?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  createdAt: string;
  isLiked?: boolean;
}

// Örnek veriler
const samplePosts: Post[] = [
  {
    id: "1",
    content: "Sosyal medya platformlarında karakter sınırı, kullanıcıların düşüncelerini özlü bir şekilde ifade etmelerini sağlar.",
    author: {
      id: "1",
      nickname: "populer_kullanici",
      hasBlueTick: true,
      fullName: "Popüler Kullanıcı"
    },
    _count: {
      likes: 1248,
      comments: 85
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 saat önce
    isLiked: true,
  },
  {
    id: "2",
    content: "Yazılım geliştirme hakkında düşünceler ve ipuçları paylaşmak istiyorum. Temiz kod yazmak, uzun vadede projenizin sürdürülebilirliğini artırır.",
    author: {
      id: "2",
      nickname: "yazilimci",
      hasBlueTick: false,
      fullName: "Yazılım Uzmanı"
    },
    _count: {
      likes: 856,
      comments: 42
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 saat önce
    isLiked: false,
  },
  {
    id: "3",
    content: "Yeni teknolojiler hakkında ne düşünüyorsunuz? Özellikle yapay zeka alanındaki gelişmeler gelecekte hayatımızı nasıl etkileyecek?",
    author: {
      id: "3",
      nickname: "tech_lover",
      hasBlueTick: true,
      fullName: "Teknoloji Meraklısı"
    },
    _count: {
      likes: 723,
      comments: 63
    },
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 saat önce
    isLiked: true,
  },
  {
    id: "4",
    content: "Bugün yeni bir kitap okumaya başladım. Okuma alışkanlığı edinmek için önerileriniz var mı?",
    author: {
      id: "4",
      nickname: "kitap_kurdu",
      hasBlueTick: false,
      fullName: "Kitap Kurdu"
    },
    _count: {
      likes: 512,
      comments: 37
    },
    createdAt: new Date(Date.now() - 14400000).toISOString(), // 4 saat önce
    isLiked: false,
  },
  {
    id: "5",
    content: "Sağlıklı yaşam için spor ve beslenme hakkında bilgiler paylaşacağım. Takipte kalın!",
    author: {
      id: "5",
      nickname: "saglikli_yasam",
      hasBlueTick: true,
      fullName: "Sağlıklı Yaşam"
    },
    _count: {
      likes: 945,
      comments: 72
    },
    createdAt: new Date(Date.now() - 18000000).toISOString(), // 5 saat önce
    isLiked: false,
  }
];

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
const formatDate = (dateString: string): string => {
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

// Tasarım 1: Kart Slider
const PopularPostsDesign1 = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };
  
  return (
    <div className="w-[300px] bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Popüler Postlar</h2>
      
      <div className="relative">
        <div className="overflow-hidden rounded-lg">
          {samplePosts.map((post, index) => (
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
                      <span>{formatNumber(post._count.comments)}</span>
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
      </div>
      
      {/* Dots navigation */}
      <div className="flex justify-center mt-1 space-x-1">
        {samplePosts.map((_, index) => (
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
};

// Tasarım 2: Liste Görünümü
const PopularPostsDesign2 = () => {
  const [activePost, setActivePost] = useState<string | null>(null);
  
  return (
    <div className="w-[300px] bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Trend Konular</h2>
      
      <div className="space-y-3">
        {samplePosts.slice(0, 3).map((post) => (
          <div 
            key={post.id} 
            className={`p-3 rounded-lg transition-colors ${
              activePost === post.id ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
            onMouseEnter={() => setActivePost(post.id)}
            onMouseLeave={() => setActivePost(null)}
          >
            <Link href={`/status/${post.id}`} className="block">
              <div className="flex items-center mb-1">
                <span className="text-xs text-blue-600 mr-1">@{post.author.nickname}</span>
                {post.author.hasBlueTick && (
                  <CheckBadgeIcon className="w-3 h-3 text-blue-500" />
                )}
                <span className="text-xs text-gray-500 ml-auto">{formatDate(post.createdAt)}</span>
              </div>
              <p className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">{post.content}</p>
              <div className="flex items-center text-xs text-gray-500">
                <div className="flex items-center">
                  <HeartIconOutline className="w-3 h-3 mr-1" />
                  <span>{formatNumber(post._count.likes)}</span>
                </div>
                <ArrowRightIcon className="w-3 h-3 ml-auto text-gray-400" />
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      <Link href="/popular" className="block text-center text-sm text-blue-500 mt-3 hover:underline">
        Tümünü Gör
      </Link>
    </div>
  );
};

// Tasarım 3: Kompakt Görünüm
const PopularPostsDesign3 = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const postsPerPage = 2;
  const totalPages = Math.ceil(samplePosts.length / postsPerPage);
  
  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === totalPages - 1 ? 0 : prevIndex + 1
    );
  };
  
  const goToPrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? totalPages - 1 : prevIndex - 1
    );
  };
  
  const currentPosts = samplePosts.slice(
    currentIndex * postsPerPage, 
    (currentIndex + 1) * postsPerPage
  );
  
  return (
    <div className="w-[300px] bg-gradient-to-br from-orange-50 to-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-orange-600">Popüler İçerikler</h2>
        <div className="flex space-x-1">
          <button 
            onClick={goToPrev}
            className="p-1 rounded hover:bg-orange-100"
            title="Önceki sayfa"
            aria-label="Önceki sayfa"
          >
            <ChevronLeftIcon className="w-4 h-4 text-orange-600" />
          </button>
          <button 
            onClick={goToNext}
            className="p-1 rounded hover:bg-orange-100"
            title="Sonraki sayfa"
            aria-label="Sonraki sayfa"
          >
            <ChevronRightIcon className="w-4 h-4 text-orange-600" />
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {currentPosts.map((post) => (
          <Link 
            key={post.id} 
            href={`/status/${post.id}`} 
            className="block p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-200 transition-colors"
          >
            <div className="flex items-center mb-2">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs mr-2">
                {post.author.nickname.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-gray-800">
                {post.author.fullName || post.author.nickname}
              </span>
              {post.author.hasBlueTick && (
                <CheckBadgeIcon className="w-3 h-3 ml-1 text-blue-500" />
              )}
            </div>
            <p className="text-xs text-gray-700 mb-2 line-clamp-2">{post.content}</p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-gray-500">
                <HeartIconOutline className="w-3 h-3 mr-1" />
                <span>{formatNumber(post._count.likes)}</span>
              </div>
              <span className="text-orange-500 text-[10px]">{formatDate(post.createdAt)}</span>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Page indicator */}
      <div className="flex justify-center mt-3 space-x-1">
        {Array.from({ length: totalPages }).map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full ${
              index === currentIndex ? "bg-orange-500" : "bg-orange-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function PopularPostsDesignPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8 text-center">Popüler Postlar Tasarım Örnekleri</h1>
      
      <div className="flex flex-col md:flex-row items-start justify-center gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-center">Tasarım 1: Kart Slider</h3>
          <PopularPostsDesign1 />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4 text-center">Tasarım 2: Liste Görünümü</h3>
          <PopularPostsDesign2 />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4 text-center">Tasarım 3: Kompakt Görünüm</h3>
          <PopularPostsDesign3 />
        </div>
      </div>
    </div>
  );
} 