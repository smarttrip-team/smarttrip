import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TourGallery } from '../components/detail/TourGallery';
import { TourOverview } from '../components/detail/TourOverview';
import { TourItinerary } from '../components/detail/TourItinerary';
import { DepartureTable } from '../components/detail/DepartureTable';
import { HotelAddon } from '../components/detail/HotelAddon';
import { tourApi } from '../api/tourApi';
import { hotelApi } from '../api/hotelApi';
import type { Departure } from '../types/tour';
import type { RoomTypeAvailability } from '../types/hotel';
import { Loader2, ArrowLeft, ShieldCheck, Check, Calendar, Users, Building, ArrowRight } from 'lucide-react';

export const TourDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const tourId = Number(id);

  // Fetch Tour detail
  const { data: tour, isLoading: isTourLoading } = useQuery({
    queryKey: ['tour', tourId],
    queryFn: () => tourApi.getTourById(tourId),
    enabled: !isNaN(tourId),
  });

  // Fetch Hotel packages for this tour
  const { data: hotelPackage } = useQuery({
    queryKey: ['hotel', tourId],
    queryFn: () => hotelApi.getHotelForTour(tourId),
    enabled: !isNaN(tourId),
  });

  // Interactive booking state
  const [selectedDepartureOverride, setSelectedDepartureOverride] = useState<Departure | null>(null);
  const [guestCount, setGuestCount] = useState<number>(1);
  const [selectedRoom, setSelectedRoom] = useState<RoomTypeAvailability | null>(null);
  const [roomQuantity, setRoomQuantity] = useState<number>(1);

  // Default to first upcoming departure if none manually selected
  const selectedDeparture = selectedDepartureOverride ?? (tour?.upcomingDepartures && tour.upcomingDepartures.length > 0 ? tour.upcomingDepartures[0] : null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (isTourLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
        <span className="font-semibold text-sm">Đang tải thông tin chi tiết tour...</span>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy thông tin tour</h2>
        <Link to="/tours" className="mt-4 inline-flex items-center gap-2 text-primary-600 font-bold">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách tour
        </Link>
      </div>
    );
  }

  // Calculate pricing
  const tourPricePerPerson = selectedDeparture ? selectedDeparture.price : tour.basePrice;
  const tourTotal = tourPricePerPerson * guestCount;
  const hotelTotal = selectedRoom ? selectedRoom.pricePerNight * roomQuantity * Math.max(1, tour.durationDays - 1) : 0;
  const grandTotal = tourTotal + hotelTotal;

  const handleBookingClick = () => {
    if (!selectedDeparture) {
      alert('Vui lòng chọn ngày khởi hành trước khi tiến hành đặt tour!');
      return;
    }
    alert(
      `Đã chọn đặt tour:\n- Tour: ${tour.title}\n- Ngày đi: ${selectedDeparture.departureDate}\n- Số khách: ${guestCount}\n${
        selectedRoom ? `- Khách sạn: ${hotelPackage?.hotelName} (${selectedRoom.roomName} x ${roomQuantity} phòng)\n` : ''
      }- Tổng cộng: ${formatPrice(grandTotal)}\n\n(Chuyển sang màn hình tạo Booking & thanh toán)`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Back navigation */}
        <div>
          <Link
            to="/tours"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách tour
          </Link>
        </div>

        {/* 1. Image Gallery & Title */}
        <TourGallery tour={tour} />

        {/* 2. Main Content + Sticky Booking Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Left Column: Details, Itinerary, Schedule, Hotel Addon */}
          <div className="lg:col-span-2 space-y-10">
            {/* Overview & Highlights */}
            <TourOverview tour={tour} />

            {/* Departure Table */}
            <DepartureTable
              departures={tour.upcomingDepartures}
              selectedDepartureId={selectedDeparture?.id}
              onSelectDeparture={setSelectedDepartureOverride}
            />

            {/* Optional Hotel Add-on */}
            <HotelAddon
              hotelPackage={hotelPackage || null}
              selectedRoomTypeId={selectedRoom?.roomTypeId}
              roomQuantity={roomQuantity}
              onSelectRoom={setSelectedRoom}
              onQuantityChange={setRoomQuantity}
            />

            {/* Itinerary */}
            <TourItinerary itinerary={tour.itinerary} />
          </div>

          {/* Right Column: Sticky Booking Summary Card */}
          <div className="lg:col-span-1 sticky top-24">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xl space-y-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Giá tour trọn gói
                </span>
                <div className="text-3xl font-black text-primary-600 mt-1">
                  {formatPrice(tourPricePerPerson)}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ khách</span>
                </div>
              </div>

              {/* Booking Options Form */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                {/* Selected Departure */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary-500" />
                    Ngày khởi hành đã chọn
                  </label>
                  {selectedDeparture ? (
                    <div className="p-3 bg-primary-50/70 border border-primary-200 rounded-xl text-xs">
                      <div className="font-bold text-slate-900">
                        {new Date(selectedDeparture.departureDate).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-primary-700 font-semibold mt-0.5">
                        Còn {selectedDeparture.availableSeats} chỗ trống
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                      Chưa chọn ngày khởi hành
                    </div>
                  )}
                </div>

                {/* Guest Count */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary-500" />
                    Số lượng khách
                  </label>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs font-semibold text-slate-700">Người lớn (từ 12 tuổi):</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <span className="font-bold text-slate-900 w-5 text-center text-sm">{guestCount}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setGuestCount(
                            selectedDeparture
                              ? Math.min(selectedDeparture.availableSeats, guestCount + 1)
                              : guestCount + 1
                          )
                        }
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white font-bold text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hotel Add-on summary (if selected) */}
                {selectedRoom && hotelPackage && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-primary-500" />
                      Gói khách sạn kèm theo
                    </label>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                      <div className="font-bold text-slate-800">{hotelPackage.hotelName}</div>
                      <div className="text-slate-600">
                        {selectedRoom.roomName} x {roomQuantity} phòng ({tour.durationDays - 1} đêm)
                      </div>
                      <div className="text-primary-600 font-bold">
                        +{formatPrice(hotelTotal)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Tiền tour ({guestCount} khách):</span>
                  <span className="font-semibold text-slate-800">{formatPrice(tourTotal)}</span>
                </div>
                {hotelTotal > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Phụ thu khách sạn:</span>
                    <span className="font-semibold text-slate-800">+{formatPrice(hotelTotal)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
                  <span className="text-2xl font-black text-primary-600">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBookingClick}
                className="w-full py-4 bg-gradient-to-r from-primary-600 to-sky-500 hover:from-primary-700 hover:to-sky-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
              >
                <span>Tiến Hành Đặt Tour</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Policies assurance */}
              <div className="space-y-1.5 pt-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Chính sách hoàn tiền 100% trước 7 ngày</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                  <span>Xác nhận chỗ tự động qua Saga</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                  <span>Bảo hiểm du lịch trọn gói theo chuyến</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
