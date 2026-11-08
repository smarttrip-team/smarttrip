import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Star, Users, ArrowRight } from 'lucide-react';
import type { Tour } from '../../types/tour';

interface TourCardProps {
  tour: Tour;
}

export const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const earliestDeparture = tour.upcomingDepartures && tour.upcomingDepartures.length > 0
    ? tour.upcomingDepartures[0]
    : null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={tour.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 text-slate-800 backdrop-blur-md shadow-sm flex items-center gap-1">
            <MapPin className="w-3 h-3 text-primary-600" />
            {tour.city}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-900 shadow-sm flex items-center gap-1">
            <Star className="w-3 h-3 fill-slate-900 text-slate-900" />
            {tour.rating || 4.8}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary-500" />
              {tour.durationDays} ngày {tour.durationDays - 1 > 0 ? `${tour.durationDays - 1} đêm` : ''}
            </span>
            {earliestDeparture && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary-500" />
                Gần nhất: {new Date(earliestDeparture.departureDate).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
            <Link to={`/tours/${tour.id}`}>{tour.title}</Link>
          </h3>

          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {tour.description}
          </p>
        </div>

        {/* Footer info: Departure info + Price */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-end justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Giá chỉ từ
            </span>
            <div className="text-lg font-black text-primary-600">
              {formatPrice(tour.basePrice)}
            </div>
            {earliestDeparture && (
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                <Users className="w-3 h-3" />
                Còn {earliestDeparture.availableSeats} chỗ trống
              </span>
            )}
          </div>

          <Link
            to={`/tours/${tour.id}`}
            className="inline-flex items-center gap-1 px-4 py-2 bg-primary-50 hover:bg-primary-600 text-primary-700 hover:text-white rounded-xl text-xs font-bold transition-all group-hover:shadow-md group-hover:shadow-primary-500/20"
          >
            Chi tiết
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
