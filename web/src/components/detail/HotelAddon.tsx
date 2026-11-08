import React from 'react';
import { Building2, Star, MapPin, Check, Plus, Minus } from 'lucide-react';
import type { HotelPackage, RoomTypeAvailability } from '../../types/hotel';

interface HotelAddonProps {
  hotelPackage: HotelPackage | null;
  selectedRoomTypeId?: number;
  roomQuantity: number;
  onSelectRoom: (room: RoomTypeAvailability | null) => void;
  onQuantityChange: (qty: number) => void;
}

export const HotelAddon: React.FC<HotelAddonProps> = ({
  hotelPackage,
  selectedRoomTypeId,
  roomQuantity,
  onSelectRoom,
  onQuantityChange,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (!hotelPackage) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-600" />
            Tùy Chọn Khách Sạn & Resort Đi Kèm (Tùy Chọn)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Nâng cấp kỳ nghỉ với gói phòng khách sạn 4-5 sao liên kết giá ưu đãi độc quyền.
          </p>
        </div>
        {selectedRoomTypeId && (
          <button
            onClick={() => onSelectRoom(null)}
            className="text-xs font-semibold text-rose-500 hover:text-rose-600 self-start sm:self-auto"
          >
            Bỏ chọn khách sạn
          </button>
        )}
      </div>

      {/* Hotel Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900">{hotelPackage.hotelName}</span>
              <div className="flex text-amber-400">
                {Array.from({ length: hotelPackage.starRating || 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
            </div>
            {hotelPackage.address && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {hotelPackage.address}
              </p>
            )}
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-800 rounded-full self-start">
            Đối tác lưu trú chính thức
          </span>
        </div>

        {/* Room Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hotelPackage.roomTypes.map((room) => {
            const isSelected = selectedRoomTypeId === room.roomTypeId;

            return (
              <div
                key={room.roomTypeId}
                onClick={() => onSelectRoom(isSelected ? null : room)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50/50 ring-2 ring-primary-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-800">{room.roomName}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 block mt-1">
                    Còn {room.availableRooms} phòng trống
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Phụ thu:</span>
                  <span className="text-sm font-black text-primary-600">
                    +{formatPrice(room.pricePerNight)} / đêm
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Room Quantity selector (if room selected) */}
        {selectedRoomTypeId && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Số lượng phòng:</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onQuantityChange(Math.max(1, roomQuantity - 1))}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-bold text-slate-900 w-6 text-center">{roomQuantity}</span>
              <button
                type="button"
                onClick={() => onQuantityChange(roomQuantity + 1)}
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
