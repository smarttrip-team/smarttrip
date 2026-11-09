import React, { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../services/api';
import { useAuthWallet } from '../../context/AuthWalletContext';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  RefreshCw,
  Mail,
  Calendar,
  CheckCircle2,
  Lock,
  Unlock,
} from 'lucide-react';

export default function UserManagementPage() {
  const { showToast } = useAuthWallet();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      showToast(err.message || 'Không thể tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    setUpdatingId(user.id);
    try {
      await adminApi.updateUserStatus(user.id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      showToast(
        `Đã chuyển trạng thái tài khoản ${user.email} sang: ${newStatus}`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Không thể cập nhật trạng thái người dùng', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.profile?.fullName?.toLowerCase().includes(q) ||
      String(u.id).includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase">
                <Users className="w-4 h-4" />
                <span>Admin Administration</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                Quản lý Người dùng & Phân quyền
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Xem danh sách tất cả tài khoản, vai trò và khóa/mở khóa tài khoản người dùng
              </p>
            </div>

            <button
              onClick={fetchUsers}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Làm mới danh sách</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm người dùng theo email, họ tên, ID..."
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Người dùng</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Vai trò (Roles)</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5">Ngày tạo</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-indigo-500" />
                      Đang tải danh sách người dùng từ user-service...
                    </td>
                  </tr>
                )}

                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      Không tìm thấy người dùng nào.
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredUsers.map((user) => {
                    const isBlocked = user.status === 'BLOCKED';
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-4 font-mono font-medium text-slate-500">
                          #{user.id}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {user.profile?.fullName || 'Chưa cập nhật tên'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {user.profile?.phone || 'Chưa có SĐT'}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-600">
                          {user.email}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1 flex-wrap">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((r) => (
                                <span
                                  key={r}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                                >
                                  {r.replace('ROLE_', '')}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400">CUSTOMER</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              isBlocked
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {isBlocked ? (
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            )}
                            <span>{user.status}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('vi-VN')
                            : '—'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={updatingId === user.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                              isBlocked
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {isBlocked ? (
                              <>
                                <Unlock className="w-3.5 h-3.5" />
                                <span>Mở khóa</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3.5 h-3.5" />
                                <span>Khóa tài khoản</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
