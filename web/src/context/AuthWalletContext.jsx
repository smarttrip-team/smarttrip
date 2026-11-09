import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { walletApi } from '../services/api';

const AuthWalletContext = createContext(null);

export const AuthWalletProvider = ({ children }) => {
  const [currentUserId, setCurrentUserId] = useState(() => {
    return Number(localStorage.getItem('smarttrip_user_id')) || 10;
  });

  const [currentUserName, setCurrentUserName] = useState(() => {
    return localStorage.getItem('smarttrip_user_name') || 'Lê Quang Vĩnh';
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
    refreshWallet(currentUserId);
  }, [currentUserId, currentUserName, refreshWallet]);

  const switchUser = (newId, newName) => {
    setCurrentUserId(newId);
    if (newName) setCurrentUserName(newName);
    showToast(`Đã chuyển sang tài khoản ID: ${newId} (${newName || 'User ' + newId})`, 'info');
  };

  return (
    <AuthWalletContext.Provider
      value={{
        currentUserId,
        currentUserName,
        wallet,
        loadingWallet,
        refreshWallet,
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
