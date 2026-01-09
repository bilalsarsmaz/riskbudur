
export enum Permission {
    // User Management
    MANAGE_USER_AVATAR = 'MANAGE_USER_AVATAR',
    MANAGE_USER_COVER = 'MANAGE_USER_COVER',
    MANAGE_USER_FULLNAME = 'MANAGE_USER_FULLNAME',
    MANAGE_USER_USERNAME = 'MANAGE_USER_USERNAME',
    DELETE_USER = 'DELETE_USER',
    APPROVE_USER = 'APPROVE_USER',
    BAN_USER = 'BAN_USER',
    VERIFY_USERS = 'VERIFY_USERS',

    // Post Management
    DELETE_USER_POST = 'DELETE_USER_POST',
    EDIT_USER_POST = 'EDIT_USER_POST',

    // System Management
    MANAGE_PAGES = 'MANAGE_PAGES',
    FIX_BUGS = 'FIX_BUGS',
    MANAGE_ANNOUNCEMENTS = 'MANAGE_ANNOUNCEMENTS',
    MANAGE_REPORTS = 'MANAGE_REPORTS', // Reports
    MANAGE_SETTINGS = 'MANAGE_SETTINGS',
    VIEW_LOGS = 'VIEW_LOGS',
    MANAGE_SENSITIVE_CONTENT = 'MANAGE_SENSITIVE_CONTENT', // New
    MANAGE_WIDGETS = 'MANAGE_WIDGETS', // New
    VIEW_SYSTEM_STATUS = 'VIEW_SYSTEM_STATUS', // New (Server Status)

    // Role Management
    GRANT_ROLES = 'GRANT_ROLES',
    GRANT_BADGES = 'GRANT_BADGES',
    VIEW_MODERATORS = 'VIEW_MODERATORS',
    VIEW_LEADS = 'VIEW_LEADS', // Deprecated

    // Views
    VIEW_DASHBOARD = 'VIEW_DASHBOARD',
    VIEW_REPORTS = 'VIEW_REPORTS',
    MANAGE_USERS = 'MANAGE_USERS', // General User Management View
    BAN_USERS = 'BAN_USERS', // Ban View
    DELETE_USERS = 'DELETE_USERS', // Delete View
    MANAGE_ROLES = 'MANAGE_ROLES',

    // Special
    GHOST_MESSAGE = 'GHOST_MESSAGE', // RootAdmin only
}

export type Role = 'USER' | 'MODERATOR' | 'ADMIN' | 'ROOTADMIN';

