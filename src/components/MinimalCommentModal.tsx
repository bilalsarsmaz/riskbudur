"use client";

import { useState, useEffect, useRef } from "react";
import ComposeBox from "./ComposeBox";
import { IconRosetteDiscountCheckFilled } from "@tabler/icons-react";
import { formatCustomDate } from "@/utils/date";
import { fetchApi } from "@/lib/api";

import { EnrichedPost } from "@/types/post";

interface MinimalCommentModalProps {
  post: EnrichedPost;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: (comment?: any) => void;
  currentUserId?: string;
}

export default function MinimalCommentModal({ post, isOpen, onClose, onCommentAdded, currentUserId }: MinimalCommentModalProps) {
  const [threadLineHeight, setThreadLineHeight] = useState("0px");
  const [additionalRecipients, setAdditionalRecipients] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.getBoundingClientRect().height;
      setThreadLineHeight(`${containerHeight - 40}px`);
    }

    // Fetch parent post (and potentially root post) to find implicit mentions
    const fetchParentPost = async () => {
      if (post.parentPostId && isOpen) {
        try {
          // 1. Fetch immediate parent
          const parentPost = await fetchApi(`/posts/${post.parentPostId}`) as EnrichedPost;

          if (parentPost) {
            setAdditionalRecipients(prev => {
              const newRecipients = new Set(prev);

              // Add parent author (author of the post we are replying to)
              if (parentPost.author) {
                newRecipients.add(parentPost.author.nickname);
              }

              // Add mentions found in parent post content
              if (parentPost.content) {
                const mentionRegex = /@([a-zA-Z0-9_]+)/g;
                const matches = parentPost.content.match(mentionRegex);
                if (matches) {
                  matches.forEach(match => newRecipients.add(match.substring(1)));
                }
              }

              return Array.from(newRecipients);
            });

            // 2. recursive check: if parent is ALSO a reply, fetch ITS parent (or thread root)
            // This covers the case: Root (Mentions A, B) -> Reply 1 (No mentions) -> Reply 2 (You are here)
            // Reply 1 has no mentions, so we miss A and B unless we go up.
            if (parentPost.parentPostId || parentPost.threadRootId) {
              const rootId = parentPost.threadRootId || parentPost.parentPostId;
              if (rootId && rootId !== parentPost.id) {
                const rootPost = await fetchApi(`/posts/${rootId}`) as EnrichedPost;
                if (rootPost) {
                  setAdditionalRecipients(prev => {
                    const newRecipients = new Set(prev);
                    // Add root author
                    if (rootPost.author) newRecipients.add(rootPost.author.nickname);
                    // Add root content mentions
                    if (rootPost.content) {
                      const matches = rootPost.content.match(/@([a-zA-Z0-9_]+)/g);
                      if (matches) matches.forEach(m => newRecipients.add(m.substring(1)));
                    }
                    return Array.from(newRecipients);
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error("Parent post fetch error:", error);
        }
      }
    };

    if (isOpen) {
      fetchParentPost();
    } else {
      setAdditionalRecipients([]); // Reset on close
    }

  }, [post.content, isOpen, post.parentPostId]);

  const formattedDate = formatCustomDate(post.createdAt);
  const likes = post._count?.likes || 0;
  const comments = post._count?.comments || 0;
  const isPopular = (likes > 30 || comments > 10);

  // Parse mentions and construct "Replying to" list
  const getReplyingToText = () => {
    const mentions = new Set<string>();

    // Always include the post author
    mentions.add(post.author.nickname);

    // Add fetched parent author
    additionalRecipients.forEach(r => mentions.add(r));

    // Find other mentions in the post content
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const matches = post.content.match(mentionRegex);
    if (matches) {
      matches.forEach(match => mentions.add(match.substring(1))); // remove @
    }

    // Filter out current user if we know who they are (to avoid replying to self in text)
    // Ideally the backend should handle this, but for UI we filter.
    // If currentUserId is passed (id), we can't filter by nickname easily unless we know current user nickname.
    // However, usually 'currentUserId' passed from PostItem is an ID string.
    // We can't filter nickname vs ID directly. 
    // IF the user is the author of the post they are replying to, they are replying to themselves.
    // Standard behavior: 'Replying to @myself'. It's fine.

    // Convert to array
    let recipients = Array.from(mentions);

    // Ensure the main author is first
    recipients = recipients.filter(r => r !== post.author.nickname);
    recipients.unshift(post.author.nickname);

    if (recipients.length === 0) return "";

    if (recipients.length === 1) {
      return <span className="text-sm text-gray-500">@{recipients[0]} adlı kullanıcıya yanıt olarak</span>;
    }

    // More than 1 recipients
    return (
      <span className="text-sm text-gray-500">
        <span className="text-[var(--app-global-link-color)]">@{recipients[0]}</span> ve diğer kullanıcılara yanıt olarak
      </span>
    );
  };


  if (!isOpen) return null;

  return (
    <>
      {/* Desktop Modal */}
      <div
        className="hidden md:flex fixed inset-0 z-50 items-center justify-center backdrop-blur-md bg-black/50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="w-full max-w-lg rounded-lg shadow-xl border border-[var(--app-global-link-color)]" style={{ backgroundColor: "var(--app-body-bg)" }}>
          <div className="h-10 flex items-center justify-between px-4">
            <div className="flex items-center">
              <span className="text-sm font-bold text-[var(--app-global-link-color)] hover:opacity-80 transition-colors font-montserrat">riskbudur</span>
              <div className="mx-3 h-4 border-l border-theme-border"></div>
              <span className="text-xs font-medium" style={{ color: "var(--app-subtitle)" }}>Yanıtla</span>
            </div>
            <button
              onClick={onClose}
              className="hover:opacity-80 transition-colors"
              style={{ color: "var(--app-subtitle)" }}
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
          <hr className="border-theme-border" />
          <div className="p-4 pb-0 relative" ref={containerRef}>
            <div className="flex items-start">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#151515] border border-theme-border flex items-center justify-center text-gray-400 mr-3 relative">
                  {post.isAnonymous ?
                    "A" :
                    (post.author.profileImage ?
                      <img src={post.author.profileImage} alt={post.author.nickname} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" /> :
                      post.author.nickname.charAt(0).toUpperCase())
                  }
                </div>
                <div
                  className="absolute left-4 sm:left-5 top-[2.5rem] w-0.5 bg-[var(--app-global-link-color)]"
                  style={{
                    height: threadLineHeight,
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
              <div className="flex-1" ref={contentRef}>
                <div className="flex flex-wrap items-center mb-1">
                  <span className="font-bold mr-1 text-sm sm:text-base" style={{ color: "var(--app-body-text)" }}>
                    {post.author.fullName || post.author.nickname}
                  </span>
                  {!post.isAnonymous && post.author.hasBlueTick && (
                    <IconRosetteDiscountCheckFilled className="w-5 h-5 ml-0.5 text-[var(--app-global-link-color)]" />
                  )}
                  {isPopular && (
                    <IconRosetteDiscountCheckFilled className="w-5 h-5 ml-0.5 text-orange-500" />
                  )}
                  <span className="ml-1 text-xs sm:text-sm" style={{ color: "var(--app-subtitle)" }}>@{post.author.nickname}</span>
                  <span className="mx-1" style={{ color: "var(--app-subtitle)" }}>·</span>
                  <span className="text-xs sm:text-sm" style={{ color: "var(--app-subtitle)" }}>{formattedDate}</span>
                </div>
                <p className="mb-2 text-sm sm:text-base" style={{ color: 'var(--app-body-text)' }}>
                  {post.content}
                </p>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4 pt-2">
            <div className="mb-2 ml-[40px] sm:ml-[50px]">
              {getReplyingToText()}
            </div>
            <ComposeBox
              isReply={true}
              postId={post.id}
              onPostCreated={onCommentAdded}
              onCancel={onClose}
              placeholder="Yanıtınızı yazın..."
            />
          </div>
        </div>
      </div>

      {/* Mobile Modal (Full Screen) */}
      <div className="md:hidden fixed inset-0 z-[9999] bg-[var(--app-body-bg)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--app-border)" }}>
          <div className="flex items-center gap-2">
            <img
              src="/riskbudurlogo.png?v=2"
              alt="riskbudur"
              className="h-5"
            />
            <span className="text-[15px] font-medium" style={{ color: "var(--app-body-text)" }}>
              Yanıtla
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#151515] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
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

        {/* Scrollable Content (Thread Preview) */}
        <div className="overflow-y-auto px-4 py-4 border-b" style={{ borderColor: "var(--app-border)" }}>
          <div className="flex items-start mb-4">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#151515] border border-theme-border flex items-center justify-center text-gray-400 mr-3 relative">
                {post.isAnonymous ?
                  "A" :
                  (post.author.profileImage ?
                    <img src={post.author.profileImage} alt={post.author.nickname} className="w-10 h-10 rounded-full object-cover" /> :
                    post.author.nickname.charAt(0).toUpperCase())
                }
              </div>
              {/* Thread line - mobilde de görünsün ki bağlam belli olsun */}
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-[var(--app-border)] -ml-px h-full"></div>
            </div>

            <div className="flex-1 pb-2">
              <div className="flex items-center mb-1">
                <span className="font-bold mr-1 text-sm" style={{ color: "var(--app-body-text)" }}>
                  {post.author.fullName || post.author.nickname}
                </span>
                <span className="text-xs text-gray-500">@{post.author.nickname} · {formattedDate}</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--app-body-text)' }}>
                {post.content}
              </p>
            </div>
          </div>

          {/* Compose Area - Moved inside scrollable area */}
          <div className="pt-[12px]">
            <div className="px-0 pb-2">
              {getReplyingToText()}
            </div>
            <ComposeBox
              isReply={true}
              postId={post.id}
              onPostCreated={onCommentAdded}
              onCancel={onClose}
              placeholder="Yanıtınızı yazın..."
              isMobileFullscreen={true}
              className="!bg-transparent !border-none !rounded-none !p-0"
            />
            {/* Alt border kaldırıldı, çünkü üst container'da border-b var */}
          </div>
        </div>

        {/* Keyboard Spacer */}
        <div className="flex-1" />
      </div>
    </>
  );
}
