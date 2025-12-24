import fs from 'fs';
import path from 'path';

// Trigger words (Politicians)
const TRIGGERS = [
    "recep", "tayyip", "erdoğan", "erdogan",
    "tayyibin", "tayyibi", "tayyibe",
    "erdoğanın", "erdoğanı", "erdoganin",
    "recebin", "recebi"
];

// Cache for bad words to avoid reading file on every request
let BAD_WORDS_CACHE: string[] | null = null;

function getBadWords(): string[] {
    if (BAD_WORDS_CACHE) return BAD_WORDS_CACHE;

    try {
        const filePath = path.join(process.cwd(), 'swears.txt');
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            // Split by any newline characters, trim, lower case
            BAD_WORDS_CACHE = fileContent
                .split(/[\r\n]+/)
                .map(w => w.trim().toLowerCase())
                .filter(w => w.length > 0);
        } else {
            console.warn("swears.txt not found at", filePath);
            BAD_WORDS_CACHE = [];
        }
    } catch (error) {
        console.error("Error reading swears.txt:", error);
        BAD_WORDS_CACHE = [];
    }

    return BAD_WORDS_CACHE!;
}

/**
 * Normalizes text by replacing leetspeak characters with standard equivalents.
 */
function normalizeText(text: string): string {
    return text.toLowerCase()
        .replace(/1|!|İ|ı/g, 'i')
        .replace(/0/g, 'o')
        .replace(/3/g, 'e')
        .replace(/4|@/g, 'a')
        .replace(/5|\$/g, 's')
        .replace(/ß/g, 'b');
}

/**
 * Checks if content should be censored based on triggers and bad words.
 * Rule: Content must contain at least one TRIGGER word AND at least one BAD word.
 */
export function shouldCensorContent(content: string): boolean {
    if (!content) return false;

    // Normalize content for checking (handle substitutions)
    const normalizedContent = normalizeText(content);

    // 1. Check for Triggers
    const hasTrigger = TRIGGERS.some(trigger => normalizedContent.includes(trigger));
    if (!hasTrigger) return false;

    // 2. Remove triggers from content to avoid false positives (e.g. "ip" in "Tayyip")
    let checkContent = normalizedContent;
    TRIGGERS.forEach(trigger => {
        checkContent = checkContent.split(trigger).join(' ');
    });

    // 3. Check for Bad Words in the remaining content
    const badWords = getBadWords();
    const hasBadWord = badWords.some(badWord => {
        // Robust check: Handle bad words that might have been loaded with whitespace
        const cleanBadWord = badWord.trim();
        // Normalize bad word too just in case (though file should be standard)
        // Actually no, bad words list is standard turkish usually. 
        if (!cleanBadWord) return false;

        return checkContent.includes(cleanBadWord);
    });

    return hasBadWord;
}

