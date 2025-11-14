"use client";

import { useState } from "react";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { CheckBadgeIcon as CheckBadgeIconOutline } from "@heroicons/react/24/outline";

export default function ProfileDesignPage() {
  const [activeTab, setActiveTab] = useState("posts");

  // Örnek profil verisi
  const profile = {
    username: "johndoe",
    fullName: "John Doe",
    bio: "👨‍💻 Software Developer | 🌱 Learning enthusiast | 🎮 Gamer",
    website: "https://johndoe.dev",
    joinDate: "Mart 2024",
    following: 234,
    followers: 567,
    coverImage: "https://picsum.photos/800/200",
    profileImage: "https://picsum.photos/200",
    hasBlueTick: true,
    hasOrangeTick: true
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-center">
        {/* Sol Sidebar - 260px */}
        <div className="hidden lg:block w-[260px] shrink-0">
          <LeftSidebar />
        </div>

        {/* Orta Bölüm - 600px */}
        <div className="w-full max-w-[600px] flex flex-col">
          {/* Profil Bölümü */}
          <div className="bg-white border border-gray-200 rounded-t-lg">
            {/* Profil Kapak Fotoğrafı */}
            <div className="relative w-full h-[200px] rounded-t-lg overflow-hidden">
              <img 
                src={profile.coverImage} 
                alt="Kapak fotoğrafı" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Profil Bilgileri */}
            <div className="relative px-4">
              {/* Profil Fotoğrafı */}
              <div className="absolute -top-16 left-4">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden">
                  <img 
                    src={profile.profileImage} 
                    alt={profile.fullName} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Profil Düzenleme Butonu */}
              <div className="flex justify-end pt-3">
                <button className="px-4 py-2 border border-gray-300 rounded-full font-medium hover:bg-gray-50 transition-colors">
                  Profili Düzenle
                </button>
              </div>

              {/* İsim ve Kullanıcı Adı */}
              <div className="mt-4">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">{profile.fullName}</h1>
                  {profile.hasBlueTick && (
                    <CheckBadgeIcon className="w-5 h-5 ml-1 text-blue-500" />
                  )}
                  {profile.hasOrangeTick && (
                    <CheckBadgeIconOutline className="w-5 h-5 ml-1 text-orange-500" />
                  )}
                </div>
                <p className="text-gray-500">@{profile.username}</p>
              </div>

              {/* Bio */}
              <div className="mt-3 text-gray-800">
                <p>{profile.bio}</p>
              </div>

              {/* Website, Katılma Tarihi */}
              <div className="mt-3 space-y-1">
                <div className="flex items-center text-gray-500">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <a href={profile.website} className="text-blue-500 hover:underline">{profile.website}</a>
                </div>
                <div className="flex items-center text-gray-500">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Katılma tarihi: {profile.joinDate}</span>
                </div>
              </div>

              {/* Takip Bilgileri */}
              <div className="flex items-center mt-4 space-x-4">
                <div className="flex items-center">
                  <span className="font-bold text-gray-900">{profile.following}</span>
                  <span className="ml-1 text-gray-500">Takip edilen</span>
                </div>
                <div className="flex items-center">
                  <span className="font-bold text-gray-900">{profile.followers}</span>
                  <span className="ml-1 text-gray-500">Takipçi</span>
                </div>
              </div>

              {/* Tab Menüsü */}
              <div className="flex border-b border-gray-200 mt-4">
                <button 
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    activeTab === "posts" 
                      ? "text-gray-900 border-b-2 border-orange-500" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("posts")}
                >
                  Gönderiler
                </button>
                <button 
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    activeTab === "replies" 
                      ? "text-gray-900 border-b-2 border-orange-500" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("replies")}
                >
                  Yanıtlar
                </button>
                <button 
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    activeTab === "media" 
                      ? "text-gray-900 border-b-2 border-orange-500" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("media")}
                >
                  Medya
                </button>
              </div>
            </div>
          </div>

          {/* Tab İçerikleri */}
          <div className="bg-white border-x border-b border-gray-200">
            {activeTab === "posts" && (
              <div className="divide-y divide-gray-200">
                {/* Örnek Post */}
                <div className="p-4">
                  <p className="text-gray-600">Henüz gönderi yok.</p>
                </div>
              </div>
            )}

            {activeTab === "replies" && (
              <div className="divide-y divide-gray-200">
                {/* Örnek Yanıt */}
                <div className="p-4">
                  <p className="text-gray-600">Henüz yanıt yok.</p>
                </div>
              </div>
            )}

            {activeTab === "media" && (
              <div className="p-4">
                {/* Örnek Medya Grid */}
                <div className="grid grid-cols-3 gap-1">
                  {/* Medya içeriği buraya gelecek */}
                  <p className="col-span-3 text-gray-600">Henüz medya paylaşımı yok.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sağ Sidebar - 300px */}
        <div className="hidden lg:block w-[300px] shrink-0 ml-[10px]">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
} 