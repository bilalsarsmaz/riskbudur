"use client";

import LeftSidebar from "@/components/LeftSidebar";
import { ReactNode } from "react";

interface AppPageLayoutProps {
  children: ReactNode;
  rightSidebar?: ReactNode;
  mainClassName?: string;
  timelineSectionClassName?: string;
  rightSidebarWrapperClassName?: string;
}

export default function AppPageLayout({
  children,
  rightSidebar,
  mainClassName = "",
  timelineSectionClassName = "",
  rightSidebarWrapperClassName = "hidden 2xl:block",
}: AppPageLayoutProps) {
  return (
    <>
      <header className="left-nav fixed left-0 top-0 h-screen overflow-y-auto z-10 w-[68px] sm:w-[88px] lg:w-[595px]">
        <div className="absolute left-0 sm:left-0 lg:left-[320px] w-full sm:w-full lg:w-[275px] h-full p-0 m-0 border-0">
          <LeftSidebar />
        </div>
      </header>

      <div className="ml-[68px] sm:ml-[88px] lg:ml-[595px] flex justify-center">
        <main className={`content flex w-full max-w-[1310px] min-h-screen px-2 sm:px-4 ${mainClassName}`}>
          <section className={`timeline flex-1 w-full lg:max-w-[600px] flex flex-col items-center pt-6 ${timelineSectionClassName}`}>
            <div className="w-full">{children}</div>
          </section>

          {rightSidebar && (
            <aside className={`${rightSidebarWrapperClassName} w-[350px] flex-shrink-0 ml-[10px] pt-6`}>
              <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                {rightSidebar}
              </div>
            </aside>
          )}
        </main>
      </div>
    </>
  );
}
