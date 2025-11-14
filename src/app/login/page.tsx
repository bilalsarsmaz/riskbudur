"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Giriş yapılıyor...", formData);
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("API yanıtı:", data);

      if (!response.ok) {
        throw new Error(data.message || `Giriş yapılırken bir hata oluştu (${response.status})`);
      }

      // Token'ı localStorage'a kaydet
      localStorage.setItem("token", data.token);
      
      // Token'ı cookie'ye de kaydet (middleware için)
      Cookies.set('token', data.token, { expires: 7 }); // 7 gün
      
      // Kullanıcı bilgilerini de kaydedebiliriz (isteğe bağlı)
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Kullanıcıyı ana sayfaya yönlendir
      router.push("/home");
    } catch (err) {
      console.error("Giriş hatası:", err);
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Form gönderme işlemi için alternatif fonksiyon
  const handleLogin = async () => {
    if (loading) return;
    
    setError("");
    setLoading(true);

    try {
      console.log("Giriş yapılıyor...", formData);
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("API yanıtı:", data);

      if (!response.ok) {
        throw new Error(data.message || `Giriş yapılırken bir hata oluştu (${response.status})`);
      }

      // Token'ı localStorage'a kaydet
      localStorage.setItem("token", data.token);
      
      // Token'ı cookie'ye de kaydet (middleware için)
      Cookies.set('token', data.token, { expires: 7 }); // 7 gün
      
      // Kullanıcı bilgilerini de kaydedebiliriz (isteğe bağlı)
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Kullanıcıyı ana sayfaya yönlendir
      router.push("/home");
    } catch (err) {
      console.error("Giriş hatası:", err);
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Hesabınıza giriş yapın
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Veya{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              yeni bir hesap oluşturun
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="E-posta"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Şifre"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="button" 
              onClick={handleLogin}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              disabled={loading}
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>Test hesabı: test@example.com / password123</p>
          </div>
        </form>
      </div>
    </div>
  );
} 