"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/components/LeftSidebar";
import { fetchApi, postApi } from "@/lib/api";
import { ChevronRightIcon, Cog8ToothIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface User {
  id: string;
  nickname: string;
  fullName: string;
  email: string;
  bio?: string;
  website?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>("account");
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [activeDetailMenu, setActiveDetailMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await fetchApi("/users/me");
        setUser(data);
        setNickname(data.nickname);
        setEmail(data.email);
      } catch (err) {
        console.error("Kullanıcı bilgileri alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await postApi("/users/me", { nickname });
      setMessage("Kullanıcı adı başarıyla güncellendi!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Kullanıcı adı güncellenirken bir hata oluştu.");
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await postApi("/users/me", { email });
      setMessage("E-posta başarıyla güncellendi!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("E-posta güncellenirken bir hata oluştu.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Yeni şifreler eşleşmiyor!");
      return;
    }
    try {
      await postApi("/users/me", { currentPassword, newPassword });
      setMessage("Şifre başarıyla güncellendi!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Şifre güncellenirken bir hata oluştu.");
    }
  };

  const handleDeactivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (window.confirm("Hesabınızı devre dışı bırakmak istediğinizden emin misiniz?")) {
      setMessage("Hesap devre dışı bırakma özelliği yakında aktif olacak.");
    }
  };

  const handleBackButton = () => {
    if (activeDetailMenu) {
      setActiveDetailMenu(null);
    } else if (activeSubMenu) {
      setActiveSubMenu(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
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

        <div className="w-full max-w-[1000px] flex">
          {/* Sol Panel - Kategoriler */}
          <div className="w-[350px] border border-theme-border rounded-l-lg overflow-hidden" style={{backgroundColor: '#0a0a0a'}}>
            <div className="p-4 border-b border-theme-border flex items-center">
              <Cog8ToothIcon className="w-6 h-6 mr-3" />
              <h1 className="text-xl font-bold">Ayarlar</h1>
            </div>

            <div>
              <button
                onClick={() => setActiveCategory(activeCategory === "account" ? null : "account")}
                className={`w-full px-4 py-4 text-left hover:bg-[#151515] flex items-center justify-between relative ${
                  activeCategory === "account" ? "bg-gray-900" : ""
                }`}
              >
                <span className="font-medium">Hesap Ayarları</span>
                <ChevronRightIcon className="w-5 h-5" />
                {activeCategory === "account" && (
                  <div className="absolute right-0 top-0 bottom-0 w-1" style={{backgroundColor: 'oklch(0.71 0.24 43.55)'}}></div>
                )}
              </button>

              <button
                disabled
                className="w-full px-4 py-4 text-left opacity-50 cursor-not-allowed flex items-center justify-between"
              >
                <span className="font-medium">Premium</span>
                <ChevronRightIcon className="w-5 h-5" />
              </button>

              <button
                disabled
                className="w-full px-4 py-4 text-left opacity-50 cursor-not-allowed flex items-center justify-between"
              >
                <span className="font-medium">Güvenlik</span>
                <ChevronRightIcon className="w-5 h-5" />
              </button>

              <button
                disabled
                className="w-full px-4 py-4 text-left opacity-50 cursor-not-allowed flex items-center justify-between"
              >
                <span className="font-medium">Bildirimler</span>
                <ChevronRightIcon className="w-5 h-5" />
              </button>

              <button
                disabled
                className="w-full px-4 py-4 text-left opacity-50 cursor-not-allowed flex items-center justify-between"
              >
                <span className="font-medium">Yardım Merkezi</span>
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* İkinci Panel */}
          {activeCategory === "account" && (
            <div className="w-[650px] border-t border-r border-b border-theme-border rounded-r-lg" style={{backgroundColor: '#0a0a0a'}}>
              {/* Ana Menü */}
              {!activeSubMenu && !activeDetailMenu && (
                <>
                  <div className="p-4">
                    <h2 className="text-lg font-bold">Hesap Ayarları</h2>
                  </div>

                  <div>
                    <button
                      onClick={() => setActiveSubMenu("account-info")}
                      className="w-full px-4 py-4 text-left hover:bg-[#151515]"
                    >
                      <div className="font-medium">Hesap bilgileri</div>
                      <div className="text-sm" style={{color: "#6e767d"}}>Hesabına ait bilgileri keşfet.</div>
                    </button>

                    <button
                      onClick={() => setActiveSubMenu("password")}
                      className="w-full px-4 py-4 text-left hover:bg-[#151515]"
                    >
                      <div className="font-medium">Şifreni değiştir</div>
                      <div className="text-sm" style={{color: "#6e767d"}}>Eğer güçlü değilse, şifreni değiştir.</div>
                    </button>

                    <button
                      onClick={() => setActiveSubMenu("deactivate")}
                      className="w-full px-4 py-4 text-left hover:bg-[#151515]"
                    >
                      <div className="font-medium text-red-500">Hesabını devre dışı bırak</div>
                      <div className="text-sm" style={{color: "#6e767d"}}>Hesabını nasıl devre dışı bırakacağını öğren.</div>
                    </button>
                  </div>
                </>
              )}

              {/* Hesap Bilgileri Alt Menüsü */}
              {activeSubMenu === "account-info" && !activeDetailMenu && (
                <>
                  <div className="p-4 border-b border-theme-border flex items-center">
                    <button
                      onClick={handleBackButton}
                      className="p-2 hover:bg-[#151515] rounded-full mr-4"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold">Hesap Bilgileri</h2>
                  </div>

                  <div>
                    <button
                      onClick={() => setActiveDetailMenu("username")}
                      className="w-full px-4 py-4 text-left hover:bg-[#151515]"
                    >
                      <div className="font-medium">Kullanıcı Adı</div>
                      <div className="text-sm" style={{color: "#6e767d"}}>@{user?.nickname}</div>
                    </button>

                    <button
                      onClick={() => setActiveDetailMenu("email")}
                      className="w-full px-4 py-4 text-left hover:bg-[#151515]"
                    >
                      <div className="font-medium">Email</div>
                      <div className="text-sm" style={{color: "#6e767d"}}>{user?.email}</div>
                    </button>

                    <button
                      onClick={() => setActiveDetailMenu("verified")}
                      className="w-full px-4 py-4 text-left hover:bg-[#151515]"
                    >
                      <div className="font-medium">Onaylanmış hesap</div>
                      <div className="text-sm" style={{color: "#6e767d"}}>Mavi Tik başvurusu</div>
                    </button>

                    <div className="border-t border-theme-border my-2"></div>

                    <button
                      onClick={() => setActiveDetailMenu("location")}
                      className="w-full px-4 py-4 text-left hover:bg-[#151515]"
                    >
                      <div className="font-medium">Konum</div>
                      <div className="text-sm" style={{color: "#6e767d"}}>Konumunuzu ekleyin</div>
                    </button>

                    <button
                      onClick={() => setActiveDetailMenu("gender")}
                      className="w-full px-4 py-4 text-left hover:bg-[#151515]"
                    >
                      <div className="font-medium">Cinsiyet</div>
                      <div className="text-sm" style={{color: "#6e767d"}}>Cinsiyetinizi belirtin</div>
                    </button>

                    <button
                      onClick={() => setActiveDetailMenu("birthdate")}
                      className="w-full px-4 py-4 text-left hover:bg-[#151515]"
                    >
                      <div className="font-medium">Doğum Tarihi</div>
                      <div className="text-sm" style={{color: "#6e767d"}}>Doğum tarihinizi girin</div>
                    </button>

                    <button
                      disabled
                      className="w-full px-4 py-4 text-left opacity-50 cursor-not-allowed"
                    >
                      <div className="font-medium">Takım</div>
                      <div className="text-sm" style={{color: "#6e767d"}}>Favori takımınızı seçin</div>
                    </button>
                  </div>
                </>
              )}

              {/* Şifre Değiştir */}
              {activeSubMenu === "password" && !activeDetailMenu && (
                <>
                  <div className="p-4 border-b border-theme-border flex items-center">
                    <button
                      onClick={handleBackButton}
                      className="p-2 hover:bg-[#151515] rounded-full mr-4"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold">Şifreni Değiştir</h2>
                  </div>

                  <div className="p-6">
                    <form onSubmit={handleUpdatePassword}>
                      <div className="mb-4">
                        <label className="block mb-2">Mevcut Şifre</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-theme-border"
                          style={{backgroundColor: '#1a1a1a'}}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-2">Yeni Şifre</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-theme-border"
                          style={{backgroundColor: '#1a1a1a'}}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-2">Yeni Şifre (Tekrar)</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-theme-border"
                          style={{backgroundColor: '#1a1a1a'}}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-full font-medium text-white"
                        style={{backgroundColor: 'oklch(0.71 0.24 43.55)'}}
                      >
                        Kaydet
                      </button>
                      {message && <p className="mt-4 text-green-500">{message}</p>}
                    </form>
                  </div>
                </>
              )}

              {/* Hesabı Devre Dışı Bırak */}
              {activeSubMenu === "deactivate" && !activeDetailMenu && (
                <>
                  <div className="p-4 border-b border-theme-border flex items-center">
                    <button
                      onClick={handleBackButton}
                      className="p-2 hover:bg-[#151515] rounded-full mr-4"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold">Hesabını Devre Dışı Bırak</h2>
                  </div>

                  <div className="p-6">
                    <form onSubmit={handleDeactivateAccount}>
                      <p className="mb-4" style={{color: "#6e767d"}}>
                        Hesabınızı devre dışı bıraktığınızda, profiliniz ve gönderileriniz gizlenecektir. 
                        İstediğiniz zaman tekrar giriş yaparak hesabınızı aktif hale getirebilirsiniz.
                      </p>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-full font-medium text-white bg-red-600 hover:bg-red-700"
                      >
                        Hesabı Devre Dışı Bırak
                      </button>
                      {message && <p className="mt-4 text-yellow-500">{message}</p>}
                    </form>
                  </div>
                </>
              )}

              {/* Detay Sayfaları */}
              {activeDetailMenu === "username" && (
                <>
                  <div className="p-4 border-b border-theme-border flex items-center">
                    <button
                      onClick={handleBackButton}
                      className="p-2 hover:bg-[#151515] rounded-full mr-4"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold">Kullanıcı Adı</h2>
                  </div>

                  <div className="p-6">
                    <form onSubmit={handleUpdateUsername}>
                      <div className="mb-4">
                        <label className="block mb-2">Yeni Kullanıcı Adı</label>
                        <input
                          type="text"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-theme-border"
                          style={{backgroundColor: '#1a1a1a'}}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-full font-medium text-white"
                        style={{backgroundColor: 'oklch(0.71 0.24 43.55)'}}
                      >
                        Kaydet
                      </button>
                      {message && <p className="mt-4 text-green-500">{message}</p>}
                    </form>
                  </div>
                </>
              )}

              {activeDetailMenu === "email" && (
                <>
                  <div className="p-4 border-b border-theme-border flex items-center">
                    <button
                      onClick={handleBackButton}
                      className="p-2 hover:bg-[#151515] rounded-full mr-4"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold">Email</h2>
                  </div>

                  <div className="p-6">
                    <form onSubmit={handleUpdateEmail}>
                      <div className="mb-4">
                        <label className="block mb-2">Yeni E-posta</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-theme-border"
                          style={{backgroundColor: '#1a1a1a'}}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-full font-medium text-white"
                        style={{backgroundColor: 'oklch(0.71 0.24 43.55)'}}
                      >
                        Kaydet
                      </button>
                      {message && <p className="mt-4 text-green-500">{message}</p>}
                    </form>
                  </div>
                </>
              )}

              {activeDetailMenu === "verified" && (
                <>
                  <div className="p-4 border-b border-theme-border flex items-center">
                    <button
                      onClick={handleBackButton}
                      className="p-2 hover:bg-[#151515] rounded-full mr-4"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold">Onaylanmış Hesap</h2>
                  </div>

                  <div className="p-6">
                    <p style={{color: "#6e767d"}}>
                      Mavi tik başvurusu özelliği yakında aktif olacak.
                    </p>
                  </div>
                </>
              )}

              {(activeDetailMenu === "location" || activeDetailMenu === "gender" || activeDetailMenu === "birthdate") && (
                <>
                  <div className="p-4 border-b border-theme-border flex items-center">
                    <button
                      onClick={handleBackButton}
                      className="p-2 hover:bg-[#151515] rounded-full mr-4"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold">
                      {activeDetailMenu === "location" && "Konum"}
                      {activeDetailMenu === "gender" && "Cinsiyet"}
                      {activeDetailMenu === "birthdate" && "Doğum Tarihi"}
                    </h2>
                  </div>

                  <div className="p-6">
                    <p style={{color: "#6e767d"}}>
                      Bu özellik yakında aktif olacak.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
