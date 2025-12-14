import { IconRosetteDiscountCheckFilled } from "@tabler/icons-react";

interface VerificationBadgeProps {
    tier?: 'NONE' | 'GREEN' | 'GOLD' | 'GRAY' | string;
    hasBlueTick?: boolean;
    username?: string;
    className?: string;
    style?: React.CSSProperties;
}

export default function VerificationBadge({ tier, hasBlueTick, username, className = "w-5 h-5 ml-1", style }: VerificationBadgeProps) {
    if ((!tier || tier === 'NONE') && !hasBlueTick) {
        return null;
    }

    let colorClass = ''; // Default to base style (Green via globals.css)

    if (tier === 'GOLD' || username === 'riskbudur') {
        colorClass = 'gold';
    } else if (tier === 'GREEN') {
        colorClass = 'default';
    }

    return (
        <IconRosetteDiscountCheckFilled
            className={`${className} verified-icon ${colorClass}`}
            style={style}
        />
    );
}
