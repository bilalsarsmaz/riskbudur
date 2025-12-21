"use client";

import { useRouter } from "next/navigation";

import { useState, useRef, useEffect, useId } from "react";
import { EnrichedPost } from "@/types/post";
import { postApi } from "@/lib/api";
import { IconPhoto, IconGif, IconMoodSmile, IconX, IconPlayerPlay, IconChartBar, IconPlus, IconMinus } from "@tabler/icons-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import GifPicker, { TenorImage } from 'gif-picker-react';
import ErrorBoundary from './ErrorBoundary';

interface ComposeBoxProps {
  onPostCreated?: (post: EnrichedPost) => void;
  isReply?: boolean;
  postId?: string; // Parent post ID for replies
  quotedPostId?: string; // Post ID for quotes
  placeholder?: string;
  submitButtonText?: string;
  onCancel?: () => void;
  className?: string;
}

export default function ComposeBox({
  onPostCreated,
  isReply = false,
  postId,
  quotedPostId,
  placeholder = "Ne düşünüyorsun?",
  submitButtonText,
  onCancel,
  className
}: ComposeBoxProps) {
  const router = useRouter();
  const uniqueId = useId();
  const photoUploadId = `photo-upload-${uniqueId}`;
  const anonymousId = `anonymous-${uniqueId}`;

  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [linkPreview, setLinkPreview] = useState<{
    url: string;
    title: string;
    description: string;
    thumbnail: string;
    siteName: string;
    type: string;
    videoId?: string;
  } | null>(null);
  const [linkPreviewLoading, setLinkPreviewLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollDays, setPollDays] = useState(0);
  const [pollHours, setPollHours] = useState(0);
  const [pollMinutes, setPollMinutes] = useState(5);
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

  // URL algılama ve link preview
  useEffect(() => {
    const detectAndFetchLinkPreview = async () => {
      // URL pattern - https, http veya www ile başlayanlar
      const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
      const urls = content.match(urlRegex);

      if (!urls || urls.length === 0) {
        // linkPreview zaten varsa dokunma
        return;
      }

      let url = urls[0]; // İlk URL'yi al

      // Protokol yoksa ekle
      if (url.startsWith('www.')) {
        url = 'https://' + url;
      }

      // riskbudur.net/username/status/[id] linkleri için önizleme yapma, sadece alıntı olarak göster
      if (url.toLowerCase().includes('riskbudur.net') && url.toLowerCase().includes('/status/')) {
        setLinkPreview(null);
        return;
      }

      // Zaten aynı URL için preview varsa tekrar çekme
      if (linkPreview && linkPreview.url === url) {
        return;
      }

      // Görsel zaten seçilmişse link preview gösterme
      if (previewUrl && !previewUrl.startsWith('http')) {
        return;
      }

      setLinkPreviewLoading(true);

      try {
        const response = await fetch('/api/link-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.title) {
            setLinkPreview(data);
            // YouTube linki ise content'ten kaldır
            if (data.type === 'youtube') {
              setContent(prev => prev.replace(urls[0], '').trim());
            }
          }
        }
      } catch (error) {
        console.error('Link preview error:', error);
      } finally {
        setLinkPreviewLoading(false);
      }
    };

    // Debounce - kullanıcı yazmayı bitirene kadar bekle
    const timeoutId = setTimeout(detectAndFetchLinkPreview, 500);
    return () => clearTimeout(timeoutId);
  }, [content, linkPreview, previewUrl]);

  const removeLinkPreview = () => {
    setLinkPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && !linkPreview && !previewUrl) {
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

      const postData: Record<string, unknown> = {
        content: content,
        isAnonymous
      };

      if (previewUrl) {
        postData.imageUrl = previewUrl;
        postData.mediaUrl = previewUrl;
      }

      if (linkPreview) {
        postData.linkPreview = linkPreview;
      }

      if (isPollOpen) {
        const validOptions = pollOptions.filter(opt => opt.trim() !== "");
        if (validOptions.length < 2) {
          setError("Anket için en az 2 seçenek gereklidir.");
          setIsLoading(false);
          return;
        }

        const totalMinutes = (pollDays * 24 * 60) + (pollHours * 60) + pollMinutes;
        if (totalMinutes < 5) {
          setError("Anket süresi en az 5 dakika olmalıdır.");
          setIsLoading(false);
          return;
        }

        postData.pollOptions = validOptions;
        postData.pollDuration = totalMinutes;
      }

      let data;
      if (isReply && postId) {
        // Reply mode
        data = await postApi<EnrichedPost>("/comments", {
          ...postData,
          postId
        });
      } else if (quotedPostId) {
        // Quote mode
        data = await postApi<EnrichedPost>("/posts/quote", {
          quotedPostId,
          content: content.trim() || undefined,
          isAnonymous // Quotes can also honor anonymous flag if backend supports it, checking logic...
          // backend likely expects 'isAnonymous' in body. 
        });
      } else {
        // Normal post mode
        data = await postApi<EnrichedPost>("/posts", postData);
      }

      // Success
      setContent("");
      setPreviewUrl(null);
      setLinkPreview(null);
      setIsTextareaActive(false);
      setIsPollOpen(false);
      setPollOptions(["", ""]);
      setPollDays(0);
      setPollHours(0);
      setPollMinutes(5);
      if (onPostCreated) {
        onPostCreated(data);
      }
      router.refresh(); // Hashtagler ve feed icin server componentleri guncelle
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

  const togglePoll = () => {
    setIsPollOpen(!isPollOpen);
    if (!isPollOpen && pollOptions.length === 0) {
      setPollOptions(["", ""]);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  return (
    <div className={`composebox text-white w-full ${(isReply || quotedPostId) ? 'bg-transparent' : 'bg-black p-4 border-t border-b border-theme-border lg:w-[598px]'} ${className || ''}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="mb-3">
          {/* Standard Textarea */}
          <div className="w-full relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (e.target.value.trim() !== "") {
                  setIsTextareaActive(true);
                }
              }}
              onClick={() => setIsTextareaActive(true)}
              placeholder={placeholder}
              disabled={isLoading}
              style={{ color: "var(--app-body-text)" }}
              className={`w-full bg-transparent text-lg placeholder-gray-500 resize-none outline-none ${isTextareaActive ? 'min-h-[80px]' : 'min-h-[40px]'}`}
              onPaste={(e) => {
                if (e.clipboardData && e.clipboardData.items) {
                  const items = e.clipboardData.items;
                  for (let i = 0; i < items.length; i++) {
                    if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
                      const file = items[i].getAsFile();
                      if (file) {
                        e.preventDefault();
                        const reader = new FileReader();
                        reader.onload = () => {
                          setPreviewUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                        return;
                      }
                    }
                  }
                }
              }}
            />
          </div>

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

          {/* Link Preview */}
          {linkPreviewLoading && (
            <div className="mt-2 p-3 border border-theme-border rounded-lg">
              <div className="flex items-center text-gray-400 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#1DCD9F] mr-2"></div>
                Link önizlemesi yükleniyor...
              </div>
            </div>
          )}

          {linkPreview && !linkPreviewLoading && !previewUrl && (() => {
            const getYoutubeThumbnail = (url: string) => {
              const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
              const match = url.match(regex);
              return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
            };

            const thumbnail = linkPreview.thumbnail ||
              ((linkPreview.type === 'youtube' || linkPreview.url.includes('youtube') || linkPreview.url.includes('youtu.be'))
                ? getYoutubeThumbnail(linkPreview.url)
                : null);

            return (
              <div className="mt-2 relative border border-theme-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full p-1 z-10 hover:bg-opacity-90"
                  onClick={removeLinkPreview}
                >
                  <IconX className="h-4 w-4" />
                </button>

                {(linkPreview.type === 'youtube' || linkPreview.url.includes('youtube') || linkPreview.url.includes('youtu.be')) && thumbnail && (
                  <div className="flex">
                    <div className="relative flex-shrink-0" style={{ width: '130px', height: '130px' }}>
                      <img
                        src={thumbnail}
                        alt={linkPreview.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-80 rounded-full p-2">
                          <IconPlayerPlay className="h-6 w-6 text-white" fill="white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center p-3 flex-1 min-w-0">
                      <div className="text-xs mb-1" style={{ color: "var(--app-subtitle)" }}>{linkPreview.siteName || 'youtube.com'}</div>
                      <div className="text-sm font-medium line-clamp-2 mb-1" style={{ color: "var(--app-subtitle)" }}>{linkPreview.title}</div>
                      {linkPreview.description && (
                        <div className="text-xs line-clamp-2" style={{ color: "var(--app-subtitle)" }}>{linkPreview.description}</div>
                      )}
                    </div>
                  </div>
                )}

                {linkPreview.type !== 'youtube' && thumbnail && (
                  <img
                    src={thumbnail}
                    alt={linkPreview.title}
                    className="w-full h-32 object-cover"
                  />
                )}

                {linkPreview.type !== 'youtube' && (
                  <div className="p-3 bg-[#181818]">
                    <div className="text-xs mb-1" style={{ color: "var(--app-subtitle)" }}>{linkPreview.siteName}</div>
                    <div className="text-sm font-medium line-clamp-2" style={{ color: "var(--app-subtitle)" }}>{linkPreview.title}</div>
                    {linkPreview.description && (
                      <div className="text-xs mt-1 line-clamp-2" style={{ color: "var(--app-subtitle)" }}>{linkPreview.description}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

        </div>

        {isPollOpen && (
          <div className="mb-3 p-3 border rounded-lg" style={{ backgroundColor: "var(--app-body-bg)", borderColor: "var(--app-border)" }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium" style={{ color: "var(--app-subtitle)" }}>Anket Seçenekleri</span>
              <button type="button" onClick={() => setIsPollOpen(false)} className="text-gray-500 hover:text-white"><IconX size={16} /></button>
            </div>
            {pollOptions.map((option, index) => (
              <div key={index} className="flex items-center mb-2 gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Seçenek ${index + 1}`}
                  className="flex-1 border rounded px-3 py-2 text-sm focus:border-[var(--app-global-link-color)] outline-none"
                  style={{ backgroundColor: "var(--app-body-bg)", color: "var(--app-body-text)", borderColor: "var(--app-border)" }}
                  maxLength={25}
                />
                {pollOptions.length > 2 && (
                  <button type="button" onClick={() => removeOption(index)} className="text-red-500 hover:text-red-400">
                    <IconX size={18} />
                  </button>
                )}
              </div>
            ))}
            {pollOptions.length < 4 && (
              <button
                type="button"
                onClick={addOption}
                className="flex items-center text-sm mt-2 hover:underline"
                style={{ color: "var(--app-global-link-color)" }}
              >
                <IconPlus size={16} className="mr-1" /> Seçenek Ekle
              </button>
            )}
            <div className="mt-3 pt-3 border-t border-theme-border">
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--app-subtitle)" }}>Anket uzunluğu</label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs mb-1 block" style={{ color: "var(--app-subtitle)" }}>Gün</label>
                  <select
                    value={pollDays}
                    onChange={(e) => setPollDays(Number(e.target.value))}
                    className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-[var(--app-global-link-color)] appearance-none"
                    style={{ backgroundColor: "var(--app-body-bg)", color: "var(--app-body-text)", borderColor: "var(--app-border)" }}
                  >
                    {[...Array(8)].map((_, i) => (
                      <option key={`day-${i}`} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs mb-1 block" style={{ color: "var(--app-subtitle)" }}>Saat</label>
                  <select
                    value={pollHours}
                    onChange={(e) => setPollHours(Number(e.target.value))}
                    className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-[var(--app-global-link-color)] appearance-none"
                    style={{ backgroundColor: "var(--app-body-bg)", color: "var(--app-body-text)", borderColor: "var(--app-border)" }}
                  >
                    {[...Array(24)].map((_, i) => (
                      <option key={`hour-${i}`} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs mb-1 block" style={{ color: "var(--app-subtitle)" }}>Dakika</label>
                  <select
                    value={pollMinutes}
                    onChange={(e) => setPollMinutes(Number(e.target.value))}
                    className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-[var(--app-global-link-color)] appearance-none"
                    style={{ backgroundColor: "var(--app-body-bg)", color: "var(--app-body-text)", borderColor: "var(--app-border)" }}
                  >
                    {[...Array(60)].map((_, i) => (
                      <option key={`min-${i}`} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-3 text-red-500 text-sm">{error}</div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <label htmlFor={photoUploadId} className="cursor-pointer hover:opacity-80" style={{ color: 'var(--app-global-link-color)' }}>
              <IconPhoto className="h-4 w-4 md:h-5 md:w-5" />
              <span className="sr-only">Fotoğraf ekle</span>
              <input
                id={photoUploadId}
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
              className="cursor-pointer hover:opacity-80 ml-2 md:ml-3" style={{ color: 'var(--app-global-link-color)' }}
              onClick={toggleGifPicker}
              data-gif-button
              aria-label="GIF ekle"
              ref={gifButtonRef}
            >
              <IconGif className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            <button
              type="button"
              className="hidden md:block cursor-pointer hover:opacity-80 ml-2 md:ml-3" style={{ color: 'var(--app-global-link-color)' }}
              onClick={toggleEmojiPicker}
              data-emoji-button
              aria-label="Emoji ekle"
              ref={emojiButtonRef}
            >
              <IconMoodSmile className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            <button
              type="button"
              className="cursor-pointer hover:opacity-80 ml-2 md:ml-3" style={{ color: 'var(--app-global-link-color)' }}
              onClick={togglePoll}
              aria-label="Anket ekle"
            >
              <IconChartBar className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            <div className="mx-2 md:mx-3 h-6 border-l border-gray-300"></div>

            {/* Yanıt veya Alıntı değilse anonim butonu göster */}
            {(!isReply && !quotedPostId) && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={anonymousId}
                  checked={isAnonymous}
                  onChange={() => setIsAnonymous(!isAnonymous)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <label htmlFor={anonymousId} className="ml-2 text-xs md:text-sm" style={{ color: "var(--app-subtitle)" }}>
                  Anonim olarak paylaş
                </label>
              </div>
            )}
          </div>

          <button
            type="submit"
            style={{ backgroundColor: 'var(--app-global-link-color)', color: 'var(--app-body-text)', border: 'none' }}
            className={`px-3 py-1.5 text-sm rounded-full font-bold ${isLoading
              ? "opacity-50 cursor-not-allowed"
              : "hover:opacity-90"
              }`}
            disabled={isLoading}
          >
            {isLoading ? "Paylaşılıyor..." : (submitButtonText ? submitButtonText : (isReply ? "Yanıtla" : "Paylaş"))}
          </button>
        </div>

        {/* Emoji Picker */}
        {
          showEmojiPicker && (
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
          )
        }

        {/* GIF Picker */}
        {
          showGifPicker && (
            <div
              ref={gifPickerRef}
              className="absolute top-10 left-0 z-50 shadow-lg rounded-lg"
              style={{ width: '320px' }}
            >
              <ErrorBoundary fallback={<div className="p-4 text-center text-gray-500">GIF yüklenemedi. API anahtarını kontrol edin.</div>}>
                <GifPicker
                  tenorApiKey={process.env.NEXT_PUBLIC_TENOR_API_KEY || "LIVDSRZULELA"}
                  clientKey="riskbudur_web"
                  onGifClick={handleGifClick}
                  width={320}
                  height={450}
                />
              </ErrorBoundary>
            </div>
          )
        }
      </form >
    </div >
  );
}