"use client";

import { ReactNode } from "react";

interface SetupLayoutProps {
    children: ReactNode;
}

export default function SetupLayout({ children }: SetupLayoutProps) {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="flex justify-center mb-8 transition-transform hover:scale-105 duration-300">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.1)] overflow-hidden">
                        <img src="/riskbudurlogo.png" alt="Riskbudur Logo" className="w-14 h-14 object-contain" />
                    </div>
                </div>

                <div className="bg-[#111] border border-theme-border rounded-2xl p-6 sm:p-8">
                    {children}
                </div>

                <div className="mt-6 flex justify-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-[#333]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#333]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#DC5F00]"></div>
                </div>
            </div>
        </div>
    );
}
