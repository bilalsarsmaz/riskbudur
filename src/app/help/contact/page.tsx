import { getPage } from "@/lib/pageContent";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import HelpLayout from "@/components/HelpLayout";
import { sanitizeHtml } from "@/lib/sanitize";
import ContactHelpButton from "@/components/ContactHelpButton";

export const metadata: Metadata = {
    title: "İletişim | Riskbudur Yardım",
};

export default async function HelpContactPage() {
    const page = await getPage("contact");

    if (!page) {
        notFound();
    }

    return (
        <HelpLayout title={page.title} subtitle={page.subtitle}>
            <div className="text-[15px] leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }} />
                <div className="mt-8">
                    <ContactHelpButton />
                </div>
            </div>
        </HelpLayout>
    );
}
