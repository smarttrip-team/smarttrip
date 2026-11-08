import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ArrowRight, Loader2 } from 'lucide-react';
import { TourCard } from '../tours/TourCard';
import type { Tour } from '../../types/tour';

interface FeaturedToursProps {
  tours: Tour[];
  isLoading?: boolean;
}

export const FeaturedTours: React.FC<FeaturedToursProps> = ({ tours, isLoading }) => {
  return (
    <section className="py-16 bg-slate-50 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold mb-2">
              <Flame className="w-4 h-4 fill-rose-500" />
              Đang Được Đặt Nhiều Nhất
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tour Du Lịch Nổi Bật & Bán Chạy
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Trải nghiệm dịch vụ lữ hành trọn gói tiêu chuẩn 4-5 sao với lịch khởi hành định kỳ.
            </p>
          </div>
          <Link
            to="/tours"
            className="mt-4 md:mt-0 text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
          >
            Xem tất cả tour
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
            <span>Đang tải danh sách tour nổi bật...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {tours.slice(0, 6).map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
