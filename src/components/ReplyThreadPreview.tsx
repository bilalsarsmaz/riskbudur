"use client";

import Link from "next/link";
import PostItem from "@/components/PostItem";
import { IconTimelineEventText } from "@tabler/icons-react";

import { EnrichedPost } from "@/types/post";

interface ReplyThreadPreviewProps {
  threadRoot: EnrichedPost;
  userReply: EnrichedPost;
  middlePostsCount: number;
  threadRepliesCount?: number;
}

export default function ReplyThreadPreview({ threadRoot, userReply, middlePostsCount, threadRepliesCount = 0 }: ReplyThreadPreviewProps) {
  const isThread = threadRepliesCount >= 4;

  if (!isThread) {
    return (
      <div className="single-reply-preview">
        <div className="[&_.post]:border-b-0 [&_.post]:pb-0">
          <PostItem
            post={threadRoot}
            isThread={false}
            showThreadLine={true}
            isFirstInThread={true}
            isLastInThread={false}
            showThreadFooter={false}
          />
        </div>

        <PostItem
          post={userReply}
          showThreadLine={true}
          isFirstInThread={false}
          isLastInThread={true}
          showThreadFooter={false}
        />
      </div>
    );
  }

  return (
    <div className="reply-thread-preview">
      <div className="[&_.post]:border-b-0 [&_.post]:pb-0">
        <PostItem
          post={threadRoot}
          isThread={true}
          showThreadLine={true}
          isFirstInThread={true}
          isLastInThread={false}
          showThreadFooter={false}
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
          post={userReply}
          showThreadLine={true}
          isFirstInThread={false}
          isLastInThread={true}
          showThreadFooter={false}
        />
      </div>

      {/* HR cizgisi */}
      <hr className="border-theme-border mx-4" />

      {/* Sadece yazi ve icona tiklaninca yonlendirme */}
      <div className="px-4 py-3 border-b border-theme-border flex justify-center">
        <Link
          href={`/${threadRoot.author.nickname}/status/${threadRoot.id}`}
          className="inline-flex items-center gap-2 text-[#1DCD9F] hover:opacity-80"
        >
          <span className="text-xs">Tümünü gör</span>
          <IconTimelineEventText size={14} />
        </Link>
      </div>
    </div>
  );
}
