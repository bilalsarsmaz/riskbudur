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
    <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-black border-b border-[#222222] z-50 flex items-center justify-between px-4">
      <Link href="/home" className="flex items-center">
        <span className="text-xl font-bold text-[#1DCD9F]">ultraswall</span>
      </Link>

      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 rounded-full hover:bg-[#151515] transition-colors"
        aria-label="Menü"
      >
        <Bars3Icon className="w-6 h-6 text-gray-200" />
      </button>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute top-14 right-0 w-48 bg-black border z-50 border-[#222222] rounded-lg shadow-lg py-2"
        >
          {[
            { href: "/home", label: "Ana Sayfa" },
            { href: "/explore", label: "Keşfet" },
            { href: "/notifications", label: "Bildirimler" },
            { href: "/messages", label: "Mesajlar" },
            { href: "/profile", label: "Profil" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 hover:bg-[#151515] text-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
