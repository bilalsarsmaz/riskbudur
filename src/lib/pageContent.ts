import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'pages.json');

export interface PageData {
    slug: string;
    title: string;
    subtitle?: string;
    content: string;
}

async function readPages(): Promise<PageData[]> {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if ((error as any).code === 'ENOENT') {
            // File doesn't exist, return empty or default
            return [];
        }
        throw error;
    }
}

async function writePages(pages: PageData[]): Promise<void> {
    await fs.writeFile(DATA_FILE, JSON.stringify(pages, null, 2), 'utf-8');
}

export async function getPages(): Promise<PageData[]> {
    return readPages();
}

export async function getPage(slug: string): Promise<PageData | undefined> {
    const pages = await readPages();
    return pages.find((p) => p.slug === slug);
}

export async function updatePage(slug: string, content: string, title?: string, subtitle?: string): Promise<PageData | null> {
    const pages = await readPages();
    const index = pages.findIndex((p) => p.slug === slug);

    if (index === -1) {
        return null;
    }

    pages[index].content = content;
    if (title) pages[index].title = title;
    if (subtitle !== undefined) pages[index].subtitle = subtitle;

    await writePages(pages);
    return pages[index];
}

export async function deletePage(slug: string): Promise<boolean> {
    const pages = await readPages();
    const newPages = pages.filter((p) => p.slug !== slug);

    if (newPages.length === pages.length) {
        return false;
    }

    await writePages(newPages);
    return true;
}
