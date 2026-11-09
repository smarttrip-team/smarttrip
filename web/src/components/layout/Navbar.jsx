import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Compass, Wallet, History, CreditCard, ChevronDown, User, Sparkles, 
  Briefcase, LogIn, LogOut, ShieldCheck, UserCheck 
} from 'lucide-react';
import { useAuthWallet } from '../../context/AuthWalletContext';
import { AuthModal } from '../../features/auth/AuthModal';

export const Navbar = () => {
  const location = useLocation();
  const { 
    token, 
    currentUserId, 
    currentUserName, 
    currentUserEmail, 
    roles, 
    isOperator, 
    isAdmin, 
    isAuthenticated, 
    wallet, 
    switchUser, 
    logout 
  } = useAuthWallet();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const navLinks = [
    { to: '/', label: 'Khám phá Tour', icon: Compass },
    { to: '/wallet', label: 'Ví điện tử', icon: Wallet },
    { to: '/bookings', label: 'Lịch sử đặt tour', icon: History },
    { to: '/operator', label: 'Quản trị Tour', icon: Briefcase },
  ];

  const presetUsers = [
    { id: 1, name: 'Nguyễn Hồng Thái', email: 'thai@smarttrip.vn', roles: ['ROLE_CUSTOMER', 'ROLE_TOUR_OPERATOR'] },
    { id: 10, name: 'Lê Quang Vĩnh', email: 'vinh@smarttrip.vn', roles: ['ROLE_CUSTOMER'] },
    { id: 2, name: 'Tour Operator Demo', email: 'operator@smarttrip.vn', roles: ['ROLE_TOUR_OPERATOR'] },
    { id: 99, name: 'Hệ Thống Admin', email: 'admin@smarttrip.vn', roles: ['ROLE_ADMIN'] },
  ];

  const getRoleBadge = () => {
    if (isAdmin) return <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-semibold">Admin</span>;
    if (isOperator) return <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-semibold">Operator</span>;
    return <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-semibold">Customer</span>;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                  SmartTrip
                </span>
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 -mt-1">
                  Travel & Saga Booking
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {link.label}
                    {link.to === '/operator' && (
                      <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-indigo-100 text-indigo-700 font-bold ml-0.5">
                        Portal
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Section: Wallet Balance & User / Auth Controls */}
            <div className="flex items-center gap-3">
              {/* Wallet Quick Pill */}
              <Link
                to="/wallet"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-colors group"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <div className="text-left text-xs">
                  <span className="text-slate-500 block text-[10px] leading-tight">Số dư ví</span>
                  <span className="font-bold text-indigo-700">{formatVND(wallet.balance)}</span>
                </div>
                <span className="hidden sm:inline-block text-[10px] font-semibold text-indigo-600 bg-white px-1.5 py-0.5 rounded-full border border-indigo-200">
                  Nạp +
                </span>
              </Link>

              {/* Auth / User Selector Dropdown */}
              <div className="relative">
                {isAuthenticated ? (
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 text-slate-700 text-sm transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-600 border border-indigo-700 flex items-center justify-center text-white font-bold text-xs">
                      {currentUserName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block text-left text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 block truncate max-w-[120px]">
                          {currentUserName}
                        </span>
                        {getRoleBadge()}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                        {currentUserEmail}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setAuthModalTab('login');
                      setShowAuthModal(true);
                    }}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-100 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Đăng Nhập</span>
                  </button>
                )}

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-sm">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                          {currentUserName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 text-xs truncate">{currentUserName}</p>
                          <p className="text-[11px] text-slate-500 truncate">{currentUserEmail}</p>
                          <div className="mt-1">{getRoleBadge()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Navigation inside user menu */}
                    <div className="py-1 border-b border-slate-100 text-xs">
                      <Link
                        to="/operator"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium"
                      >
                        <Briefcase className="w-4 h-4 text-indigo-500" />
                        <span>Cổng Quản Trị Tour (Operator)</span>
                      </Link>
                      <Link
                        to="/bookings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        <History className="w-4 h-4 text-slate-400" />
                        <span>Lịch sử đặt tour</span>
                      </Link>
                      <Link
                        to="/wallet"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                      >
                        <Wallet className="w-4 h-4 text-slate-400" />
                        <span>Ví điện tử cá nhân</span>
                      </Link>
                    </div>

                    {/* Preset Users Switcher */}
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Chuyển nhanh tài khoản demo
                      </p>
                      <div className="space-y-1">
                        {presetUsers.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUser(u.id, u.name, u.roles);
                              setShowUserMenu(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs transition-colors ${
                              currentUserId === u.id ? 'font-bold text-indigo-600 bg-indigo-50/60' : 'text-slate-600'
                            }`}
                          >
                            <span className="truncate">{u.name}</span>
                            {currentUserId === u.id && <Sparkles className="w-3 h-3 text-indigo-600 flex-shrink-0" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logout button */}
                    <div className="p-2">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialTab={authModalTab}
      />
    </>
  );
};
