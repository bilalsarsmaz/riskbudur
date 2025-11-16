"use client";

import { useState, useRef, useEffect } from "react";
import { postApi } from "@/lib/api";
import { PhotoIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import { GifIcon } from "@heroicons/react/24/solid";

interface CommentComposeBoxProps {
  postId: string;
  onCommentAdded: () => void;
  onCancel: () => void;
  hideAvatar?: boolean;
  textareaClassName?: string;
  onSubmit?: (content: string) => Promise<void>;
  submitButtonText?: string;
}

export default function CommentComposeBox({ 
  postId, 
  onCommentAdded, 
  onCancel,
  hideAvatar = false,
  textareaClassName = "",
  onSubmit,
  submitButtonText = "Yanıtla"
}: CommentComposeBoxProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const gifPickerRef = useRef<HTMLDivElement>(null);
  const gifButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node) && !emojiButtonRef.current?.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (gifPickerRef.current && !gifPickerRef.current.contains(event.target as Node) && !gifButtonRef.current?.contains(event.target as Node)) {
        setShowGifPicker(false);
      }
    };

    if (showEmojiPicker || showGifPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker, showGifPicker]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !previewUrl) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      if (onSubmit) {
        await onSubmit(content.trim());
      } else {
        await postApi("/comments", {
          postId,
          content: content.trim(),
          imageUrl: previewUrl || undefined
        });
        setContent("");
        setPreviewUrl(null);
        onCommentAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const emojis = ["😀", "😂", "😍", "🥰", "😎", "🤔", "👍", "❤️", "🔥", "💯"];

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            className={`w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 ${textareaClassName}`}
            placeholder="Yanıtınızı yazın..."
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
          />
          
          {previewUrl && (
            <div className="mt-2 relative">
              <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-lg" />
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
              >
                ✕
              </button>
            </div>
          )}
          
          {error && (
            <div className="mt-2 text-red-500 text-sm">{error}</div>
          )}
          
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center">
              <label 
                htmlFor="comment-photo-upload" 
                className="cursor-pointer hover:opacity-80 p-1 rounded"
                style={{color: "oklch(0.71 0.24 43.55)"}}
              >
                <PhotoIcon className="h-5 w-5" />
                <span className="sr-only">Fotoğraf ekle</span>
                <input
                  id="comment-photo-upload"
                  ref={fileInputRef}
                  accept="image/*"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  aria-label="Fotoğraf ekle"
                />
              </label>
              
              <button
                ref={gifButtonRef}
                type="button"
                onClick={() => {
                  setShowGifPicker(!showGifPicker);
                  setShowEmojiPicker(false);
                }}
                className="cursor-pointer hover:opacity-80 ml-1 p-1 rounded"
                data-gif-button="true"
                aria-label="GIF ekle"
                style={{color: "oklch(0.71 0.24 43.55)"}}
              >
                <GifIcon className="h-5 w-5" />
              </button>
              
              <button
                ref={emojiButtonRef}
                type="button"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowGifPicker(false);
                }}
                className="cursor-pointer hover:opacity-80 ml-1 p-1 rounded"
                data-emoji-button="true"
                aria-label="Emoji ekle"
                style={{color: "oklch(0.71 0.24 43.55)"}}
              >
                <FaceSmileIcon className="h-5 w-5" />
              </button>
              
              {showEmojiPicker && (
                <div
                  ref={emojiPickerRef}
                  className="absolute mt-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50"
                  style={{ marginLeft: "0px" }}
                >
                  <div className="grid grid-cols-5 gap-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-2xl hover:bg-gray-100 rounded p-1"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {showGifPicker && (
                <div
                  ref={gifPickerRef}
                  className="absolute mt-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50"
                  style={{ marginLeft: "40px" }}
                >
                  <p className="text-sm text-gray-500">GIF özelliği yakında eklenecek</p>
                </div>
              )}
            </div>
            
            <div>
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 mr-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
                disabled={isLoading}
              >
                İptal
              </button>
              <button
                type="submit"
                className={`px-4 py-1.5 rounded-full text-white font-medium text-sm ${
                  isLoading || (!content.trim() && !previewUrl)
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:opacity-90"
                }`}
                disabled={isLoading || (!content.trim() && !previewUrl)}
                style={{backgroundColor: "oklch(0.71 0.24 43.55)"}}
              >
                {isLoading ? "Gönderiliyor..." : submitButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
