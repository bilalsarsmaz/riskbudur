"use client";

import { useState, useEffect } from "react";
import { postApi } from "@/lib/api";
import { EnrichedPost } from "@/types/post";
import { IconRosetteDiscountCheckFilled, IconX } from "@tabler/icons-react";
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
              <span className="text-xs font-medium" style={{ color: "var(--app-subtitle)" }}>Alıntıla</span>
            </div>
            <button
              onClick={onClose}
              className="hover:opacity-80 transition-colors"
              style={{ color: "var(--app-subtitle)" }}
              title="Kapat"
              aria-label="Kapat"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>
          <hr className="border-theme-border" />

          <div className="p-4 pb-[11px]">
            {/* Quote Content */}
            <div className="post-quote mb-3 rounded-lg overflow-hidden" style={{ border: "0.4px solid #333" }}>
              <div className="p-3">
                <div className="flex items-start">
                  <div className="post-quote-avatar">
                    {isAnonymous ? (
                      <div className="w-8 h-8 rounded-full mr-2 flex items-center justify-center">
                        <img
                          src="/riskbudurlogo.png?v=2"
                          alt="Anonim"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <img
                        src={post.author.profileImage || `https://ui-avatars.com/api/?name=${post.author.nickname}&background=random`}
                        alt={post.author.nickname}
                        className="w-8 h-8 rounded-full object-cover mr-2"
                      />
                    )}
                  </div>

                  <div className="post-quote-content flex-1">
                    <div className="post-quote-header flex items-center mb-1">
                      {isAnonymous ? (
                        <span className="post-quote-author font-medium text-sm" style={{ color: "var(--app-body-text)" }}>
                          Anonim Kullanıcı
                        </span>
                      ) : (
                        <span className="post-quote-author font-medium text-sm" style={{ color: "var(--app-body-text)" }}>
                          {post.author.fullName || post.author.nickname}
                        </span>
                      )}
                      {!isAnonymous && post.author.hasBlueTick && (
                        <IconRosetteDiscountCheckFilled className="w-4 h-4 ml-1 text-[var(--app-global-link-color)]" />
                      )}
                      <span className="mx-1 font-light text-xs" style={{ color: "var(--app-subtitle)" }}>·</span>
                      <span className="text-xs font-light" style={{ color: "var(--app-subtitle)" }}>{formattedDate}</span>
                    </div>

                    <div className="post-quote-text text-sm line-clamp-3" style={{ color: 'var(--app-body-text)' }}>
                      {post.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
              Alıntıla
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#151515] transition-colors"
          >
            <IconX className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-4 py-4 border-b" style={{ borderColor: "var(--app-border)" }}>
          {/* Quote Preview */}
          <div className="post-quote rounded-lg overflow-hidden mb-4" style={{ border: "0.4px solid #333" }}>
            <div className="p-3">
              <div className="flex items-start">
                <div className="post-quote-avatar mr-2">
                  <img
                    src={isAnonymous ? "/riskbudurlogo.png?v=2" : (post.author.profileImage || `https://ui-avatars.com/api/?name=${post.author.nickname}`)}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: "var(--app-body-text)" }}>
                      {isAnonymous ? "Anonim Kullanıcı" : (post.author.fullName || post.author.nickname)}
                    </span>
                    <span className="mx-1 text-xs text-gray-500">·</span>
                    <span className="text-xs text-gray-500">{formattedDate}</span>
                  </div>
                  <div className="text-sm" style={{ color: "var(--app-body-text)" }}>
                    {post.content}
                  </div>
                  {(post.imageUrl || post.mediaUrl) && (
                    <img src={post.imageUrl || post.mediaUrl} className="mt-2 rounded-md w-full max-h-40 object-cover" alt="Media" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Compose Area - Moved inside scrollable area */}
          <div className="pt-[12px]">
            <ComposeBox
              quotedPostId={post.id}
              onPostCreated={(newPost) => {
                onQuoteAdded(newPost);
                onClose();
              }}
              placeholder="Bir şeyler ekle..."
              submitButtonText="Alıntıla"
              isMobileFullscreen={true}
              className="!bg-transparent !border-none !rounded-none !p-0"
            />
            {/* Alt border kaldırıldı */}
          </div>
        </div>

        {/* Keyboard Spacer */}
        <div className="flex-1" />
      </div>
    </>
  );
}
