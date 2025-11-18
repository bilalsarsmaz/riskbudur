"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { postApi } from "@/lib/api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    fullName: string;
    bio: string;
    website: string;
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

        // Max genişlik/yükseklik 1920px
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

        // Kaliteyi ayarla (0.7 = %70 kalite)
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
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMessage("Fotoğraf hazırlanıyor...");
      try {
        const compressed = await compressImage(file);
        setProfileImage(compressed);
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
        setMessage("");
      } catch (err) {
        setMessage("Fotoğraf işlenemedi.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let profileImageUrl = null;
      let coverImageUrl = null;

      // Profil fotoğrafını yükle
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

      // Kapak fotoğrafını yükle
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

      // Diğer bilgileri güncelle
      await postApi("/users/me", {
        fullName,
        bio,
        website,
      });

      setMessage("Profil başarıyla güncellendi!");

      // localStorage güncelle
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        className="w-full max-w-[600px] rounded-lg overflow-hidden"
        style={{ backgroundColor: "#0a0a0a", border: "1px solid #222222" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#222222]">
          <div className="flex items-center">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full mr-4"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">Profili Düzenle</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-full font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: "oklch(0.71 0.24 43.55)" }}
          >
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 max-h-[70vh] overflow-y-auto">
          {/* Kapak Fotoğrafı */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Kapak Fotoğrafı</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="w-full px-4 py-2 rounded-lg border border-[#222222]"
              style={{ backgroundColor: "#1a1a1a" }}
            />
            {coverImage && (
              <p className="text-sm mt-2" style={{ color: "#6e767d" }}>
                Seçilen: {coverImage.name} ({(coverImage.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>

          {/* Profil Fotoğrafı */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Profil Fotoğrafı</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="w-full px-4 py-2 rounded-lg border border-[#222222]"
              style={{ backgroundColor: "#1a1a1a" }}
            />
            {profileImage && (
              <p className="text-sm mt-2" style={{ color: "#6e767d" }}>
                Seçilen: {profileImage.name} ({(profileImage.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>

          {/* Tam Ad */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Tam Ad</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#222222]"
              style={{ backgroundColor: "#1a1a1a" }}
              placeholder="Tam adınız"
            />
          </div>

          {/* Bio */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#222222]"
              style={{ backgroundColor: "#1a1a1a" }}
              rows={3}
              placeholder="Kendiniz hakkında birkaç kelime"
            />
          </div>

          {/* Web Sitesi */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Web Sitesi</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[#222222]"
              style={{ backgroundColor: "#1a1a1a" }}
              placeholder="https://example.com"
            />
          </div>

          {message && (
            <p
              className={`text-center ${
                message.includes("başarıyla") ? "text-green-500" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
