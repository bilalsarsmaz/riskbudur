"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { IconBrandGoogle, IconArrowLeft } from "@tabler/icons-react";
import { postApi } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<'none' | 'login' | 'register' | 'forgot-password'>('none');

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (token) {
      router.push("/home");
    }
  }, [router]);

  const showForm = (formType: 'login' | 'register' | 'forgot-password') => {
    setActiveForm(formType);
    setError("");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("Sıfırlama bağlantısı gönderildi! (Simülasyon: Console loglarına bakınız)");
      setActiveForm("login");
    } catch (err: any) {
      setError(err.message || "Hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Giriş sırasında hata: ${response.status}`);
      }

      localStorage.setItem("token", data.token);
      Cookies.set('token', data.token, { expires: 7 });

      if (data.user) {
        localStorage.setItem("userInfo", JSON.stringify(data.user));
      }

      router.push("/home");
    } catch (err) {
      console.error("Giriş hatası:", err);
      setError(err instanceof Error ? err.message : "Giriş sırasında beklenmeyen bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      // Use helper or fetch, but ensure we send fullName
      const res = await postApi("/auth/register", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      }) as { isSetupComplete: boolean; token: string; user: any };

      // Token'ı kaydet
      if (res.token) {
        localStorage.setItem("token", res.token);
        Cookies.set('token', res.token, { expires: 7 });

        if (res.user) {
          localStorage.setItem("userInfo", JSON.stringify(res.user));
        }
      }

      // Redirect to Setup
      if (!res.isSetupComplete) {
        router.push("/setup");
      } else {
        router.push("/home");
      }

    } catch (err: any) {
      console.error("Kayıt hatası:", err);
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const renderWelcome = () => (
    <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="lg:hidden text-center mb-8">
        <img src="/riskbudurlogo.png?v=2" alt="Riskbudur Logo" className="w-16 h-16 mx-auto object-contain" />
      </div>

      <div>
        <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Derin bir nefes al!</h2>
        <p className="text-xl font-bold mb-8">Ve aramıza katıl.</p>
      </div>

      <div className="space-y-4">
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

        <button
          onClick={() => showForm('register')}
          className="w-full py-3 px-4 bg-[#DC5F00] text-white rounded-full font-bold hover:bg-[#b04c00] transition-colors"
        >
          Hesap Oluştur
        </button>

        <p className="text-xs text-gray-500 leading-relaxed">
          RiskBudur'a kayıt olarak <a href="https://riskbudur.net/help/terms" className="text-[#DC5F00] hover:underline" target="_blank" rel="noopener noreferrer">Kullanım Şartları</a>'nı kabul etmiş olursun.
        </p>

        <div className="mt-8 pt-4">
          <h3 className="font-bold mb-4">Zaten bir hesabın var mı?</h3>
          <button
            onClick={() => showForm('login')}
            className="w-full py-3 px-4 text-[#DC5F00] border border-gray-700 rounded-full font-bold hover:bg-white/5 transition-colors"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    </div>
  );

  const renderLoginForm = () => (
    <div className="w-full max-w-sm animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center mb-8">
        <button onClick={() => setActiveForm('none')} className="p-2 -ml-2 hover:bg-gray-900 rounded-full transition-colors">
          <IconArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold ml-4">Giriş Yap</h2>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium mb-6">
          {error}
        </div>
      )}

      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors mb-6"
        onClick={() => window.location.href = '/api/auth/google'}
      >
        <IconBrandGoogle size={20} />
        Google ile Giriş Yap
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-800"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-black text-gray-500">veya</span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="appearance-none block w-full px-4 py-3 bg-black border border-gray-700 rounded-lg placeholder-gray-500 text-[var(--app-body-text)] focus:outline-none focus:border-[#DC5F00] focus:ring-1 focus:ring-[#DC5F00] transition-colors"
            placeholder="E-posta"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
          />
        </div>
        <div>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="appearance-none block w-full px-4 py-3 bg-black border border-gray-700 rounded-lg placeholder-gray-500 text-[var(--app-body-text)] focus:outline-none focus:border-[#DC5F00] focus:ring-1 focus:ring-[#DC5F00] transition-colors"
            placeholder="Şifre"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 mt-4"
        >
          {loading ? "Giriş yapılıyor..." : "İleri"}
        </button>

        <button
          type="button"
          onClick={() => setActiveForm('forgot-password')}
          className="w-full py-2 text-sm font-bold text-white border border-gray-700 rounded-full hover:bg-white/5 transition-colors mt-4"
        >
          Şifreni mi unuttun?
        </button>
      </form>
    </div>
  );

  const renderForgotPasswordForm = () => (
    <div className="w-full max-w-sm animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center mb-8">
        <button onClick={() => setActiveForm('login')} className="p-2 -ml-2 hover:bg-gray-900 rounded-full transition-colors">
          <IconArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold ml-4">Şifreni Sıfırla</h2>
      </div>

      <p className="text-gray-500 mb-6">Hesabına bağlı e-posta adresini gir, sana sıfırlama bağlantısı gönderelim.</p>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleForgotPassword} className="space-y-6">
        <input
          type="email"
          required
          placeholder="E-posta"
          className="appearance-none block w-full px-4 py-3 bg-black border border-gray-700 rounded-lg placeholder-gray-500 text-[var(--app-body-text)] focus:outline-none focus:border-[#DC5F00] focus:ring-1 focus:ring-[#DC5F00] transition-colors"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
        </button>
      </form>
    </div>
  );

  const renderRegisterForm = () => (
    <div className="w-full max-w-sm animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center mb-8">
        <button onClick={() => setActiveForm('none')} className="p-2 -ml-2 hover:bg-gray-900 rounded-full transition-colors">
          <IconArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold ml-4">Hesabını oluştur</h2>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-medium mb-6">
          {error}
        </div>
      )}

      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors mb-6"
        onClick={() => window.location.href = '/api/auth/google'}
      >
        <IconBrandGoogle size={20} />
        Google ile Kaydol
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-800"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-black text-gray-500">veya</span>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleRegister}>
        <div>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            className="appearance-none block w-full px-4 py-3 bg-black border border-gray-700 rounded-lg placeholder-gray-500 text-[var(--app-body-text)] focus:outline-none focus:border-[#DC5F00] focus:ring-1 focus:ring-[#DC5F00] transition-colors"
            placeholder="İsim"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            disabled={loading}
          />
        </div>
        <div>
          <input
            id="register-email"
            name="email"
            type="email"
            required
            className="appearance-none block w-full px-4 py-3 bg-black border border-gray-700 rounded-lg placeholder-gray-500 text-[var(--app-body-text)] focus:outline-none focus:border-[#DC5F00] focus:ring-1 focus:ring-[#DC5F00] transition-colors"
            placeholder="E-posta"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
          />
        </div>
        <div>
          <input
            id="register-password"
            name="password"
            type="password"
            required
            className="appearance-none block w-full px-4 py-3 bg-black border border-gray-700 rounded-lg placeholder-gray-500 text-[var(--app-body-text)] focus:outline-none focus:border-[#DC5F00] focus:ring-1 focus:ring-[#DC5F00] transition-colors"
            placeholder="Şifre"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="mt-8">
          <p className="text-xs text-gray-500 mb-4">
            Kaydolarak, <a href="https://riskbudur.net/help/terms" className="text-[#DC5F00] hover:underline" target="_blank" rel="noopener noreferrer">Kullanım Şartları</a>'nı, <a href="https://riskbudur.net/help/privacy" className="text-[#DC5F00] hover:underline" target="_blank" rel="noopener noreferrer">Gizlilik Politikası</a>'nı ve <a href="https://riskbudur.net/help/terms" className="text-[#DC5F00] hover:underline" target="_blank" rel="noopener noreferrer">Çerez Kullanımı</a>'nı kabul etmiş olursun.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#DC5F00] text-white rounded-full font-bold hover:bg-[#b04c00] transition-colors disabled:opacity-50"
          >
            {loading ? "Kaydediliyor..." : "Kaydol"}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-black text-[var(--app-body-text)]">
      {/* Sol Taraf: Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#111] text-white items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 -left-10 w-96 h-96 bg-[#DC5F00] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-0 -right-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden">
            <img src="/riskbudurlogo.png?v=2" alt="Riskbudur Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight">RiskBudur'a hoş geldin!</h1>
          <p className="text-xl text-gray-400 max-w-md mx-auto leading-relaxed">
            Patronuna mı <span className="text-[#1d9bf0]">#kızdın</span>, en yakın arkadaşının sevgilisinden <span className="text-[#1d9bf0]">#hoşlanıyorsun</span> ve bunları kimseyle <span className="text-[#1d9bf0]">#paylaşamıyorsun</span>. Korkma artık içini dökebileceğin bir yer <span className="text-[#1d9bf0]">#var</span>!
          </p>
        </div>
      </div>

      {/* Sağ Taraf: Dynamic Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 bg-black">
        {activeForm === 'none' && renderWelcome()}
        {activeForm === 'login' && renderLoginForm()}
        {activeForm === 'register' && renderRegisterForm()}
        {activeForm === 'forgot-password' && renderForgotPasswordForm()}
      </div>
    </div>
  );
}
