import React from 'react';
import { Clock, CheckCircle2, ShieldCheck, Bus, Utensils, UserCheck } from 'lucide-react';
import type { Tour } from '../../types/tour';

interface TourOverviewProps {
  tour: Tour;
}

export const TourOverview: React.FC<TourOverviewProps> = ({ tour }) => {
  return (
    <div className="space-y-6">
      {/* Key Quick Facts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 border border-slate-200/80 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-primary-600 shadow-sm flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold uppercase">Thời lượng</span>
            <span className="text-sm font-bold text-slate-800">{tour.durationDays} Ngày {tour.durationDays - 1 > 0 ? `${tour.durationDays - 1} Đêm` : ''}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 shadow-sm flex items-center justify-center shrink-0">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold uppercase">Di chuyển</span>
            <span className="text-sm font-bold text-slate-800">Xe du lịch đời mới</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-amber-500 shadow-sm flex items-center justify-center shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold uppercase">Ẩm thực</span>
            <span className="text-sm font-bold text-slate-800">Đặc sản địa phương</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-sky-500 shadow-sm flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold uppercase">Hướng dẫn viên</span>
            <span className="text-sm font-bold text-slate-800">Suốt tuyến chuyên nghiệp</span>
          </div>
        </div>
      </div>

      {/* Highlights */}
      {tour.highlights && tour.highlights.length > 0 && (
        <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-6">
          <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary-600" />
            Điểm Nhấn Nổi Bật Của Chuyến Đi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tour.highlights.map((h, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-3">Mô Tả Tổng Quan Tour</h3>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {tour.description}
        </p>
      </div>
    </div>
  );
};
