import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

interface ItineraryItem {
  day: number;
  title: string;
  content: string;
}

interface TourItineraryProps {
  itinerary?: ItineraryItem[];
}

export const TourItinerary: React.FC<TourItineraryProps> = ({ itinerary }) => {
  const [openDay, setOpenDay] = useState<number | null>(1);

  if (!itinerary || itinerary.length === 0) {
    return null;
  }

  const toggleDay = (day: number) => {
    setOpenDay(openDay === day ? null : day);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600" />
          Lịch Trình Chi Tiết Từng Ngày
        </h3>
        <span className="text-xs text-slate-500">{itinerary.length} ngày trải nghiệm</span>
      </div>

      <div className="space-y-3">
        {itinerary.map((item) => {
          const isOpen = openDay === item.day;
          return (
            <div
              key={item.day}
              className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all"
            >
              <button
                onClick={() => toggleDay(item.day)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-primary-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                    N{item.day}
                  </span>
                  <span className="font-bold text-sm text-slate-800">
                    {item.title}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-sm text-slate-600 border-t border-slate-100 leading-relaxed bg-slate-50/50">
                  <div className="flex items-start gap-2 text-primary-700 font-semibold text-xs mb-2">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>Lộ trình chi tiết</span>
                  </div>
                  {item.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
