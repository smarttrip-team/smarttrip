import React from 'react';
import { MapPin, Star, Share2, Heart } from 'lucide-react';
import type { Tour } from '../../types/tour';

interface TourGalleryProps {
  tour: Tour;
}

export const TourGallery: React.FC<TourGalleryProps> = ({ tour }) => {
  return (
    <div className="space-y-4">
      {/* Title & Location Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 text-xs mb-2">
            <span className="px-3 py-1 rounded-full font-bold bg-primary-50 text-primary-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {tour.city}, {tour.country}
            </span>
            <span className="flex items-center gap-1 font-bold text-slate-700">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {tour.rating || 4.9} ({tour.reviewCount || 120} đánh giá)
            </span>
            <span className="text-slate-400">• Mã tour: ST-{tour.id.toString().padStart(4, '0')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
            {tour.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => alert('Đã sao chép liên kết tour!')}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary-600 transition-colors"
            title="Chia sẻ tour"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => alert('Đã lưu vào danh sách yêu thích!')}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-colors"
            title="Lưu yêu thích"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-3xl overflow-hidden shadow-lg aspect-[16/9] max-h-[460px]">
        <div className="md:col-span-2 h-full overflow-hidden">
          <img
            src={tour.imageUrl || 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80'}
            alt={tour.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
          />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-4 h-full">
          <div className="overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
              alt="Destination detail 1"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
            />
          </div>
          <div className="overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80"
              alt="Destination detail 2"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
