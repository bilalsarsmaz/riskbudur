import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(content: string): string {
    return DOMPurify.sanitize(content, {
        // Allow rich text tags and attributes
        ADD_TAGS: ['iframe', 'p', 'span', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'b', 'strong', 'i', 'em', 'u', 'a', 'img', 'blockquote'],
        ADD_ATTR: ['target', 'allow', 'allowfullscreen', 'frameborder', 'scrolling', 'style', 'class', 'href', 'src', 'alt', 'width', 'height']
    });
}
