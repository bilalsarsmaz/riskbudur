"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Announcement {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
}

interface AnnouncementsResponse {
  announcements: Announcement[];
}

interface AnnouncementsProps {
  onVisibilityChange?: (visible: boolean) => void;
}

// SessionStorage anahtarı
const ANNOUNCEMENT_HIDDEN_KEY = "announcement_hidden";

export default function Announcements({ onVisibilityChange }: AnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // Bileşen yüklendiğinde sessionStorage'dan duyuru görünürlük durumunu kontrol et
  useEffect(() => {
    // Client tarafında mı kontrol et
    if (typeof window !== "undefined") {
      const isHidden = sessionStorage.getItem(ANNOUNCEMENT_HIDDEN_KEY) === "true";
      if (isHidden) {
        setIsVisible(false);
      }
    }
  }, []);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await fetchApi("/announcements") as AnnouncementsResponse;
        if (data.announcements && data.announcements.length > 0) {
          setAnnouncements(data.announcements);
        } else {
          // API'den veri gelmezse örnek duyuru göster
          setAnnouncements([
            {
              id: "1",
              content: "Nown platformuna hoş geldiniz! Burada düşüncelerinizi özgürce paylaşabilirsiniz.",
              createdAt: new Date().toISOString(),
              authorName: "Admin"
            }
          ]);
        }
      } catch (error) {
        console.error("Duyurular yüklenirken hata oluştu:", error);
        // Hata durumunda örnek duyuru göster
        setAnnouncements([
          {
            id: "1",
            content: "Nown platformuna hoş geldiniz! Burada düşüncelerinizi özgürce paylaşabilirsiniz.",
            createdAt: new Date().toISOString(),
            authorName: "Admin"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  // Görünürlük değiştiğinde üst bileşeni bilgilendir
  useEffect(() => {
    onVisibilityChange?.(isVisible);
  }, [isVisible, onVisibilityChange]);

  // Birden fazla duyuru varsa otomatik kaydırma
  useEffect(() => {
    if (announcements.length <= 1 || !isVisible) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === announcements.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000); // 8 saniyede bir değiştir
    
    return () => clearInterval(interval);
  }, [announcements.length, isVisible]);

  // Duyuruyu kapat
  const handleClose = () => {
    // SessionStorage'a duyurunun kapatıldığını kaydet
    if (typeof window !== "undefined") {
      sessionStorage.setItem(ANNOUNCEMENT_HIDDEN_KEY, "true");
    }
    setIsVisible(false);
  };

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-center py-2">
          <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (announcements.length === 0 || !isVisible) {
    return null;
  }

  return (
    <div className="rounded-lg p-4 relative" style={{backgroundColor: "#0a0a0a", border: "1px solid", borderColor: "oklch(0.71 0.24 43.55)"}}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold" style={{color: "#d9dadd"}}>DUYURU</h3>
        <button 
          onClick={handleClose}
          className="text-orange-500 hover:text-blue-700"
          aria-label="Duyuruyu kapat"
          title="Duyuruyu kapat"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div style={{color: "#d9dadd"}}>
        {announcements[currentIndex].content}
      </div>
      
      <div className="mt-2 text-xs text-blue-600 flex justify-between items-center">
        <span>{announcements[currentIndex].authorName}</span>
        {announcements.length > 1 && (
          <div className="flex space-x-1">
            {announcements.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-orange-500" : "bg-orange-400"
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Duyuru ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 