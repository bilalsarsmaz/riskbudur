"use client";

import { useState, useEffect } from "react";
import { postApi } from "@/lib/api";
import { Post } from "./PostList";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { CheckBadgeIcon as CheckBadgeIconOutline } from "@heroicons/react/24/outline";
import Link from "next/link";
import CommentComposeBox from "./CommentComposeBox";

interface QuoteModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onQuoteAdded: () => void;
}

export default function QuoteModal({ post, isOpen, onClose, onQuoteAdded }: QuoteModalProps) {
  const [formattedDate, setFormattedDate] = useState("");
  
  const isAnonymous = (post as any).isAnonymous || false;

  useEffect(() => {
    if (post?.createdAt) {
      const date = new Date(post.createdAt);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        setFormattedDate("şimdi");
      } else if (diffInSeconds < 3600) {
        setFormattedDate(`${Math.floor(diffInSeconds / 60)} dk önce`);
      } else if (diffInSeconds < 86400) {
        setFormattedDate(`${Math.floor(diffInSeconds / 3600)} saat önce`);
      } else {
        setFormattedDate(`${Math.floor(diffInSeconds / 86400)} gün önce`);
      }
    }
  }, [post]);

  const handleQuoteSubmit = async (content: string) => {
    try {
      await postApi("/posts/quote", {
        quotedPostId: post.id,
        content: content.trim() || undefined
      });
      
      onQuoteAdded();
      onClose();
    } catch (err) {
      throw err;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg w-full max-w-lg mx-4 shadow-xl border border-orange-400">
        <div className="h-10 flex items-center justify-between px-4">
          <div className="flex items-center">
            <span className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors font-montserrat">ultraswall</span>
            <div className="mx-3 h-4 border-l border-gray-300"></div>
            <span className="text-xs font-medium text-gray-700">Alıntıla</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Kapat"
            aria-label="Kapat"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        </div>
        <hr className="border-gray-200" />
        <div className="p-4 pb-0">
          <div className="post-quote mb-3 rounded-lg overflow-hidden" style={{border: "0.4px solid #2a2a2a"}}>
            <div className="p-3">
              <div className="flex items-start">
                <div className="post-quote-avatar">
                  {isAnonymous ? (
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
                  ) : post.author.profileImage ? (
                    <img 
                      src={post.author.profileImage} 
                      alt={post.author.nickname} 
                      className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2">
                      {post.author.nickname.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="post-quote-content flex-1">
                  <div className="post-quote-header flex items-center mb-1">
                    {isAnonymous ? (
                      <span className="post-quote-author font-medium text-gray-900 text-sm">
                        Anonim Kullanıcı
                      </span>
                    ) : (
                      <Link href={`/${post.author.nickname}`}>
                        <span className="post-quote-author font-medium text-gray-900 text-sm">
                          {post.author.fullName || post.author.nickname}
                        </span>
                      </Link>
                    )}
                    {!isAnonymous && post.author.hasBlueTick && (
                      <CheckBadgeIcon className="post-quote-badge post-quote-badge-blue w-4 h-4 ml-1 text-blue-500" />
                    )}
                    {(post as any).isPopular && (
                      <CheckBadgeIconOutline className="post-quote-badge post-quote-badge-orange w-4 h-4 ml-1 text-orange-500" />
                    )}
                    <span className="post-quote-separator mx-1 font-light text-xs" style={{color: "#4a4a4a"}}>·</span>
                    <span className="post-quote-date text-xs font-light" style={{color: "#4a4a4a"}}>{formattedDate}</span>
                  </div>
                  
                  <Link href={`/status/${post.id}`}>
                    {post.content && (
                      <div className="post-quote-text text-gray-800 text-sm line-clamp-3">
                        {post.content}
                      </div>
                    )}
                    
                    {(post.mediaUrl || post.imageUrl) && (
                      <div className={`post-quote-media rounded-lg overflow-hidden ${post.content ? 'mt-2' : ''}`} style={{border: "0.4px solid #2a2a2a"}}>
                        <img 
                          src={post.imageUrl || post.mediaUrl} 
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
        </div>
        
        <div className="px-4 pb-4 pt-2">
          <CommentComposeBox 
            postId={post.id}
            onCommentAdded={onQuoteAdded}
            onCancel={onClose}
            hideAvatar={true}
            textareaClassName="border-0 focus:ring-0"
            onSubmit={handleQuoteSubmit}
            submitButtonText="Alıntıla"
          />
        </div>
      </div>
    </div>
  );
}
