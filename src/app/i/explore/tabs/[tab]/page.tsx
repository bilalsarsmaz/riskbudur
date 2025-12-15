import ExploreFeed from "@/components/ExploreFeed";
import { redirect } from "next/navigation";

interface PageProps {
    params: {
        tab: string;
    };
}

export default async function ExploreTabPage({ params }: PageProps) {
    const { tab } = await params;

    let activeTab: "gundem" | "kisiler";

    if (tab === "trending") {
        activeTab = "gundem";
    } else if (tab === "online") {
        activeTab = "kisiler";
    } else {
        // Invalid tab, redirect to default
        redirect("/i/explore/tabs/trending");
    }

    return <ExploreFeed activeTab={activeTab} />;
}
