"use client";

import { useState, useEffect, useRef } from "react";
import CommentComposeBox from "./CommentComposeBox";

interface Post {
  id: string;
  content: string;
  username: string;
  fullName?: string;
  createdAt: string;
  userImage?: string;
  isAnonymous?: boolean;
}

interface MinimalCommentModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
}

export default function MinimalCommentModal({ post, isOpen, onClose, onCommentAdded }: MinimalCommentModalProps) {
  const [formattedDate, setFormattedDate] = useState("");
  const [threadLineHeight, setThreadLineHeight] = useState("0px");
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.getBoundingClientRect().height;
      setThreadLineHeight(`${containerHeight - 40}px`);
    }
  }, [post.content, isOpen]);

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
            <span className="text-xs font-medium text-gray-700">Yanıtla</span>
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
        <div className="p-4 pb-0 relative" ref={containerRef}>
          <div className="flex items-start">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-3 relative">
                {post.isAnonymous ? 
                  "A" : 
                  (post.userImage ? 
                    <img src={post.userImage} alt={post.username} className="w-10 h-10 rounded-full object-cover" /> : 
                    post.username.charAt(0).toUpperCase())
                }
              </div>
              <div 
                className="absolute left-5 top-[2.5rem] w-0.5 bg-orange-400"
                style={{
                  height: threadLineHeight,
                  transform: 'translateX(-50%)'
                }}
              />
            </div>
            <div className="flex-1" ref={contentRef}>
              <div className="flex items-center mb-1 gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">{post.fullName || post.username}</span>
                <span className="text-gray-500">@{post.username}</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-sm text-gray-500">{formattedDate}</span>
              </div>
              <p className="text-gray-800 mb-2">
                {post.content}
              </p>
            </div>
          </div>
        </div>
        <div className="px-4 pb-4 pt-2">
          <div className="mb-2" style={{ marginLeft: 50 }}>
            <span className="text-sm text-gray-500">@{post.username} adlı kullanıcıya yanıt olarak</span>
          </div>
          <CommentComposeBox 
            postId={post.id}
            onCommentAdded={onCommentAdded}
            onCancel={onClose}
            hideAvatar={true}
            textareaClassName="border-0 focus:ring-0"
          />
        </div>
      </div>
    </div>
  );
}
