"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { postApi } from "@/lib/api";
import { IconBrandGoogle } from "@tabler/icons-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const res = await postApi("/auth/register", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      }) as { isSetupComplete: boolean };

      // Token otomatik olarak cookie'ye set edildi.
      // Eğer kurulum tamamlanmamışsa (ki yeni kayıtta tamamlanmamış olacak) setup sayfasına yönlendir.
      if (!res.isSetupComplete) {
        router.push("/setup");
      } else {
        router.push("/home");
      }

    } catch (err: any) {
      setError(err.message || "Kayıt olurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Sol Taraf: Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#111] items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 -left-10 w-96 h-96 bg-[#DC5F00] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 -right-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden">
            <img src="/riskbudurlogo.png" alt="Riskbudur Logo" className="w-16 h-16 object-contain" />
          </div>

          <h1 className="text-5xl font-extrabold mb-6 tracking-tight">RiskBudur'a hoş geldin!</h1>
          <p className="text-xl text-gray-400 max-w-md mx-auto leading-relaxed">
            Patronuna mı <span className="text-[#1d9bf0]">#kızdın</span>, en yakın arkadaşının sevgilisinden <span className="text-[#1d9bf0]">#hoşlanıyorsun</span> ve bunları kimseyle <span className="text-[#1d9bf0]">#paylaşamıyorsun</span>. Korkma artık içini dökebileceğin bir yer <span className="text-[#1d9bf0]">#var</span>!
          </p>
        </div>
      </div>

      {/* Sağ Taraf: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 bg-black">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden text-center mb-8">
            <img src="/riskbudurlogo.png" alt="Riskbudur Logo" className="w-16 h-16 mx-auto object-contain" />
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-2">Hesap Oluştur</h2>
            <p className="text-gray-500">Hemen kaydol, sohbete başla.</p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Google Sign In (Placeholder) */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
              onClick={() => window.location.href = '/api/auth/google'}
            >
              <IconBrandGoogle size={20} />
              Google ile Kaydol
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-800"></div>
              <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">veya</span>
              <div className="flex-grow border-t border-gray-800"></div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 bg-black border border-gray-700 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:border-[#DC5F00] focus:ring-1 focus:ring-[#DC5F00] transition-colors"
                  placeholder="Ad Soyad"
                />
              </div>

              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 bg-black border border-gray-700 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:border-[#DC5F00] focus:ring-1 focus:ring-[#DC5F00] transition-colors"
                  placeholder="E-posta"
                />
              </div>

              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none block w-full px-4 py-3 bg-black border border-gray-700 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:border-[#DC5F00] focus:ring-1 focus:ring-[#DC5F00] transition-colors"
                  placeholder="Şifre"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full text-white bg-[#DC5F00] hover:bg-[#b04c00] font-bold transition-all disabled:opacity-50"
              >
                {loading ? "Kaydediliyor..." : "Kayıt Ol"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500">
            Zaten hesabın var mı?{" "}
            <Link href="/login" className="font-bold text-[#DC5F00] hover:underline">
              Giriş yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 