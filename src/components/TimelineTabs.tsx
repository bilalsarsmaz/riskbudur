 // @ts-nocheck

 "use client";

 type TimelineType = "all" | "following";

 interface TimelineTabsProps {
   activeTab: TimelineType;
   onTabChange: (tab: TimelineType) => void;
 }

 export default function TimelineTabs({ activeTab, onTabChange }: TimelineTabsProps) {
   return (
     <div className="w-full bg-black border-b border-[#222222]">
       <div className="flex">
         <button
           onClick={() => onTabChange("all")}
           className={`flex-1 py-4 px-4 text-center relative transition-colors ${
             activeTab === "all"
               ? "text-[#1DCD9F] font-bold"
               : "text-gray-400 font-medium hover:text-gray-200"
           }`}
         >
           Sitedeki Herkes
           {activeTab === "all" && (
             <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1DCD9F] rounded-t-full"></div>
           )}
         </button>
         <button
           onClick={() => onTabChange("following")}
           className={`flex-1 py-4 px-4 text-center relative transition-colors ${
             activeTab === "following"
               ? "text-[#1DCD9F] font-bold"
               : "text-gray-400 font-medium hover:text-gray-200"
           }`}
         >
           Takip Ettiklerim
           {activeTab === "following" && (
             <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1DCD9F] rounded-t-full"></div>
           )}
         </button>
       </div>
     </div>
   );
 }
