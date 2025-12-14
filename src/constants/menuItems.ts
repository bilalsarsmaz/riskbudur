import {
    IconHome,
    IconHomeFilled,
    IconSearch,
    IconBell,
    IconBellFilled,
    IconMail,
    IconMailFilled,
    IconUser,
    IconUserFilled,
    IconTargetArrow,
    IconEdit,
} from "@tabler/icons-react";

export interface MenuItem {
    id: string;
    label: string;
    icon: any;
    iconFilled: any;
    href: string | ((nickname?: string) => string);
    hasFilled: boolean;
    showInMobile: boolean;
}

export const menuItems: MenuItem[] = [
    {
        id: "home",
        label: "Ana Sayfa",
        icon: IconHome,
        iconFilled: IconHomeFilled,
        href: "/home",
        hasFilled: true,
        showInMobile: true,
    },
    {
        id: "explore",
        label: "Keşfet",
        icon: IconSearch,
        iconFilled: IconSearch,
        href: "/explore",
        hasFilled: false,
        showInMobile: true,
    },
    {
        id: "compose",
        label: "Compose",
        icon: IconEdit,
        iconFilled: IconEdit,
        href: "/compose",
        hasFilled: false,
        showInMobile: true,
    },
    {
        id: "notifications",
        label: "Bildirim",
        icon: IconBell,
        iconFilled: IconBellFilled,
        href: "/notifications",
        hasFilled: true,
        showInMobile: true,
    },
    {
        id: "messages",
        label: "Mesajlar",
        icon: IconMail,
        iconFilled: IconMailFilled,
        href: "/messages",
        hasFilled: true,
        showInMobile: true,
    },
    {
        id: "bookmarks",
        label: "Çivilenenler",
        icon: IconTargetArrow,
        iconFilled: IconTargetArrow,
        href: "/bookmarks",
        hasFilled: false,
        showInMobile: false,
    },
    {
        id: "profile",
        label: "Profilim",
        icon: IconUser,
        iconFilled: IconUserFilled,
        href: (nickname?: string) => nickname ? `/${nickname}` : "/profile",
        hasFilled: true,
        showInMobile: false, // Removed from bottom nav
    },
];
