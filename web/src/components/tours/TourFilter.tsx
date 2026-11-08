import React, { useState } from 'react';
import { Search, Filter, RotateCcw, DollarSign, MapPin, ArrowDownUp } from 'lucide-react';
import type { TourSearchParams } from '../../types/tour';
import { MOCK_DESTINATIONS } from '../../api/mockData';

interface TourFilterProps {
  initialParams: TourSearchParams;
  onFilterChange: (params: TourSearchParams) => void;
  onReset: () => void;
}

export const TourFilter: React.FC<TourFilterProps> = ({
  initialParams,
  onFilterChange,
  onReset,
}) => {
  const [keyword, setKeyword] = useState(initialParams.keyword || '');
  const [city, setCity] = useState(initialParams.city || '');
  const [priceRange, setPriceRange] = useState<string>(() => {
    if (initialParams.maxPrice && Number(initialParams.maxPrice) <= 3500000) return 'under_3.5m';
    if (initialParams.minPrice && Number(initialParams.minPrice) >= 3500000 && initialParams.maxPrice && Number(initialParams.maxPrice) <= 5000000) return '3.5m_5m';
    if (initialParams.minPrice && Number(initialParams.minPrice) >= 5000000) return 'above_5m';
    return 'all';
  });
  const [sortBy, setSortBy] = useState<string>(initialParams.sortBy || 'default');

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let minPrice: number | undefined;
    let maxPrice: number | undefined;

    if (priceRange === 'under_3.5m') {
      maxPrice = 3500000;
    } else if (priceRange === '3.5m_5m') {
      minPrice = 3500000;
      maxPrice = 5000000;
    } else if (priceRange === 'above_5m') {
      minPrice = 5000000;
    }

    onFilterChange({
      keyword: keyword.trim() || undefined,
      city: city || undefined,
      minPrice,
      maxPrice,
      sortBy: sortBy === 'default' ? undefined : (sortBy as any),
      page: 0,
    });
  };

  const handleReset = () => {
    setKeyword('');
    setCity('');
    setPriceRange('all');
    setSortBy('default');
    onReset();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Filter className="w-5 h-5 text-primary-600" />
          <span>Bộ lọc tìm kiếm</span>
        </div>
        <button
          onClick={handleReset}
          className="text-xs font-semibold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
          title="Đặt lại bộ lọc"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Xóa lọc
        </button>
      </div>

      <form onSubmit={handleApply} className="space-y-6">
        {/* Keyword Search */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Từ khóa tìm kiếm
          </label>
          <div className="relative">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tên tour, di sản, địa danh..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Destination / City */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary-500" />
            Điểm đến
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          >
            <option value="">Tất cả điểm đến</option>
            {MOCK_DESTINATIONS.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name} ({d.toursCount} tour)
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-primary-500" />
            Mức giá
          </label>
          <div className="space-y-2">
            {[
              { id: 'all', label: 'Tất cả các mức giá' },
              { id: 'under_3.5m', label: 'Dưới 3.500.000 ₫' },
              { id: '3.5m_5m', label: 'Từ 3.500.000 ₫ - 5.000.000 ₫' },
              { id: 'above_5m', label: 'Trên 5.000.000 ₫' },
            ].map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                  priceRange === option.id
                    ? 'bg-primary-50 text-primary-700 font-bold border border-primary-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="priceRange"
                  value={option.id}
                  checked={priceRange === option.id}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {/* Sort by */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ArrowDownUp className="w-3.5 h-3.5 text-primary-500" />
            Sắp xếp theo
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
          >
            <option value="default">Mặc định (Nổi bật nhất)</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="duration">Thời lượng dài nhất</option>
          </select>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Filter className="w-4 h-4" />
          Áp dụng bộ lọc
        </button>
      </form>
    </div>
  );
};
