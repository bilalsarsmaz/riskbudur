import Link from "next/link";
import { useRouter } from "next/navigation";
import VerificationBadge from "./VerificationBadge";
import { useState, useEffect } from "react";

interface UserListItemProps {
    user: {
        id: string;
        nickname: string;
        fullName: string;
        profileImage?: string | null;
        verificationTier: "NONE" | "GREEN" | "GOLD" | "GRAY";
        hasBlueTick: boolean;
        bio?: string | null;
        isFollowing: boolean;
    };
    currentUserId?: string;
    onFollowToggle: (userId: string, currentlyFollowing: boolean) => Promise<void>;
}

export default function UserListItem({
    user,
    currentUserId,
    onFollowToggle,
}: UserListItemProps) {
    const router = useRouter();
    const isOwnProfile = currentUserId === user.id;
    const [isFollowing, setIsFollowing] = useState(user.isFollowing);
    const [isLoading, setIsLoading] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Sync state with props
    useEffect(() => {
        setIsFollowing(user.isFollowing);
    }, [user.isFollowing]);

    const handleFollowClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        setIsLoading(true);
        try {
            await onFollowToggle(user.id, isFollowing);
            setIsFollowing(!isFollowing);
        } catch (error) {
            console.error("Follow toggle failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="flex items-start p-4 hover:bg-white/5 transition-colors border-b border-theme-border cursor-pointer"
            onClick={() => router.push(`/${user.nickname}`)}
        >
            {/* Avatar */}
            <div className="flex-shrink-0">
                {user.profileImage ? (
                    <img
                        src={user.profileImage}
                        alt={user.nickname}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                        {user.nickname[0].toUpperCase()}
                    </div>
                )}
            </div>

            {/* User Info */}
            <div className="flex-1 ml-3 min-w-0">
                <div className="flex items-center gap-1">
                    <span
                        className="font-bold text-[15px] truncate"
                        style={{ color: "var(--app-body-text)" }}
                    >
                        {user.fullName}
                    </span>
                    <VerificationBadge
                        tier={user.verificationTier}
                        hasBlueTick={user.hasBlueTick}
                        username={user.nickname}
                        className="flex-shrink-0"
                        style={{ width: "18px", height: "18px" }}
                    />
                </div>
                <span className="text-[15px]" style={{ color: "var(--app-subtitle)" }}>
                    @{user.nickname}
                </span>
                {user.bio && (
                    <p
                        className="mt-1 text-[15px] line-clamp-2"
                        style={{ color: "var(--app-body-text)" }}
                    >
                        {user.bio}
                    </p>
                )}
            </div>

            {/* Follow Button */}
            {!isOwnProfile && (
                <button
                    onClick={handleFollowClick}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    disabled={isLoading || !currentUserId}
                    className={`ml-3 px-4 py-1.5 rounded-full font-bold text-[15px] transition-colors flex-shrink-0 ${isFollowing
                        ? "border min-w-[120px]"
                        : "border border-theme-border hover:bg-white/10"
                        }`}
                    style={{
                        color: isFollowing ? "var(--app-global-link-color)" : "var(--app-body-text)",
                        borderColor: isFollowing ? "var(--app-global-link-color)" : undefined,
                        backgroundColor: isFollowing && isHovering ? "rgba(220, 95, 0, 0.1)" : "transparent"
                    }}
                >
                    {isLoading ? (
                        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    ) : isFollowing ? (
                        isHovering ? "Kovalama" : "Kovalanıyor"
                    ) : (
                        "Kovala"
                    )}
                </button>
            )}
        </div>
    );
}
