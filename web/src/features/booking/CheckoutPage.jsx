import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Calendar, Users, Hotel, ShieldCheck, AlertCircle, ArrowRight, Plus, Trash2, Wallet, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuthWallet } from '../../context/AuthWalletContext';
import { bookingApi } from '../../services/api';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUserId, currentUserName, wallet, refreshWallet, showToast } = useAuthWallet();

  // URL query params pre-fill
  const initialTourId = searchParams.get('tourId') || '101';
  const initialTourName = searchParams.get('tourName') || 'Khám phá Vịnh Hạ Long - Đảo Cát Bà 3N2Đ';
  const initialDepartureId = searchParams.get('departureId') || '201';
  const initialDepartureDate = searchParams.get('departureDate') || '2026-11-20';
  const initialUnitPrice = Number(searchParams.get('unitPrice')) || 3500000;

  // Tour Booking State
  const [tourId, setTourId] = useState(initialTourId);
  const [tourName, setTourName] = useState(initialTourName);
  const [departureId, setDepartureId] = useState(initialDepartureId);
  const [departureDate, setDepartureDate] = useState(initialDepartureDate);
  const [unitPrice, setUnitPrice] = useState(initialUnitPrice);
  const initialQuantity = Math.max(1, Number(searchParams.get('quantity')) || 1);
  const [quantity, setQuantity] = useState(initialQuantity);

  // Passengers State
  const [passengers, setPassengers] = useState(() => {
    const list = [{ fullName: currentUserName || 'Khách hàng', phone: '0901234567', dateOfBirth: '1995-05-15' }];
    for (let i = 1; i < initialQuantity; i++) {
      list.push({ fullName: 'Hành khách ' + (i + 1), phone: '0901234567', dateOfBirth: '1995-05-15' });
    }
    return list;
  });

  // Optional Hotel State
  const [includeHotel, setIncludeHotel] = useState(searchParams.get('hasHotel') === 'true');
  const [hotelId, setHotelId] = useState(Number(searchParams.get('hotelId')) || 1);
  const [hotelName, setHotelName] = useState(searchParams.get('hotelName') || 'Vinpearl Resort & Spa Hạ Long');
  const [roomTypeId, setRoomTypeId] = useState(Number(searchParams.get('roomTypeId')) || 10);
  const [roomName, setRoomName] = useState(searchParams.get('roomName') || 'Deluxe Ocean View Room');
  const [roomPrice, setRoomPrice] = useState(Number(searchParams.get('hotelPrice')) || 1200000);
  const [roomQuantity, setRoomQuantity] = useState(1);
  const [checkInDate, setCheckInDate] = useState(initialDepartureDate);
  const [checkOutDate, setCheckOutDate] = useState('2026-11-22');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customIdempotencyKey, setCustomIdempotencyKey] = useState('');
  const [simulationMode, setSimulationMode] = useState('SUCCESS');

  // Update passenger count when quantity changes
  useEffect(() => {
    if (passengers.length < quantity) {
      const added = Array.from({ length: quantity - passengers.length }, (_, i) => ({
        fullName: `Hành khách ${passengers.length + i + 1}`,
        phone: '0900000000',
        dateOfBirth: '2000-01-01',
      }));
      setPassengers([...passengers, ...added]);
    } else if (passengers.length > quantity) {
      setPassengers(passengers.slice(0, quantity));
    }
  }, [quantity]);

  useEffect(() => {
    refreshWallet(currentUserId);
  }, [currentUserId, refreshWallet]);

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  // Calculations
  const tourSubtotal = unitPrice * quantity;
  const hotelSubtotal = includeHotel ? roomPrice * roomQuantity : 0;
  const grandTotal = tourSubtotal + hotelSubtotal;
  const isBalanceSufficient = wallet.balance >= grandTotal;

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!isBalanceSufficient) {
      showToast(`Số dư ví không đủ! Cần ${formatVND(grandTotal)}, số dư hiện tại là ${formatVND(wallet.balance)}. Vui lòng nạp thêm tiền.`, 'error');
      return;
    }

    const keyPrefix = simulationMode === 'FAIL_AFTER_PAYMENT' ? 'FAIL_AFTER_PAYMENT-' : '';
    const idempotencyKey = customIdempotencyKey.trim() || `${keyPrefix}booking-${currentUserId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const payload = {
      customerId: currentUserId,
      tourId: Number(tourId),
      departureId: Number(departureId),
      tourName: tourName,
      departureDate: departureDate,
      unitPrice: unitPrice,
      quantity: Number(quantity),
      idempotencyKey: idempotencyKey,
      passengers: passengers.map((p) => ({
        fullName: p.fullName,
        phone: p.phone,
        dateOfBirth: p.dateOfBirth,
      })),
      hotelDetails: includeHotel
        ? [
            {
              hotelId: Number(hotelId),
              hotelName: hotelName,
              roomTypeId: Number(roomTypeId),
              roomName: roomName,
              checkInDate: checkInDate,
              checkOutDate: checkOutDate,
              roomQuantity: Number(roomQuantity),
              price: roomPrice,
            },
          ]
        : [],
    };

    setIsSubmitting(true);
    try {
      const response = await bookingApi.createBooking(payload);
      const createdBooking = response?.data;
      showToast(`Đã tiếp nhận đơn đặt chỗ ${createdBooking?.bookingCode}! Bắt đầu kích hoạt Saga...`, 'success');
      // Redirect to Booking Tracking screen
      navigate(`/tracking/${createdBooking?.bookingCode}`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tạo đơn đặt chỗ';
      showToast(`Đặt chỗ thất bại: ${errorMsg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Xác Nhận & Đặt Chỗ Tour</h1>
        <p className="text-slate-500 text-sm mt-1">
          Hoàn tất thông tin hành khách và lựa chọn khách sạn để kích hoạt quy trình Booking Saga
        </p>
      </div>

      <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Booking Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Tour & Departure Selection */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-5 h-5 text-indigo-600" />
              1. Thông tin Tour & Lịch khởi hành
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Tour đang chọn (Snapshot)
              </span>
              <h3 className="text-lg font-bold text-slate-900">{tourName}</h3>
              <p className="text-xs text-slate-500">Mã Tour ID: #{tourId}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Lịch khởi hành (Departure Date):
                </label>
                <select
                  value={departureId}
                  onChange={(e) => {
                    setDepartureId(e.target.value);
                    if (e.target.value === '201') setDepartureDate('2026-11-20');
                    if (e.target.value === '202') setDepartureDate('2026-12-05');
                  }}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="201">Khởi hành: 20/11/2026 - Giá: {formatVND(3500000)} (Chỗ trống: 15)</option>
                  <option value="202">Khởi hành: 05/12/2026 - Giá: {formatVND(3650000)} (Chỗ trống: 8)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Số lượng hành khách:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(10, Number(e.target.value))))}
                    className="w-24 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 text-center"
                  />
                  <span className="text-xs text-slate-500">
                    Đơn giá: <strong className="text-slate-800">{formatVND(unitPrice)}</strong> / khách
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Passengers Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Users className="w-5 h-5 text-indigo-600" />
              2. Danh sách hành khách ({passengers.length} người)
            </h2>

            <div className="space-y-4">
              {passengers.map((p, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Hành khách #{idx + 1} {idx === 0 && '(Trưởng đoàn)'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Họ và tên *</label>
                      <input
                        type="text"
                        value={p.fullName}
                        onChange={(e) => handlePassengerChange(idx, 'fullName', e.target.value)}
                        required
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Số điện thoại *</label>
                      <input
                        type="tel"
                        value={p.phone}
                        onChange={(e) => handlePassengerChange(idx, 'phone', e.target.value)}
                        required
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500"
                        placeholder="0901234567"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Ngày sinh *</label>
                      <input
                        type="date"
                        value={p.dateOfBirth}
                        onChange={(e) => handlePassengerChange(idx, 'dateOfBirth', e.target.value)}
                        required
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Optional Hotel Add-on */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Hotel className="w-5 h-5 text-indigo-600" />
                3. Tùy chọn thêm khách sạn đối tác (Hotel Add-on)
              </h2>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-indigo-600">
                <input
                  type="checkbox"
                  checked={includeHotel}
                  onChange={(e) => setIncludeHotel(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                Kèm phòng khách sạn
              </label>
            </div>

            {includeHotel ? (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Khách sạn:</label>
                    <input
                      type="text"
                      value={hotelName}
                      onChange={(e) => setHotelName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Loại phòng (Room Type):</label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Check-in:</label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Check-out:</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Số lượng phòng:</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={roomQuantity}
                      onChange={(e) => setRoomQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Giá phòng mỗi đêm: <strong className="text-slate-800">{formatVND(roomPrice)}</strong> x {roomQuantity} phòng = <strong className="text-indigo-600">{formatVND(roomPrice * roomQuantity)}</strong>
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Chưa chọn khách sạn kèm theo. Bạn có thể tick vào ô phía trên để đặt kèm phòng khách sạn đối tác.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Price Breakdown & Wallet Payment */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Tóm Tắt Chi Phí (Price Breakdown)
            </h2>

            {/* Price Items */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Tiền Tour ({quantity} khách):</span>
                <span className="font-semibold text-slate-900">{formatVND(tourSubtotal)}</span>
              </div>

              {includeHotel && (
                <div className="flex justify-between text-slate-600">
                  <span>Khách sạn ({roomQuantity} phòng):</span>
                  <span className="font-semibold text-slate-900">{formatVND(hotelSubtotal)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 text-base">Tổng thanh toán:</span>
                <span className="font-extrabold text-2xl text-indigo-700">{formatVND(grandTotal)}</span>
              </div>
            </div>

            {/* Wallet Balance Check Box */}
            <div className={`p-4 rounded-xl border ${
              isBalanceSufficient
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/70 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-start gap-2.5">
                <Wallet className={`w-5 h-5 mt-0.5 ${isBalanceSufficient ? 'text-emerald-600' : 'text-rose-600'}`} />
                <div className="text-xs space-y-1 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Số dư ví khả dụng:</span>
                    <span className="font-extrabold">{formatVND(wallet.balance)}</span>
                  </div>

                  {isBalanceSufficient ? (
                    <p className="text-emerald-700 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Số dư đủ để thanh toán đơn hàng này.
                    </p>
                  ) : (
                    <div className="space-y-1 text-rose-700">
                      <p className="font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Thiếu {formatVND(grandTotal - wallet.balance)}
                      </p>
                      <Link
                        to="/wallet"
                        className="inline-block mt-1 font-bold text-indigo-700 underline hover:text-indigo-800"
                      >
                        Nạp thêm tiền vào ví ngay &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Saga Simulation Scenario selector */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1.5">
              <label className="block text-xs font-bold text-amber-900 flex items-center justify-between">
                <span>⚙️ Kịch bản Mô phỏng Saga:</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-200 text-amber-900">Test Mode</span>
              </label>
              <select
                value={simulationMode}
                onChange={(e) => setSimulationMode(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 bg-white text-slate-800 shadow-xs focus:ring-1 focus:ring-amber-500"
              >
                <option value="SUCCESS">🟢 Luồng Chuẩn: Thành công 100% (CONFIRMED)</option>
                <option value="FAIL_AFTER_PAYMENT">🔴 Mô phỏng: Đã Tạm Giữ Tiền &rarr; Lỗi Quyết Toán &rarr; Bồi Hoàn & Hoàn Tiền Ví (COMPENSATED)</option>
              </select>
              <p className="text-[10px] text-amber-800 leading-tight">
                {simulationMode === 'SUCCESS'
                  ? 'Giao dịch đi qua đầy đủ 4 bước tuần tự và xác nhận đơn hàng thành công.'
                  : 'Hệ thống giữ ghế tour, tạm giữ tiền ví thành công, sau đó mô phỏng đối tác từ chối để kích hoạt bồi hoàn: tự động giải phóng tiền tạm giữ trong ví và trả lại ghế tour.'}
              </p>
            </div>

            {/* Idempotency key input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Idempotency Key (Tùy chọn kiểm thử):
              </label>
              <input
                type="text"
                value={customIdempotencyKey}
                onChange={(e) => setCustomIdempotencyKey(e.target.value)}
                placeholder="Tự sinh nếu để trống"
                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 text-slate-600"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isBalanceSufficient}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                !isBalanceSufficient
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : isSubmitting
                  ? 'bg-indigo-400 cursor-wait'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang khởi tạo Saga...
                </>
              ) : (
                <>
                  Xác Nhận & Đặt Chỗ Ngay
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-400 text-center space-y-1">
              <p>Thanh toán bảo đảm qua Saga Orchestrator.</p>
              <p>Nếu có lỗi ở bất kỳ bước nào, tiền ví sẽ được bồi hoàn tự động 100%.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
