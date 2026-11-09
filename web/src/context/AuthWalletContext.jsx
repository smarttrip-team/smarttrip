import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { walletApi, authApi } from '../services/api';

const AuthWalletContext = createContext(null);

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
    return localStorage.getItem('smarttrip_user_email') || 'vinh@smarttrip.vn';
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
    localStorage.setItem('smarttrip_roles', JSON.stringify(roles));
    if (token) {
      localStorage.setItem('smarttrip_token', token);
    }
    refreshWallet(currentUserId);
  }, [currentUserId, currentUserName, currentUserEmail, roles, token, refreshWallet]);

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

        localStorage.setItem('smarttrip_token', data.token);
        localStorage.setItem('smarttrip_user_id', String(data.id));
        localStorage.setItem('smarttrip_user_name', data.fullName || data.email);
        localStorage.setItem('smarttrip_user_email', data.email);
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

        localStorage.setItem('smarttrip_token', data.token);
        localStorage.setItem('smarttrip_user_id', String(data.id));
        localStorage.setItem('smarttrip_user_name', data.fullName || data.email);
        localStorage.setItem('smarttrip_user_email', data.email);
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

  // Demo user switcher
  const switchUser = (newId, newName, newRoles = ['ROLE_CUSTOMER']) => {
    setCurrentUserId(newId);
    if (newName) setCurrentUserName(newName);
    setRoles(newRoles);
    showToast(`Đã chuyển sang tài khoản ID: ${newId} (${newName || 'User ' + newId})`, 'info');
  };

  const isOperator = roles.includes('ROLE_TOUR_OPERATOR') || roles.includes('ROLE_ADMIN');
  const isAdmin = roles.includes('ROLE_ADMIN');
  const isAuthenticated = Boolean(token);

  return (
    <AuthWalletContext.Provider
      value={{
        token,
        currentUserId,
        currentUserName,
        currentUserEmail,
        roles,
        isOperator,
        isAdmin,
        isAuthenticated,
        wallet,
        loadingWallet,
        refreshWallet,
        login,
        register,
        logout,
        switchUser,
        showToast,
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all duration-300 transform translate-y-0 text-white bg-slate-900 border border-slate-700">
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
