import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, RefreshCw, ArrowLeft, Shield, Calendar, Users, Hotel, Wallet, History, AlertTriangle } from 'lucide-react';
import { bookingApi } from '../../services/api';
import { useAuthWallet } from '../../context/AuthWalletContext';

export const BookingTrackingPage = () => {
  const { bookingCode } = useParams();
  const { currentUserId, refreshWallet, showToast } = useAuthWallet();

  const [booking, setBooking] = useState(null);
  const [saga, setSaga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const fetchStatus = async () => {
    try {
      const res = await bookingApi.getBookingByCode(bookingCode);
      if (res?.data) {
        setBooking(res.data);
      }
    } catch (err) {
      console.warn('Booking details fetch error:', err.message);
    }

    try {
      const sagaRes = await bookingApi.getSagaStatus(bookingCode);
      if (sagaRes?.data) {
        setSaga(sagaRes.data);
      }
    } catch (err) {
      console.warn('Saga status fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    refreshWallet(currentUserId);

    // Polling interval if status is PENDING or saga is PROCESSING / STARTED
    const interval = setInterval(() => {
      setPollCount((prev) => prev + 1);
      fetchStatus();
      refreshWallet(currentUserId);
    }, 2000);

    // Stop polling if booking is in final state (CONFIRMED, FAILED, CANCELLED)
    if (booking?.status && ['CONFIRMED', 'FAILED', 'CANCELLED'].includes(booking.status.toUpperCase())) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [bookingCode, booking?.status]);

  const handleCancel = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${bookingCode}? Toàn bộ số tiền sẽ được hoàn ngay vào ví của bạn.`)) {
      return;
    }

    setIsCancelling(true);
    try {
      await bookingApi.cancelBooking(bookingCode);
      showToast(`Đã yêu cầu hủy đơn ${bookingCode} thành công! Số dư ví đã được hoàn lại.`, 'success');
      await fetchStatus();
      await refreshWallet(currentUserId);
    } catch (err) {
      showToast(`Hủy đơn thất bại: ${err.message}`, 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const status = booking?.status?.toUpperCase() || 'PENDING';
  const hasHotel = booking?.hotelDetails && booking.hotelDetails.length > 0;

  // Expected 5 Saga Steps
  const SAGA_STEPS = [
    { key: 'RESERVE_TOUR', label: '1. Giữ chỗ Tour', desc: 'Kiểm tra và trừ số ghế khả dụng' },
    ...(hasHotel ? [{ key: 'RESERVE_HOTEL', label: '2. Giữ phòng Khách sạn', desc: 'Kiểm tra phòng đối tác' }] : []),
    { key: 'AUTHORIZE_PAYMENT', label: hasHotel ? '3. Tạm giữ tiền Ví (Hold)' : '2. Tạm giữ tiền Ví (Hold)', desc: 'Xác thực số dư ví điện tử' },
    { key: 'CONFIRM_RESOURCES', label: hasHotel ? '4. Quyết toán tài nguyên' : '3. Quyết toán tài nguyên', desc: 'Khóa chặt ghế và phòng' },
    { key: 'CAPTURE_PAYMENT', label: hasHotel ? '5. Trừ tiền Ví (Capture)' : '4. Trừ tiền Ví (Capture)', desc: 'Chuyển tiền vào tài khoản dịch vụ' },
  ];

  const getStepStatus = (stepKey) => {
    if (status === 'CONFIRMED') return 'COMPLETED';
    if (status === 'FAILED') {
      const stepObj = saga?.steps?.find((s) => s.stepName === stepKey);
      if (stepObj?.status === 'FAILED') return 'FAILED';
      if (stepObj?.status === 'COMPENSATED') return 'COMPENSATED';
      return stepObj?.status || 'PENDING';
    }
    const stepObj = saga?.steps?.find((s) => s.stepName === stepKey);
    return stepObj?.status || 'PENDING';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Về Lịch sử đặt tour
        </Link>
      </div>

      {/* Main Status Header Card */}
      <div className={`rounded-2xl p-6 sm:p-8 text-white shadow-xl transition-all ${
        status === 'CONFIRMED'
          ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
          : status === 'FAILED'
          ? 'bg-gradient-to-r from-rose-600 to-red-700'
          : status === 'CANCELLED'
          ? 'bg-gradient-to-r from-slate-700 to-slate-800'
          : 'bg-gradient-to-r from-indigo-700 to-purple-800'
      }`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                Saga Orchestrator Tracking
              </span>
              <span className="text-xs text-white/80">Polling #{pollCount}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {status === 'CONFIRMED' && 'Đơn Hàng Đã Được Xác Nhận!'}
              {status === 'PENDING' && 'Đang Điều Phối Saga Giao Dịch...'}
              {status === 'FAILED' && 'Giao Dịch Thất Bại (Đã Bồi Hoàn)'}
              {status === 'CANCELLED' && 'Đơn Hàng Đã Bị Hủy (Đã Hoàn Tiền)'}
            </h1>
            <p className="text-xs sm:text-sm text-white/80">
              Mã đặt chỗ: <strong className="font-mono text-white text-base tracking-wider">{bookingCode}</strong>
            </p>
          </div>

          {/* Status Icon Indicator */}
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            {status === 'CONFIRMED' && <CheckCircle2 className="w-10 h-10 text-white" />}
            {status === 'PENDING' && <RefreshCw className="w-8 h-8 text-white animate-spin" />}
            {status === 'FAILED' && <XCircle className="w-10 h-10 text-white" />}
            {status === 'CANCELLED' && <AlertTriangle className="w-10 h-10 text-white" />}
          </div>
        </div>

        {/* Failure reason notice */}
        {status === 'FAILED' && saga?.failureReason && (
          <div className="mt-4 p-3 rounded-lg bg-black/20 text-xs text-white/90 border border-white/10">
            <strong>Lý do thất bại:</strong> {saga.failureReason}
          </div>
        )}
      </div>

      {/* Real-time Saga Step Progress Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Tiến trình Saga Orchestration (Dual-write & Concurrency Proof)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống thực thi tuần tự qua RabbitMQ Event-Driven, lưu Outbox Events và bảo đảm Idempotency
            </p>
          </div>
          {status === 'PENDING' && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              Đang thực thi...
            </span>
          )}
        </div>

        {/* Timeline steps */}
        <div className="space-y-4">
          {SAGA_STEPS.map((step, idx) => {
            const stepStatus = getStepStatus(step.key);
            const isCompleted = stepStatus === 'COMPLETED';
            const isRunning = stepStatus === 'PENDING' && status === 'PENDING';
            const isFailed = stepStatus === 'FAILED';

            return (
              <div
                key={step.key}
                className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                    : isRunning
                    ? 'border-indigo-200 bg-indigo-50/50 text-indigo-900 shadow-sm'
                    : isFailed
                    ? 'border-rose-200 bg-rose-50 text-rose-900'
                    : 'border-slate-100 bg-slate-50/60 text-slate-500'
                }`}
              >
                {/* Step indicator circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white'
                    : isRunning
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse'
                    : isFailed
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-slate-900">{step.label}</h3>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isRunning
                        ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                        : isFailed
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {stepStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Details Summary */}
      {booking && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800">Chi tiết đơn đặt chỗ</h2>
            <span className="font-bold text-lg text-indigo-700">{formatVND(booking.totalAmount)}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-semibold text-slate-800 block">Dịch vụ Tour:</span>
              <p>{booking.items?.[0]?.tourNameSnapshot || 'Tour du lịch'}</p>
              <p>Khởi hành: <strong>{booking.items?.[0]?.departureDateSnapshot}</strong></p>
              <p>Số khách: <strong>{booking.items?.[0]?.quantity} người</strong></p>
            </div>

            {hasHotel && (
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-800 block">Dịch vụ Khách sạn:</span>
                <p>{booking.hotelDetails?.[0]?.hotelNameSnapshot}</p>
                <p>Phòng: <strong>{booking.hotelDetails?.[0]?.roomNameSnapshot}</strong> x {booking.hotelDetails?.[0]?.roomQuantity}</p>
                <p>Check-in: <strong>{booking.hotelDetails?.[0]?.checkInDate}</strong> &rarr; Check-out: <strong>{booking.hotelDetails?.[0]?.checkOutDate}</strong></p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3 justify-end items-center">
            {status === 'CONFIRMED' && (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                {isCancelling ? 'Đang hủy...' : 'Yêu cầu hủy tour & Hoàn tiền ví'}
              </button>
            )}

            <Link
              to="/wallet"
              className="px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              Kiểm tra ví điện tử
            </Link>

            <Link
              to="/bookings"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5" />
              Xem tất cả đơn đặt tour
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
