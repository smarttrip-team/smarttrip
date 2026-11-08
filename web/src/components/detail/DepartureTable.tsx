import React from 'react';
import { Calendar, Users, AlertCircle, CheckCircle } from 'lucide-react';
import type { Departure } from '../../types/tour';

interface DepartureTableProps {
  departures?: Departure[];
  selectedDepartureId?: number;
  onSelectDeparture: (departure: Departure) => void;
}

export const DepartureTable: React.FC<DepartureTableProps> = ({
  departures,
  selectedDepartureId,
  onSelectDeparture,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (!departures || departures.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="font-semibold text-sm">Chưa có lịch khởi hành sắp tới cho tour này.</p>
        <p className="text-xs text-slate-400 mt-1">Vui lòng liên hệ hotline 1900 6868 để đặt lịch riêng.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            Lịch Khởi Hành Sắp Tới & Tình Trạng Chỗ
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chọn một ngày khởi hành phù hợp để tiếp tục bước giữ chỗ và đặt tour.
          </p>
        </div>
      </div>

      <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Lựa chọn</th>
                <th className="py-3.5 px-4">Ngày khởi hành</th>
                <th className="py-3.5 px-4">Ngày kết thúc</th>
                <th className="py-3.5 px-4">Số chỗ trống</th>
                <th className="py-3.5 px-4 text-right">Giá tour / Khách</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departures.map((dep) => {
                const isSelected = selectedDepartureId === dep.id;
                const isFull = dep.availableSeats <= 0;

                return (
                  <tr
                    key={dep.id}
                    onClick={() => !isFull && onSelectDeparture(dep)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-primary-50/70 border-l-4 border-primary-600'
                        : isFull
                        ? 'bg-slate-50/60 opacity-60 cursor-not-allowed'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="radio"
                        name="selectedDeparture"
                        checked={isSelected}
                        disabled={isFull}
                        onChange={() => onSelectDeparture(dep)}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {formatDate(dep.departureDate)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatDate(dep.returnDate)}
                    </td>
                    <td className="py-3.5 px-4">
                      {isFull ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                          Hết chỗ
                        </span>
                      ) : dep.availableSeats <= 5 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          <Users className="w-3 h-3" />
                          Chỉ còn {dep.availableSeats} chỗ
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          Còn {dep.availableSeats} / {dep.totalSeats} chỗ
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-base font-black text-primary-600">
                        {formatPrice(dep.price)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
