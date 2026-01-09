import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Riskbudur",
  description: "underground sosyal medya",
};

import ApprovalGuard from "@/components/ApprovalGuard";
import BanChecker from "@/components/BanChecker";
import MaintenancePage from "@/components/MaintenancePage";
import { getSystemSettings } from "@/lib/settings";
import { cookies, headers } from "next/headers";
import { verifyToken } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check Maintenance Mode (Server-Side)
  try {
    const settings = await getSystemSettings();
    if (settings.maintenanceMode) {
      const headersList = await headers();
      const pathname = headersList.get("x-current-path") || "";

      // Allow Login and Auth API
      if (!pathname.startsWith("/login") && !pathname.startsWith("/api/auth")) {
        const cookieStore = await cookies();
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
            <html lang="tr">
              <body className={`${openSans.variable} font-sans antialiased`}>
                <MaintenancePage />
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
    <html lang="tr">
      <body className={`${openSans.variable} font-sans antialiased`}>
        <ApprovalGuard>
          <BanChecker />
          {children}
        </ApprovalGuard>
      </body>
    </html>
  );
}
