import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Calendar, Users, Hotel, ArrowRight, RefreshCw, XCircle, CheckCircle2, AlertTriangle, Clock, Wallet } from 'lucide-react';
import { useAuthWallet } from '../../context/AuthWalletContext';
import { bookingApi } from '../../services/api';

export const BookingHistoryPage = () => {
  const { currentUserId, currentUserName, refreshWallet, showToast } = useAuthWallet();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [cancellingCode, setCancellingCode] = useState(null);

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getCustomerBookings(currentUserId);
      if (res?.data && Array.isArray(res.data)) {
        setBookings(res.data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.warn('Failed to load bookings from API:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    refreshWallet(currentUserId);
  }, [currentUserId]);

  const handleCancel = async (bookingCode) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng ${bookingCode}? Tiền sẽ được hoàn lại ngay vào ví điện tử của bạn.`)) {
      return;
    }

    setCancellingCode(bookingCode);
    try {
      await bookingApi.cancelBooking(bookingCode);
      showToast(`Đã hủy thành công đơn hàng ${bookingCode}! Tiền đã được hoàn lại vào ví.`, 'success');
      await refreshWallet(currentUserId);
      await fetchBookings();
    } catch (err) {
      showToast(`Hủy đơn thất bại: ${err.message}`, 'error');
    } finally {
      setCancellingCode(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === 'ALL') return true;
    return b.status?.toUpperCase() === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3.5 h-3.5" /> CONFIRMED</span>;
      case 'PENDING':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse"><Clock className="w-3.5 h-3.5" /> PENDING</span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700"><AlertTriangle className="w-3.5 h-3.5" /> CANCELLED</span>;
      case 'FAILED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800"><XCircle className="w-3.5 h-3.5" /> FAILED</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <History className="w-8 h-8 text-indigo-600" />
            Lịch Sử Đặt Tour & Quản Lý Đơn Hàng
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi trạng thái các đơn đặt chỗ và thực hiện yêu cầu hủy tour hoàn tiền cho {currentUserName}
          </p>
        </div>

        <button
          onClick={() => {
            fetchBookings();
            refreshWallet(currentUserId);
            showToast('Đã làm mới danh sách đơn đặt chỗ', 'info');
          }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium shadow-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
          Làm mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto text-xs font-semibold">
        {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              filterStatus === st
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st === 'ALL' ? 'Tất cả đơn hàng' : st}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Đang tải danh sách đặt tour...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
          <History className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-800">Không có đơn đặt chỗ nào</h3>
            <p className="text-xs text-slate-500 mt-1">
              Bạn chưa thực hiện đơn đặt tour nào với trạng thái này.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-colors"
          >
            Khám phá & Đặt Tour ngay &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const hasHotel = b.hotelDetails && b.hotelDetails.length > 0;
            const isConfirmed = b.status?.toUpperCase() === 'CONFIRMED';
            const isCancelled = b.status?.toUpperCase() === 'CANCELLED';

            return (
              <div
                key={b.id || b.bookingCode}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                      {b.bookingCode}
                    </span>
                    <span className="text-xs text-slate-400">
                      {b.createdAt ? new Date(b.createdAt).toLocaleString('vi-VN') : 'Mới tạo'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(b.status)}
                    <span className="text-lg font-bold text-indigo-700">{formatVND(b.totalAmount)}</span>
                  </div>
                </div>

                {/* Tour & Hotel summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-800 block text-sm">
                      {b.items?.[0]?.tourNameSnapshot || 'Tour du lịch'}
                    </span>
                    <div className="flex items-center gap-4 text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        Khởi hành: <strong>{b.items?.[0]?.departureDateSnapshot}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                        Số khách: <strong>{b.items?.[0]?.quantity} người</strong>
                      </span>
                    </div>
                  </div>

                  {hasHotel ? (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-800 block text-sm flex items-center gap-1.5">
                        <Hotel className="w-4 h-4 text-amber-500" />
                        {b.hotelDetails?.[0]?.hotelNameSnapshot}
                      </span>
                      <p className="text-slate-500">
                        Loại phòng: <strong>{b.hotelDetails?.[0]?.roomNameSnapshot}</strong> x {b.hotelDetails?.[0]?.roomQuantity} phòng
                      </p>
                      <p className="text-slate-500">
                        {b.hotelDetails?.[0]?.checkInDate} &rarr; {b.hotelDetails?.[0]?.checkOutDate}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50/50 border border-slate-100 flex items-center text-slate-400 italic">
                      Không kèm khách sạn đối tác
                    </div>
                  )}
                </div>

                {/* Actions row */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {isCancelled && (
                      <span className="text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Đơn đã hủy - Tiền đã hoàn về ví điện tử
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Cancellation button */}
                    {isConfirmed && (
                      <button
                        onClick={() => handleCancel(b.bookingCode)}
                        disabled={cancellingCode === b.bookingCode}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                      >
                        {cancellingCode === b.bookingCode ? 'Đang hủy...' : 'Hủy tour & Hoàn tiền'}
                      </button>
                    )}

                    {/* View Saga Live Tracking */}
                    <Link
                      to={`/tracking/${b.bookingCode}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                    >
                      Xem Saga Tracking
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
