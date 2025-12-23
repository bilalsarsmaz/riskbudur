"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdmStandardPageLayout from "@/components/AdmStandardPageLayout";
import AdminSidebar from "@/components/AdminSidebar";
import GlobalHeader from "@/components/GlobalHeader";
import AdminBadge from "@/components/AdminBadge";
import {
  IconBan,
  IconTrash,
  IconEdit,
  IconRosetteDiscountCheckFilled,
  IconSearch,
  IconX,
  IconMapPin,
  IconMail
} from "@tabler/icons-react";
import { hasPermission, Permission, Role, canManageRole } from "@/lib/permissions";
import { fetchApi } from "@/lib/api";

interface User {
  id: string; // Changed from number to string to match Prisma schema
  nickname: string;
  fullName: string | null;
  email: string;
  profileImage: string | null;
  hasBlueTick: boolean;
  isBanned: boolean;
  createdAt: string;
  verificationTier: 'NONE' | 'GREEN' | 'GOLD' | 'GRAY';
  ipAddress?: string | null;
  role?: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'BANNED' | 'VERIFIED' | 'MODERATION'>('ALL');
  const [currentUserRole, setCurrentUserRole] = useState<Role | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    const fetchMe = async () => {
      try {
        const me = await fetchApi("/users/me");
        if (me) setCurrentUserRole(me.role as Role);
        setIsAuthenticated(true);
        fetchUsers();
      } catch (e) {
        router.push("/");
      }
    };
    fetchMe();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 401) {
        router.push("/");
      } else {
        const error = await response.json();
        console.error("API Error:", error);
        alert("Kullanıcılar yüklenirken bir hata oluştu: " + (error.error || "Bilinmeyen hata"));
      }
    } catch (error) {
      console.error("Kullanıcılar yüklenirken hata:", error);
      alert("Kullanıcılar yüklenirken bir hata oluştu. Konsolu kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId: string, isBanned: boolean) => {
    if (!confirm(isBanned ? "Kullanıcının banını kaldırmak istediğinize emin misiniz?" : "Bu kullanıcıyı banlamak istediğinize emin misiniz?")) {
      return;
    }

    setActionLoading(userId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: isBanned ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "İşlem başarısız oldu");
      }
    } catch (error) {
      console.error("Ban işlemi hatası:", error);
      alert("Bir hata oluştu");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string, nickname: string, role?: string) => {
    if (role === 'ROOTADMIN') {
      alert("Root Admin silinemez!");
      return;
    }
    if (!confirm(`"${nickname}" kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) {
      return;
    }

    setActionLoading(userId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        alert("Kullanıcı silinemedi");
      }
    } catch (error) {
      console.error("Silme işlemi hatası:", error);
      alert("Bir hata oluştu");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (user: User) => {
    if (user.role === 'ROOTADMIN' && currentUserRole !== 'ROOTADMIN') {
      alert("Root Admin sadece başka bir Root Admin tarafından düzenlenebilir!");
      return;
    }
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedUser: Partial<User>) => {
    if (!selectedUser) return;

    setActionLoading(selectedUser.id);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedUser)
      });

      if (response.ok) {
        await fetchUsers();
        setShowEditModal(false);
        setSelectedUser(null);
      } else {
        const error = await response.json();
        alert(error.error || "Güncelleme başarısız oldu");
      }
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      alert("Bir hata oluştu");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    // text search
    const matchesSearch = user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // tab filter
    if (activeTab === 'BANNED') return user.isBanned;
    if (activeTab === 'VERIFIED') return user.hasBlueTick || user.verificationTier !== 'NONE';
    if (activeTab === 'MODERATION') return user.role === 'ADMIN' || user.role === 'MODERATOR' || user.role === 'LEAD' || user.role === 'ROOTADMIN';

    return true;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  // Right Sidebar Content
  const rightSidebarContent = (
    <div className="rounded-2xl p-4 sticky top-4" style={{ backgroundColor: 'var(--app-surface)' }}>
      <h2 className="text-xl font-extrabold mb-4" style={{ color: 'var(--app-body-text)' }}>İstatistikler</h2>
      <div className="space-y-4">
        <div>
          <p className="text-[13px]" style={{ color: 'var(--app-subtitle)' }}>Toplam Kullanıcı</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--app-body-text)' }}>{users.length}</p>
        </div>
        <div>
          <p className="text-[13px]" style={{ color: 'var(--app-subtitle)' }}>Banlı Kullanıcı</p>
          <p className="text-2xl font-bold text-[#f4212e]">
            {users.filter(u => u.isBanned).length}
          </p>
        </div>
        <div>
          <p className="text-[13px]" style={{ color: 'var(--app-subtitle)' }}>Onay Rozeti Olan</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--app-accent)' }}>
            {users.filter(u => u.hasBlueTick).length}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <AdmStandardPageLayout sidebarContent={<AdminSidebar />} rightSidebarContent={rightSidebarContent}>
      <GlobalHeader title="Kullanıcılar" subtitle="Site Ahalisi" />

      <div className="px-4 py-4 border-b border-theme-border">
        {/* Arama */}
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--app-subtitle)' }} />
          <input
            type="text"
            placeholder="Ara"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-theme-surface border-none rounded-full placeholder-theme-subtitle focus:outline-none focus:ring-1 focus:ring-theme-accent"
            style={{ backgroundColor: 'var(--app-input-bg)', color: 'var(--app-body-text)', colorScheme: 'dark' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-theme-border">
        {[
          { id: 'ALL', label: 'Tümü' },
          { id: 'BANNED', label: 'Banlılar' },
          { id: 'VERIFIED', label: 'Onaylılar' },
          { id: 'MODERATION', label: 'Yöneticiler' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-4 text-center font-medium relative transition-colors hover:bg-white/5 ${activeTab === tab.id ? 'font-bold' : ''
              }`}
            style={{
              color: activeTab === tab.id ? 'var(--app-accent)' : 'var(--app-subtitle)'
            }}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[4px] rounded-t-full" style={{ backgroundColor: 'var(--app-accent)' }}></div>
            )}
          </button>
        ))}
      </div>

      <div className="">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d9bf0]"></div>
            <p className="mt-2 text-[#71767b]">Yükleniyor...</p>
          </div>
        ) : (
          <div>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-[#71767b]">
                {searchTerm ? "Arama sonucu bulunamadı" : "Kullanıcı bulunamadı"}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="user-card flex items-center justify-between group px-4 py-3 border-b border-theme-border transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/${user.nickname}`);
                      }}
                    >
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.nickname}
                          className="w-12 h-12 rounded-full object-cover border-[0.5px] border-theme-border hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-[0.5px] border-theme-border hover:opacity-80 transition-opacity" style={{ backgroundColor: 'var(--app-surface)', color: 'var(--app-body-text)' }}>
                          {user.nickname.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div
                        className="flex items-center space-x-1 cursor-pointer group/name"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/${user.nickname}`);
                        }}
                      >
                        <span className="font-bold text-[15px] group-hover/name:underline" style={{ color: 'var(--app-body-text)' }}>
                          {user.fullName || user.nickname}
                        </span>
                        {(user.verificationTier !== 'NONE' || user.hasBlueTick) && (
                          <IconRosetteDiscountCheckFilled className={`w-[18px] h-[18px] verified-icon ${user.verificationTier === 'GOLD' ? 'gold' :
                            user.verificationTier === 'GRAY' ? 'gray' :
                              user.verificationTier === 'GREEN' ? 'green' :
                                user.nickname === 'riskbudur' ? 'gold' : 'green'
                            }`} />
                        )}
                        <AdminBadge
                          role={user.role}
                          className="w-[18px] h-[18px] ml-0.5"
                        />
                        {user.isBanned && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] uppercase font-bold bg-[#f4212e]/10 text-[#f4212e] rounded-sm tracking-wide">
                            Banned
                          </span>
                        )}
                      </div>
                      <div className="text-[14px]" style={{ color: 'var(--app-subtitle)' }}>
                        @{user.nickname}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1.5">
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEdit(user)}
                        disabled={actionLoading === user.id}
                        className="p-2 rounded-full hover:bg-[#1d9bf0]/10 text-[#71767b] hover:text-[#1d9bf0] transition-colors"
                        title="Düzenle"
                      >
                        <IconEdit size={18} />
                      </button>
                      {/* Verification button moved to Edit Modal */}
                      {hasPermission(currentUserRole, Permission.BAN_USER) && (
                        <button
                          onClick={() => handleBan(user.id, user.isBanned)}
                          disabled={actionLoading === user.id}
                          className={`p-2 rounded-full hover:bg-[#f4212e]/10 transition-colors ${user.isBanned ? 'text-[#f4212e]' : 'text-[#71767b] hover:text-[#f4212e]'}`}
                          title={user.isBanned ? "Banı kaldır" : "Banla"}
                        >
                          <IconBan size={18} />
                        </button>
                      )}

                      {hasPermission(currentUserRole, Permission.DELETE_USER) && canManageRole(currentUserRole!, user.role as Role) && (
                        <button
                          onClick={() => handleDelete(user.id, user.nickname, user.role)}
                          disabled={actionLoading === user.id}
                          className="p-2 rounded-full hover:bg-[#f4212e]/10 text-[#71767b] hover:text-[#f4212e] transition-colors"
                          title="Sil"
                        >
                          <IconTrash size={18} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-[#536471] pr-2">
                      {user.ipAddress && (
                        <div className="flex items-center space-x-1" title="IP Adresi">
                          <IconMapPin size={14} />
                          <span>{user.ipAddress}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1" title="Kayıtlı Email">
                        <IconMail size={14} />
                        <span className="truncate max-w-[200px]">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Düzenleme Modal */}
      {
        showEditModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onSave={handleSaveEdit}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            loading={actionLoading === selectedUser.id}
            currentUserRole={currentUserRole}
          />
        )
      }
    </AdmStandardPageLayout >
  );
}

// Düzenleme Modal Component'i
function EditUserModal({ user, onSave, onCancel, loading, currentUserRole }: { user: User; onSave: (data: Partial<User>) => void; onCancel: () => void; loading: boolean; currentUserRole: Role | null }) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    nickname: user.nickname,
    email: user.email
  });
  const [isVerified, setIsVerified] = useState(user.verificationTier !== 'NONE');
  const [selectedTier, setSelectedTier] = useState<'GREEN' | 'GOLD' | 'GRAY'>(
    user.verificationTier === 'NONE' ? 'GREEN' : user.verificationTier
  );
  const [role, setRole] = useState(user.role || 'USER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      verificationTier: isVerified ? selectedTier : 'NONE',
      role
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#111111] border border-theme-border rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Kullanıcı Düzenle</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            <IconX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Tam Ad
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 bg-[#000000] border border-theme-border rounded-lg text-white focus:outline-none focus:border-[#1DCD9F]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-3 py-2 bg-[#000000] border border-theme-border rounded-lg text-white focus:outline-none focus:border-[#1DCD9F]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-[#000000] border border-theme-border rounded-lg text-white focus:outline-none focus:border-[#1DCD9F]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Rol
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-[#000000] border border-theme-border rounded-lg text-white focus:outline-none focus:border-[#1DCD9F]"
            >
              <option value="USER">Kullanıcı (Üye)</option>
              <option value="MODERATOR">Moderatör</option>
              <option value="LEAD">Lider (Lead)</option>
              <option value="ADMIN">Yönetici (Admin)</option>
              {currentUserRole === 'ROOTADMIN' && <option value="ROOTADMIN">Root Admin</option>}
            </select>
          </div>

          <div className="border-t border-theme-border pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Kullanıcı Onaylansın mı?
            </label>
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={isVerified}
                  onChange={() => setIsVerified(true)}
                  className="mr-2 text-[#1DCD9F] focus:ring-[#1DCD9F]"
                />
                <span className={isVerified ? "text-white" : "text-gray-500"}>Evet</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={!isVerified}
                  onChange={() => setIsVerified(false)}
                  className="mr-2 text-red-500 focus:ring-red-500"
                />
                <span className={!isVerified ? "text-white" : "text-gray-500"}>Hayır</span>
              </label>
            </div>

            {isVerified && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Rozet Tipini Seçin
                </label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#000000] border border-theme-border rounded-lg text-white focus:outline-none focus:border-[#1DCD9F]"
                >
                  <option value="GREEN">Standart</option>
                  <option value="GOLD">Kurumsal (Gold)</option>
                  <option value="GRAY">Siyasi (Gri)</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#1DCD9F] !text-black rounded-lg hover:bg-[#1ab88a] transition-colors disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#222222] text-white rounded-lg hover:bg-[#333333] transition-colors disabled:opacity-50"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
