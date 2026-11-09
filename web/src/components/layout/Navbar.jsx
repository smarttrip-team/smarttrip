import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Wallet, History, CreditCard, ChevronDown, User, Sparkles } from 'lucide-react';
import { useAuthWallet } from '../../context/AuthWalletContext';

export const Navbar = () => {
  const location = useLocation();
  const { currentUserId, currentUserName, wallet, switchUser } = useAuthWallet();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const navLinks = [
    { to: '/', label: 'Khám phá Tour', icon: Compass },
    { to: '/wallet', label: 'Ví điện tử', icon: Wallet },
    { to: '/bookings', label: 'Lịch sử đặt tour', icon: History },
  ];

  const presetUsers = [
    { id: 10, name: 'Lê Quang Vĩnh (Khách hàng 10)' },
    { id: 1, name: 'Nguyễn Hồng Thái (Khách hàng 1)' },
    { id: 2, name: 'Trần Thị B (Khách hàng 2)' },
  ];

  return (
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
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Wallet Balance & User Switcher */}
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

            {/* User Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <span className="font-medium text-slate-800 block truncate max-w-[120px]">
                    {currentUserName}
                  </span>
                  <span className="text-[10px] text-slate-400">ID: #{currentUserId}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-sm">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Chọn tài khoản thử nghiệm
                    </p>
                  </div>
                  {presetUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id, u.name.split(' (')[0]);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between ${
                        currentUserId === u.id ? 'font-semibold text-indigo-600 bg-indigo-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{u.name}</span>
                      {currentUserId === u.id && <Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  ))}
                  <div className="p-2 border-t border-slate-100">
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        placeholder="ID khác..."
                        id="customUserIdInput"
                        className="w-full text-xs px-2 py-1 border rounded border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => {
                          const val = document.getElementById('customUserIdInput')?.value;
                          if (val) {
                            switchUser(Number(val), `User ${val}`);
                            setShowUserMenu(false);
                          }
                        }}
                        className="text-xs px-2.5 py-1 bg-slate-800 text-white rounded hover:bg-slate-900"
                      >
                        Đổi
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
