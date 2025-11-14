"use client";

import { useState, useRef, useEffect } from "react";
import { Post } from "./PostList";
import { postApi } from "@/lib/api";
import { PhotoIcon, GifIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import GifPicker, { TenorImage } from 'gif-picker-react';

interface ComposeBoxProps {
  onPostCreated: (post: Post) => void;
}

export default function ComposeBox({ onPostCreated }: ComposeBoxProps) {
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isTextareaActive, setIsTextareaActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const gifPickerRef = useRef<HTMLDivElement>(null);
  const gifButtonRef = useRef<HTMLButtonElement>(null);

  // Emoji picker dışında bir yere tıklandığında emoji picker'ı kapat
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
      
      // Textarea dışında bir yere tıklandığında textareaActive'i false yap
      if (
        textareaRef.current && 
        !(event.target as Node).isEqualNode(textareaRef.current) &&
        !textareaRef.current.contains(event.target as Node) &&
        content.trim() === ""
      ) {
        setIsTextareaActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Post içeriği boş olamaz");
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
      
      // Post verilerini hazırla
      const postData: Record<string, unknown> = {
        content,
        isAnonymous
      };
      
      // Eğer bir GIF veya resim seçildiyse, imageUrl olarak ekle
      if (previewUrl) {
        postData.imageUrl = previewUrl;
      }
      
      // API'ye gönder
      const data = await postApi<Post>("/posts", postData);
      
      // Post başarıyla oluşturuldu
      setContent("");
      setPreviewUrl(null);
      setIsTextareaActive(false);
      onPostCreated(data);
      
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
      
      // Cursor'ı emoji sonrasına konumlandır
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
    <div className="bg-white border-t border-l border-r border-gray-200 rounded-t-lg p-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="mb-3">
          <textarea
            ref={textareaRef}
            className="w-full p-1 border-none rounded-lg resize-none focus:outline-none transition-all duration-200"
            placeholder="Ne düşünüyorsun?"
            rows={isTextareaActive ? 3 : 1}
            style={{backgroundColor: 'transparent', 
              height: isTextareaActive ? 'auto' : '30px', 
              overflow: isTextareaActive ? 'auto' : 'hidden'
            }}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (e.target.value.trim() !== "") {
                setIsTextareaActive(true);
              }
            }}
            disabled={isLoading}
            onFocus={() => setIsTextareaActive(true)}
            onClick={() => setIsTextareaActive(true)}
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
        </div>
        
        {error && (
          <div className="mb-3 text-red-500 text-sm">{error}</div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <label htmlFor="photo-upload" className="cursor-pointer hover:opacity-80" style={{color: 'oklch(0.71 0.24 43.55)'}}>
              <PhotoIcon className="h-5 w-5" />
              <span className="sr-only">Fotoğraf ekle</span>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isLoading}
                aria-label="Fotoğraf ekle"
              />
            </label>
            
            <button 
              type="button" 
              className="cursor-pointer hover:opacity-80 ml-3" style={{color: 'oklch(0.71 0.24 43.55)'}}
              onClick={toggleGifPicker}
              data-gif-button
              aria-label="GIF ekle"
              ref={gifButtonRef}
            >
              <GifIcon className="h-5 w-5" />
            </button>
            
            <button 
              type="button" 
              className="cursor-pointer hover:opacity-80 ml-3" style={{color: 'oklch(0.71 0.24 43.55)'}}
              onClick={toggleEmojiPicker}
              data-emoji-button
              aria-label="Emoji ekle"
              ref={emojiButtonRef}
            >
              <FaceSmileIcon className="h-5 w-5" />
            </button>
            
            <div className="mx-3 h-6 border-l border-gray-300"></div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={() => setIsAnonymous(!isAnonymous)}
                className="rounded text-blue-600 focus:ring-blue-500"
                disabled={isLoading}
              />
              <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                Anonim olarak paylaş
              </label>
            </div>
          </div>
          
          <button
            type="submit"
            style={{backgroundColor: 'oklch(0.71 0.24 43.55)', color: '#ffffff', border: 'none'}}
            className={`px-4 py-2 rounded-full font-medium ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:opacity-90"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Paylaşılıyor..." : "Paylaş"}
          </button>
        </div>
        
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div 
            ref={emojiPickerRef}
            className="absolute top-10 left-0 z-50 shadow-lg rounded-lg"
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
        
        {/* GIF Picker */}
        {showGifPicker && (
          <div 
            ref={gifPickerRef}
            className="absolute top-10 left-0 z-50 shadow-lg rounded-lg"
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
      </form>
    </div>
  );
}