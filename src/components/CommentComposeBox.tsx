import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { postApi } from "@/lib/api";
import { PhotoIcon, FaceSmileIcon, XMarkIcon, PlayIcon } from "@heroicons/react/24/outline";
import { GifIcon } from "@heroicons/react/24/solid";

interface CommentComposeBoxProps {
  postId: string;
  onCommentAdded: (comment?: any) => void;
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
  const router = useRouter();
  const [content, setContent] = useState("");
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

  // URL detection and link preview fetch (copied from ComposeBox)
  useEffect(() => {
    const detectAndFetchLinkPreview = async () => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = content.match(urlRegex);

      if (!urls || urls.length === 0) return;

      const url = urls[0];
      // riskbudur.net/username/status/[id] linkleri için önizleme yapma
      if (url.toLowerCase().includes('riskbudur.net') && url.toLowerCase().includes('/status/')) {
        setLinkPreview(null);
        return;
      }

      if (linkPreview && linkPreview.url === url) return;
      if (previewUrl && !previewUrl.startsWith('http')) return;

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
            if (data.type === 'youtube') {
              setContent(prev => prev.replace(url, '').trim());
            }
          }
        }
      } catch (error) {
        console.error('Link preview error:', error);
      } finally {
        setLinkPreviewLoading(false);
      }
    };

    const timeoutId = setTimeout(detectAndFetchLinkPreview, 500);
    return () => clearTimeout(timeoutId);
  }, [content, linkPreview, previewUrl]);

  const removeLinkPreview = () => {
    setLinkPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && !previewUrl) return;

    setIsLoading(true);
    setError("");

    try {
      if (onSubmit) {
        await onSubmit(content.trim());
        // router.refresh();
      } else {
        const response = await postApi("/comments", {
          postId,
          content: content,
          imageUrl: previewUrl || undefined,
          mediaUrl: previewUrl || undefined,
          linkPreview: linkPreview || undefined
        });
        setContent("");
        setPreviewUrl(null);
        onCommentAdded(response);
        // router.refresh();
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
          <div className="w-full relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Yanıtını yaz..."
              className="w-full bg-transparent placeholder-gray-500 resize-none outline-none min-h-[80px]"
              style={{ color: "var(--app-body-text)" }}
              onPaste={(e) => {
                if (e.clipboardData && e.clipboardData.items) {
                  const items = e.clipboardData.items;
                  for (let i = 0; i < items.length; i++) {
                    if (items[i].kind === 'file' && items[i].type.startsWith('image/')) {
                      const file = items[i].getAsFile();
                      if (file) {
                        e.preventDefault();
                        const reader = new FileReader();
                        reader.onloadend = () => {
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

          {/* Link Preview UI */}
          {linkPreviewLoading && (
            <div className="mt-2 p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center text-gray-500 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-400 mr-2"></div>
                Link önizlemesi yükleniyor...
              </div>
            </div>
          )}

          {linkPreview && !linkPreviewLoading && !previewUrl && (
            <div className="mt-2 relative border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full p-1 z-10 hover:bg-opacity-90"
                onClick={removeLinkPreview}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>

              {linkPreview.type === 'youtube' && linkPreview.thumbnail && (
                <div className="flex">
                  <div className="relative flex-shrink-0" style={{ width: '100px', height: '100px' }}>
                    <img
                      src={linkPreview.thumbnail}
                      alt={linkPreview.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-60 rounded-full p-1.5">
                        <PlayIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center p-2 flex-1 min-w-0 bg-gray-50">
                    <div className="text-xs text-gray-500 mb-0.5">{linkPreview.siteName}</div>
                    <div className="text-sm font-medium text-gray-900 line-clamp-2 mb-0.5">{linkPreview.title}</div>
                  </div>
                </div>
              )}

              {linkPreview.type !== 'youtube' && (
                <div className="flex">
                  {linkPreview.thumbnail && (
                    <div className="w-24 h-24 flex-shrink-0">
                      <img src={linkPreview.thumbnail} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-2 flex-1 bg-gray-50">
                    <div className="text-xs text-gray-500">{linkPreview.siteName}</div>
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">{linkPreview.title}</div>
                  </div>
                </div>
              )}
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
                style={{ color: "var(--app-global-link-color)" }}
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
                style={{ color: "var(--app-global-link-color)" }}
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
                style={{ color: "var(--app-global-link-color)" }}
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
                className="px-3 py-1.5 mr-2 hover:bg-white/10 rounded-lg text-sm transition-colors"
                style={{ color: "var(--app-body-text)" }}
                disabled={isLoading}
              >
                İptal
              </button>
              <button
                type="submit"
                className={`px-4 py-1.5 rounded-full !text-black font-medium text-sm ${isLoading || (!content.trim() && !previewUrl)
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-90"
                  }`}
                disabled={isLoading || (!content.trim() && !previewUrl)}
                style={{ backgroundColor: "var(--app-global-link-color)" }}
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
