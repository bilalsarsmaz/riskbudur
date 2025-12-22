"use client";

import { useState, useEffect } from "react";
import { postApi } from "@/lib/api";
import { EnrichedPost } from "@/types/post";
import { IconRosetteDiscountCheckFilled } from "@tabler/icons-react";
import Link from "next/link";
import ComposeBox from "./ComposeBox";
import { formatCustomDate } from "@/utils/date";

interface QuoteModalProps {
  post: EnrichedPost;
  isOpen: boolean;
  onClose: () => void;
  onQuoteAdded: (post?: EnrichedPost) => void;
}

export default function QuoteModal({ post, isOpen, onClose, onQuoteAdded }: QuoteModalProps) {
  const isAnonymous = post.isAnonymous || false;
  const formattedDate = formatCustomDate(post.createdAt);
  const likes = post._count?.likes || 0;
  const comments = post._count?.comments || 0;
  const isPopular = (likes > 30 || comments > 10);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center backdrop-blur-md bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-t-2xl rounded-b-none sm:rounded-lg mx-0 sm:mx-4 shadow-xl border-t border-x border-b-0 border-[var(--app-global-link-color)] sm:border" style={{ backgroundColor: "var(--app-body-bg)" }}>
        <div className="h-10 flex items-center justify-between px-4">
          <div className="flex items-center">
            <span className="text-sm font-bold text-[var(--app-global-link-color)] hover:opacity-80 transition-colors font-montserrat">riskbudur</span>
            <div className="mx-3 h-4 border-l border-theme-border"></div>
            <span className="text-xs font-medium" style={{ color: "var(--app-subtitle)" }}>Alıntıla</span>
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

        <div className="p-4 pb-0">
          <div className="post-quote mb-3 rounded-lg overflow-hidden" style={{ border: "0.4px solid #333" }}>
            <div className="p-3">
              <div className="flex items-start">
                <div className="post-quote-avatar">
                  {isAnonymous ? (
                    <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center">
                      <img
                        src="/riskbudurlogo.png"
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
                      <span className="post-quote-author font-medium text-sm" style={{ color: "var(--app-body-text)" }}>
                        Anonim Kullanıcı
                      </span>
                    ) : (
                      <Link href={`/${post.author.nickname}`}>
                        <span className="post-quote-author font-medium text-sm" style={{ color: "var(--app-body-text)" }}>
                          {post.author.fullName || post.author.nickname}
                        </span>
                      </Link>
                    )}
                    {!isAnonymous && post.author.hasBlueTick && (
                      <IconRosetteDiscountCheckFilled className="w-4 h-4 ml-1 text-[var(--app-global-link-color)]" />
                    )}
                    {isPopular && (
                      <IconRosetteDiscountCheckFilled className="w-4 h-4 ml-1 text-orange-500" />
                    )}
                    <span className="mx-1 font-light text-xs" style={{ color: "var(--app-subtitle)" }}>·</span>
                    <span className="text-xs font-light" style={{ color: "var(--app-subtitle)" }}>{formattedDate}</span>
                  </div>

                  <Link href={`/${post.author.nickname}/status/${post.id}`}>
                    {post.content && (
                      <div className="post-quote-text text-sm line-clamp-3" style={{ color: 'var(--app-body-text)' }}>
                        {post.content}
                      </div>
                    )}

                    {(post.mediaUrl || post.imageUrl) && (
                      <div className={`post-quote-media rounded-lg overflow-hidden ${post.content ? 'mt-2' : ''}`} style={{ border: "0.4px solid #333" }}>
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
          <ComposeBox
            quotedPostId={post.id}
            onPostCreated={(newPost) => {
              onQuoteAdded(newPost);
              onClose();
            }}
            onCancel={onClose}
            placeholder="Bir şeyler ekle..."
            submitButtonText="Alıntıla"
          />
        </div>
      </div>
    </div>
  );
}
