import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(content: string): string {
    return DOMPurify.sanitize(content, {
        USE_PROFILES: { html: true },
        // Allow common attributes and tags for rich text
        ADD_TAGS: ['iframe'], // If we want to allow embeds explicitly, otherwise remove this
        ADD_ATTR: ['target', 'allow', 'allowfullscreen', 'frameborder', 'scrolling']
    });
}
