"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import MobileHeader from "@/components/MobileHeader";
import { 
  IconBan,
  IconUserCheck,
  IconTrash,
  IconEdit,
  IconRosetteDiscountCheckFilled,
  IconSearch,
  IconX
} from "@tabler/icons-react";

interface User {
  id: number;
  nickname: string;
  fullName: string | null;
  email: string;
  profileImage: string | null;
  hasBlueTick: boolean;
  isBanned: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    setIsAuthenticated(true);
    fetchUsers();
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

  const handleBan = async (userId: number, isBanned: boolean) => {
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
        alert("İşlem başarısız oldu");
      }
    } catch (error) {
      console.error("Ban işlemi hatası:", error);
      alert("Bir hata oluştu");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: number, nickname: string) => {
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

  const handleToggleBlueTick = async (userId: number, hasBlueTick: boolean) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}/blue-tick`, {
        method: hasBlueTick ? "DELETE" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        await fetchUsers();
      } else {
        alert("İşlem başarısız oldu");
      }
    } catch (error) {
      console.error("Onay rozeti işlemi hatası:", error);
      alert("Bir hata oluştu");
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (user: User) => {
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

  const filteredUsers = users.filter(user =>
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <>
      <MobileHeader />
      
      <header className="left-nav hidden lg:block fixed left-0 top-0 h-screen overflow-y-auto z-10 w-[68px] sm:w-[88px] lg:w-[595px]">
        <div className="absolute left-0 sm:left-0 lg:left-[320px] w-full sm:w-full lg:w-[275px] h-full p-0 m-0 border-0">
          <AdminSidebar />
        </div>
      </header>

      <div className="lg:ml-[68px] sm:ml-[88px] lg:ml-[595px] flex justify-center">
        <main className="content flex w-full max-w-[1310px] min-h-screen">
          {/* Orta Alan */}
          <section className="admin-content flex-1 w-full lg:max-w-[600px] flex flex-col items-stretch bg-black text-white lg:border-l lg:border-r border-[#222222] pt-14 pb-16 lg:pt-6 lg:pb-6">
            <div className="px-4">
              <h1 className="text-2xl font-bold mb-6">Kullanıcılar</h1>
              
              {/* Arama */}
              <div className="mb-4 relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kullanıcı adı, email veya isim ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#111111] border border-[#222222] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#1DCD9F]"
                />
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-500">Yükleniyor...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? "Arama sonucu bulunamadı" : "Kullanıcı bulunamadı"}
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="bg-[#111111] border border-[#222222] rounded-lg p-4 hover:bg-[#1a1a1a] transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            {user.profileImage ? (
                              <img
                                src={user.profileImage}
                                alt={user.nickname}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                                {user.nickname.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-white">
                                  {user.fullName || user.nickname}
                                </span>
                                {user.hasBlueTick && (
                                  <IconRosetteDiscountCheckFilled className="w-5 h-5 text-[#1DCD9F]" />
                                )}
                                {user.isBanned && (
                                  <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded">BANLI</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-400">
                                @{user.nickname}
                              </div>
                              <div className="text-xs text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(user)}
                              disabled={actionLoading === user.id}
                              className="p-2 rounded-lg hover:bg-[#222222] transition-colors disabled:opacity-50"
                              title="Düzenle"
                            >
                              <IconEdit className="w-5 h-5 text-blue-500" />
                            </button>
                            <button
                              onClick={() => handleToggleBlueTick(user.id, user.hasBlueTick)}
                              disabled={actionLoading === user.id}
                              className="p-2 rounded-lg hover:bg-[#222222] transition-colors disabled:opacity-50"
                              title={user.hasBlueTick ? "Onay rozetini kaldır" : "Onay rozeti ver"}
                            >
                              <IconRosetteDiscountCheckFilled className={`w-5 h-5 ${user.hasBlueTick ? 'text-[#1DCD9F]' : 'text-gray-500'}`} />
                            </button>
                            <button
                              onClick={() => handleBan(user.id, user.isBanned)}
                              disabled={actionLoading === user.id}
                              className="p-2 rounded-lg hover:bg-[#222222] transition-colors disabled:opacity-50"
                              title={user.isBanned ? "Banı kaldır" : "Banla"}
                            >
                              <IconBan className={`w-5 h-5 ${user.isBanned ? 'text-red-500' : 'text-yellow-500'}`} />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id, user.nickname)}
                              disabled={actionLoading === user.id}
                              className="p-2 rounded-lg hover:bg-[#222222] transition-colors disabled:opacity-50"
                              title="Sil"
                            >
                              <IconTrash className="w-5 h-5 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Sağ Sidebar */}
          <aside className="right-side hidden 2xl:block w-[350px] flex-shrink-0 ml-[10px] pt-6 bg-black text-white border border-[#222222] rounded-lg">
            <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto p-4">
              <h2 className="text-xl font-bold mb-4">İstatistikler</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Toplam Kullanıcı</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Banlı Kullanıcı</p>
                  <p className="text-2xl font-bold text-red-500">
                    {users.filter(u => u.isBanned).length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Onay Rozeti Olan</p>
                  <p className="text-2xl font-bold text-[#1DCD9F]">
                    {users.filter(u => u.hasBlueTick).length}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>

      {/* Düzenleme Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onSave={handleSaveEdit}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          loading={actionLoading === selectedUser.id}
        />
      )}
    </>
  );
}

// Düzenleme Modal Component'i
function EditUserModal({ user, onSave, onCancel, loading }: { user: User; onSave: (data: Partial<User>) => void; onCancel: () => void; loading: boolean }) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    nickname: user.nickname,
    email: user.email
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#111111] border border-[#222222] rounded-lg p-6 w-full max-w-md">
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
              className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-lg text-white focus:outline-none focus:border-[#1DCD9F]"
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
              className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-lg text-white focus:outline-none focus:border-[#1DCD9F]"
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
              className="w-full px-3 py-2 bg-[#000000] border border-[#222222] rounded-lg text-white focus:outline-none focus:border-[#1DCD9F]"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#1DCD9F] text-white rounded-lg hover:bg-[#1ab88a] transition-colors disabled:opacity-50"
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
