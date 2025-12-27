"use client";

import SecondaryLayout from "@/components/SecondaryLayout";
import SettingsList from "@/components/settings/SettingsList";
import { usePathname } from "next/navigation";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isRootSettings = pathname === "/settings";

    return (
        <SecondaryLayout maxWidth="100%">
            <div className="flex w-full h-[calc(100dvh-60px)] lg:h-screen overflow-hidden bg-black text-white">

                {/* Middle Area (Menu List) - 400px Fixed on Desktop */}
                {/* Hidden on Mobile if NOT at root /settings */}
                <div className={`
            w-full lg:w-[400px] flex-shrink-0 h-full bg-black border-r border-[#2f3336]
            ${!isRootSettings ? "hidden lg:block" : "block"}
        `}>
                    <SettingsList />
                </div>

                {/* Right Area (Detail/Children) - Flex 1 */}
                {/* Hidden on Mobile if at root /settings */}
                <div className={`
            flex-1 h-full bg-black overflow-y-auto
            ${isRootSettings ? "hidden lg:block" : "block"}
        `}>
                    <div className="h-full flex flex-col">
                        {children}
                    </div>
                </div>

            </div>
        </SecondaryLayout>
    );
}
