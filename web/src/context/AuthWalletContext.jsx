import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { walletApi } from '../services/api';

const AuthWalletContext = createContext(null);

export const PRESET_USERS = [
  { id: 10, name: 'Lê Quang Vĩnh', email: 'vinhle@smarttrip.com', role: 'ROLE_CUSTOMER', roleLabel: 'Customer' },
  { id: 1, name: 'Công ty Du lịch Việt (Operator)', email: 'operator@smarttrip.com', role: 'ROLE_TOUR_OPERATOR', roleLabel: 'Tour Operator' },
  { id: 2, name: 'Khách sạn Mường Thanh (Manager)', email: 'hotelier@smarttrip.com', role: 'ROLE_HOTEL_MANAGER', roleLabel: 'Hotel Manager' },
  { id: 3, name: 'Hệ thống Quản trị (Admin)', email: 'admin@smarttrip.com', role: 'ROLE_ADMIN', roleLabel: 'Admin' },
];

export const AuthWalletProvider = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState(() => {
    return Number(localStorage.getItem('smarttrip_user_id')) || 10;
  });

  const [currentUserName, setCurrentUserName] = useState(() => {
    return localStorage.getItem('smarttrip_user_name') || 'Lê Quang Vĩnh';
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('smarttrip_user_role') || 'ROLE_CUSTOMER';
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
    }, 4000);
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
    localStorage.setItem('smarttrip_user_role', currentRole);
    if (currentRole === 'ROLE_CUSTOMER') {
      refreshWallet(currentUserId);
    }
  }, [currentUserId, currentUserName, currentRole, refreshWallet]);

  const switchUser = (userOrId, newName, newRole) => {
    if (typeof userOrId === 'object' && userOrId !== null) {
      setCurrentUserId(userOrId.id);
      setCurrentUserName(userOrId.name);
      setCurrentRole(userOrId.role || 'ROLE_CUSTOMER');
      showToast(`Đã chuyển vai trò: ${userOrId.roleLabel || userOrId.role} (${userOrId.name})`, 'info');
      return;
    }
    const id = Number(userOrId);
    const matched = PRESET_USERS.find((u) => u.id === id);
    setCurrentUserId(id);
    if (newName) setCurrentUserName(newName);
    else if (matched) setCurrentUserName(matched.name);
    if (newRole) setCurrentRole(newRole);
    else if (matched) setCurrentRole(matched.role);
    showToast(`Đã chuyển sang tài khoản ID: ${id} (${newName || matched?.name || 'User ' + id})`, 'info');
  };

  const switchRole = (role) => {
    setCurrentRole(role);
    const matched = PRESET_USERS.find((u) => u.role === role);
    if (matched) {
      setCurrentUserId(matched.id);
      setCurrentUserName(matched.name);
    }
    showToast(`Đã đổi phân quyền sang: ${role}`, 'info');
  };

  return (
    <AuthWalletContext.Provider
      value={{
        currentUserId,
        currentUserName,
        currentRole,
        wallet,
        loadingWallet,
        refreshWallet,
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
