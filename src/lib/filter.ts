
import prisma from "@/lib/prisma";

let cachedWords: string[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache

async function getSensitiveWords(): Promise<string[]> {
    const now = Date.now();
    if (cachedWords && (now - lastFetch < CACHE_TTL)) {
        return cachedWords;
    }

    try {
        const words = await prisma.sensitiveWord.findMany({
            select: { word: true }
        });
        cachedWords = words.map(w => w.word.toLowerCase());
        lastFetch = now;
        return cachedWords;
    } catch (e) {
        console.error("Failed to fetch sensitive words", e);
        return [];
    }
}

export async function hasSensitiveContent(text: string | null | undefined): Promise<boolean> {
    if (!text) return false;

    const badWords = await getSensitiveWords();
    if (badWords.length === 0) return false;

    // Normalizasyon ve kontrol
    const normalizedText = text.toLowerCase();

    // Kelime sınırlarıyla kontrol et (regex kullanmadan basit performanslı kontrol, 
    // ancak tam kelime eşleşmesi için regex gerekebilir. 
    // Admin panelinde girilen kelimeler "regex" gibi değil "kelime" gibi. 
    // Mevcut mantık regex kullanıyordu, aynısını koruyalım ama boolean donsun)

    // Sort logic is less critical for boolean check but good for optimization if we return early
    // No sorting needed if we just use .some()

    for (const word of badWords) {
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Case insensitive match for whole word
        const regex = new RegExp(`\\b${escapedWord}\\b`, 'i');
        if (regex.test(normalizedText)) {
            return true;
        }
    }

    return false;
}
