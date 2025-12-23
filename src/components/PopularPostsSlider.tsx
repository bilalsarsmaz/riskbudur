"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import PostItem from "./PostItem";

interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    nickname: string;
    profileImage?: string;
    hasBlueTick: boolean;
    verificationTier?: 'NONE' | 'GREEN' | 'GOLD' | 'GRAY';
    fullName?: string;
    role?: string;
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

export default function PopularPostsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        const data = await fetchApi("/posts/popular?limit=5") as PopularPostsResponse;
        if (data.posts && data.posts.length > 0) {
          setPopularPosts(data.posts);
        } else {
          setPopularPosts([]);
        }
      } catch (error) {
        console.error("Popüler postlar yüklenirken hata oluştu:", error);
        setPopularPosts([]);
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
      <div className="overflow-hidden">
        {popularPosts.map((post, index) => {
          // Convert to EnrichedPost format for PostItem
          const enrichedPost = {
            id: post.id,  // Keep as string
            content: post.content,
            imageUrl: undefined,
            videoUrl: undefined,
            gifUrl: undefined,
            isAnonymous: false,
            isThread: false,
            isPinned: false,
            authorId: post.author.id,
            createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
            updatedAt: new Date(),
            parentPostId: undefined,
            quotedPostId: undefined,
            author: {
              id: post.author.id,
              nickname: post.author.nickname,
              fullName: post.author.fullName || post.author.nickname,
              profileImage: post.author.profileImage || undefined,
              hasBlueTick: post.author.hasBlueTick,
              verificationTier: post.author.verificationTier || 'NONE',
              role: post.author.role,
            },
            _count: {
              likes: post._count.likes,
              comments: post._count.comments || 0,
              quotes: 0,
              replies: 0,
            },
            isLiked: post.isLiked || false,
          };

          return (
            <div
              key={post.id}
              className={`transition-all duration-300 ease-in-out ${index === currentIndex ? "block opacity-100" : "hidden opacity-0"
                }`}
            >
              {/* Compact wrapper for slider */}
              <div className="popular-post-compact max-h-[160px] overflow-hidden border border-theme-border rounded-lg">
                <div className="scale-[0.85] origin-top-left w-[118%]">
                  <PostItem
                    post={enrichedPost}
                    isFirst={true}
                    showThreadLine={false}
                    isFirstInThread={true}
                    isLastInThread={true}
                    isThread={false}
                    showThreadFooter={false}
                    className="!border-b-0 !pb-0"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dots navigation */}
      <div className="flex justify-center mt-2 space-x-1">
        {popularPosts.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors`}
            style={{
              backgroundColor: index === currentIndex ? 'var(--app-accent)' : '#333333'
            }}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
} 