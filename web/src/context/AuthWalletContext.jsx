import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { walletApi, authApi } from '../services/api';

const AuthWalletContext = createContext(null);

export const PRESET_USERS = [
  { id: 10, name: 'Lê Quang Vĩnh', email: 'vinhle@smarttrip.com', role: 'ROLE_CUSTOMER', roleLabel: 'Customer' },
  { id: 1, name: 'Nguyễn Hồng Thái (Operator)', email: 'operator@smarttrip.com', role: 'ROLE_TOUR_OPERATOR', roleLabel: 'Tour Operator' },
  { id: 6, name: 'Trần Quốc Bảo (Tour Manager)', email: 'tourmanager2@smarttrip.com', role: 'ROLE_TOUR_OPERATOR', roleLabel: 'Tour Manager 2' },
  { id: 2, name: 'Khách sạn Mường Thanh (Manager)', email: 'hotelier@smarttrip.com', role: 'ROLE_HOTEL_MANAGER', roleLabel: 'Hotel Manager' },
  { id: 7, name: 'Lê Thu Trang (Hotel Manager)', email: 'hotelmanager2@smarttrip.com', role: 'ROLE_HOTEL_MANAGER', roleLabel: 'Hotel Manager 2' },
  { id: 3, name: 'Hệ thống Quản trị (Admin)', email: 'admin@smarttrip.com', role: 'ROLE_ADMIN', roleLabel: 'Admin' },
];

