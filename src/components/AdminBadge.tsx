import { IconShieldCheckFilled } from "@tabler/icons-react";

interface AdminBadgeProps {
    role?: string;
    className?: string;
}

export default function AdminBadge({ role, className = "w-5 h-5 ml-1" }: AdminBadgeProps) {
    if (!role || role === 'USER') return null;

    // roles: ADMIN, MODERATOR, SUPERADMIN
    const isAdminRole = ['ADMIN', 'MODERATOR', 'LEAD', 'ROOTADMIN'].includes(role);

    if (!isAdminRole) return null;

    return (
        <IconShieldCheckFilled
            className={`${className} app-adminbadge`}
            title={role} // optional tooltip
        />
    );
}
