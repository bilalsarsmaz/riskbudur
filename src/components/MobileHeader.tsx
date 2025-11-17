"use client";

import { useState, useEffect, useRef } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#2a2a2a] z-50 flex items-center justify-between px-4">
      <Link href="/home" className="flex items-center">
        <span className="text-xl font-bold text-blue-500">ultraswall</span>
      </Link>

      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Menü"
      >
        <Bars3Icon className="w-6 h-6 text-gray-700" />
      </button>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute top-14 right-0 w-48 bg-white border border-[#2a2a2a] rounded-lg shadow-lg py-2"
        >
          <Link
            href="/home"
            className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            Ana Sayfa
          </Link>
          <Link
            href="/explore"
            className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            Keşfet
          </Link>
          <Link
            href="/notifications"
            className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            Bildirimler
          </Link>
          <Link
            href="/messages"
            className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            Mesajlar
          </Link>
          <Link
            href="/profile"
            className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            Profil
          </Link>
        </div>
      )}
    </header>
  );
}
