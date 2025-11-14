"use client";

import { useState, useRef, useEffect } from "react";
import { postApi } from "@/lib/api";
import { PhotoIcon, GifIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import GifPicker, { TenorImage } from 'gif-picker-react';

interface CommentComposeBoxProps {
  postId: string;
  onCommentAdded: () => void;
  onCancel: () => void;
  hideAvatar?: boolean;
  textareaClassName?: string;
}

export default function CommentComposeBox({ 
  postId, 
  onCommentAdded, 
  onCancel,
  hideAvatar = false,
  textareaClassName = ""
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
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[data-emoji-button]')
      ) {
        setShowEmojiPicker(false);
      }
      
      if (
        gifPickerRef.current && 
        !gifPickerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[data-gif-button]')
      ) {
        setShowGifPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!content.trim()) {
      setError("Yorum içeriği boş olamaz");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
        return;
      }
      
      const commentData: Record<string, unknown> = {
        postId,
        content
      };
      
      if (previewUrl) {
        commentData.imageUrl = previewUrl;
      }
      
      await postApi("/comments", commentData);
      
      setContent("");
      setPreviewUrl(null);
      onCommentAdded();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + emoji + content.substring(end);
      
      setContent(newContent);
      
      setTimeout(() => {
        textarea.selectionStart = start + emoji.length;
        textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 10);
    } else {
      setContent(content + emoji);
    }
    
    setShowEmojiPicker(false);
  };
  
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
    setShowGifPicker(false);
  };
  
  const toggleGifPicker = () => {
    setShowGifPicker(!showGifPicker);
    setShowEmojiPicker(false);
  };
  
  const handleGifClick = (gif: TenorImage) => {
    setPreviewUrl(gif.url);
    setShowGifPicker(false);
  };
  
  return (
    <div className="flex">
      {!hideAvatar && (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
          B
        </div>
      )}
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          className={'w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-blue-400 ' + textareaClassName}
          placeholder="Yanıtınızı yazın..."
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
        />
        
        {previewUrl && (
          <div className="mt-2 relative">
            <img 
              src={previewUrl} 
              alt="Seçilen görsel" 
              className="max-h-40 rounded-lg"
            />
            <button
              type="button"
              className="absolute top-1 right-1 bg-gray-800 bg-opacity-50 text-white rounded-full p-1"
              onClick={removeImage}
            >
              ✕
            </button>
          </div>
        )}
        
        {error && (
          <div className="mb-3 text-red-500 text-sm">{error}</div>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            <label htmlFor="comment-photo-upload" className="cursor-pointer hover:opacity-80 p-1 rounded" style={{color: "oklch(0.71 0.24 43.55)"}}>
              <PhotoIcon className="h-5 w-5" />
              <span className="sr-only">Fotoğraf ekle</span>
              <input
                id="comment-photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isLoading}
                ref={fileInputRef}
                aria-label="Fotoğraf ekle"
              />
            </label>
            
            <button 
              type="button" 
              className="cursor-pointer hover:opacity-80 ml-1 p-1 rounded"
              style={{color: "oklch(0.71 0.24 43.55)"}}
              onClick={toggleGifPicker}
              data-gif-button
              aria-label="GIF ekle"
              ref={gifButtonRef}
            >
              <GifIcon className="h-5 w-5" />
            </button>
            
            <button 
              type="button" 
              className="cursor-pointer hover:opacity-80 ml-1 p-1 rounded"
              style={{color: "oklch(0.71 0.24 43.55)"}}
              onClick={toggleEmojiPicker}
              data-emoji-button
              aria-label="Emoji ekle"
              ref={emojiButtonRef}
            >
              <FaceSmileIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 mr-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm"
                disabled={isLoading}
              >
                İptal
              </button>
            )}
            <button
              type="button"
              onClick={() => handleSubmit()}
              className={'px-4 py-1.5 rounded-full text-white font-medium text-sm ' + (isLoading || !content.trim() ? "opacity-50 cursor-not-allowed" : "hover:opacity-90")}
              style={{backgroundColor: "oklch(0.71 0.24 43.55)"}}
              disabled={isLoading || !content.trim()}
            >
              {isLoading ? "Gönderiliyor..." : "Yanıtla"}
            </button>
          </div>
        </div>
        
        {showEmojiPicker && (
          <div 
            ref={emojiPickerRef}
            className="absolute mt-2 z-50 shadow-lg rounded-lg"
            style={{ width: '320px' }}
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              searchPlaceHolder="Emoji ara..."
              width="100%"
              height={350}
            />
          </div>
        )}
        
        {showGifPicker && (
          <div 
            ref={gifPickerRef}
            className="absolute mt-2 z-50 shadow-lg rounded-lg"
            style={{ width: '320px' }}
          >
            <GifPicker
              tenorApiKey="AIzaSyBCG3Ov4ZiZpucTWNm9-PBdGVw0mqxjH8A"
              onGifClick={handleGifClick}
              width={320}
              height={450}
            />
          </div>
        )}
      </div>
    </div>
  );
}
