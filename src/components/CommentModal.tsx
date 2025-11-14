"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { postApi } from "@/lib/api";

interface CommentModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
}

export default function CommentModal({ postId, isOpen, onClose, onCommentAdded }: CommentModalProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Yorum içeriği boş olamaz");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      await postApi("/comments", {
        postId,
        content
      });
      
      // Yorum başarıyla eklendi
      setContent("");
      onCommentAdded();
      onClose();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yorum eklenirken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
      <div className="bg-white rounded-lg w-full max-w-lg mx-4 shadow-xl">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Yorum Yap</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            title="Kapat"
            aria-label="Kapat"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Yorumunuzu yazın..."
              rows={4}
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
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Gönderiliyor..." : "Yorum Yap"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 