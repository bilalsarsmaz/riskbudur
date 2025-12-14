export const formatCustomDate = (dateVal: Date | string) => {
    const date = typeof dateVal === 'string' ? new Date(dateVal) : dateVal;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return "şimdi";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}d`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}s`;
    }

    if (date.getFullYear() === now.getFullYear()) {
        const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
        return `${date.getDate()} ${months[date.getMonth()]}`;
    }

    const months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};
