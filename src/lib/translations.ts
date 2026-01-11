
import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export type TranslationMap = Record<string, string>;

/**
 * Fetches all translations for a given language code.
 * Cached for performance.
 */
export const getTranslations = unstable_cache(
    async (languageCode: string): Promise<TranslationMap> => {
        try {
            const translations = await prisma.translation.findMany({
                where: { languageCode },
                select: { key: true, value: true },
            });

            return translations.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
            }, {} as TranslationMap);
        } catch (error) {
            console.error(`Error fetching translations for ${languageCode}:`, error);
            return {};
        }
    },
    ["translations-by-lang"],
    { revalidate: 60, tags: ["translations"] }
);

/**
 * Fetches the default language code.
 */
export const getDefaultLanguage = unstable_cache(
    async (): Promise<string> => {
        try {
            const lang = await prisma.language.findFirst({
                where: { isDefault: true },
                select: { code: true },
            });
            return lang?.code || "tr";
        } catch (error) {
            return "tr";
        }
    },
    ["default-language"],
    { revalidate: 3600, tags: ["languages"] }
);

/**
 * Invalidate cache helper (to be used in API routes)
 */
export const TAGS = {
    TRANSLATIONS: "translations",
    LANGUAGES: "languages",
};
