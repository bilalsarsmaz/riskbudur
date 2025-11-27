"use client";

import Link from "next/link";
import PostItem from "@/components/PostItem";
import { IconTimelineEventText } from "@tabler/icons-react";

interface Author {
  id?: string;
  nickname: string;
  fullName?: string;
  profileImage?: string;
  hasBlueTick?: boolean;
}

interface PostData {
  id: string;
  content: string;
  createdAt?: string;
  author: Author;
  mediaUrl?: string;
  imageUrl?: string;
  linkPreview?: any;
  isAnonymous?: boolean;
  _count?: {
    likes: number;
    comments: number;
    quotes?: number;
  };
}

interface ReplyThreadPreviewProps {
  threadRoot: PostData;
  userReply: PostData;
  middlePostsCount: number;
}

export default function ReplyThreadPreview({ threadRoot, userReply, middlePostsCount }: ReplyThreadPreviewProps) {
  const isThread = middlePostsCount > 0;
  
  if (!isThread) {
    return (
      <div className="single-reply-preview">
        <div className="[&_.post]:border-b-0 [&_.post]:pb-0">
          <PostItem 
            post={threadRoot as any} 
            isThread={false} 
            showThreadLine={true} 
            isFirstInThread={true}
            isLastInThread={false} 
          />
        </div>
        
        <PostItem 
          post={userReply as any} 
          showThreadLine={true} 
          isFirstInThread={false} 
          isLastInThread={true} 
        />
      </div>
    );
  }
  
  return (
    <div className="reply-thread-preview">
      <div className="[&_.post]:border-b-0 [&_.post]:pb-0">
        <PostItem 
          post={threadRoot as any} 
          isThread={true} 
          showThreadLine={true} 
          isFirstInThread={true}
          isLastInThread={false} 
        />
      </div>
      
      <div className="relative" style={{ height: '48px' }}>
        <div 
          className="absolute bg-[#1DCD9F]" 
          style={{ 
            left: '35px', 
            top: '0',
            height: '12px',
            width: '2px',
          }} 
        />
        <div 
          className="absolute bg-[#1DCD9F]" 
          style={{ 
            left: '35px', 
            top: '16px',
            height: '6px',
            width: '2px',
          }} 
        />
        <div 
          className="absolute bg-[#1DCD9F]" 
          style={{ 
            left: '35px', 
            top: '26px',
            height: '6px',
            width: '2px',
          }} 
        />
        <div 
          className="absolute bg-[#1DCD9F]" 
          style={{ 
            left: '35px', 
            top: '36px',
            height: '12px',
            width: '2px',
          }} 
        />
      </div>
      
      {/* Son post - border yok */}
      <div className="[&_.post]:border-b-0">
        <PostItem 
          post={userReply as any} 
          showThreadLine={true} 
          isFirstInThread={false} 
          isLastInThread={true} 
        />
      </div>
      
      {/* HR cizgisi */}
      <hr className="border-[#2a2a2a] mx-4" />
      
      {/* Sadece yazi ve icona tiklaninca yonlendirme */}
      <div className="px-4 py-3 border-b border-[#2a2a2a]">
        <Link 
          href={`/status/${threadRoot.id}`}
          className="inline-flex items-center gap-2 text-[#1DCD9F] hover:opacity-80"
        >
          <span className="text-xs">Tümünü gör</span>
          <IconTimelineEventText size={14} />
        </Link>
      </div>
    </div>
  );
}
