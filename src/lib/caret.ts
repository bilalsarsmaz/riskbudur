/**
 * Calculate coordinates for the caret in a text input or textarea.
 * Based on https://github.com/component/textarea-caret-position
 */

export interface Coordinates {
    top: number;
    left: number;
    height: number;
}

const properties = [
    'direction',
    'boxSizing',
    'width',
    'height',
    'overflowX',
    'overflowY',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'fontSizeAdjust',
    'lineHeight',
    'fontFamily',
    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration',
    'letterSpacing',
    'wordSpacing',
    'tabSize',
    'MozTabSize',
] as const;

export function getCaretCoordinates(element: HTMLTextAreaElement | HTMLInputElement, position: number): Coordinates {
    const isFirefox = typeof window !== 'undefined' && (window as any).mozInnerScreenX != null;

    const div = document.createElement('div');
    div.id = 'input-textarea-caret-position-mirror-div';
    document.body.appendChild(div);

    const style = div.style;
    const computed = window.getComputedStyle(element);

    style.whiteSpace = 'pre-wrap';
    if (element.nodeName !== 'INPUT')
        style.wordWrap = 'break-word';

    style.position = 'absolute';
    style.visibility = 'hidden';

    properties.forEach(prop => {
        // @ts-ignore
        style[prop] = computed[prop];
    });

    if (isFirefox) {
        if (element.scrollHeight > parseInt(computed.height))
            style.overflowY = 'scroll';
    } else {
        style.overflow = 'hidden';
    }

    div.textContent = element.value.substring(0, position);

    if (element.nodeName === 'INPUT')
        div.textContent = div.textContent.replace(/\s/g, '\u00a0');

    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.';
    div.appendChild(span);

    const coordinates = {
        top: span.offsetTop + parseInt(computed['borderTopWidth']),
        left: span.offsetLeft + parseInt(computed['borderLeftWidth']),
        height: parseInt(computed['lineHeight'])
    };

    document.body.removeChild(div);

    return coordinates;
}
