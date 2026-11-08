import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Sparkles, Shield, Compass } from 'lucide-react';
import { MOCK_DESTINATIONS } from '../../api/mockData';

export const HeroBanner: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (city) params.set('city', city);
    navigate(`/tours?${params.toString()}`);
  };

  return (
    <div className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2000&q=85"
          alt="Vietnam Landscape"
          className="w-full h-full object-cover opacity-40 scale-105 animate-pulse duration-[10000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sky-300 text-xs font-semibold backdrop-blur-md border border-white/10 mb-6">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Hơn 500+ Tour du lịch trọn gói chuẩn 4-5 sao
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          Khám Phá Trọn Vẹn <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-primary-300 to-amber-300">
            Vẻ Đẹp Di Sản Việt Nam
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal">
          Xác nhận giữ chỗ tự động qua Saga Orchestrator, thanh toán an toàn với Mock Wallet và chính sách hoàn tiền minh bạch.
        </p>

        {/* Search Box Card */}
        <div className="mt-10 max-w-4xl mx-auto bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-3xl shadow-2xl border border-white/20">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Keyword */}
            <div className="sm:col-span-5 text-left px-3 py-2 rounded-2xl bg-slate-50 border border-slate-100 focus-within:ring-2 focus-within:ring-primary-500 focus-within:bg-white transition-all">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Bạn muốn đi đâu?
              </label>
              <div className="flex items-center gap-2 mt-0.5">
                <Search className="w-4 h-4 text-primary-500 shrink-0" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Hội An, Bà Nà, Fansipan..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Destination select */}
            <div className="sm:col-span-4 text-left px-3 py-2 rounded-2xl bg-slate-50 border border-slate-100 focus-within:ring-2 focus-within:ring-primary-500 focus-within:bg-white transition-all">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Điểm đến yêu thích
              </label>
              <div className="flex items-center gap-2 mt-0.5">
                <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="">Tất cả điểm đến</option>
                  {MOCK_DESTINATIONS.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit button */}
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-primary-600 to-sky-500 hover:from-primary-700 hover:to-sky-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Search className="w-5 h-5" />
                <span>Tìm Tour</span>
              </button>
            </div>
          </form>
        </div>

        {/* Feature badges below search */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-primary-400" />
            Lịch trình chọn lọc
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-400" />
            Chính sách hoàn tiền linh hoạt
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-400" />
            Khởi hành hàng tuần
          </span>
        </div>
      </div>
    </div>
  );
};
