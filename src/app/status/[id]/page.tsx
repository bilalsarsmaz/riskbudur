"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import PostItem from "@/components/PostItem";
import CommentComposeBox from "@/components/CommentComposeBox";
import { fetchApi } from "@/lib/api";
import { Post } from "@/components/PostList";

interface ReplyPost extends Post {
  replies?: ReplyPost[];
}

interface PostWithReplies extends Post {
  comments: ReplyPost[];
  parentPost?: {
    id: string;
    content: string;
    author: {
      id: string;
      nickname: string;
      fullName?: string;
    };
  };
}

interface CurrentUser {
  nickname: string;
  profileImage?: string;
}

// Tum yanitlari duz liste haline getir (nested'i flatten et)
const flattenReplies = (replies: ReplyPost[]): ReplyPost[] => {
  const result: ReplyPost[] = [];
  
  const processReply = (reply: ReplyPost) => {
    result.push(reply);
    if (reply.replies && reply.replies.length > 0) {
      reply.replies.forEach(processReply);
    }
  };
  
  replies.forEach(processReply);
  return result;
};

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<PostWithReplies | null>(null);
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
        setError("Post yuklenirken bir hata olustu.");
        console.error("Post yukleme hatasi:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const userData = await fetchApi("/users/me");
        setCurrentUser(userData);
      } catch (err) {
        console.error("Kullanici bilgileri alinamadi:", err);
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

  const LoadingContent = () => (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1DCD9F]"></div>
    </div>
  );

  const ErrorContent = () => (
    <div className="p-8 text-center">
      <p className="text-red-500 mb-4">{error || "Post bulunamadi"}</p>
      <button
        onClick={() => router.push("/home")}
        className="px-4 py-2 rounded-lg text-white font-medium bg-[#1DCD9F]"
      >
        Ana Sayfaya Don
      </button>
    </div>
  );

  const PostDetailContent = () => {
    if (!post) return null;

    // Tum yanitlari duz liste yap
    const allReplies = post.comments ? flattenReplies(post.comments) : [];
    const hasReplies = allReplies.length > 0;
    const isThread = allReplies.length >= 2;

    return (
      <>
        {/* Header - Thread badge kaldirildi */}
        <div className="border-b border-[#222222] p-4 flex items-center sticky top-0 bg-black z-10">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[#151515] rounded-full mr-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Gönderi Detayı</h1>
        </div>

        {/* Ana Post - cizgi yok, ama thread ise badge goster */}
        <div className="post-detail-card post-thread-root">
          <PostItem 
            post={post} 
            isFirst={true}
            showThreadLine={false}
            isFirstInThread={true}
            isLastInThread={!hasReplies}
            isThread={isThread}
            showThreadFooter={false}
          />
        </div>

        {/* Yanit Yazma Alani */}
        {!isCommentBoxFocused ? (
          <div className="p-4 border-b border-[#222222] bg-black">
            <div className="flex items-center justify-between">
              <div
                onClick={() => setIsCommentBoxFocused(true)}
                className="flex items-center flex-1 cursor-pointer hover:bg-[#151515] p-2 rounded-lg"
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
                <span style={{color: "#6e767d"}}>Yanitini yaz...</span>
              </div>
              <button
                disabled
                className="px-4 py-2 rounded-full text-white font-medium opacity-50 cursor-not-allowed bg-[#1DCD9F]"
              >
                Yanitla
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-[#222222] bg-black">
            <CommentComposeBox
              postId={postId}
              onCommentAdded={handleCommentAdded}
              onCancel={() => setIsCommentBoxFocused(false)}
              hideAvatar={true}
              textareaClassName="border-0 focus:ring-0"
            />
          </div>
        )}

        {/* Yanitlar */}
        {hasReplies ? (
          <div>
            {allReplies.map((reply, index) => {
              const isFirst = index === 0;
              const isLast = index === allReplies.length - 1;
              
              return (
                <div key={reply.id} className="post-thread-item">
                  <PostItem 
                    post={reply}
                    showThreadLine={true}
                    isFirstInThread={isFirst}
                    isLastInThread={isLast}
                    isThread={false}
                    showThreadFooter={false}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center" style={{color: "#6e767d"}}>
            Henuz yanit yok. Ilk yaniti sen yaz!
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <>
        <MobileHeader />
        <div className="hidden lg:flex justify-center w-full">
          <div className="flex w-full max-w-[1310px]">
            <header className="left-nav flex-shrink-0 w-[275px] h-screen sticky top-0 overflow-y-auto z-10">
              <LeftSidebar />
            </header>
            <main className="content flex flex-1 min-h-screen">
              <section className="timeline flex-1 w-full lg:max-w-[600px] flex flex-col items-stretch bg-black lg:border-l lg:border-r border-[#222222]">
                <LoadingContent />
              </section>
              <aside className="right-side hidden xl:block w-[350px] flex-shrink-0 ml-[10px] pt-6">
                <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                  <RightSidebar />
                </div>
              </aside>
            </main>
          </div>
        </div>
        <div className="lg:hidden flex flex-col min-h-screen">
          <main className="content flex-1 pt-14 pb-16">
            <LoadingContent />
          </main>
        </div>
        <MobileBottomNav />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <MobileHeader />
        <div className="hidden lg:flex justify-center w-full">
          <div className="flex w-full max-w-[1310px]">
            <header className="left-nav flex-shrink-0 w-[275px] h-screen sticky top-0 overflow-y-auto z-10">
              <LeftSidebar />
            </header>
            <main className="content flex flex-1 min-h-screen">
              <section className="timeline flex-1 w-full lg:max-w-[600px] flex flex-col items-stretch bg-black lg:border-l lg:border-r border-[#222222]">
                <ErrorContent />
              </section>
              <aside className="right-side hidden xl:block w-[350px] flex-shrink-0 ml-[10px] pt-6">
                <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                  <RightSidebar />
                </div>
              </aside>
            </main>
          </div>
        </div>
        <div className="lg:hidden flex flex-col min-h-screen">
          <main className="content flex-1 pt-14 pb-16">
            <ErrorContent />
          </main>
        </div>
        <MobileBottomNav />
      </>
    );
  }

  return (
    <>
      <MobileHeader />
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex justify-center w-full">
        <div className="flex w-full max-w-[1310px]">
          <header className="left-nav flex-shrink-0 w-[275px] h-screen sticky top-0 overflow-y-auto z-10">
            <LeftSidebar />
          </header>

          <main className="content flex flex-1 min-h-screen">
            <section className="timeline flex-1 w-full lg:max-w-[600px] flex flex-col items-stretch bg-black lg:border-l lg:border-r border-[#222222]">
              <PostDetailContent />
            </section>

            <aside className="right-side hidden xl:block w-[350px] flex-shrink-0 ml-[10px] pt-6">
              <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                <RightSidebar />
              </div>
            </aside>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen">
        <main className="content flex-1 pt-14 pb-16">
          <section className="timeline w-full flex flex-col items-stretch bg-black">
            <PostDetailContent />
          </section>
        </main>
      </div>

      <MobileBottomNav />
    </>
  );
}
