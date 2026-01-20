import { format } from 'date-fns';
import { tr, enUS, fr, it } from 'date-fns/locale';

const locales: Record<string, any> = {
    tr,
    en: enUS,
    fr,
    it
};

export const formatCustomDate = (dateVal: Date | string, lang: string = 'tr') => {
    const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Short suffixes for relative time (e.g. 5m, 2h)
    const suffixMap: Record<string, { m: string, h: string, now: string }> = {
        tr: { m: 'd', h: 's', now: 'şimdi' },
        en: { m: 'm', h: 'h', now: 'now' },
        fr: { m: 'm', h: 'h', now: 'maintenant' },
        it: { m: 'm', h: 'h', now: 'adesso' }
    };

    const suffixes = suffixMap[lang] || suffixMap['en'];

    if (diffInSeconds < 60) {
        return suffixes.now;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}${suffixes.m}`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}${suffixes.h}`;
    }

    // Use date-fns for localized date formatting
    const locale = locales[lang] || enUS;

    if (date.getFullYear() === now.getFullYear()) {
        return format(date, 'd MMM', { locale });
    }

    return format(date, 'd MMM yyyy', { locale });
};
