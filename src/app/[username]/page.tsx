"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import EditProfileModal from "@/components/EditProfileModal";
import { CheckBadgeIcon, LinkIcon, CalendarIcon } from "@heroicons/react/24/solid";
import { fetchApi } from "@/lib/api";
import PostList from "@/components/PostList";

interface Profile {
  username: string;
  fullName: string;
  bio: string;
  website: string;
  joinDate: string;
  following: number;
  followers: number;
  coverImage: string | null;
  profileImage: string | null;
  hasBlueTick: boolean;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  mediaUrl?: string;
  imageUrl?: string;
  isAnonymous: boolean;
  author: {
    id: string;
    nickname: string;
    hasBlueTick: boolean;
    profileImage?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [activeTab, setActiveTab] = useState("posts");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaPosts, setMediaPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const data = await fetchApi("/users/me");
        setCurrentUser(data);
      } catch (err) {
        console.error("Mevcut kullanıcı alınamadı:", err);
      }
    };

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchApi(`/users/${username}`);
        setProfile(data);
        setError(null);
      } catch (err) {
        setError("Profil yüklenirken bir hata oluştu.");
        console.error("Profil yükleme hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPosts = async () => {
      try {
        const data = await fetchApi(`/users/${username}/posts`);
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Postlar yüklenirken hata oluştu:", err);
      }
    };

    const fetchUserMediaPosts = async () => {
      try {
        const data = await fetchApi(`/users/${username}/media`);
        setMediaPosts(data.posts || []);
      } catch (err) {
        console.error("Medya postları yüklenirken hata oluştu:", err);
      }
    };

    fetchCurrentUser();
    fetchProfile();
    fetchUserPosts();
    fetchUserMediaPosts();
  }, [username]);

  const isOwnProfile = currentUser?.nickname === username;

  const handleProfileUpdated = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center">
          <div className="w-full max-w-[600px] flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center">
          <div className="w-full max-w-[600px]">
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-red-500">{error || "Profil bulunamadı"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-center">
        <div className="hidden lg:block w-[260px] shrink-0">
          <LeftSidebar />
        </div>

        <div className="w-full max-w-[600px]">
          <div className="border border-[#222222] rounded-t-lg overflow-hidden" style={{backgroundColor: '#0a0a0a'}}>
            {profile.coverImage && (
              <div className="w-full h-48">
                <img
                  src={profile.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="relative -mt-16">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.username}
                      className="w-32 h-32 rounded-full border-4 border-[#0a0a0a] object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-[#0a0a0a] bg-gray-300 flex items-center justify-center text-gray-600 text-4xl">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => isOwnProfile ? setIsEditModalOpen(true) : null}
                  className="px-4 py-2 rounded-full font-medium border border-[#222222] hover:bg-gray-800"
                >
                  {isOwnProfile ? "Profili Düzenle" : "Takip Et"}
                </button>
              </div>

              <div className="mt-4">
                <div className="flex items-center mb-1">
                  <h1 className="text-2xl font-bold">{profile.fullName}</h1>
                  {profile.hasBlueTick && (
                    <CheckBadgeIcon className="w-6 h-6 text-blue-500 ml-2" />
                  )}
                </div>
                <p className="text-gray-500">@{profile.username}</p>
                
                {profile.bio && <p className="mt-2">{profile.bio}</p>}
                
                <div className="flex items-center gap-4 mt-2">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center hover:underline"
                      style={{color: 'oklch(0.71 0.24 43.55)'}}
                    >
                      <LinkIcon className="w-4 h-4 mr-1" />
                      {profile.website}
                    </a>
                  )}
                  <div className="flex items-center" style={{color: "#6e767d"}}>
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    Katılma tarihi: {profile.joinDate}
                  </div>
                </div>

                <div className="flex space-x-4 mt-2">
                  <span>
                    <strong>{profile.following}</strong> <span style={{color: "#6e767d"}}>Takip Edilen</span>
                  </span>
                  <span>
                    <strong>{profile.followers}</strong> <span style={{color: "#6e767d"}}>Takipçi</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex border-t border-[#222222]">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex-1 py-4 text-center font-medium ${
                  activeTab === "posts"
                    ? "border-b-2 border-orange-500"
                    : ""
                }`}
              >
                Gönderiler
              </button>
              <button
                onClick={() => setActiveTab("replies")}
                className={`flex-1 py-4 text-center font-medium ${
                  activeTab === "replies"
                    ? "border-b-2 border-orange-500"
                    : ""
                }`}
              >
                Yanıtlar
              </button>
              <button
                onClick={() => setActiveTab("media")}
                className={`flex-1 py-4 text-center font-medium ${
                  activeTab === "media"
                    ? "border-b-2 border-orange-500"
                    : ""
                }`}
              >
                Medya
              </button>
            </div>
          </div>

          <div className="rounded-b-lg overflow-hidden">
            {activeTab === "posts" && (
              posts.length > 0 ? (
                <PostList posts={posts} />
              ) : (
                <div className="p-4 border-x border-b border-[#222222]" style={{backgroundColor: '#0a0a0a'}}>
                  <p style={{color: "#6e767d"}}>Henüz gönderi yok.</p>
                </div>
              )
            )}

            {activeTab === "replies" && (
              <div className="p-4 border-x border-b border-[#222222]" style={{backgroundColor: '#0a0a0a'}}>
                <p style={{color: "#6e767d"}}>Henüz yanıt yok.</p>
              </div>
            )}

            {activeTab === "media" && (
              mediaPosts.length > 0 ? (
                <PostList posts={mediaPosts} />
              ) : (
                <div className="p-4 border-x border-b border-[#222222]" style={{backgroundColor: '#0a0a0a'}}>
                  <p style={{color: "#6e767d"}}>Henüz medya paylaşımı yok.</p>
                </div>
              )
            )}
          </div>
        </div>

        <div className="hidden lg:block w-[300px] shrink-0 ml-[10px]">
          <RightSidebar />
        </div>
      </div>

      {isOwnProfile && profile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentProfile={{
            fullName: profile.fullName,
            bio: profile.bio || "",
            website: profile.website || "",
            profileImage: profile.profileImage,
            coverImage: profile.coverImage,
          }}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
}
