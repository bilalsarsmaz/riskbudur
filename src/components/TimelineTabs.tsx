// @ts-nocheck

"use client";

import { useState, useEffect, useRef } from "react";

type TimelineType = "all" | "following";

interface TimelineTabsProps {
  activeTab: TimelineType;
  onTabChange: (tab: TimelineType) => void;
}

import { useTranslation } from "@/components/TranslationProvider";

export default function TimelineTabs({ activeTab, onTabChange }: TimelineTabsProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // iOS bounce fix & threshold
      if (currentScrollY < 10) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false); // Scroll down -> hide
      } else {
        setIsVisible(true); // Scroll up -> show
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`timeline-tabs w-full bg-theme-bg/80 backdrop-blur-md border-b border-theme-border sticky top-14 lg:top-0 z-20 h-[60px] flex transition-transform duration-300 ease-in-out ${!isVisible ? '-translate-y-[120%]' : 'translate-y-0'
        } lg:translate-y-0`}
    >
      <div className="flex w-full h-full">
        <button
          onClick={() => onTabChange("all")}
          className={`flex-1 h-full flex items-center justify-center relative transition-colors ${activeTab === "all"
            ? "text-[var(--app-global-link-color)] font-bold"
            : "text-theme-text font-medium"
            }`}
        >
          {t('feed.all', 'Herkes')}
          {activeTab === "all" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--app-global-link-color)] rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => onTabChange("following")}
          className={`flex-1 h-full flex items-center justify-center relative transition-colors ${activeTab === "following"
            ? "text-[var(--app-global-link-color)] font-bold"
            : "text-theme-text font-medium"
            }`}
        >
          {t('feed.following', 'Kovaladıklarım')}
          {activeTab === "following" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--app-global-link-color)] rounded-t-full"></div>
          )}
        </button>
      </div>
    </div>
  );
}
