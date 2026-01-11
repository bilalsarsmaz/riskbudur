import type { Metadata, Viewport } from "next";
import { Open_Sans, Montserrat } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Riskbudur",
  description: "underground sosyal medya",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import ThemeInitializer from "@/components/ThemeInitializer";
import BanChecker from "@/components/BanChecker";
import MaintenancePage from "@/components/MaintenancePage";
import { getSystemSettings } from "@/lib/settings";
import { cookies, headers } from "next/headers";
import { verifyToken } from "@/lib/auth";

import { TranslationProvider } from "@/components/TranslationProvider";
import { getTranslations, getDefaultLanguage } from "@/lib/translations";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Language Setup
  const cookieStore = await cookies();
  const defaultLang = await getDefaultLanguage();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || defaultLang;
  const translations = await getTranslations(lang);

  // Check Maintenance Mode (Server-Side)
  try {
    const settings = await getSystemSettings();
    if (settings.maintenanceMode) {
      const headersList = await headers();
      const pathname = headersList.get("x-current-path") || "";

      // Allow Login and Auth API
      if (!pathname.startsWith("/login") && !pathname.startsWith("/api/auth")) {
        const token = cookieStore.get("token")?.value;
        let isAdmin = false;

        if (token) {
          const decoded = await verifyToken(token);
          if (decoded && (decoded.role === "ADMIN" || decoded.role === "ROOTADMIN")) {
            isAdmin = true;
          }
        }

        if (!isAdmin) {
          return (
            <html lang={lang}>
              <body className={`${openSans.variable} ${montserrat.variable} font-sans antialiased`}>
                <TranslationProvider initialLanguage={lang} initialTranslations={translations}>
                  <MaintenancePage />
                </TranslationProvider>
              </body>
            </html>
          );
        }
      }
    }
  } catch (error) {
    console.error("Maintenance check failed:", error);
  }

  return (
    <html lang={lang}>
      <body className={`${openSans.variable} ${montserrat.variable} font-sans antialiased`}>
        <TranslationProvider initialLanguage={lang} initialTranslations={translations}>
          <ThemeInitializer />
          <BanChecker />
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
