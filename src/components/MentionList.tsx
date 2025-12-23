import { useEffect, useState } from "react";
import { IconDiscountCheckFilled } from "@tabler/icons-react";

interface User {
    id: string;
    nickname: string;
    fullName: string | null;
    profileImage: string | null;
    verificationTier: string | null;
    hasBlueTick: boolean;
}

interface MentionListProps {
    query: string;
    onSelect: (user: User) => void;
    onClose: () => void;
}

export default function MentionList({ query, onSelect, onClose }: MentionListProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query) {
            setUsers([]);
            return;
        }

        const fetchUsers = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`/api/users?mode=search&search=${query}&limit=5`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data.users || []);
                }
            } catch (error) {
                console.error("Error fetching users for mention:", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchUsers, 300); // 300ms debounce

        return () => clearTimeout(timeoutId);
    }, [query]);

    if (!query) return null;

    return (
        <div className="w-64 bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {loading ? (
                <div className="p-3 text-center text-sm text-gray-500">Aranıyor...</div>
            ) : users.length > 0 ? (
                <ul className="py-1">
                    {users.map((user) => (
                        <li
                            key={user.id}
                            onClick={() => onSelect(user)}
                            className="px-3 py-2 hover:bg-[var(--app-card-hover)] cursor-pointer flex items-center gap-2 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt={user.nickname} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-blue-500">
                                        {user.nickname[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-sm text-[var(--app-body-text)] truncate">
                                        {user.fullName || user.nickname}
                                    </span>
                                    {(user.hasBlueTick || user.verificationTier === "GOLD" || user.verificationTier === "OFFICIAL") && (
                                        <IconDiscountCheckFilled className="w-4 h-4 text-blue-500" />
                                    )}
                                </div>
                                <div className="text-xs text-gray-500 truncate">@{user.nickname}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="p-3 text-center text-sm text-gray-500">Kullanıcı bulunamadı</div>
            )}
        </div>
    );
}
