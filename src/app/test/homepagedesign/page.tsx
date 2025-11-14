"use client";

import { useState } from "react";
import Link from "next/link";
import ComposeBox from "@/components/ComposeBox";
import Announcements from "@/components/Announcements";
import { Post as OriginalPost } from "@/components/PostList";
import PopularPostsSlider from "@/components/PopularPostsSlider";
import { 
  HeartIcon as HeartIconOutline,
  ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconOutline,
  ArrowPathIcon as ArrowPathIconOutline,
  CheckBadgeIcon as CheckBadgeIconOutline,
  HomeIcon,
  UserIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
  EnvelopeIcon,
  ArrowRightStartOnRectangleIcon,
  EllipsisHorizontalIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";
import { 
  HeartIcon as HeartIconSolid,
  ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconSolid,
  ArrowPathIcon as ArrowPathIconSolid,
  CheckBadgeIcon,
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  BellIcon as BellIconSolid,
  EnvelopeIcon as EnvelopeIconSolid,
  UserIcon as UserIconSolid,
  BookmarkIcon as BookmarkIconSolid
} from "@heroicons/react/24/solid";

// Genişletilmiş Author tipi
interface Author {
  id: string;
  nickname: string;
  hasBlueTick: boolean;
  fullName?: string;
}

// Genişletilmiş Post tipi
interface Post extends Omit<OriginalPost, 'author'> {
  author: Author;
}

// Örnek post verileri
const samplePosts: Post[] = [
  {
    id: "0",
    content: "Sosyal medya platformlarında karakter sınırı, kullanıcıların düşüncelerini özlü bir şekilde ifade etmelerini sağlar. Bu 280 karakterlik örnek post, Nown platformunda paylaşabileceğiniz maksimum içerik uzunluğunu göstermektedir. Kısa ve öz paylaşımlar, okuyucuların dikkatini çekmek için idealdir.",
    createdAt: new Date().toISOString(), // Şu an
    author: {
      id: "user0",
      nickname: "nown_official",
      hasBlueTick: true,
      fullName: "Nown Resmi"
    },
    _count: {
      likes: 124,
      comments: 37,
    },
    isLiked: true,
  },
  {
    id: "1",
    content: "Merhaba dünya! Bu bir örnek post içeriğidir.",
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 saat önce
    author: {
      id: "user1",
      nickname: "test_user",
      hasBlueTick: true,
      fullName: "Test Kullanıcı"
    },
    _count: {
      likes: 15,
      comments: 5,
    },
    isLiked: false,
  },
  {
    id: "2",
    content: "Nown platformunda yeni tasarımlar üzerinde çalışıyoruz. Yakında birçok yenilik geliyor!",
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 saat önce
    author: {
      id: "user2",
      nickname: "admin",
      hasBlueTick: true,
      fullName: "Nown Admin"
    },
    _count: {
      likes: 42,
      comments: 8,
    },
    isLiked: true,
  },
  {
    id: "3",
    content: "Yazılım geliştirme süreçleri hakkında düşüncelerimi paylaşmak istiyorum. İyi bir kod, okunabilir ve sürdürülebilir olmalıdır. Sizin düşünceleriniz neler?",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
    author: {
      id: "user3",
      nickname: "developer",
      hasBlueTick: false,
      fullName: "Yazılım Geliştirici"
    },
    _count: {
      likes: 28,
      comments: 12,
    },
    isLiked: false,
  },
  {
    id: "4",
    content: "Bugün yeni bir teknoloji öğrendim ve çok heyecanlıyım! Öğrenmeye devam etmek hayatın en güzel yanlarından biri.",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 gün önce
    author: {
      id: "user4",
      nickname: "tech_lover",
      hasBlueTick: false,
      fullName: "Teknoloji Sever"
    },
    _count: {
      likes: 35,
      comments: 7,
    },
    isLiked: true,
  },
  {
    id: "5",
    content: "İyi bir kahve ve kod yazmak için sakin bir ortam. Günün en verimli saatleri bunlar!",
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 gün önce
    author: {
      id: "user5",
      nickname: "coffee_coder",
      hasBlueTick: true,
      fullName: "Kahve Sever Kodcu"
    },
    _count: {
      likes: 50,
      comments: 15,
    },
    isLiked: false,
  },
  {
    id: "6",
    content: "Yeni projemiz için kullanıcı arayüzü tasarımları üzerinde çalışıyoruz. Kullanıcı deneyimi her şeyden önce gelir!",
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 gün önce
    author: {
      id: "user6",
      nickname: "ux_designer",
      hasBlueTick: true,
      fullName: "UX Tasarımcısı"
    },
    _count: {
      likes: 62,
      comments: 18,
    },
    isLiked: false,
  },
  {
    id: "7",
    content: "Açık kaynak projelere katkıda bulunmak, hem topluma hem de kendi gelişiminize katkı sağlar. Bugün bir pull request daha gönderdim!",
    createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 gün önce
    author: {
      id: "user7",
      nickname: "open_source_dev",
      hasBlueTick: false,
      fullName: "Açık Kaynak Geliştirici"
    },
    _count: {
      likes: 45,
      comments: 9,
    },
    isLiked: true,
  },
  {
    id: "8",
    content: "Yapay zeka alanındaki son gelişmeler gerçekten etkileyici! Sizce gelecekte hangi alanlarda daha fazla AI uygulaması göreceğiz?",
    createdAt: new Date(Date.now() - 518400000).toISOString(), // 6 gün önce
    author: {
      id: "user8",
      nickname: "ai_enthusiast",
      hasBlueTick: true,
      fullName: "AI Meraklısı"
    },
    _count: {
      likes: 78,
      comments: 25,
    },
    isLiked: false,
  },
  {
    id: "9",
    content: "Yeni mobil uygulamamızın beta sürümünü test eden gönüllülere teşekkür ederiz! Geri bildirimleriniz çok değerli.",
    createdAt: new Date(Date.now() - 604800000).toISOString(), // 7 gün önce
    author: {
      id: "user9",
      nickname: "app_developer",
      hasBlueTick: true,
      fullName: "Mobil Uygulama Geliştirici"
    },
    _count: {
      likes: 56,
      comments: 14,
    },
    isLiked: true,
  },
  {
    id: "10",
    content: "Siber güvenlik konusunda herkesin bilmesi gereken en temel şey: Güçlü ve benzersiz parolalar kullanmak! Parola yöneticisi kullanıyor musunuz?",
    createdAt: new Date(Date.now() - 691200000).toISOString(), // 8 gün önce
    author: {
      id: "user10",
      nickname: "security_expert",
      hasBlueTick: false,
      fullName: "Siber Güvenlik Uzmanı"
    },
    _count: {
      likes: 92,
      comments: 31,
    },
    isLiked: false,
  },
  {
    id: "11",
    content: "Dün akşam harika bir teknoloji konferansına katıldım. Ağ oluşturma ve yeni fikirler edinme açısından çok verimli geçti!",
    createdAt: new Date(Date.now() - 777600000).toISOString(), // 9 gün önce
    author: {
      id: "user11",
      nickname: "tech_networker",
      hasBlueTick: false,
      fullName: "Teknoloji Ağı Kurucu"
    },
    _count: {
      likes: 38,
      comments: 7,
    },
    isLiked: true,
  },
  {
    id: "12",
    content: "Veri bilimi projelerimde Python ve R kullanıyorum. Sizin veri analizi için tercih ettiğiniz araçlar neler?",
    createdAt: new Date(Date.now() - 864000000).toISOString(), // 10 gün önce
    author: {
      id: "user12",
      nickname: "data_scientist",
      hasBlueTick: true,
      fullName: "Veri Bilimci"
    },
    _count: {
      likes: 65,
      comments: 22,
    },
    isLiked: false,
  },
];

// Sayıyı formatlama fonksiyonu (1000 -> 1K)
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

interface CustomPostItemProps {
  post: Post;
  isThreadItem?: boolean;
  isLastThreadItem?: boolean;
}

// Özel post bileşeni (postdesign sayfasından uyarlanmış)
const CustomPostItem = ({ post, isFirst = false }: Omit<CustomPostItemProps, 'isThreadItem' | 'isLastThreadItem'> & { isFirst?: boolean }) => {
  const [liked, setLiked] = useState(post.isLiked || false);
  const [commented, setCommented] = useState(false);
  const [quoted, setQuoted] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  
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
  
  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setLiked(!liked);
  };

  const handleComment = () => {
    setCommented(!commented);
  };

  const handleQuote = () => {
    setQuoted(!quoted);
  };
  
  const isPopular = post._count.likes > 30 || post._count.comments > 10;
  
  return (
    <div className={`${!isFirst ? 'border-t border-gray-200' : ''} p-4 relative`}>
      <div className="flex items-start relative z-10">
        {/* Profil resmi */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3 relative z-10">
            {post.author.nickname.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <div className="flex-1">
          {/* Kullanıcı bilgisi ve tarih */}
          <div className="flex flex-wrap items-center mb-1">
            <div className="flex items-center mr-1">
              <span className="font-medium text-gray-900">
                {post.author.fullName || post.author.nickname}
              </span>
              {post.author.hasBlueTick && (
                <CheckBadgeIcon className="w-5 h-5 ml-1 text-blue-500" />
              )}
              {isPopular && (
                <CheckBadgeIconOutline className="w-5 h-5 ml-1 text-orange-500" />
              )}
            </div>
            <span className="text-gray-500">@{post.author.nickname}</span>
            <span className="mx-2 text-gray-500">•</span>
            <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
          </div>
          
          {/* Post içeriği */}
          <div className="text-gray-800 mb-3">
            {post.content}
          </div>
          
          {/* Etkileşim butonları */}
          <div className="flex items-center text-gray-500 text-sm">
            {/* Beğeni butonu */}
            <button 
              onClick={handleLike} 
              className={`flex items-center mr-4 ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
            >
              {liked ? (
                <HeartIconSolid className="w-5 h-5 mr-1" />
              ) : (
                <HeartIconOutline className="w-5 h-5 mr-1" />
              )}
              <span>{isPopular ? formatNumber(likeCount) : likeCount}</span>
            </button>
            
            {/* Yorum butonu */}
            <button 
              onClick={handleComment}
              className={`flex items-center mr-4 ${commented ? 'text-blue-500' : 'hover:text-blue-500'}`}
            >
              {commented ? (
                <ChatBubbleOvalLeftIconSolid className="w-5 h-5 mr-1" />
              ) : (
                <ChatBubbleOvalLeftIconOutline className="w-5 h-5 mr-1" />
              )}
              <span>{isPopular ? formatNumber(post._count.comments) : post._count.comments}</span>
            </button>
            
            {/* Alıntıla butonu */}
            <button 
              onClick={handleQuote}
              className={`flex items-center ${quoted ? 'text-green-500' : 'hover:text-green-500'}`}
            >
              {quoted ? (
                <ArrowPathIconSolid className="w-5 h-5 mr-1" />
              ) : (
                <ArrowPathIconOutline className="w-5 h-5 mr-1" />
              )}
              <span>0</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Özel post listesi bileşeni
const CustomPostList = ({ posts }: { posts: Post[] }) => {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">Henüz hiç post yok.</p>
        <p className="mt-2 text-sm text-gray-400">İlk postu paylaşan sen ol!</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-b-lg bg-white">
      {posts.map((post, index) => (
        <CustomPostItem 
          key={post.id} 
          post={post} 
          isFirst={index === 0}
        />
      ))}
    </div>
  );
};

// Özel sol sidebar bileşeni
const CustomLeftSidebar = () => {
  const [activeMenu, setActiveMenu] = useState("home");
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Örnek kullanıcı
  const currentUser = {
    id: "kjaer",
    nickname: "semtinadami",
    fullName: "Kjaer",
    hasBlueTick: true
  };

  const menuItems = [
    { id: "home", label: "Ana Sayfa", icon: HomeIcon, activeIcon: HomeIconSolid, href: "/home" },
    { id: "explore", label: "Keşfet", icon: MagnifyingGlassIcon, activeIcon: MagnifyingGlassIconSolid, href: "/explore" },
    { id: "notifications", label: "Bildirimler", icon: BellIcon, activeIcon: BellIconSolid, href: "/notifications", count: 5 },
    { id: "messages", label: "Mesajlar", icon: EnvelopeIcon, activeIcon: EnvelopeIconSolid, href: "/messages", count: 2 },
    { id: "profile", label: "Profilim", icon: UserIcon, activeIcon: UserIconSolid, href: "/profile" },
    { id: "bookmarks", label: "Kaydedilenler", icon: BookmarkIcon, activeIcon: BookmarkIconSolid, href: "/bookmarks" }
  ];

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    // Çıkış işlemi burada yapılacak
    console.log("Çıkış yapılıyor...");
    setShowUserMenu(false);
  };

  return (
    <div className="bg-white px-4 pb-4 sticky top-4 flex flex-col h-[calc(100vh-2rem)]">
      {/* Logo */}
      <div className="mb-4 px-2">
        <Link href="/home" className="inline-block">
          <div className="text-2xl font-bold text-orange-500 hover:text-orange-600 transition-colors font-montserrat">
            nown
          </div>
        </Link>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2 pt-0">
          {menuItems.map(item => {
            const isActive = activeMenu === item.id;
            const Icon = isActive ? item.activeIcon : item.icon;
            
            return (
              <li key={item.id}>
                <Link 
                  href={item.href} 
                  className="flex items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveMenu(item.id);
                  }}
                >
                  <Icon 
                    className={`h-6 w-6 mr-3 ${isActive ? 'text-orange-500' : ''}`} 
                  />
                  <span className={isActive ? 'font-bold' : ''}>{item.label}</span>
                  {item.count && (
                    <span className="ml-auto bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {item.count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Kullanıcı profil menüsü */}
      <div className="mt-auto relative">
        <div 
          className="flex items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
          onClick={handleUserMenuToggle}
        >
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3">
            {currentUser.nickname.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center">
              <span className="font-bold text-sm">{currentUser.fullName}</span>
              {currentUser.hasBlueTick && (
                <CheckBadgeIcon className="w-4 h-4 ml-1 text-blue-500" />
              )}
            </div>
            <div className="text-sm text-gray-500">
              @{currentUser.nickname}
            </div>
          </div>
          <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
        </div>
        
        {/* Açılır menü */}
        {showUserMenu && (
          <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
            <div className="p-2">
              <button 
                className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  console.log("Ayarlar açılıyor...");
                  setShowUserMenu(false);
                }}
              >
                <Cog6ToothIcon className="h-5 w-5 mr-2" />
                Ayarlar
              </button>
              <button 
                className="flex items-center w-full p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={handleLogout}
              >
                <ArrowRightStartOnRectangleIcon className="h-5 w-5 mr-2" />
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Özel sağ sidebar bileşeni
const CustomRightSidebar = () => {
  // Örnek hashtag verileri
  const trendingHashtags = [
    { id: 1, name: "teknoloji", count: 45 },
    { id: 2, name: "yazilim", count: 38 },
    { id: 3, name: "sanat", count: 32 },
    { id: 4, name: "spor", count: 29 },
    { id: 5, name: "muzik", count: 24 }
  ];

  return (
    <div className="space-y-4">
      {/* Trending Hashtags */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Gündem</h2>
        <div className="space-y-2">
          {trendingHashtags.map((hashtag) => (
            <Link 
              key={hashtag.id}
              href={`/hashtag/${hashtag.name}`}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
            >
              <span className="text-blue-600">#{hashtag.name}</span>
              <span className="text-xs text-gray-500">{hashtag.count} post</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Popüler Postlar */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Popüler Postlar</h2>
        <PopularPostsSlider />
      </div>

      {/* Footer */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg">
        <div className="text-xs text-gray-500 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Link href="/about" className="hover:underline">Hakkında</Link>
            <Link href="/terms" className="hover:underline">Kullanım Şartları</Link>
            <Link href="/privacy" className="hover:underline">Gizlilik</Link>
            <Link href="/contact" className="hover:underline">İletişim</Link>
          </div>
          <p>© 2023 Nown. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
};

export default function HomePageDesign() {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [loading] = useState(false);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);

  // Post oluşturma işlevi
  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  // Duyuru görünürlüğü değiştiğinde çağrılacak fonksiyon
  const handleAnnouncementVisibilityChange = (visible: boolean) => {
    setIsAnnouncementVisible(visible);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-center">
        {/* Sol Sidebar - 260px */}
        <div className="hidden lg:block w-[260px] shrink-0">
          <CustomLeftSidebar />
        </div>

        {/* Orta Bölüm - 600px */}
        <div className="w-full max-w-[600px] flex flex-col items-center">
          <div className="w-full">
            {/* Duyurular */}
            <div className={isAnnouncementVisible ? "mb-[15px]" : ""}>
              <Announcements onVisibilityChange={handleAnnouncementVisibilityChange} />
            </div>

            {/* Post Oluşturma */}
            <div className="mb-0">
              <ComposeBox onPostCreated={handlePostCreated} />
            </div>

            {/* Post Listesi */}
            <div>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-500">Postlar yükleniyor...</p>
                </div>
              ) : (
                <CustomPostList posts={posts} />
              )}
            </div>
          </div>
        </div>

        {/* Sağ Sidebar - 300px */}
        <div className="hidden lg:block w-[300px] shrink-0 ml-[10px]">
          <CustomRightSidebar />
        </div>
      </div>
    </div>
  );
}
