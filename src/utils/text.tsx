import Link from "next/link";
import React from "react";

/**
 * Parses content and replaces mentions, hashtags, and links with clickable elements.
 * @param content The text content to parse.
 * @param mentionedUsers Optional array of usernames that are valid mentions. If undefined, all mentions are considered valid.
 * @param options Optional configuration.
 * @returns ReactNode array or the original string.
 */
export const parseContent = (
    content: string,
    mentionedUsers?: string[],
    options: {
        disablePostLinks?: boolean;
        enableFormatting?: boolean; // Enable *bold* and _italic_
    } = {}
) => {
    if (!content) return null;

    // Logic from PostItem: remove trailing post links if they appear at the end (often used for quote cards/link previews)
    // PostItem logic was: find all post links, remove them from content string *before* parsing others?
    // Actually PostItem says: "Önce içeriğin sadece post linki(leri) ve boşluklardan oluşup oluşmadığını kontrol et"
    // and "Post içeriğini parse edip hashtag ve linkleri tıklanabilir hale getir"

    // We will preserve the core logic:
    const postLinkRegex = /(?:https?:\/\/)?(?:www\.)?riskbudur\.net\/(?:[^\/]+\/)?status\/\d+/gi;

    /* 
       PostItem Logic adaptation:
       If the content is JUST links, checks are done. 
       But here we want a general purpose parser.
       Let's stick to the main loop which finds all entities.
    */

    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    const hashtagRegex = /#[\p{L}\p{N}_]+/gu;
    const mentionRegex = /@[\w_]+/g;
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2}(?:\/[^\s]*)?)/g;

    const matches: Array<{ type: 'hashtag' | 'mention' | 'link' | 'postlink' | 'bold' | 'italic'; start: number; end: number; text: string }> = [];

    // 1. Links
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
        const m = match;
        const isPostLink = /riskbudur\.net\/(?:[^\/]+\/)?status\/\d+/i.test(m[0]);

        // For standard PostItem usage, we might treat postLinks differently, but for general Display, a link is a link.
        // However, PostItem explicitly separates 'postlink' type to potentially HIDE it if it's the quoted post?
        // Let's rely on standard link behavior for now unless specifically 'postlink' logic is needed.
        // In PostItem: "const isPostLink ... if (!isPostLink ...) matches.push({type: 'link'})"

        // We will include post links as standard links for notifications unless we want to hide them.
        // Notifications probably want to see the link.

        // Let's stick to PostItem's exact logic to ensure we don't break PostItem, 
        // OR we make it configurable. 
        // PostItem hides the link text if it renders a card. Notifications don't confirm cards.

        // Let's implement the 'link' type.
        // Check overlap manually as in PostItem
        const isOverlapping = matches.some(existing =>
            (existing.start <= m.index && m.index < existing.end) ||
            (existing.start < m.index + m[0].length && m.index + m[0].length <= existing.end) ||
            (m.index <= existing.start && existing.end <= m.index + m[0].length)
        );

        if (!isOverlapping) {
            // In PostItem, isPostLink is skipped for the 'link' array, then added in a separate loop as 'postlink'.
            // We can do the same.
            if (isPostLink) {
                // Skip here, wait for postLink loop
            } else {
                matches.push({ type: 'link', start: m.index, end: m.index + m[0].length, text: m[0] });
            }
        }
    }

    // 2. Hashtags
    while ((match = hashtagRegex.exec(content)) !== null) {
        const m = match;
        const isOverlapping = matches.some(existing =>
            (existing.start <= m.index && m.index < existing.end) ||
            (existing.start < m.index + m[0].length && m.index + m[0].length <= existing.end) ||
            (m.index <= existing.start && existing.end <= m.index + m[0].length)
        );

        if (!isOverlapping) {
            matches.push({ type: 'hashtag', start: m.index, end: m.index + m[0].length, text: m[0] });
        }
    }

    // 3. Mentions
    while ((match = mentionRegex.exec(content)) !== null) {
        const m = match;
        const isEmail = m.index > 0 && content[m.index - 1] !== ' ' && content[m.index - 1] !== '\n'; // Simple email check

        const isOverlapping = matches.some(existing =>
            (existing.start <= m.index && m.index < existing.end) ||
            (existing.start < m.index + m[0].length && m.index + m[0].length <= existing.end) ||
            (m.index <= existing.start && existing.end <= m.index + m[0].length)
        );

        if (!isEmail && !isOverlapping) {
            matches.push({ type: 'mention', start: m.index, end: m.index + m[0].length, text: m[0] });
        }
    }

    // 4. Post Links (specific loop from PostItem)
    while ((match = postLinkRegex.exec(content)) !== null) {
        const m = match;
        const isOverlapping = matches.some(existing =>
            (existing.start <= m.index && m.index < existing.end) ||
            (existing.start < m.index + m[0].length && m.index + m[0].length <= existing.end) ||
            (m.index <= existing.start && existing.end <= m.index + m[0].length)
        );
        if (!isOverlapping) {
            matches.push({ type: 'postlink', start: m.index, end: m.index + m[0].length, text: m[0] });
        }
    }

    // 5. Formatting (Bold & Italic)
    if (options.enableFormatting) {
        // Bold (*text*)
        const boldRegex = /\*([^*]+)\*/g;
        let bMatch;
        while ((bMatch = boldRegex.exec(content)) !== null) {
            const m = bMatch;
            const isOverlapping = matches.some(existing =>
                (existing.start <= m.index && m.index < existing.end) ||
                (existing.start < m.index + m[0].length && m.index + m[0].length <= existing.end) ||
                (m.index <= existing.start && existing.end <= m.index + m[0].length)
            );
            if (!isOverlapping) {
                matches.push({ type: 'bold', start: m.index, end: m.index + m[0].length, text: m[0] });
            }
        }

        // Italic (_text_)
        const italicRegex = /_([^_]+)_/g;
        let iMatch;
        while ((iMatch = italicRegex.exec(content)) !== null) {
            const m = iMatch;
            const isOverlapping = matches.some(existing =>
                (existing.start <= m.index && m.index < existing.end) ||
                (existing.start < m.index + m[0].length && m.index + m[0].length <= existing.end) ||
                (m.index <= existing.start && existing.end <= m.index + m[0].length)
            );
            if (!isOverlapping) {
                matches.push({ type: 'italic', start: m.index, end: m.index + m[0].length, text: m[0] });
            }
        }
    }

    matches.sort((a, b) => a.start - b.start);

    matches.forEach((match, index) => {
        // Add text before match
        if (match.start > lastIndex) {
            parts.push(content.substring(lastIndex, match.start));
        }

        if (match.type === 'hashtag') {
            const hashtag = match.text.slice(1);
            parts.push(
                <Link
                    key={`hashtag-${index}`}
                    href={`/hashtag/${encodeURIComponent(hashtag.toLowerCase())}`}
                    className="text-[var(--app-global-link-color)] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    {match.text}
                </Link>
            );
            lastIndex = match.end;
        } else if (match.type === 'mention') {
            const username = match.text.slice(1);
            // Default to true if no list provided
            const isValidMention = mentionedUsers ? mentionedUsers.includes(username) : true;

            if (isValidMention) {
                parts.push(
                    <Link
                        key={`mention-${index}`}
                        href={`/${username}`}
                        className="text-[var(--app-global-link-color)] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {match.text}
                    </Link>
                );
            } else {
                parts.push(
                    <span
                        key={`mention-${index}`}
                        className="text-[var(--app-body-text)]"
                    >
                        {match.text}
                    </span>
                );
            }
            lastIndex = match.end;
        } else if (match.type === 'link') {
            let url = match.text;
            if (url.startsWith('www.')) {
                url = 'https://' + url;
            } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            parts.push(
                <a
                    key={`link-${index}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--app-global-link-color)] hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    {match.text}
                </a>
            );
            lastIndex = match.end;
        } else if (match.type === 'postlink') {
            if (options.disablePostLinks) {
                parts.push(
                    <Link
                        key={`postlink-${index}`}
                        href={match.text}
                        className="text-[var(--app-global-link-color)] hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {match.text}
                    </Link>
                );
            }
            lastIndex = match.end;
        } else if (match.type === 'bold') {
            parts.push(<strong key={`bold-${index}`}>{match.text.slice(1, -1)}</strong>);
            lastIndex = match.end;
        } else if (match.type === 'italic') {
            parts.push(<em key={`italic-${index}`}>{match.text.slice(1, -1)}</em>);
            lastIndex = match.end;
        }
    });

    if (lastIndex < content.length) {
        const remaining = content.substring(lastIndex);
        if (remaining) {
            parts.push(remaining);
        }
    }

    return parts.length > 0 ? parts : content;
};
