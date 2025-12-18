export const formatRelativeTime = (date: Date | string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "şimdi";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}dk`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}sa`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}g`;

    return past.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};
