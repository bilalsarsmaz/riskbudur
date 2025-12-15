"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SecondaryLayout from "@/components/SecondaryLayout";
import { fetchApi, postApi } from "@/lib/api";
import {
  UserCircleIcon,
  KeyIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

interface User {
  id: string;
  nickname: string;
  fullName: string | null;
  email: string;
  bio?: string;
  website?: string;
  gender?: string | null;
  birthday?: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("account");
  const [loading, setLoading] = useState(true);

  // Form states
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("unspecified");
  const [birthday, setBirthday] = useState("");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Verification states
  const [verificationFullName, setVerificationFullName] = useState("");
  const [verificationCategory, setVerificationCategory] = useState("media");
  const [verificationText, setVerificationText] = useState("");
  const [verificationImage, setVerificationImage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await fetchApi("/users/me");
        setUser(data);
        setUser(data);
        setFullName(data.fullName || "");
        setNickname(data.nickname);
        setEmail(data.email);
        setGender(data.gender || "unspecified");
        setBirthday(data.birthday ? new Date(data.birthday).toISOString().split('T')[0] : "");
      } catch (err) {
        console.error("Kullanıcı bilgileri alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVerificationImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await postApi("/users/me", {
        fullName,
        nickname,
        email,
        gender,
        birthday: birthday || null
      });
      showMessage('success', "Hesap bilgileri güncellendi!");
    } catch (err: any) {
      showMessage('error', err.message || "Güncelleme sırasında hata oluştu.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showMessage('error', "Yeni şifreler eşleşmiyor!");
      return;
    }
    try {
      await postApi("/users/me", { currentPassword, newPassword });
      showMessage('success', "Şifre başarıyla güncellendi!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showMessage('error', err.message || "Şifre güncellenirken bir hata oluştu.");
    }
  };

  const handleVerificationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await postApi("/verification-requests", {
        fullName: verificationFullName,
        category: verificationCategory,
        description: verificationText,
        identityImage: verificationImage
      });
      setIsSubmitted(true);
      showMessage('success', "Başvurunuz alındı! İncelendikten sonra size dönüş yapılacaktır.");
      setVerificationFullName("");
      setVerificationText("");
      setVerificationImage(null);
    } catch (err: any) {
      showMessage('error', err.message || "Başvuru sırasında hata oluştu.");
    }
  };

  const handleDeactivateAccount = async () => {
    if (window.confirm("Hesabınızı devre dışı bırakmak istediğinizden emin misiniz?")) {
      showMessage('error', "Hesap devre dışı bırakma özelliği yakında aktif olacak.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <SecondaryLayout maxWidth="1050px">
      <div className="flex w-full min-h-[calc(100vh-60px)]">

        {/* Sol Panel - Kategoriler */}
        <div className="w-[300px] border-r border-theme-border p-4 hidden md:block">
          <h1 className="text-2xl font-bold mb-6 px-2">Ayarlar</h1>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveCategory("account")}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${activeCategory === 'account' ? 'bg-[#1a1a1a] text-white' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'}`}
            >
              <div className="flex items-center space-x-3">
                <UserCircleIcon className="w-6 h-6" />
                <span className="font-medium">Hesabım</span>
              </div>
              {activeCategory === 'account' && <div className="w-1 h-4 bg-orange-500 rounded-full"></div>}
            </button>

            <button disabled className="w-full flex items-center justify-between p-3 rounded-lg text-gray-600 cursor-not-allowed">
              <span className="font-medium ml-9">Premium (Yakında)</span>
            </button>
            <button disabled className="w-full flex items-center justify-between p-3 rounded-lg text-gray-600 cursor-not-allowed">
              <span className="font-medium ml-9">Bildirimler (Yakında)</span>
            </button>
          </nav>
        </div>

        {/* Sağ Panel - İçerik */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-900' : 'bg-red-900/30 text-red-400 border border-red-900'}`}>
              {message.text}
            </div>
          )}

          {activeCategory === "account" && (
            <div className="space-y-12 max-w-2xl">

              {/* Profil Bölümü */}
              <section>
                <h2 className="text-xl font-bold mb-1 flex items-center">
                  Hesap Bilgileri
                </h2>
                <p className="text-gray-500 text-sm mb-6">Temel hesap bilgilerinizi buradan yönetebilirsiniz.</p>

                <form onSubmit={handleUpdateProfile} className="space-y-6 bg-[#0a0a0a] p-6 rounded-2xl border border-theme-border">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Tam Adınız</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ad Soyad"
                      className="w-full bg-[#151515] border border-theme-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Kullanıcı Adı</label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full bg-[#151515] border border-theme-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">E-posta Adresi</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#151515] border border-theme-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Cinsiyet</label>
                      <div className="relative">
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-[#151515] border border-theme-border rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-orange-500 transition-colors"
                        >
                          <option value="unspecified">Belirtmek İstemiyorum</option>
                          <option value="male">Erkek</option>
                          <option value="female">Kadın</option>
                          <option value="other">Diğer</option>
                        </select>
                        <ChevronRightIcon className="w-5 h-5 absolute right-4 top-3.5 text-gray-500 rotate-90 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Doğum Günü</label>
                      <input
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="w-full bg-[#151515] border border-theme-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors">
                      Bilgileri Güncelle
                    </button>
                  </div>
                </form>
              </section>

              <div className="border-b border-theme-border"></div>

              {/* Şifre Bölümü */}
              <section>
                <h2 className="text-xl font-bold mb-1 flex items-center">
                  <KeyIcon className="w-6 h-6 mr-2 text-orange-500" />
                  Güvenlik ve Şifre
                </h2>
                <p className="text-gray-500 text-sm mb-6">Hesabınızın güvenliği için güçlü bir şifre kullanın.</p>

                <form onSubmit={handleUpdatePassword} className="space-y-6 bg-[#0a0a0a] p-6 rounded-2xl border border-theme-border">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Mevcut Şifre</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#151515] border border-theme-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Yeni Şifre</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#151515] border border-theme-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Yeni Şifre (Tekrar)</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#151515] border border-theme-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-full hover:bg-orange-700 transition-colors">
                      Şifreyi Değiştir
                    </button>
                  </div>
                </form>
              </section>

              <div className="border-b border-theme-border"></div>

              {/* Mavi Tik Bölümü */}
              <section>
                <h2 className="text-xl font-bold mb-1 flex items-center">
                  <CheckBadgeIcon className="w-6 h-6 mr-2 text-blue-500" />
                  Onaylanmış Hesap (Mavi Tik)
                </h2>
                <p className="text-gray-500 text-sm mb-6">Topluluk tarafından tanınan bir kişi veya markaysanız onay rozeti alabilirsiniz.</p>

                <form onSubmit={handleVerificationRequest} className="space-y-6 bg-gradient-to-br from-[#0a0a0a] to-blue-900/10 p-6 rounded-2xl border border-blue-900/30">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Gerçek İsim ve Soyisim</label>
                    <input
                      type="text"
                      required
                      value={verificationFullName}
                      onChange={(e) => setVerificationFullName(e.target.value)}
                      placeholder="Kimlikte yazan isminiz"
                      className="w-full bg-[#151515] border border-theme-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Kategori</label>
                    <div className="relative">
                      <select
                        value={verificationCategory}
                        onChange={(e) => setVerificationCategory(e.target.value)}
                        className="w-full bg-[#151515] border border-theme-border rounded-lg px-4 py-3 text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors"
                      >
                        <option value="media">Medya ve Haberler</option>
                        <option value="brand">Marka ve İşletme</option>
                        <option value="creator">İçerik Üreticisi</option>
                        <option value="entertainment">Eğlence</option>
                        <option value="other">Diğer</option>
                      </select>
                      <ChevronRightIcon className="w-5 h-5 absolute right-4 top-3.5 text-gray-500 rotate-90 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Neden onaylanmalısınız?</label>
                    <textarea
                      required
                      value={verificationText}
                      onChange={(e) => setVerificationText(e.target.value)}
                      placeholder="Bize kendinizden veya markanızdan kısaca bahsedin..."
                      className="w-full bg-[#151515] border border-theme-border rounded-lg px-4 py-3 text-white min-h-[100px] focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Kimlik Fotoğrafı veya Belge</label>
                    <div className="border border-dashed border-theme-border rounded-lg p-6 flex flex-col items-center justify-center bg-[#151515] hover:bg-[#1a1a1a] transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                      />
                      {verificationImage ? (
                        <div className="relative w-full h-32">
                          <img src={verificationImage} alt="Preview" className="w-full h-full object-contain rounded" />
                          <p className="text-center text-xs text-green-500 mt-2">Görsel seçildi</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          </div>
                          <p className="text-gray-400 text-sm">Fotoğraf yüklemek için tıklayın</p>
                          <p className="text-gray-600 text-xs mt-1">Sadece PNG, JPG.</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitted}
                      className={`px-6 py-2 font-semibold rounded-full transition-colors shadow-lg ${isSubmitted ? 'bg-green-600 text-white cursor-default' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/20'}`}
                    >
                      {isSubmitted ? "Başarılı! ✅" : "Başvuruyu Gönder"}
                    </button>
                  </div>
                </form>
              </section>

              <div className="border-b border-theme-border"></div>

              {/* Tehlikeli Bölge */}
              <section className="opacity-80 hover:opacity-100 transition-opacity">
                <h2 className="text-xl font-bold mb-1 flex items-center text-red-500">
                  <ExclamationTriangleIcon className="w-6 h-6 mr-2" />
                  Tehlikeli Bölge
                </h2>
                <div className="mt-4 bg-red-900/10 border border-red-900/30 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Hesabı Devre Dışı Bırak</h3>
                    <p className="text-sm text-gray-500 mt-1">Bu işlem hesabınızı geçici olarak kapatır.</p>
                  </div>
                  <button
                    onClick={handleDeactivateAccount}
                    className="px-5 py-2 border border-red-800 text-red-500 rounded-lg hover:bg-red-900/20 transition-colors text-sm font-medium"
                  >
                    Devre Dışı Bırak
                  </button>
                </div>
              </section>

              <div className="h-20"></div> {/* Bottom spacer */}
            </div>
          )}
        </div>
      </div>
    </SecondaryLayout>
  );
}
