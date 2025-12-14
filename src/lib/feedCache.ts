import { EnrichedPost } from "@/types/post";

interface FeedCache {
    posts: EnrichedPost[];
    page: number;
    hasMore: boolean;
    scrollPosition: number;
    timestamp: number;
}

let cache: FeedCache | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

export const feedCache = {
    set: (data: Omit<FeedCache, "timestamp">) => {
        cache = {
            ...data,
            timestamp: Date.now(),
        };
    },

    get: (): FeedCache | null => {
        if (!cache) return null;

        // Cache suresi dolmussa null don
        if (Date.now() - cache.timestamp > CACHE_DURATION) {
            cache = null;
            return null;
        }

        return cache;
    },

    clear: () => {
        cache = null;
    }
};
