"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
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
            <div className="border border-[#2a2a2a] rounded-lg p-8 text-center" style={{backgroundColor: '#0a0a0a'}}>
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-center">
        <div className="hidden lg:block w-[260px] shrink-0">
          <LeftSidebar />
        </div>

        <div className="w-full max-w-[600px]">
          <div className="border border-[#2a2a2a] rounded-t-lg p-4 mb-0 flex items-center" style={{backgroundColor: '#0a0a0a'}}>
            <button
              onClick={() => router.push("/home")}
              className="p-2 hover:bg-gray-800 rounded-full mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Gönderi Detayı</h1>
          </div>

          <div className="border-x border-b border-[#2a2a2a] p-4 mb-0" style={{backgroundColor: '#0a0a0a'}}>
            <div className="flex items-start mb-4">
              {post.author.profileImage ? (
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
              )}
              <div className="ml-3">
                <div className="flex items-center">
                  <span
                    className="font-bold text-base cursor-pointer hover:underline"
                    onClick={() => handleProfileClick(post.author.nickname)}
                  >
                    {post.author.fullName || post.author.nickname}
                  </span>
                  {post.author.hasBlueTick && (
                    <svg className="w-5 h-5 ml-1" viewBox="0 0 24 24" fill="#1D9BF0">
                      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5c-1.51 0-2.818.915-3.437 2.25-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.51 0 2.817-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"/>
                    </svg>
                  )}
                </div>
                <span
                  className="text-sm cursor-pointer hover:underline"
                  style={{color: "#6e767d"}}
                  onClick={() => handleProfileClick(post.author.nickname)}
                >
                  @{post.author.nickname}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-lg whitespace-pre-wrap break-words">{post.content}</p>
            </div>

            {(post.mediaUrl || post.imageUrl) && (
              <div className="mb-4 rounded-lg overflow-hidden" style={{border: "0.4px solid #2a2a2a"}}>
                <img
                  src={post.mediaUrl || post.imageUrl || ""}
                  alt="Post media"
                  className="w-full h-auto"
                />
              </div>
            )}

            <div className="text-sm mb-3" style={{color: "#6e767d"}}>
              {new Date(post.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} · {new Date(post.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} · <span className="font-semibold" style={{color: "#d9dadd"}}>{Math.floor(Math.random() * 1000) + 100}</span> Görüntülenme
            </div>

            <hr className="border-[#2a2a2a] mb-3" />

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
              className="border-x border-[#2a2a2a] p-4"
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
            <div className="border-x border-[#2a2a2a] p-4" style={{backgroundColor: '#0a0a0a'}}>
              <CommentComposeBox
                postId={postId}
                onCommentAdded={handleCommentAdded}
                onCancel={() => setIsCommentBoxFocused(false)}
                hideAvatar={true}
                textareaClassName="border-0 focus:ring-0"
              />
            </div>
          )}

          <div className="border border-[#2a2a2a] rounded-b-lg" style={{backgroundColor: '#0a0a0a'}}>

            {post.comments && post.comments.length > 0 ? (
              <div>
                {post.comments.map((comment, index) => (
                  <div
                    key={comment.id}
                    className={`p-4 ${index !== post.comments.length - 1 ? 'border-b border-[#2a2a2a]' : ''}`}
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
                          <span className="mx-2" style={{color: "#2a2a2a"}}>•</span>
                          <span className="text-sm" style={{color: "#2a2a2a"}}>
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
              <div className="p-8 text-center" style={{color: "#2a2a2a"}}>
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
