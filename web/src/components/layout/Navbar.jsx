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
  PlusCircle,
  ShieldCheck,
  Sparkles,
  LogIn,
  LogOut,
  Briefcase,
  History,
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
        return { label: 'Customer', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
    }
  };

  const roleBadge = getRoleBadge(currentRole);

  const isActive = (path) => {
    return location.pathname === path
      ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
      : 'text-slate-600 hover:text-indigo-600 transition-colors';
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Dynamic Menus */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    SmartTrip
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium -mt-1">
                    Microservices Platform
                  </span>
                </div>
              </Link>

              {/* Dynamic Role-Based Navigation Menu */}
              <nav className="hidden md:flex items-center gap-6 text-sm">
                {/* Customer Menus */}
                {currentRole === 'ROLE_CUSTOMER' && (
                  <>
                    <Link to="/tours" className={`py-5 ${isActive('/tours') || isActive('/')}`}>
                      Khám phá Tour
                    </Link>
                    <Link to="/bookings" className={`py-5 flex items-center gap-1.5 ${isActive('/bookings')}`}>
                      <CalendarCheck className="w-4 h-4" />
                      Đơn đặt chỗ
                    </Link>
                    <Link to="/wallet" className={`py-5 flex items-center gap-1.5 ${isActive('/wallet')}`}>
                      <Wallet className="w-4 h-4" />
                      Ví SmartTrip
                    </Link>
                    <Link to="/operator" className={`py-5 flex items-center gap-1.5 ${isActive('/operator')}`}>
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      Cổng Đối Tác
                    </Link>
                  </>
                )}

                {/* Tour Operator Menus */}
                {currentRole === 'ROLE_TOUR_OPERATOR' && (
                  <>
                    <Link to="/operator" className={`py-5 flex items-center gap-1.5 ${isActive('/operator')}`}>
                      <Layers className="w-4 h-4 text-amber-500" />
                      Quản lý Tour & Lịch trình
                    </Link>
                    <Link to="/tours" className={`py-5 ${isActive('/tours')}`}>
                      Xem Catalog Tour
                    </Link>
                    <Link to="/bookings" className={`py-5 flex items-center gap-1.5 ${isActive('/bookings')}`}>
                      <History className="w-4 h-4 text-slate-400" />
                      Lịch sử đặt chỗ
                    </Link>
                  </>
                )}

                {/* Hotel Manager Menus */}
                {currentRole === 'ROLE_HOTEL_MANAGER' && (
                  <>
                    <Link to="/hotel-manager" className={`py-5 flex items-center gap-1.5 ${isActive('/hotel-manager')}`}>
                      <Building2 className="w-4 h-4 text-emerald-500" />
                      Quản lý Khách sạn & Số lượng phòng
                    </Link>
                  </>
                )}

                {/* Admin Menus */}
                {currentRole === 'ROLE_ADMIN' && (
                  <>
                    <Link to="/admin/sagas" className={`py-5 flex items-center gap-1.5 ${isActive('/admin/sagas')}`}>
                      <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                      <span className="font-semibold text-rose-600">Saga Visualizer</span>
                    </Link>
                    <Link to="/admin/users" className={`py-5 flex items-center gap-1.5 ${isActive('/admin/users')}`}>
                      <Users className="w-4 h-4 text-indigo-500" />
                      Quản lý Người dùng
                    </Link>
                    <Link to="/operator" className={`py-5 flex items-center gap-1.5 ${isActive('/operator')}`}>
                      <Layers className="w-4 h-4 text-amber-500" />
                      Cổng Tour Operator
                    </Link>
                    <Link to="/admin" className={`py-5 flex items-center gap-1.5 ${isActive('/admin')}`}>
                      <ShieldCheck className="w-4 h-4 text-slate-500" />
                      Tổng quan Hệ thống
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Right Header: Wallet Pill, Auth & Role Switcher */}
            <div className="flex items-center gap-3">
              {/* Live Wallet Balance Pill */}
              <Link
                to="/wallet"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors shadow-xs"
                title="Số dư ví khả dụng"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Wallet className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-slate-500 hidden sm:inline">Ví:</span>
                <span className="font-semibold text-slate-900">
                  {loadingWallet ? '...' : formatCurrency(wallet.balance)}
                </span>
              </Link>

              {/* Role Badge Indicator */}
              <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadge.color}`}>
                {roleBadge.label}
              </span>

              {/* Auth / User Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-all shadow-xs"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                    {currentUserName ? currentUserName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-semibold text-slate-900 leading-tight">
                      {currentUserName}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight">
                      ID: {currentUserId} • {roleBadge.label}
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
                        <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{currentUserName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {currentUserEmail} (ID: #{currentUserId})
                        </div>
                      </div>

                      {/* Profile & Auth Actions */}
                      <div className="py-1 border-b border-slate-100">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            setShowProfileModal(true);
                          }}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium"
                        >
                          <UserCheck className="w-4 h-4 text-indigo-500" />
                          <span>Hồ sơ cá nhân (User Profile)</span>
                        </button>

                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            setAuthModalTab('login');
                            setShowAuthModal(true);
                          }}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium"
                        >
                          <LogIn className="w-4 h-4 text-indigo-500" />
                          <span>Đăng nhập / Đăng ký tài khoản khác</span>
                        </button>
                      </div>

                      {/* Preset Users Switcher */}
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Mô phỏng truy cập vai trò (Demo)
                        </p>
                        <div className="space-y-1">
                          {PRESET_USERS.map((user) => {
                            const isCurrent = user.id === currentUserId;
                            const badge = getRoleBadge(user.role);
                            return (
                              <button
                                key={user.id}
                                onClick={() => {
                                  switchUser(user);
                                  setDropdownOpen(false);
                                }}
                                className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors ${
                                  isCurrent ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold shrink-0 mt-0.5">
                                  {user.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-900 truncate">{user.name}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${badge.color}`}>
                                      {badge.label}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">{user.email} (ID: {user.id})</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Logout */}
                      <div className="p-2">
                        <button
                          onClick={() => {
                            logout();
                            setDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </>
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

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
}

export { Navbar };
