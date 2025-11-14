"use client";

import { useState } from "react";
import { 
  HeartIcon as HeartIconOutline,
  ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconOutline,
  ArrowPathIcon as ArrowPathIconOutline,
  CheckBadgeIcon as CheckBadgeIconOutline
} from "@heroicons/react/24/outline";
import { 
  HeartIcon as HeartIconSolid,
  ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconSolid,
  ArrowPathIcon as ArrowPathIconSolid,
  CheckBadgeIcon
} from "@heroicons/react/24/solid";

// Post tipi tanımı
interface PostAuthor {
  id: string;
  nickname: string;
  hasBlueTick: boolean;
}

interface PostType {
  id: string;
  content: string;
  author: PostAuthor;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  quoteCount: number;
  quotedPost?: PostType; // Alıntılanan post
  replyToPost?: PostType; // Yanıtlanan post
  isThreadParent?: boolean; // Thread başlangıcı mı?
  threadId?: string; // Thread ID'si
  isPopular?: boolean; // Popüler post mu?
  mediaUrl?: string; // Medya URL'i
  imageUrl?: string; // GIF URL'i
}

// Örnek post verileri
const samplePosts: PostType[] = [
  {
    id: "1",
    content: "Merhaba dünya! Bu bir standart post örneğidir.",
    author: {
      id: "user1",
      nickname: "testuser",
      hasBlueTick: false,
    },
    createdAt: new Date().toISOString(),
    likeCount: 5,
    commentCount: 2,
    quoteCount: 1,
  },
  {
    id: "2",
    content: "Bu bir onaylı (mavi tik) kullanıcının post örneğidir.",
    author: {
      id: "user3",
      nickname: "onayli_kullanici",
      hasBlueTick: true,
    },
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
    likeCount: 25,
    commentCount: 8,
    quoteCount: 3,
  },
  {
    id: "gif-post",
    content: "Bu bir GIF içeren post örneğidir!",
    author: {
      id: "user8",
      nickname: "gif_seven",
      hasBlueTick: false,
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 saat önce
    likeCount: 42,
    commentCount: 7,
    quoteCount: 3,
    imageUrl: "https://media.tenor.com/5lLcKZgmIhgAAAAC/american-psycho-patrick-bateman.gif",
  },
  {
    id: "image-post",
    content: "Bu bir resim içeren post örneğidir!",
    author: {
      id: "user9",
      nickname: "fotograf_seven",
      hasBlueTick: true,
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 saat önce
    likeCount: 36,
    commentCount: 12,
    quoteCount: 5,
    mediaUrl: "https://picsum.photos/800/450",
  },
  {
    id: "3",
    content: "Bu bir alıntılanan post örneğidir. Başka bir postu alıntılayarak yorum yapılmıştır.",
    author: {
      id: "user4",
      nickname: "alintilayan",
      hasBlueTick: false,
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 saat önce
    likeCount: 7,
    commentCount: 1,
    quoteCount: 0,
    quotedPost: {
      id: "1",
      content: "Merhaba dünya! Bu bir standart post örneğidir.",
      author: {
        id: "user1",
        nickname: "testuser",
        hasBlueTick: false,
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
      likeCount: 5,
      commentCount: 2,
      quoteCount: 1,
    }
  },
  {
    id: "4",
    content: "Bu bir yanıtlanan post örneğidir. Başka bir posta yanıt olarak yazılmıştır.",
    author: {
      id: "user5",
      nickname: "yanitlayan",
      hasBlueTick: false,
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 saat önce
    likeCount: 3,
    commentCount: 0,
    quoteCount: 1,
    replyToPost: {
      id: "1",
      content: "Merhaba dünya! Bu bir standart post örneğidir.",
      author: {
        id: "user1",
        nickname: "testuser",
        hasBlueTick: false,
      },
      createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 gün önce
      likeCount: 5,
      commentCount: 2,
      quoteCount: 1,
    }
  },
  {
    id: "5",
    content: "Bu bir popüler post örneğidir! Viral içerikler genellikle yüksek etkileşim alır ve daha fazla kişiye ulaşır. #trending #viral",
    author: {
      id: "user7",
      nickname: "viral_icerik",
      hasBlueTick: false,
    },
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 gün önce
    likeCount: 5248,
    commentCount: 1837,
    quoteCount: 2419,
    isPopular: true,
  },
];

// Thread için örnek postlar
const threadPosts: PostType[] = [
  {
    id: "t1",
    content: "Bu bir thread başlangıcıdır. Thread'ler birden fazla bağlantılı posttan oluşur.",
    author: {
      id: "user6",
      nickname: "thread_baslatan",
      hasBlueTick: true,
    },
    createdAt: new Date(Date.now() - 10800000).toISOString(), // 3 saat önce
    likeCount: 15,
    commentCount: 5,
    quoteCount: 2,
    isThreadParent: true,
    threadId: "thread1",
  },
  {
    id: "t2",
    content: "Bu thread'in ikinci postudur. Thread içindeki postlar kronolojik sırayla gösterilir.",
    author: {
      id: "user6",
      nickname: "thread_baslatan",
      hasBlueTick: true,
    },
    createdAt: new Date(Date.now() - 10790000).toISOString(), // 3 saat önce
    likeCount: 8,
    commentCount: 2,
    quoteCount: 0,
    threadId: "thread1",
  },
  {
    id: "t3",
    content: "Bu thread'in üçüncü ve son postudur. Thread'ler genellikle uzun içerikleri bölmek için kullanılır.",
    author: {
      id: "user6",
      nickname: "thread_baslatan",
      hasBlueTick: true,
    },
    createdAt: new Date(Date.now() - 10780000).toISOString(), // 3 saat önce
    likeCount: 6,
    commentCount: 1,
    quoteCount: 0,
    threadId: "thread1",
  },
];

// Birden fazla kişinin olduğu thread için örnek postlar
const multiUserThreadPosts: PostType[] = [
  {
    id: "mt1",
    content: "Merhaba! Bu bir tartışma başlattım. Herkes fikirlerini paylaşabilir.",
    author: {
      id: "user10",
      nickname: "tartisma_baslatan",
      hasBlueTick: false,
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 saat önce
    likeCount: 24,
    commentCount: 8,
    quoteCount: 3,
    isThreadParent: true,
    threadId: "multithread1",
  },
  {
    id: "mt2",
    content: "Katılıyorum! Bu konu hakkında daha fazla konuşmalıyız.",
    author: {
      id: "user11",
      nickname: "destekleyen",
      hasBlueTick: true,
    },
    createdAt: new Date(Date.now() - 7000000).toISOString(),
    likeCount: 12,
    commentCount: 1,
    quoteCount: 0,
    threadId: "multithread1",
  },
  {
    id: "mt3",
    content: "Ben farklı düşünüyorum. Şu noktalara dikkat etmeliyiz...",
    author: {
      id: "user12",
      nickname: "karsi_gorus",
      hasBlueTick: false,
    },
    createdAt: new Date(Date.now() - 6800000).toISOString(),
    likeCount: 8,
    commentCount: 4,
    quoteCount: 1,
    threadId: "multithread1",
    isPopular: true,
  },
  {
    id: "mt4",
    content: "Hepinizin görüşleri değerli. Farklı bakış açıları konuyu zenginleştiriyor.",
    author: {
      id: "user10",
      nickname: "tartisma_baslatan",
      hasBlueTick: false,
    },
    createdAt: new Date(Date.now() - 6500000).toISOString(),
    likeCount: 15,
    commentCount: 0,
    quoteCount: 0,
    threadId: "multithread1",
  },
  {
    id: "mt5",
    content: "Bu tartışmaya ben de katılmak istiyorum. İşte benim düşüncelerim...",
    author: {
      id: "user13",
      nickname: "yeni_katilan",
      hasBlueTick: false,
    },
    createdAt: new Date(Date.now() - 6200000).toISOString(),
    likeCount: 7,
    commentCount: 2,
    quoteCount: 0,
    threadId: "multithread1",
  }
];

type PostVariant = "default" | "highlighted" | "compact" | "expanded" | "thread-item";

interface PostProps {
  post: PostType;
  variant?: PostVariant;
  isThreadItem?: boolean;
  isLastThreadItem?: boolean;
}

// Sayıyı formatlama fonksiyonu (1000 -> 1K)
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Post bileşeni
const Post = ({ post, variant = "default", isThreadItem = false, isLastThreadItem = false }: PostProps) => {
  const [liked, setLiked] = useState(false);
  const [commented, setCommented] = useState(false);
  const [quoted, setQuoted] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  
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
  
  // Farklı varyantlar için stil sınıfları
  const variantClasses: Record<PostVariant, string> = {
    default: "bg-white",
    highlighted: "bg-blue-50 border-l-4 border-blue-500",
    compact: "bg-white py-2",
    expanded: "bg-white",
    "thread-item": "bg-white",
  };
  
  return (
    <div className={`border border-gray-200 rounded-none ${isThreadItem ? 'mb-0 p-4 border-b-0' : 'mb-4 p-4'} max-w-[600px] w-full mx-auto ${variantClasses[variant]} ${isThreadItem && isLastThreadItem ? 'border-b' : ''} ${isThreadItem && post.isThreadParent ? '' : ''} relative`}>
      {/* Thread çizgisi */}
      {isThreadItem && !isLastThreadItem && !post.isThreadParent && (
        <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-orange-400 h-full" style={{zIndex: 1}}></div>
      )}
      {isThreadItem && isLastThreadItem && !post.isThreadParent && (
        <div className="absolute left-9 top-0 h-10 w-0.5 bg-orange-400" style={{zIndex: 1}}></div>
      )}
      <div className="flex items-start relative z-10">
        {/* Profil resmi */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3 relative z-10">
            {post.author.nickname.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <div className="flex-1">
          {/* Kullanıcı bilgisi ve tarih */}
          <div className="flex items-center mb-1">
            <span className="font-medium text-gray-900">
              {post.author.nickname}
            </span>
            {post.author.hasBlueTick && (
              <CheckBadgeIcon className="w-5 h-5 ml-1 text-blue-500" />
            )}
            {post.isPopular && (
              <CheckBadgeIconOutline className="w-5 h-5 ml-1 text-orange-500" />
            )}
            <span className="mx-2 text-gray-500">•</span>
            <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
            {post.isThreadParent && (
              <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Thread</span>
            )}
          </div>
          
          {/* Yanıtlanan post referansı */}
          {post.replyToPost && (
            <div className="mb-2 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Yanıtlanan: <span className="font-medium ml-1">{post.replyToPost.author.nickname}</span>
              </span>
            </div>
          )}
          
          {/* Post içeriği */}
          <div className="text-gray-800 mb-3">
            {post.content}
          </div>
          
          {/* Post resmi veya GIF'i */}
          {(post.mediaUrl || post.imageUrl) && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img 
                src={post.imageUrl || post.mediaUrl} 
                alt="Post görseli" 
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          
          {/* Alıntılanan post */}
          {post.quotedPost && (
            <div className="border border-gray-200 rounded-lg p-3 mb-3">
              <div className="flex items-start">
                {/* Profil resmi */}
                <div>
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2">
                    {post.quotedPost.author.nickname.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="flex-1">
                  {/* Kullanıcı bilgisi ve tarih */}
                  <div className="flex items-center mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {post.quotedPost.author.nickname}
                    </span>
                    {post.quotedPost.author.hasBlueTick && (
                      <CheckBadgeIcon className="w-5 h-5 ml-1 text-blue-500" />
                    )}
                    {post.quotedPost.isPopular && (
                      <CheckBadgeIconOutline className="w-5 h-5 ml-1 text-orange-500" />
                    )}
                    <span className="mx-2 text-gray-500 text-xs">•</span>
                    <span className="text-xs text-gray-500">{formatDate(post.quotedPost.createdAt)}</span>
                  </div>
                  
                  {/* Post içeriği */}
                  <div className="text-gray-800 text-sm line-clamp-3">
                    {post.quotedPost.content}
                  </div>
                </div>
              </div>
            </div>
          )}
          
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
              <span>{post.isPopular ? formatNumber(likeCount) : likeCount}</span>
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
              <span>{post.isPopular ? formatNumber(post.commentCount) : post.commentCount}</span>
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
              <span>{post.isPopular ? formatNumber(post.quoteCount) : post.quoteCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Thread bileşeni
const Thread = ({ posts }: { posts: PostType[] }) => {
  return (
    <div className="max-w-[600px] mx-auto overflow-hidden">
      {posts.map((post, index) => (
        <Post 
          key={post.id} 
          post={post} 
          variant="thread-item" 
          isThreadItem={true}
          isLastThreadItem={index === posts.length - 1}
        />
      ))}
    </div>
  );
};

// Post tasarım sayfası
export default function PostDesignPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Post Tasarım Örnekleri</h1>
      
      <div className="mb-8 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4 text-center">Standart Post</h2>
        <Post post={samplePosts[0]} />
      </div>
      
      <div className="mb-8 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4 text-center">Onaylı Kullanıcı Postu</h2>
        <Post post={samplePosts[1]} />
      </div>
      
      <div className="mb-8 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4 text-center">GIF İçeren Post</h2>
        <Post post={samplePosts[2]} />
      </div>
      
      <div className="mb-8 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4 text-center">Resim İçeren Post</h2>
        <Post post={samplePosts[3]} />
      </div>
      
      <div className="mb-8 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4 text-center">Alıntılanan Post</h2>
        <Post post={samplePosts[4]} />
      </div>
      
      <div className="mb-8 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4 text-center">Yanıtlanan Post</h2>
        <Post post={samplePosts[5]} />
      </div>
      
      <div className="mb-8 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4 text-center">Popüler Post</h2>
        <p className="mb-2 text-gray-600 text-center max-w-[600px]">Yüksek etkileşim alan popüler post örneği:</p>
        <Post post={samplePosts[6]} />
      </div>
      
      <div className="mb-8 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4 text-center">Thread</h2>
        <p className="mb-2 text-gray-600 text-center">Aynı kişi tarafından oluşturulan thread örneği:</p>
        <Thread posts={threadPosts} />
      </div>
      
      <div className="mb-8 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4 text-center">Thread (Birden Fazla Kişi)</h2>
        <p className="mb-2 text-gray-600 text-center">Birden fazla kişinin katıldığı tartışma thread örneği:</p>
        <Thread posts={multiUserThreadPosts} />
      </div>
      
      <div className="mb-8 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4 text-center">Etkileşimli Post</h2>
        <p className="mb-2 text-gray-600 text-center max-w-[600px]">Etkileşim butonlarına tıklayarak ikonların değişimini test edebilirsiniz:</p>
        <ul className="list-disc pl-5 mb-4 text-sm text-gray-600 max-w-[600px]">
          <li>Beğeni (kalp ikonu) - Tıklandığında kırmızı renkte solid olur</li>
          <li>Yorum (konuşma balonu ikonu) - Tıklandığında mavi renkte solid olur</li>
          <li>Alıntıla (ok ikonu) - Tıklandığında yeşil renkte solid olur</li>
        </ul>
        <Post post={samplePosts[0]} />
      </div>
    </div>
  );
} 