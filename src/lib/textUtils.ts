
/**
 * Extracts hashtags from content.
 * Example: "#hello world #test" -> ["hello", "test"]
 */
export function extractHashtags(content: string): string[] {
    const hashtagRegex = /#[\p{L}\p{N}_]+/gu;
    const matches = content.match(hashtagRegex);
    if (!matches) return [];
    return [...new Set(matches.map(tag => tag.slice(1).toLowerCase()))];
}

/**
 * Extracts mentions from content.
 * Example: "@user1 hello @user2" -> ["user1", "user2"]
 */
export function extractMentions(content: string): string[] {
    const mentionRegex = /@[\w_]+/g;
    const matches = content.match(mentionRegex);
    if (!matches) return [];
    return [...new Set(matches.map(tag => tag.slice(1)))];
}
