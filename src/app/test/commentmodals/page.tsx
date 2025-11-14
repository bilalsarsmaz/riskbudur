"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import MinimalCommentModal from "@/components/MinimalCommentModal";

// Ana sayfa
export default function CommentModalsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Link href="/test/postdesign" className="mr-4 text-blue-600 hover:text-blue-800 flex items-center">
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          <span>Post Tasarımlarına Dön</span>
        </Link>
        <h1 className="text-2xl font-bold">Yorum Modalı Tasarımları</h1>
      </div>
      
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Yeni Geliştirilen Minimal Modal</h2>
        <p className="mb-4 text-gray-600">
          ComposeBox bileşeninin tüm özelliklerini içeren yeni minimal yorum modalı:
        </p>
      </div>
      
      {/* Yeni Minimal Comment Modal */}
      <MinimalCommentModal 
        post={{
          id: "example-post-id",
          content: "Bu yeni geliştirdiğimiz minimal yorum modalı için örnek bir post içeriğidir. ComposeBox bileşeninin tüm özellikleri entegre edilmiştir.",
          username: "testuser",
          createdAt: new Date().toISOString(),
          isAnonymous: false
        }}
        isOpen={true}
        onClose={() => {}}
        onCommentAdded={() => {
          alert("Yorum başarıyla eklendi!");
        }}
      />
      
    </div>
  );
} 