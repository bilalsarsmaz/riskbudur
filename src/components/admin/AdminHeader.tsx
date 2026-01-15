"use client";

import { IconSearch, IconBell, IconSettings } from "@tabler/icons-react";

export default function AdminHeader() {
    return (
        <header className="h-[60px] flex items-center justify-between px-8 border-b border-gray-800 bg-[#040404]">
            {/* Left: Breadcrumbs or Page Title (Optional, search is better for SaaS) */}
            <div className="relative w-96">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                    type="text"
                    placeholder="Type to search..."
                    className="w-full bg-gray-900/50 border border-transparent focus:border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-600 outline-none transition-all"
                />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Upgrade / Add Button (Reference style) */}
                <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white text-black rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors">
                    <span>+ New Report</span>
                </button>

                <div className="h-6 w-[1px] bg-gray-800"></div>

                <button className="text-gray-400 hover:text-white transition-colors relative">
                    <IconBell size={20} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#040404]"></span>
                </button>

                <button className="text-gray-400 hover:text-white transition-colors">
                    <IconSettings size={20} />
                </button>
            </div>
        </header>
    );
}
