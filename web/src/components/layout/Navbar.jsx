import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthWallet, PRESET_USERS } from '../../context/AuthWalletContext';
import {
  Compass,
  Wallet,
  CalendarCheck,
  UserCheck,
  ChevronDown,
  Layers,
  Activity,
  Users,
  Building2,
  CalendarRange,
  ShieldCheck,
  Sparkles,
  LogIn,
  LogOut,
  Briefcase,
  History,
  Search,
  User,
  Phone,
  Mail
} from 'lucide-react';
import { AuthModal } from '../../features/auth/AuthModal';
import { UserProfileModal } from '../../features/auth/UserProfileModal';

export default function Navbar() {
  const { 
    token,
    currentUserId, 
    currentUserName, 
    currentUserEmail,
    currentRole, 
    roles,
    wallet, 
    loadingWallet, 
    switchUser,
    logout,
    isAuthenticated,
  } = useAuthWallet();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const location = useLocation();

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN':
        return { label: 'Admin', color: 'bg-rose-100 text-rose-700 border-rose-200' };
      case 'ROLE_TOUR_OPERATOR':
        return { label: 'Tour Operator', color: 'bg-amber-100 text-amber-700 border-amber-200' };
      case 'ROLE_HOTEL_MANAGER':
        return { label: 'Hotel Manager', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'Customer', color: 'bg-sky-100 text-sky-700 border-sky-200' };
    }
  };

  const roleBadge = getRoleBadge(currentRole);

  const isActive = (path) => {
    if (path === '/tours') {
      return location.pathname === '/' || location.pathname === '/tours' || location.pathname.startsWith('/tours/')
        ? 'text-sky-600 font-bold border-b-2 border-sky-600'
        : 'text-slate-700 hover:text-sky-600 transition-colors';
    }
    return location.pathname === path
      ? 'text-sky-600 font-bold border-b-2 border-sky-600'
      : 'text-slate-700 hover:text-sky-600 transition-colors';
  };

  return (
    <>
      {/* Top Bar (Dark Navy, matching user screenshot) */}
      <div className="bg-slate-900 text-slate-300 text-[11px] sm:text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span>📞 Hotline 24/7:</span>
              <strong className="text-white font-bold">1900 6868</strong>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <span>Email:</span>
              <a href="mailto:hotro@smarttrip.vn" className="hover:text-white transition-colors">
                hotro@smarttrip.vn
              </a>
            </span>
          </div>
          <div className="text-slate-400 font-medium">
            Nền tảng du lịch thông minh SmartTrip
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Dynamic Menus */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-200 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-sky-600 tracking-tight">
                    SmartTrip
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold -mt-1">
                    KHÁM PHÁ VIỆT NAM
                  </span>
                </div>
              </Link>

              {/* Core Navigation Links */}
              <nav className="hidden md:flex items-center gap-6 text-sm">
                <Link to="/" className={`py-5 ${location.pathname === '/' ? 'text-sky-600 font-bold' : 'text-slate-700 hover:text-sky-600'}`}>
                  Trang chủ
                </Link>
                <Link to="/tours" className={`py-5 ${isActive('/tours')}`}>
                  Khám phá Tour
                </Link>
                <Link to="/tours" className="py-5 text-slate-700 hover:text-sky-600 transition-colors">
                  Điểm đến
                </Link>

                {/* Additional Role Badges / Links */}
                {currentRole === 'ROLE_CUSTOMER' && (
                  <>
                    <Link to="/bookings" className={`py-5 flex items-center gap-1.5 ${isActive('/bookings')}`}>
                      <CalendarCheck className="w-4 h-4 text-sky-500" />
                      Đơn đặt chỗ
                    </Link>
                  </>
                )}

                {/* Operator Links */}
                {(currentRole === 'ROLE_TOUR_OPERATOR' || currentRole === 'ROLE_ADMIN') && (
                  <Link to="/operator" className={`py-5 flex items-center gap-1.5 ${isActive('/operator')}`}>
                    <Layers className="w-4 h-4 text-amber-500" />
                    Quản lý Tour
                  </Link>
                )}

                {/* Hotel Manager Links */}
                {(currentRole === 'ROLE_HOTEL_MANAGER' || currentRole === 'ROLE_ADMIN') && (
                  <Link to="/hotel-manager" className={`py-5 flex items-center gap-1.5 ${isActive('/hotel-manager')}`}>
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    Quản lý Khách sạn
                  </Link>
                )}

                {/* Admin Links */}
                {currentRole === 'ROLE_ADMIN' && (
                  <Link to="/admin/sagas" className={`py-5 flex items-center gap-1.5 ${isActive('/admin/sagas')}`}>
                    <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                    <span className="font-semibold text-rose-600">Saga Visualizer</span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Right Header: Search, Auth & User Actions */}
            <div className="flex items-center gap-3">
              {/* Search Icon */}
              <button
                type="button"
                onClick={() => {
                  const searchEl = document.getElementById('tour-search-input');
                  if (searchEl) {
                    searchEl.focus();
                  } else {
                    window.location.href = '/tours';
                  }
                }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                title="Tìm kiếm tour"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* If Authenticated: Show Wallet Pill */}
              {isAuthenticated && (
                <Link
                  to="/wallet"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors shadow-xs"
                  title="Số dư ví SmartTrip"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Wallet className="w-3.5 h-3.5 text-sky-600" />
                  <span className="font-semibold text-slate-900 hidden sm:inline">
                    {loadingWallet ? '...' : formatCurrency(wallet.balance)}
                  </span>
                </Link>
              )}

              {/* Guest / Login State (Matching user screenshots) */}
              {!isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('login');
                      setShowAuthModal(true);
                    }}
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-sky-600 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Đăng nhập</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab('register');
                      setShowAuthModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-bold shadow-sm shadow-sky-100 transition-all"
                  >
                    Đăng ký
                  </button>
                </div>
              ) : (
                /* Authenticated User Selector Dropdown */
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-all shadow-xs"
                  >
                    <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      {currentUserName ? currentUserName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="text-left hidden lg:block">
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {currentUserName}
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {roleBadge.label}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                        {/* User Header */}
                        <div className="px-4 py-3 border-b border-slate-100">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                            <span>{currentUserName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {currentUserEmail}
                          </div>
                          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border border-sky-200 bg-sky-50 text-sky-700">
                            {roleBadge.label}
                          </div>
                        </div>

                        {/* Profile & Wallet Actions */}
                        <div className="py-1 border-b border-slate-100">
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              setShowProfileModal(true);
                            }}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-medium"
                          >
                            <UserCheck className="w-4 h-4 text-sky-500" />
                            <span>Hồ sơ cá nhân (User Profile)</span>
                          </button>

                          <Link
                            to="/wallet"
                            onClick={() => setDropdownOpen(false)}
                            className="w-full text-left flex items-center justify-between px-4 py-2 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-medium"
                          >
                            <div className="flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-emerald-500" />
                              <span>Ví SmartTrip</span>
                            </div>
                            <span className="font-bold text-emerald-600">
                              {formatCurrency(wallet.balance)}
                            </span>
                          </Link>

                          <Link
                            to="/bookings"
                            onClick={() => setDropdownOpen(false)}
                            className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-medium"
                          >
                            <CalendarCheck className="w-4 h-4 text-sky-500" />
                            <span>Lịch sử đặt chỗ (My Bookings)</span>
                          </Link>
                        </div>

                        {/* Switch Test Role Header */}
                        <div className="px-4 py-2 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Chuyển Đổi Tài Khoản / Vai Trò Test
                        </div>

                        <div className="py-1 border-b border-slate-100 max-h-48 overflow-y-auto">
                          {PRESET_USERS.map((user) => (
                            <button
                              key={user.id}
                              onClick={() => {
                                switchUser(user);
                                setDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-sky-50 transition-colors ${
                                currentUserId === user.id ? 'bg-sky-50/70 font-bold text-sky-700' : 'text-slate-700'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <div className="truncate font-semibold">{user.name}</div>
                                <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 bg-white font-medium shrink-0">
                                {user.roleLabel}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Logout & Re-login buttons */}
                        <div className="p-2 space-y-1">
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              setAuthModalTab('login');
                              setShowAuthModal(true);
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 text-slate-700 rounded-lg font-medium"
                          >
                            <LogIn className="w-4 h-4 text-sky-500" />
                            <span>Đăng nhập tài khoản khác</span>
                          </button>
                          <button
                            onClick={() => {
                              logout();
                              setDropdownOpen(false);
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-rose-50 text-rose-600 rounded-lg font-medium"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Đăng xuất (Logout)</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialTab={authModalTab}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
}
