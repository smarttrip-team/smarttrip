import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { MOCK_DESTINATIONS } from '../../api/mockData';

export const Destinations: React.FC = () => {
  return (
    <section id="destinations" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block mb-1">
            Điểm Đến Yêu Thích
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Khám Phá Các Tọa Độ Du Lịch Hàng Đầu
          </h2>
        </div>
        <Link
          to="/tours"
          className="mt-4 md:mt-0 text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
        >
          Xem tất cả điểm đến
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
        {MOCK_DESTINATIONS.map((d) => (
          <Link
            key={d.id}
            to={`/tours?city=${encodeURIComponent(d.name)}`}
            className="group relative rounded-2xl overflow-hidden aspect-[3/4] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block bg-slate-100"
          >
            <img
              src={d.imageUrl}
              alt={d.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <div className="flex items-center gap-1 text-[11px] text-sky-300 font-medium">
                <MapPin className="w-3 h-3" />
                <span>Việt Nam</span>
              </div>
              <h3 className="font-bold text-base mt-0.5 group-hover:text-primary-300 transition-colors">
                {d.name}
              </h3>
              <span className="text-[11px] text-slate-300 block">
                {d.toursCount} tour đang mở
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