export const ROLE_HIERARCHY: Record<Role, number> = {
    'ROOTADMIN': 4,
    'ADMIN': 3,
    'MODERATOR': 1,
    'USER': 0
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    'ROOTADMIN': [
        // Tam yetki (All Permissions)
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_USERS,
        Permission.BAN_USERS,
        Permission.DELETE_USERS,
        Permission.VIEW_REPORTS,
        Permission.MANAGE_REPORTS,
        Permission.MANAGE_SETTINGS,
        Permission.VIEW_LOGS,
        Permission.MANAGE_ROLES,
        Permission.VERIFY_USERS,
        Permission.MANAGE_ANNOUNCEMENTS,
        Permission.GHOST_MESSAGE,
        Permission.GRANT_ROLES,
        Permission.GRANT_BADGES,
        Permission.FIX_BUGS,
        Permission.MANAGE_PAGES,
        Permission.APPROVE_USER,
        Permission.DELETE_USER,
        Permission.MANAGE_USER_USERNAME,
        Permission.MANAGE_USER_FULLNAME,
        Permission.MANAGE_USER_COVER,
        Permission.MANAGE_USER_AVATAR,
        Permission.DELETE_USER_POST,
        Permission.EDIT_USER_POST,
        Permission.BAN_USER,
        Permission.VIEW_MODERATORS,
        Permission.MANAGE_SENSITIVE_CONTENT,
        Permission.MANAGE_WIDGETS,
        Permission.VIEW_SYSTEM_STATUS
    ],
    'ADMIN': [
        // Limited System Access
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_USERS,
        Permission.BAN_USERS,
        // No DELETE_USERS for Admin as per matrix? Matrix says "Kullanıcıyı silme -> Root Only".
        // But let's check: Matrix Row "Kullanıcıyı silme" -> Root: Yes, Admin: Yes, Moderator: X.
        // Wait, "Kullanıcıyı silme" -> Root: √, Admin: √, Mod: X.
        Permission.DELETE_USERS, // View Permission
        Permission.DELETE_USER,  // Action Permission

        Permission.VIEW_REPORTS,
        Permission.MANAGE_REPORTS,

        // Settings Access? "Hassas İçerikler -> Admin: √". "Widget açma/kapama -> Admin: X".
        Permission.MANAGE_SENSITIVE_CONTENT,

        // No MANAGE_SETTINGS generally? Or constrained? 
        // Let's give MANAGE_SETTINGS but restrict specific tabs in UI.
        Permission.MANAGE_SETTINGS,

        // No VIEW_LOGS (Server Status -> Admin: X)?
        // Matrix "Sunucu Durumu -> Root: √, Admin: X".
        // So NO VIEW_LOGS or VIEW_SYSTEM_STATUS

        // Role Management -> "Kullanıcıya yetki verme/alma -> Root: √, Admin: X"
        Permission.MANAGE_ROLES, // View role list? Perhaps. But cannot GRANT.
        // Grant Roles -> X.

        Permission.VERIFY_USERS, // "Kullanıcı Onaylama -> Admin: √"
        Permission.APPROVE_USER,

        Permission.MANAGE_ANNOUNCEMENTS, // "Duyuru Yönetimi -> Admin: √"

        Permission.GRANT_BADGES, // "Kullanıcıya rozet verme/alma -> Admin: √"

        Permission.MANAGE_USER_USERNAME, // "Username düzenleme -> Admin: √"
        Permission.MANAGE_USER_FULLNAME,
        Permission.MANAGE_USER_COVER,
        Permission.MANAGE_USER_AVATAR,
        Permission.DELETE_USER_POST,
        Permission.EDIT_USER_POST,
        Permission.BAN_USER,
        Permission.VIEW_MODERATORS

        // "Platform sayfalarını oluşturma -> Admin: X" -> No MANAGE_PAGES
        // "Widget açma/kapama -> Admin: X" -> No MANAGE_WIDGETS
        // "GhostMessage -> Admin: X" -> No GHOST_MESSAGE
    ],
    'MODERATOR': [
        Permission.VIEW_DASHBOARD,
        Permission.MANAGE_USERS, // Enable access to Users page
        Permission.VIEW_REPORTS,
        Permission.MANAGE_REPORTS, // "Şikayetler -> Mod: √"

        Permission.MANAGE_USER_AVATAR, // "Profil Foto Düzenleme -> Mod: √"
        Permission.MANAGE_USER_COVER,  // "Kapak Foto -> Mod: √"
        Permission.MANAGE_USER_FULLNAME, // "Fullname -> Mod: √"

        Permission.DELETE_USER_POST, // "Gönderi silme -> Mod: √"
        Permission.EDIT_USER_POST,   // "Gönderi düzenleme -> Mod: √"

        Permission.BAN_USER,       // "Hesap banlama/açma -> Mod: √"
        Permission.BAN_USERS,      // View

        Permission.MANAGE_USER_USERNAME // "Username düzenleme -> Mod: √"

        // "Kullanıcıyı silme -> Mod: X"
        // "Rozet verme -> Mod: X"
        // "Yetki verme -> Mod: X"
        // "Kullanıcı Onaylama -> Mod: X"
        // "Duyuru -> Mod: X"
        // "Hassas İçerikler -> Mod: X"
        // "Sunucu Durumu -> Mod: X"
        // "Platform sayfaları -> Mod: X"
        // "Widget -> Mod: X"
        // "Ghost -> Mod: X"
    ],
    'USER': []
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
