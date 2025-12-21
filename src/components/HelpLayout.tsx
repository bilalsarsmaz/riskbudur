import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";

interface HelpLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export default function HelpLayout({ children, title, subtitle }: HelpLayoutProps) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center">
            {/* Header / Top Bar */}
            <div className="w-full max-w-4xl px-4 py-6 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="https://riskbudur.net" className="p-2 hover:bg-gray-900 rounded-full transition-colors" title="Platforma Dön">
                        <IconArrowLeft className="w-6 h-6 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                            Riskbudur Yardım
                        </h1>
                        <p className="text-sm text-gray-500">Destek Merkezi</p>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="w-full max-w-4xl px-4 py-8 flex-1">
                {title && (
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">{title}</h2>
                        {subtitle && <p className="text-gray-400">{subtitle}</p>}
                    </div>
                )}

                <div className="prose prose-invert max-w-none prose-orange">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-8 text-center text-gray-600 border-t border-gray-900 mt-auto">
                <p>&copy; {new Date().getFullYear()} Riskbudur.com - Tüm Hakları Saklıdır.</p>
            </footer>
        </div>
    );
}
