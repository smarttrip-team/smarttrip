import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Menu, X, Phone, User, Search } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Khám phá Tour', path: '/tours' },
    { name: 'Điểm đến', path: '/#destinations' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      {/* Top bar info */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary-400" />
              Hotline 24/7: <strong className="text-white">1900 6868</strong>
            </span>
            <span>Email: hotro@smarttrip.vn</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Nền tảng du lịch thông minh SmartTrip</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Smart<span className="text-primary-600">Trip</span>
              </span>
              <span className="block text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                Khám phá Việt Nam
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-semibold transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-primary-600 border-b-2 border-primary-600 py-1'
                    : 'text-slate-600 hover:text-primary-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/tours"
              className="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-50 rounded-full transition-colors"
              title="Tìm kiếm tour"
            >
              <Search className="w-5 h-5" />
            </Link>
            <div className="h-6 w-px bg-slate-200"></div>
            <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary-600 transition-colors">
              <User className="w-4 h-4" />
              Đăng nhập
            </button>
            <button className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all">
              Đăng ký
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-semibold ${
                isActive(link.path)
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <button className="w-full py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200">
              Đăng nhập
            </button>
            <button className="w-full py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-xl shadow-md">
              Đăng ký tài khoản
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
