"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';

export default function Home() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<'none' | 'login' | 'register'>('none');

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nickname: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (token) {
      router.push("/home");
    }
  }, [router]);

  const showForm = (formType: 'login' | 'register') => {
    setActiveForm(formType);
    setError("");
  };

  const handleLogin = async () => {
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

  const handleRegister = async () => {
    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Kayıt yapılırken bir hata oluştu (${response.status})`);
      }

      setActiveForm('login');
      setError("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
    } catch (err) {
      console.error("Kayıt hatası:", err);
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center mb-6" style={{ color: '#d9dadd' }}>Giriş Yapın</h2>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#d9dadd' }}>
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
            style={{ backgroundColor: '#1a1a1a', color: '#d9dadd', borderColor: '#222222' }}
            placeholder="E-posta adresiniz"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: '#d9dadd' }}>
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
            style={{ backgroundColor: '#1a1a1a', color: '#d9dadd', borderColor: '#222222' }}
            placeholder="Şifreniz"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={loading}
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          type="button"
          onClick={handleLogin}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? "opacity-50" : "hover:opacity-90"
            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          style={{ backgroundColor: 'oklch(0.71 0.24 43.55)' }}
          disabled={loading}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </div>
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setActiveForm('none')}
          className="text-sm hover:opacity-80"
          style={{ color: 'oklch(0.71 0.24 43.55)' }}
        >
          Geri Dön
        </button>
      </div>
    </>
  );

  const renderRegisterForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center mb-6" style={{ color: '#d9dadd' }}>Kayıt Olun</h2>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium mb-1" style={{ color: '#d9dadd' }}>
            Kullanıcı Adı
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
            style={{ backgroundColor: '#1a1a1a', color: '#d9dadd', borderColor: '#222222' }}
            placeholder="Kullanıcı adınız"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="register-email" className="block text-sm font-medium mb-1" style={{ color: '#d9dadd' }}>
            E-posta
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
            style={{ backgroundColor: '#1a1a1a', color: '#d9dadd', borderColor: '#222222' }}
            placeholder="E-posta adresiniz"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="register-password" className="block text-sm font-medium mb-1" style={{ color: '#d9dadd' }}>
            Şifre
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-500 rounded-md focus:outline-none focus:ring-2 focus:border-transparent sm:text-sm"
            style={{ backgroundColor: '#1a1a1a', color: '#d9dadd', borderColor: '#222222' }}
            placeholder="Şifreniz"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={loading}
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          type="button"
          onClick={handleRegister}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? "opacity-50" : "hover:opacity-90"
            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          style={{ backgroundColor: 'oklch(0.71 0.24 43.55)' }}
          disabled={loading}
        >
          {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
        </button>
      </div>
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setActiveForm('none')}
          className="text-sm hover:opacity-80"
          style={{ color: 'oklch(0.71 0.24 43.55)' }}
        >
          Geri Dön
        </button>
      </div>
    </>
  );

  const renderWelcome = () => (
    <>
      <div className="flex items-start justify-center" style={{ marginBottom: '22px' }}>
        <img src="/riskbudurlogo.png" alt="Logo" style={{ width: "80px", height: "auto", objectFit: "contain", marginRight: '5px', marginTop: '5px' }} />
        <div className="flex flex-col justify-center" style={{ marginTop: '17px' }}>
          <h1 className="text-5xl font-extrabold font-montserrat leading-none" style={{ color: '#d9dadd' }}>
            riskbudur
          </h1>
          <p className="text-xs font-medium font-montserrat text-right" style={{ color: '#6e767d', marginTop: '0px' }}>
            underground sosyal medya
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => showForm('login')}
          className="block w-full py-3 px-4 text-center text-white font-medium rounded-lg transition duration-200 hover:opacity-90"
          style={{ backgroundColor: 'oklch(0.71 0.24 43.55)' }}
        >
          Giriş Yap
        </button>

        <button
          onClick={() => showForm('register')}
          className="block w-full py-3 px-4 text-center font-medium rounded-lg transition duration-200 hover:bg-[#151515]"
          style={{ color: '#d9dadd', border: '1px solid #222222', backgroundColor: '#0a0a0a' }}
        >
          Kayıt Ol
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-md w-full p-6 rounded-lg" style={{ backgroundColor: '#0a0a0a', border: '1px solid #222222' }}>
        {activeForm === 'none' && renderWelcome()}
        {activeForm === 'login' && renderLoginForm()}
        {activeForm === 'register' && renderRegisterForm()}
      </div>
    </div>
  );
}
