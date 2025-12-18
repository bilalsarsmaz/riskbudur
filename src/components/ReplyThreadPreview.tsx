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
      <div className="single-reply-preview border-b border-theme-border">
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

        <div className="[&_.post]:border-b-0">
          <PostItem
            post={userReply}
            showThreadLine={true}
            isFirstInThread={false}
            isLastInThread={true}
            showThreadFooter={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="reply-thread-preview border-b border-theme-border">
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

      <div className="relative group cursor-pointer" style={{ height: '48px' }}>
        <Link href={`/${threadRoot.author.nickname}/status/${threadRoot.id}`} className="absolute inset-0 z-10" />

        {/* Dashed Lines */}
        <div
          className="absolute bg-[var(--app-icon-verified)] w-[2px] left-[28px] sm:left-[36px]"
          style={{ top: '0', height: '12px' }}
        />
        <div
          className="absolute bg-[var(--app-icon-verified)] w-[2px] left-[28px] sm:left-[36px]"
          style={{ top: '16px', height: '6px' }}
        />
        <div
          className="absolute bg-[var(--app-icon-verified)] w-[2px] left-[28px] sm:left-[36px]"
          style={{ top: '26px', height: '6px' }}
        />
        <div
          className="absolute bg-[var(--app-icon-verified)] w-[2px] left-[28px] sm:left-[36px]"
          style={{ top: '36px', height: '12px' }}
        />

        {/* Text */}
        <div className="absolute top-0 bottom-0 left-[48px] sm:left-[56px] flex items-center">
          <span
            className="text-sm font-medium hover:underline transition-all"
            style={{ color: 'var(--app-global-link-color)' }}
          >
            Daha fazla göster
          </span>
        </div>
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

    </div>
  );
}
