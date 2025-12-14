import { getPage } from "@/lib/pageContent";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import SecondaryLayout from "@/components/SecondaryLayout";

export const metadata: Metadata = {
    title: "Gizlilik Politikası | Riskbudur",
};

export default async function PrivacyPage() {
    const page = await getPage("privacy");

    if (!page) {
        notFound();
    }

    return (
        <SecondaryLayout>
            <GlobalHeader title={page.title} subtitle={page.subtitle} showBackButton={true} />
            <div className="p-4 static-page-content max-w-none text-[15px] leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
            </div>
        </SecondaryLayout>
    );
}
