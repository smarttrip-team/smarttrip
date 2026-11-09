import React from 'react';
import { Compass, ShieldCheck, HeartHandshake, Zap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 text-slate-500 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-slate-900">SmartTrip</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nền tảng đặt tour du lịch thông minh ứng dụng kiến trúc Microservices & Saga Orchestration, bảo đảm tính nhất quán và độ tin cậy giao dịch phân tán.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">Tính năng cốt lõi</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-indigo-500" /> Saga Orchestration</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Transactional Outbox</li>
              <li className="flex items-center gap-1.5"><HeartHandshake className="w-3.5 h-3.5 text-blue-500" /> Idempotent Consumers</li>
              <li className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Mock Wallet Ledger</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">Khách hàng</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/" className="hover:text-indigo-600">Khám phá Tour</a></li>
              <li><a href="/wallet" className="hover:text-indigo-600">Ví điện tử & Nạp tiền</a></li>
              <li><a href="/bookings" className="hover:text-indigo-600">Theo dõi & Lịch sử đặt tour</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">Học phần</h4>
            <p className="text-xs text-slate-500 mb-2">MSS301 - Microservices Architecture & Distributed Systems</p>
            <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[11px] font-mono">
              v1.0.0-CP4
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} SmartTrip Team (Lê Quang Vĩnh & Nguyễn Hồng Thái). All rights reserved.
        </div>
      </div>
    </footer>
  );
};
