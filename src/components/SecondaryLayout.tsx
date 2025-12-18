import LeftSidebar from "./LeftSidebar";
import MobileBottomNav from "./mobile/MobileBottomNav";
import MobileHeader from "./mobile/MobileHeader";

// Update props interface
interface SecondaryLayoutProps {
    children: React.ReactNode;
    showLeftSidebar?: boolean;
    className?: string;
    maxWidth?: string;
    sidebarContent?: React.ReactNode; // New prop for custom sidebar
    hideMobileElements?: boolean;
}

// Update function signature and render logic
export default function SecondaryLayout({
    children,
    showLeftSidebar = true,
    className = "",
    maxWidth = "900px",
    sidebarContent,
    hideMobileElements = false
}: SecondaryLayoutProps) {
    return (
        <>
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

                    {/* Wide Content Area (Middle + Right merged) */}
                    <section
                        className={`flex-1 w-full flex flex-col items-stretch lg:border-x border-theme-border ${hideMobileElements ? '' : 'pt-14 pb-16'} lg:pt-0 lg:pb-0 relative ${className}`}
                        style={{ maxWidth }}
                    >
                        {children}
                    </section>
                </div>
            </div>

            {/* Mobile Header moved to bottom for auto-scroll fix */}
            {!hideMobileElements && <MobileHeader />}

            {/* Mobile Bottom Navigation */}
            {!hideMobileElements && <MobileBottomNav />}
        </>
    );
}