export const AuthWalletProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('smarttrip_token') || null;
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    return Number(localStorage.getItem('smarttrip_user_id')) || 10;
  });

  const [currentUserName, setCurrentUserName] = useState(() => {
    return localStorage.getItem('smarttrip_user_name') || 'Lê Quang Vĩnh';
  });

  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
    return localStorage.getItem('smarttrip_user_email') || 'vinhle@smarttrip.com';
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('smarttrip_user_role') || 'ROLE_CUSTOMER';
  });

  const [roles, setRoles] = useState(() => {
    try {
      const stored = localStorage.getItem('smarttrip_roles');
      return stored ? JSON.parse(stored) : ['ROLE_CUSTOMER'];
    } catch {
      return ['ROLE_CUSTOMER'];
    }
  });

  const [wallet, setWallet] = useState({
    balance: 0,
    heldAmount: 0,
    currency: 'VND',
    status: 'ACTIVE',
  });

  const [loadingWallet, setLoadingWallet] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  const refreshWallet = useCallback(async (userId = currentUserId) => {
    setLoadingWallet(true);
    try {
      const res = await walletApi.getWallet(userId);
      if (res?.data) {
        setWallet({
          balance: Number(res.data.balance || 0),
          heldAmount: Number(res.data.heldAmount || 0),
          currency: res.data.currency || 'VND',
          status: res.data.status || 'ACTIVE',
        });
      }
    } catch (err) {
      console.warn('Unable to load wallet from backend, using local state:', err.message);
    } finally {
      setLoadingWallet(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('smarttrip_user_id', String(currentUserId));
    localStorage.setItem('smarttrip_user_name', currentUserName);
    localStorage.setItem('smarttrip_user_email', currentUserEmail);
    localStorage.setItem('smarttrip_user_role', currentRole);
    localStorage.setItem('smarttrip_roles', JSON.stringify(roles));
    if (token) {
      localStorage.setItem('smarttrip_token', token);
    }
    if (currentRole === 'ROLE_CUSTOMER') {
      refreshWallet(currentUserId);
    }
  }, [currentUserId, currentUserName, currentUserEmail, currentRole, roles, token, refreshWallet]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      const data = res.data;
      if (data && data.token) {
        setToken(data.token);
        setCurrentUserId(data.id);
        setCurrentUserName(data.fullName || data.email);
        setCurrentUserEmail(data.email);
        const userRoles = Array.from(data.roles || ['ROLE_CUSTOMER']);
        setRoles(userRoles);
        setCurrentRole(userRoles[0] || 'ROLE_CUSTOMER');

        localStorage.setItem('smarttrip_token', data.token);
        localStorage.setItem('smarttrip_user_id', String(data.id));
        localStorage.setItem('smarttrip_user_name', data.fullName || data.email);
        localStorage.setItem('smarttrip_user_email', data.email);
        localStorage.setItem('smarttrip_user_role', userRoles[0] || 'ROLE_CUSTOMER');
        localStorage.setItem('smarttrip_roles', JSON.stringify(userRoles));

        showToast(`Đăng nhập thành công! Chào mừng ${data.fullName || data.email}`, 'success');
        refreshWallet(data.id);
        return { success: true, data };
      }
      throw new Error('Dữ liệu xác thực không hợp lệ');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đăng nhập thất bại';
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  // Register handler
  const register = async (registerData) => {
    try {
      const res = await authApi.register(registerData);
      const data = res.data;
      if (data && data.token) {
        setToken(data.token);
        setCurrentUserId(data.id);
        setCurrentUserName(data.fullName || data.email);
        setCurrentUserEmail(data.email);
        const userRoles = Array.from(data.roles || ['ROLE_CUSTOMER']);
        setRoles(userRoles);
        setCurrentRole(userRoles[0] || 'ROLE_CUSTOMER');

        localStorage.setItem('smarttrip_token', data.token);
        localStorage.setItem('smarttrip_user_id', String(data.id));
        localStorage.setItem('smarttrip_user_name', data.fullName || data.email);
        localStorage.setItem('smarttrip_user_email', data.email);
        localStorage.setItem('smarttrip_user_role', userRoles[0] || 'ROLE_CUSTOMER');
        localStorage.setItem('smarttrip_roles', JSON.stringify(userRoles));

        showToast(`Đăng ký tài khoản thành công! Chào mừng ${data.fullName || data.email}`, 'success');
        refreshWallet(data.id);
        return { success: true, data };
      }
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Đăng ký thất bại';
      showToast(msg, 'error');
      throw new Error(msg);
    }
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    localStorage.removeItem('smarttrip_token');
    showToast('Đã đăng xuất khỏi tài khoản', 'info');
  };

  // Flexible user / role switcher (supports both object and separate args)
  const switchUser = (userOrId, newName, newRole) => {
    if (typeof userOrId === 'object' && userOrId !== null) {
      setCurrentUserId(userOrId.id);
      setCurrentUserName(userOrId.name);
      if (userOrId.email) setCurrentUserEmail(userOrId.email);
      const roleStr = userOrId.role || 'ROLE_CUSTOMER';
      setCurrentRole(roleStr);
      setRoles([roleStr]);
      showToast(`Đã chuyển vai trò: ${userOrId.roleLabel || roleStr} (${userOrId.name})`, 'info');
      return;
    }

    const id = Number(userOrId);
    const matched = PRESET_USERS.find((u) => u.id === id);
    setCurrentUserId(id);
    if (newName) setCurrentUserName(newName);
    else if (matched) setCurrentUserName(matched.name);
    if (matched?.email) setCurrentUserEmail(matched.email);

    const targetRole = newRole || (matched ? matched.role : 'ROLE_CUSTOMER');
    setCurrentRole(targetRole);
    setRoles(Array.isArray(targetRole) ? targetRole : [targetRole]);
    showToast(`Đã chuyển sang tài khoản ID: ${id} (${newName || matched?.name || 'User ' + id})`, 'info');
  };

  const switchRole = (role) => {
    setCurrentRole(role);
    setRoles([role]);
    const matched = PRESET_USERS.find((u) => u.role === role);
    if (matched) {
      setCurrentUserId(matched.id);
      setCurrentUserName(matched.name);
      if (matched.email) setCurrentUserEmail(matched.email);
    }
    showToast(`Đã đổi phân quyền sang: ${role}`, 'info');
  };

  const isOperator = currentRole === 'ROLE_TOUR_OPERATOR' || currentRole === 'ROLE_ADMIN' || roles.includes('ROLE_TOUR_OPERATOR') || roles.includes('ROLE_ADMIN');
  const isAdmin = currentRole === 'ROLE_ADMIN' || roles.includes('ROLE_ADMIN');
  const isHotelManager = currentRole === 'ROLE_HOTEL_MANAGER' || currentRole === 'ROLE_ADMIN' || roles.includes('ROLE_HOTEL_MANAGER');
  const isAuthenticated = Boolean(token);

  return (
    <AuthWalletContext.Provider
      value={{
        token,
        currentUserId,
        currentUserName,
        currentUserEmail,
        currentRole,
        roles,
        isOperator,
        isAdmin,
        isHotelManager,
        isAuthenticated,
        wallet,
        loadingWallet,
        refreshWallet,
        login,
        register,
        logout,
        switchUser,
        switchRole,
        showToast,
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-sm font-medium transition-all duration-300 text-white bg-slate-900 border border-slate-700">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              toast.type === 'success'
                ? 'bg-emerald-400'
                : toast.type === 'error'
                ? 'bg-rose-400'
                : 'bg-indigo-400'
            }`}
          />
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </AuthWalletContext.Provider>
  );
};

export const useAuthWallet = () => {
  const context = useContext(AuthWalletContext);
  if (!context) {
    throw new Error('useAuthWallet must be used within an AuthWalletProvider');
  }
  return context;
};
