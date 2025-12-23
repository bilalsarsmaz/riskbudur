
export enum Permission {
    // User Management
    MANAGE_USER_AVATAR = 'MANAGE_USER_AVATAR',
    MANAGE_USER_COVER = 'MANAGE_USER_COVER',
    MANAGE_USER_FULLNAME = 'MANAGE_USER_FULLNAME',
    MANAGE_USER_USERNAME = 'MANAGE_USER_USERNAME', // Lead+
    DELETE_USER = 'DELETE_USER', // Lead+
    APPROVE_USER = 'APPROVE_USER', // Lead+
    BAN_USER = 'BAN_USER',

    // Content Management
    DELETE_USER_POST = 'DELETE_USER_POST',
    EDIT_USER_POST = 'EDIT_USER_POST',

    // System / Platform
    MANAGE_ANNOUNCEMENTS = 'MANAGE_ANNOUNCEMENTS', // Lead+
    MANAGE_PAGES = 'MANAGE_PAGES', // Admin+
    FIX_BUGS = 'FIX_BUGS', // Admin+ (Conceptually)

    // Role Management
    VIEW_MODERATORS = 'VIEW_MODERATORS', // Lead+
    VIEW_LEADS = 'VIEW_LEADS', // Admin+
    GRANT_ROLES = 'GRANT_ROLES', // Admin+
    GRANT_BADGES = 'GRANT_BADGES', // Admin+

    // Special
    GHOST_MESSAGE = 'GHOST_MESSAGE', // RootAdmin only
}

export type Role = 'USER' | 'MODERATOR' | 'LEAD' | 'ADMIN' | 'ROOTADMIN';

const ROLE_HIERARCHY: Record<Role, number> = {
    'USER': 0,
    'MODERATOR': 1,
    'LEAD': 2,
    'ADMIN': 3,
    'ROOTADMIN': 5,
};

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    'USER': [],
    'MODERATOR': [
        Permission.MANAGE_USER_AVATAR,
        Permission.MANAGE_USER_COVER,
        Permission.MANAGE_USER_FULLNAME,
        Permission.BAN_USER,
        Permission.DELETE_USER_POST,
        Permission.EDIT_USER_POST,
    ],
    'LEAD': [
        // Moderator Permissions
        Permission.MANAGE_USER_AVATAR,
        Permission.MANAGE_USER_COVER,
        Permission.MANAGE_USER_FULLNAME,
        Permission.BAN_USER,
        Permission.DELETE_USER_POST,
        Permission.EDIT_USER_POST,

        // Lead Specific
        Permission.MANAGE_USER_USERNAME,
        Permission.DELETE_USER,
        Permission.APPROVE_USER,
        Permission.MANAGE_ANNOUNCEMENTS,
        Permission.VIEW_MODERATORS,
    ],
    'ADMIN': [
        // All Lead Permissions
        Permission.MANAGE_USER_AVATAR,
        Permission.MANAGE_USER_COVER,
        Permission.MANAGE_USER_FULLNAME,
        Permission.BAN_USER,
        Permission.DELETE_USER_POST,
        Permission.EDIT_USER_POST,
        Permission.MANAGE_USER_USERNAME,
        Permission.DELETE_USER,
        Permission.APPROVE_USER,
        Permission.MANAGE_ANNOUNCEMENTS,
        Permission.VIEW_MODERATORS,

        // Admin Specific
        Permission.MANAGE_PAGES,
        Permission.FIX_BUGS,
        Permission.VIEW_LEADS,
        Permission.GRANT_ROLES,
        Permission.GRANT_BADGES,
    ],

    'ROOTADMIN': [
        // All Admin Permissions + Ghost Message
        Permission.MANAGE_USER_AVATAR,
        Permission.MANAGE_USER_COVER,
        Permission.MANAGE_USER_FULLNAME,
        Permission.BAN_USER,
        Permission.DELETE_USER_POST,
        Permission.EDIT_USER_POST,
        Permission.MANAGE_USER_USERNAME,
        Permission.DELETE_USER,
        Permission.APPROVE_USER,
        Permission.MANAGE_ANNOUNCEMENTS,
        Permission.VIEW_MODERATORS,
        Permission.MANAGE_PAGES,
        Permission.FIX_BUGS,
        Permission.VIEW_LEADS,
        Permission.GRANT_ROLES,
        Permission.GRANT_BADGES,

        Permission.GHOST_MESSAGE,
    ]
};

export function hasPermission(role: Role | undefined | null, permission: Permission): boolean {
    if (!role) return false;

    // SuperAdmin and RootAdmin usually bypass checks, but let's be explicit with the matrix
    if (role === 'ROOTADMIN') return true;

    const permissions = ROLE_PERMISSIONS[role];
    return permissions?.includes(permission) || false;
}

/**
 * Checks if the actor has a higher role than the target.
 * Users strictly cannot modify users with higher or equal roles.
 */
export function canManageRole(actorRole: Role, targetRole: Role): boolean {
    const actorRank = ROLE_HIERARCHY[actorRole] || 0;
    const targetRank = ROLE_HIERARCHY[targetRole] || 0;

    return actorRank > targetRank;
}
