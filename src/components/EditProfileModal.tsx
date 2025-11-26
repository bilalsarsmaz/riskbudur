"use client";

import { useState, useRef } from "react";
import { XMarkIcon, CameraIcon } from "@heroicons/react/24/outline";
import { postApi } from "@/lib/api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    fullName: string;
    bio: string;
    website: string;
    location?: string;
    profileImage: string | null;
    coverImage: string | null;
  };
  onProfileUpdated: () => void;
}

// Fotoğrafı sıkıştır
const compressImage = async (file: File, maxSizeMB: number = 2): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const maxDimension = 1920;
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Sıkıştırma başarısız'));
            }
          },
          'image/jpeg',
          0.7
        );
      };
      img.onerror = () => reject(new Error('Resim yüklenemedi'));
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
  });
};

export default function EditProfileModal({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated,
}: EditProfileModalProps) {
  const [fullName, setFullName] = useState(currentProfile.fullName);
  const [bio, setBio] = useState(currentProfile.bio || "");
  const [website, setWebsite] = useState(currentProfile.website || "");
  const [location, setLocation] = useState(currentProfile.location || "");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(currentProfile.profileImage);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(currentProfile.coverImage);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMessage("Fotoğraf hazırlanıyor...");
      try {
        const compressed = await compressImage(file);
        setProfileImage(compressed);
        setProfileImagePreview(URL.createObjectURL(compressed));
        setMessage("");
      } catch (err) {
        setMessage("Fotoğraf işlenemedi.");
      }
    }
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMessage("Fotoğraf hazırlanıyor...");
      try {
        const compressed = await compressImage(file);
        setCoverImage(compressed);
        setCoverImagePreview(URL.createObjectURL(compressed));
        setMessage("");
      } catch (err) {
        setMessage("Fotoğraf işlenemedi.");
      }
    }
  };

  const removeCoverImage = () => {
    setCoverImage(null);
    setCoverImagePreview(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let profileImageUrl = null;
      let coverImageUrl = null;

      if (profileImage) {
        try {
          const formData = new FormData();
          formData.append("image", profileImage);
          const profileResult = await postApi("/users/me/profile-image", formData);
          
          if (profileResult && typeof profileResult === 'object' && 'imageUrl' in profileResult) {
            profileImageUrl = profileResult.imageUrl as string;
          }
        } catch (imgErr) {
          throw new Error("Profil fotoğrafı yüklenemedi: " + (imgErr instanceof Error ? imgErr.message : String(imgErr)));
        }
      }

      if (coverImage) {
        try {
          const formData = new FormData();
          formData.append("image", coverImage);
          const coverResult = await postApi("/users/me/cover-image", formData);
          
          if (coverResult && typeof coverResult === 'object' && 'imageUrl' in coverResult) {
            coverImageUrl = coverResult.imageUrl as string;
          }
        } catch (imgErr) {
          throw new Error("Kapak fotoğrafı yüklenemedi: " + (imgErr instanceof Error ? imgErr.message : String(imgErr)));
        }
      }

      await postApi("/users/me", {
        fullName,
        bio,
        website,
        location,
      });

      setMessage("Profil başarıyla güncellendi!");

      const storedUser = localStorage.getItem("userInfo");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.fullName = fullName;
        if (profileImageUrl) userData.profileImage = profileImageUrl;
        if (coverImageUrl) userData.coverImage = coverImageUrl;
        localStorage.setItem("userInfo", JSON.stringify(userData));
      }
      
      setTimeout(() => {
        onProfileUpdated();
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setMessage(`Profil güncellenirken bir hata oluştu: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30">
      <div
        className="w-full max-w-[600px] max-h-[90vh] rounded-2xl overflow-hidden flex flex-col bg-black border border-[#333]"
        
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#151515] rounded-full mr-4"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-xl font-bold text-white">Profili düzenle</h2>
          </div>
          <button
            onClick={() => handleSubmit()}
            disabled={loading}
            className="px-4 py-1.5 rounded-full font-bold text-black bg-white hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "..." : "Kaydet"}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Cover Image Section */}
          <div className="relative">
            <div className="w-full h-48 bg-[#333] relative">
              {coverImagePreview ? (
                <img
                  src={coverImagePreview}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#333]"></div>
              )}
              
              {/* Cover Image Buttons */}
              <div className="absolute inset-0 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="p-3 bg-black bg-opacity-60 rounded-full hover:bg-opacity-80 transition-colors"
                >
                  <CameraIcon className="w-5 h-5 text-white" />
                </button>
                {coverImagePreview && (
                  <button
                    type="button"
                    onClick={removeCoverImage}
                    className="p-3 bg-black bg-opacity-60 rounded-full hover:bg-opacity-80 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
              />
            </div>

            {/* Profile Image - Positioned at bottom of cover */}
            <div className="absolute left-4" style={{ bottom: "-48px" }}>
              <div className="relative">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-28 h-28 rounded-full border-4 border-black object-cover"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full border-4 border-black bg-[#333] flex items-center justify-center">
                    <span className="text-4xl text-gray-500">
                      {fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full hover:bg-opacity-60 transition-colors"
                >
                  <CameraIcon className="w-6 h-6 text-white" />
                </button>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="px-4 pt-16 pb-4 space-y-6">
            {/* İsim */}
            <div className="border border-[#333] rounded-md px-3 py-2 focus-within:border-[#1d9bf0]">
              <label className="block text-xs text-gray-500 mb-1">İsim</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent text-white outline-none"
                placeholder="İsminiz"
              />
            </div>

            {/* Kişisel bilgiler (Bio) */}
            <div className="border border-[#333] rounded-md px-3 py-2 focus-within:border-[#1d9bf0]">
              <label className="block text-xs text-gray-500 mb-1">Kişisel bilgiler</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-transparent text-white outline-none resize-none"
                rows={3}
                placeholder="Kendiniz hakkında birkaç kelime"
              />
            </div>

            {/* Konum */}
            <div className="border border-[#333] rounded-md px-3 py-2 focus-within:border-[#1d9bf0]">
              <label className="block text-xs text-gray-500 mb-1">Konum</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-white outline-none"
                placeholder="Konumunuz"
              />
            </div>

            {/* Web Sitesi */}
            <div className="border border-[#333] rounded-md px-3 py-2 focus-within:border-[#1d9bf0]">
              <label className="block text-xs text-gray-500 mb-1">Web sitesi</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full bg-transparent text-white outline-none"
                placeholder="https://example.com"
              />
            </div>

            {message && (
              <p
                className={`text-center text-sm ${
                  message.includes("başarıyla") ? "text-green-500" : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
