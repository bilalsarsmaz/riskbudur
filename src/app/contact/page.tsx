import { getPage } from "@/lib/pageContent";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import GlobalHeader from "@/components/GlobalHeader";
import StandardPageLayout from "@/components/StandardPageLayout";

export const metadata: Metadata = {
    title: "İletişim | Riskbudur",
};

export default async function ContactPage() {
    const page = await getPage("contact");

    if (!page) {
        notFound();
    }

    return (
        <StandardPageLayout>
            <GlobalHeader title={page.title} subtitle={page.subtitle} showBackButton={true} />
            <div className="p-4 static-page-content max-w-none text-[15px] leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
            </div>
        </StandardPageLayout>
    );
}
