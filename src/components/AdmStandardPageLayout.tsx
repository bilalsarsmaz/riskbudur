import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import MobileBottomNav from "./mobile/MobileBottomNav";
import MobileHeader from "./mobile/MobileHeader";

interface AdmStandardPageLayoutProps {
    children: React.ReactNode;
    showLeftSidebar?: boolean;
    showRightSidebar?: boolean;
    className?: string;
    sidebarContent?: React.ReactNode; // Prop for custom sidebar
    rightSidebarContent?: React.ReactNode; // Prop for custom right sidebar
}

/**
 * Admin Standard 3-column layout: Left Sidebar + Middle Content + Right Sidebar
 * Layout: S + M + R
 * - Left: 88px (md) → 275px (xl)
 * - Middle: max 600px
 * - Right: 350px (visible on lg+)
 */
export default function AdmStandardPageLayout({
    children,
    showLeftSidebar = true,
    showRightSidebar = true,
    className = "",
    sidebarContent,
    rightSidebarContent
}: AdmStandardPageLayoutProps) {
    return (
        <>
            {/* Mobile Header */}
            <MobileHeader />

            <div className="flex justify-center w-full min-h-screen" style={{ backgroundColor: 'var(--app-body-bg)' }}>
                <div className="flex w-full max-w-[1310px]">
                    {/* Left Sidebar */}
                    {showLeftSidebar && (
                        <header className="left-nav flex-shrink-0 w-[88px] xl:w-[275px] h-screen sticky top-0 overflow-y-auto z-10 hidden lg:block">
                            <div className="h-full w-full">
                                {sidebarContent ? sidebarContent : <LeftSidebar />}
                            </div>
                        </header>
                    )}

                    {/* Middle Content */}
                    <section className={`flex-1 w-full lg:max-w-[600px] flex flex-col items-stretch lg:border-x border-theme-border pt-14 lg:pt-0 pb-16 lg:pb-0 relative ${className}`}>
                        {children}
                    </section>

                    {/* Right Sidebar */}
                    {showRightSidebar && (
                        <aside className="w-[350px] ml-[10px] pt-6 hidden lg:block">
                            {rightSidebarContent ? rightSidebarContent : <RightSidebar />}
                        </aside>
                    )}
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </>
    );
}
