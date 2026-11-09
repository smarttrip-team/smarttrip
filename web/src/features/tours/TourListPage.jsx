import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Calendar, MapPin, Users, ArrowRight, Star, Hotel, Check, Sparkles } from 'lucide-react';
import { tourApi } from '../../services/api';

// Fallback high quality seed tours in case backend tours table has not been populated yet
const SEED_TOURS = [
  {
    id: 101,
    name: 'Khám phá Vịnh Hạ Long - Đảo Cát Bà 3N2Đ',
    description: 'Du thuyền 5 sao đẳng cấp, tham quan Hang Sửng Sốt, chèo thuyền Kayak và nghỉ đêm trên vịnh di sản thiên nhiên thế giới.',
    destination: 'Quảng Ninh',
    duration: '3 Ngày 2 Đêm',
    basePrice: 3500000,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    departures: [
      { id: 201, departureDate: '2026-11-20', availableSeats: 15, price: 3500000 },
      { id: 202, departureDate: '2026-12-05', availableSeats: 8, price: 3650000 },
    ],
    hotelOption: {
      hotelId: 1,
      hotelName: 'Vinpearl Resort & Spa Hạ Long',
      roomTypeId: 10,
      roomName: 'Deluxe Ocean View Room',
      price: 1200000,
    }
  },
  {
    id: 102,
    name: 'Đà Nẵng - Bán Đảo Sơn Trà - Phố Cổ Hội An 4N3Đ',
    description: 'Hành trình di sản miền Trung: Cầu Vàng Bà Nà Hills, lặn ngắm san hô Cù Lao Chàm và thả hoa đăng phố cổ Hội An về đêm.',
    destination: 'Đà Nẵng & Hội An',
    duration: '4 Ngày 3 Đêm',
    basePrice: 4200000,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
    departures: [
      { id: 203, departureDate: '2026-11-25', availableSeats: 12, price: 4200000 },
      { id: 204, departureDate: '2026-12-10', availableSeats: 20, price: 4200000 },
    ],
    hotelOption: {
      hotelId: 2,
      hotelName: 'TMS Hotel Da Nang Beach',
      roomTypeId: 20,
      roomName: 'Premier Ocean View Twin',
      price: 1400000,
    }
  },
  {
    id: 103,
    name: 'Thiên đường biển đảo Phú Quốc - Sunset Town 3N2Đ',
    description: 'Nghỉ dưỡng biển ngọc, cáp treo Hòn Thơm vượt biển dài nhất thế giới, Grand World thành phố không ngủ và safari bán hoang dã.',
    destination: 'Kiên Giang',
    duration: '3 Ngày 2 Đêm',
    basePrice: 5100000,
    rating: 4.95,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    departures: [
      { id: 205, departureDate: '2026-12-01', availableSeats: 10, price: 5100000 },
      { id: 206, departureDate: '2026-12-15', availableSeats: 6, price: 5300000 },
    ],
    hotelOption: {
      hotelId: 3,
      hotelName: 'Novotel Phu Quoc Resort',
      roomTypeId: 30,
      roomName: 'Superior Suite Sea Facing',
      price: 1800000,
    }
  }
];

export const TourListPage = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState(SEED_TOURS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const res = await tourApi.getTours();
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
          // Merge API tours with sample departures if missing
          const mapped = res.data.map((t, idx) => ({
            id: t.id,
            name: t.name || t.title,
            description: t.description || 'Khám phá hành trình du lịch độc đáo cùng SmartTrip.',
            destination: t.destination || t.location || 'Việt Nam',
            duration: t.duration || '3N2Đ',
            basePrice: t.basePrice || t.price || 3500000,
            imageUrl: t.imageUrl || SEED_TOURS[idx % SEED_TOURS.length].imageUrl,
            rating: 4.9,
            departures: t.departures || SEED_TOURS[idx % SEED_TOURS.length].departures,
            hotelOption: SEED_TOURS[idx % SEED_TOURS.length].hotelOption,
          }));
          setTours(mapped);
        }
      } catch (err) {
        console.info('Backend tours endpoint not ready or empty, using seed tours:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const handleBookNow = (tour) => {
    const defaultDeparture = tour.departures?.[0];
    const params = new URLSearchParams({
      tourId: String(tour.id),
      tourName: tour.name,
      departureId: String(defaultDeparture?.id || 201),
      departureDate: defaultDeparture?.departureDate || '2026-12-01',
      unitPrice: String(defaultDeparture?.price || tour.basePrice),
    });

    if (tour.hotelOption) {
      params.append('hasHotel', 'true');
      params.append('hotelId', String(tour.hotelOption.hotelId));
      params.append('hotelName', tour.hotelOption.hotelName);
      params.append('roomTypeId', String(tour.hotelOption.roomTypeId));
      params.append('roomName', tour.hotelOption.roomName);
      params.append('hotelPrice', String(tour.hotelOption.price));
    }

    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5" /> Nền tảng Đặt Tour Phân Tán (Saga Driven)
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Khám Phá Việt Nam Cùng <span className="text-indigo-400">SmartTrip</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base">
            Đặt tour trọn gói, tích hợp giữ phòng khách sạn đối tác và thanh toán tức thì qua ví điện tử với cam kết Saga Transaction 100% tin cậy.
          </p>
        </div>
      </div>

      {/* Tour List Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Tour Du Lịch Nổi Bật</h2>
            <p className="text-slate-500 text-sm mt-0.5">Lựa chọn chuyến đi hoàn hảo và kiểm thử quy trình Saga</p>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {tours.length} chuyến đi có sẵn
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Image & Tags */}
              <div className="relative h-52 overflow-hidden bg-slate-100">
                <img
                  src={tour.imageUrl}
                  alt={tour.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-800 shadow">
                    {tour.duration}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-600/90 backdrop-blur-md text-white shadow">
                    {tour.destination}
                  </span>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  {tour.rating}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {tour.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {tour.description}
                  </p>
                </div>

                {/* Departures Preview */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      Khởi hành gần nhất:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {tour.departures?.[0]?.departureDate || '2026-11-20'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-emerald-500" />
                      Chỗ còn trống:
                    </span>
                    <span className="font-semibold text-emerald-600">
                      {tour.departures?.[0]?.availableSeats || 10} chỗ
                    </span>
                  </div>

                  {tour.hotelOption && (
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Hotel className="w-3.5 h-3.5 text-amber-500" />
                        Tùy chọn KS:
                      </span>
                      <span className="font-medium text-slate-700 truncate max-w-[150px]">
                        {tour.hotelOption.hotelName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Price & Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Giá từ</span>
                    <span className="text-xl font-bold text-indigo-700">
                      {formatVND(tour.basePrice)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleBookNow(tour)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-100 group-hover:gap-2 transition-all"
                  >
                    Đặt chỗ ngay
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
