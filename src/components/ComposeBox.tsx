"use client";

import { useRouter } from "next/navigation";

import { useState, useRef, useEffect, useId } from "react";
import { EnrichedPost } from "@/types/post";
import { postApi } from "@/lib/api";
import { IconPhoto, IconGif, IconMoodSmile, IconX, IconPlayerPlay, IconChartBar, IconPlus, IconMinus, IconGhost, IconGhostFilled } from "@tabler/icons-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import GifPicker, { TenorImage, Theme } from 'gif-picker-react';
import ErrorBoundary from './ErrorBoundary';
import MentionList from "./MentionList";
import { getCaretCoordinates } from "@/lib/caret";

interface ComposeBoxProps {
  onPostCreated?: (post: EnrichedPost) => void;
  isReply?: boolean;
  postId?: string; // Parent post ID for replies
  quotedPostId?: string; // Post ID for quotes
  placeholder?: string;
  submitButtonText?: string;
  onCancel?: () => void;
  className?: string;
  isMobileFullscreen?: boolean; // Mobile tam ekran modunda mı
}

export default function ComposeBox({
  onPostCreated,
  isReply = false,
  postId,
  quotedPostId,
  placeholder = "Ne düşünüyorsun?",
  submitButtonText,
  onCancel,
  className,
  isMobileFullscreen = false
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

  // Mention State
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [allowAnonymous, setAllowAnonymous] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const gifPickerRef = useRef<HTMLDivElement>(null);
  const gifButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to correctly calculate scrollHeight (shrinking)
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [content]);

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
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [content]);

  // Fetch settings to check anonymous posting capability
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/settings", {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const settings = await res.json();
          if (settings["enable_anonymous_posting"] === "false") {
            setAllowAnonymous(false);
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

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
          ...postData,
          quotedPostId,
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
      // router.refresh(); // Removed: Client side update via onPostCreated is enough for immediate feedback
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

  // URL length calculation helper
  const calculateLength = (text: string) => {
    // Regex to find URLs
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const urls = text.match(urlRegex) || [];

    // Remove URLs from text to count remaining characters
    let remainingText = text.replace(urlRegex, "");

    // Calculate total: remaining text length + (number of URLs * 23)
    return remainingText.length + (urls.length * 23);
  };

  const MAX_CHARS = 360;
  const currentLength = calculateLength(content);
  const isOverLimit = currentLength > MAX_CHARS;
  const remainingChars = MAX_CHARS - currentLength;

  const handleMentionSelect = (user: { nickname: string }) => {
    if (mentionQuery === null || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const value = content;
    const selectionEnd = textarea.selectionEnd;

    // Find the @ before cursor
    const textBeforeCursor = value.slice(0, selectionEnd);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const prefix = value.slice(0, lastAtIndex);
      const suffix = value.slice(selectionEnd);
      const newContent = `${prefix}@${user.nickname} ${suffix}`;

      setContent(newContent);
      setMentionQuery(null);

      // Calculate new cursor position
      const newCursorPos = lastAtIndex + user.nickname.length + 2; // +2 for @ and space

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 10);
    }
  };

  return (
    <div className={`composebox text-white w-full ${(isReply || quotedPostId) ? 'bg-transparent' : 'bg-black py-[11px] px-[13px] border-t border-b border-theme-border lg:w-[598px]'} ${className || ''}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="mb-1">
          {/* Standard Textarea */}
          <div className="w-full relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                const newContent = e.target.value;
                // Only allow update if length is within limit or if deleting (length decreasing)
                // We check if the NEW length is <= MAX_CHARS.
                // However, user might be trying to paste a long text. We should ideally truncate or block.
                // Request said "Limit dolduğunda bana yazdırmamalı" (Don't let me type).
                // But pasting might be tricky if we don't truncate. 
                // Let's check new length. 
                // If user is adding text and it exceeds, block. 
                // If user is deleting, allow.

                const newLength = calculateLength(newContent);
                const oldLength = calculateLength(content);

                if (newLength <= MAX_CHARS || newLength < oldLength) {
                  setContent(newContent);
                  if (newContent.trim() !== "") {
                    setIsTextareaActive(true);
                  }

                  // Mention detection
                  const cursor = e.target.selectionEnd;
                  const textBeforeCursor = newContent.slice(0, cursor);
                  const lastAtIndex = textBeforeCursor.lastIndexOf("@");

                  if (lastAtIndex !== -1) {
                    const query = textBeforeCursor.slice(lastAtIndex + 1);
                    // Check if query is valid (no spaces, acceptable length)
                    // Also check if the @ is preceded by space or is start of line (optional but good practice)
                    const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : " ";
                    const isValidPredecessor = /\s/.test(charBeforeAt);

                    if (isValidPredecessor && !/\s/.test(query) && query.length < 20) {
                      setMentionQuery(query);

                      const coords = getCaretCoordinates(e.target, lastAtIndex + 1);
                      // Adjust for scrollTop if needed, though getCaretCoordinates usually returns relative to top-left of element content box.
                      // We need to add padding/border. The utility does add border.
                      // We also need to subtract scrollTop of the textarea
                      const top = coords.top - e.target.scrollTop + 24; // +24 for line height approx/gap

                      setMentionPosition({ top, left: coords.left });
                    } else {
                      setMentionQuery(null);
                    }
                  } else {
                    setMentionQuery(null);
                  }
                }
              }}
              onKeyDown={(e) => {
                // Ctrl + Enter or Cmd + Enter to submit
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              onClick={() => {
                setIsTextareaActive(true);
                setMentionQuery(null); // Click closes suggestion usually, or we could re-eval? 
                // Better to keep it simple: clicking away or moving cursor arbitrarily might break context so closing is safe.
                // Actually, if they click back into the @mention string, maybe we should re-open?
                // For now let's just keep it simple. If they want to trigger it again they can retype or we can add complex cursor tracking later.
              }}
              placeholder={isAnonymous ? "Anonim olarak paylaşacaksınız..." : placeholder}
              disabled={isLoading}
              style={{ color: "var(--app-body-text)" }}
              className={`w-full bg-transparent text-lg resize-none outline-none overflow-hidden placeholder-[var(--app-subtitle)] ${isTextareaActive ? 'min-h-[80px]' : 'min-h-[40px]'}`}
              onPaste={(e) => {
                // ... logic for images ... 
                if (e.clipboardData && e.clipboardData.items) {
                  const items = e.clipboardData.items;
                  for (let i = 0; i < items.length; i++) {
                    if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
                      // ... existing image paste logic ...
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
                // Handle text paste truncation? 
                // If standard onChange handles it, it will just block the paste if it exceeds. 
                // Better UX might be to truncate the pasted text to fit, but user asked "Do not let me type".
                // Blocking the paste entirely if it overflows is "not letting type/input".
              }}
            />
            {/* Character Counter Removed from here */}
            {mentionQuery !== null && (
              <div style={{
                position: 'absolute',
                top: mentionPosition.top,
                left: isMobileFullscreen ? '50%' : mentionPosition.left,
                transform: isMobileFullscreen ? 'translateX(-50%)' : 'none',
                zIndex: 100,
                width: 'max-content'
              }}>
                <MentionList
                  query={mentionQuery}
                  onSelect={handleMentionSelect}
                  onClose={() => setMentionQuery(null)}
                />
              </div>
            )}
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
          <div className="flex items-center gap-2 md:gap-3">
            {/* Yanıt veya Alıntı değilse VE anonim paylaşıma izin veriliyorsa anonim butonu göster */}
            {(!isReply && !quotedPostId && allowAnonymous) && (
              <button
                type="button"
                className={`cursor-pointer hover:opacity-80 ${isAnonymous ? 'text-white' : ''}`}
                style={{ color: isAnonymous ? 'white' : 'var(--app-global-link-color)' }}
                onClick={() => setIsAnonymous(!isAnonymous)}
                aria-label="Anonim mod"
                title={isAnonymous ? "Anonim modu kapat" : "Anonim modu aç"}
              >
                {isAnonymous ? (
                  <IconGhostFilled className="w-[20px] h-[20px] md:w-[23px] md:h-[23px] text-[#1DCD9F]" />
                ) : (
                  <IconGhost className="w-[20px] h-[20px] md:w-[23px] md:h-[23px]" />
                )}
              </button>
            )}

            <label htmlFor={photoUploadId} className={`cursor-pointer hover:opacity-80`} style={{ color: 'var(--app-global-link-color)' }}>
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
              className="cursor-pointer hover:opacity-80" style={{ color: 'var(--app-global-link-color)' }}
              onClick={toggleGifPicker}
              data-gif-button
              aria-label="GIF ekle"
              ref={gifButtonRef}
            >
              <IconGif className="w-[25px] h-[25px]" />
            </button>

            <button
              type="button"
              className="hidden md:block cursor-pointer hover:opacity-80" style={{ color: 'var(--app-global-link-color)' }}
              onClick={toggleEmojiPicker}
              data-emoji-button
              aria-label="Emoji ekle"
              ref={emojiButtonRef}
            >
              <IconMoodSmile className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            <button
              type="button"
              className="cursor-pointer hover:opacity-80" style={{ color: 'var(--app-global-link-color)' }}
              onClick={togglePoll}
              aria-label="Anket ekle"
            >
              <IconChartBar className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Character Counter */}
            {(isTextareaActive || content.length > 0) && (
              <div className={`text-xs font-medium ${remainingChars < 20 ? 'text-red-500' : 'text-gray-500'}`}>
                {remainingChars}
              </div>
            )}

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
            isMobileFullscreen ? (
              // Mobil Tam Ekran GIF Picker
              <div className="fixed inset-0 z-[100] bg-[var(--app-body-bg)] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "var(--app-border)" }}>
                  <div className="flex items-center gap-2">
                    <img
                      src="/riskbudurlogo.png?v=2"
                      alt="riskbudur"
                      className="h-5"
                    />
                    <span className="text-[15px] font-medium" style={{ color: "var(--app-body-text)" }}>
                      GIF Seç
                    </span>
                  </div>
                  <button
                    onClick={() => setShowGifPicker(false)}
                    className="p-1.5 rounded-full transition-colors"
                    style={{ color: "var(--app-subtitle)" }}
                  >
                    <IconX className="w-5 h-5" />
                  </button>
                </div>
                {/* GIF Picker Content */}
                <div className="flex-1 overflow-hidden">
                  <style>{`
                    .GifPickerReact.gpr-dark-theme {
                        --gpr-bg-color: var(--app-body-bg) !important;
                        --gpr-main-container-bg: var(--app-body-bg) !important;
                        --gpr-search-input-bg-color: var(--app-surface) !important;
                        --gpr-picker-border-color: transparent !important;
                        --gpr-highlight-color: var(--app-accent) !important;
                        border-radius: 0 !important;
                        border: none !important;
                    }
                    .GifPickerReact.gpr-dark-theme > div:first-child {
                        border-radius: 0 !important;
                        border: none !important;
                        border-top: none !important;
                    }
                    .GifPickerReact .gpr-search-container {
                        border-radius: 0 !important;
                        border: none !important;
                    }
                  `}</style>
                  <ErrorBoundary fallback={<div className="p-4 text-center" style={{ color: "var(--app-subtitle)" }}>GIF yüklenemedi.</div>}>
                    <GifPicker
                      tenorApiKey={process.env.NEXT_PUBLIC_TENOR_API_KEY || ""}
                      clientKey="riskbudur_web"
                      onGifClick={handleGifClick}
                      width={typeof window !== 'undefined' ? window.innerWidth : 400}
                      height={typeof window !== 'undefined' ? window.innerHeight - 60 : 500}
                      theme={Theme.DARK}
                    />
                  </ErrorBoundary>
                </div>
              </div>
            ) : (
              // Desktop Inline GIF Picker
              <div
                ref={gifPickerRef}
                className="absolute top-10 left-0 z-50 shadow-lg rounded-lg overflow-hidden"
                style={{
                  width: '400px',
                  backgroundColor: 'var(--app-body-bg)',
                } as React.CSSProperties}
              >
                <style>{`
                  .GifPickerReact.gpr-dark-theme {
                      --gpr-bg-color: var(--app-body-bg) !important;
                      --gpr-main-container-bg: var(--app-body-bg) !important;
                      --gpr-search-input-bg-color: var(--app-surface) !important;
                      --gpr-picker-border-color: var(--app-border) !important;
                      --gpr-highlight-color: var(--app-accent) !important;
                  }
                `}</style>
                <ErrorBoundary fallback={<div className="p-4 text-center text-gray-500">GIF yüklenemedi. API anahtarını kontrol edin.</div>}>
                  <GifPicker
                    tenorApiKey={process.env.NEXT_PUBLIC_TENOR_API_KEY || ""}
                    clientKey="riskbudur_web"
                    onGifClick={handleGifClick}
                    width={400}
                    height={450}
                    theme={Theme.DARK}
                  />
                </ErrorBoundary>
              </div>
            )
          )
        }
      </form >
    </div >
  );
}