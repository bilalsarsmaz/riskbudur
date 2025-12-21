import { getPage } from '@/lib/pageContent';
import { sanitizeHtml } from "@/lib/sanitize";
import HelpLayout from "@/components/HelpLayout";
import { notFound } from "next/navigation";
import { Metadata } from 'next';

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata(
    props: Props,
): Promise<Metadata> {
    const params = await props.params;
    const page = await getPage(params.slug);

    if (!page) {
        return {
            title: 'Sayfa Bulunamadı | Riskbudur Yardım',
        }
    }

    return {
        title: `${page.title} | Riskbudur Yardım`,
        description: page.subtitle || `${page.title} hakkında bilgi.`,
    }
}

export default async function DynamicHelpPage(props: Props) {
    const params = await props.params;
    const page = await getPage(params.slug);

    if (!page) {
        notFound();
    }

    return (
        <HelpLayout title={page.title} subtitle={page.subtitle}>
            <div className="static-page-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.content) }} />
        </HelpLayout>
    );
}
