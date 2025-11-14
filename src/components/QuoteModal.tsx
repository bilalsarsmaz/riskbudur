"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { postApi } from "@/lib/api";
import { Post } from "./PostList";

interface QuoteModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onQuoteAdded: () => void;
}

export default function QuoteModal({ post, isOpen, onClose, onQuoteAdded }: QuoteModalProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Alıntı içeriği boş olamaz");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      await postApi("/posts/quote", {
        quotedPostId: post.id,
        content
      });
      
      // Alıntı başarıyla eklendi
      setContent("");
      onQuoteAdded();
      onClose();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Alıntı eklenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4 shadow-xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Alıntıla</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            title="Kapat"
            aria-label="Kapat"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Alıntılanan post */}
          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 mr-2">
                {post.author.nickname.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-medium text-sm">@{post.author.nickname}</span>
                <span className="mx-1 text-gray-500">•</span>
                <span className="text-xs text-gray-500">Alıntılanan post</span>
              </div>
            </div>
            <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Düşüncelerinizi ekleyin..."
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            {error && (
              <div className="mb-4 text-red-500 text-sm">{error}</div>
            )}
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                disabled={isSubmitting}
              >
                İptal
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg text-white font-medium ${
                  isSubmitting
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Gönderiliyor..." : "Alıntıla"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 