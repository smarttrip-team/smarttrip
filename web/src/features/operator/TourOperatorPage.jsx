import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { tourApi, operatorApi, bookingApi, walletApi } from '../../services/api';
import { useAuthWallet } from '../../context/AuthWalletContext';
import {
  Layers,
  PlusCircle,
  Wallet,
  ArrowUpRight,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  Edit2,
  Save,
  X,
  ShieldCheck,
  Search,
  XCircle,
  Power,
} from 'lucide-react';

export default function TourOperatorPage() {
  const { showToast, currentUserId, wallet } = useAuthWallet();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showCreateTourModal, setShowCreateTourModal] = useState(false);
  const [showAddDepartureModal, setShowAddDepartureModal] = useState(false);
  const [selectedTourForDeparture, setSelectedTourForDeparture] = useState(null);

  // Inline Settlement Ledger View
  const [showSettlementLedger, setShowSettlementLedger] = useState(false);
  const [settlementTransactions, setSettlementTransactions] = useState([]);
  const [loadingSettlement, setLoadingSettlement] = useState(false);

  const fetchSettlementTransactions = useCallback(async () => {
    setLoadingSettlement(true);
    try {
      const res = await walletApi.getTransactions(currentUserId);
      if (res?.data) {
        setSettlementTransactions(res.data);
      }
    } catch (err) {
      console.warn('Could not load settlements:', err);
    } finally {
      setLoadingSettlement(false);
    }
  }, [currentUserId]);

  const toggleSettlementLedger = () => {
    if (!showSettlementLedger) {
      fetchSettlementTransactions();
    }
    setShowSettlementLedger(!showSettlementLedger);
  };

  // Capacity Edit State
  const [editingDepartureId, setEditingDepartureId] = useState(null);
  const [capacityEditForm, setCapacityEditForm] = useState({ totalSeats: 20, availableSeats: 20 });

  // Operator Emergency Booking Cancellation State
  const [lookupBookingCode, setLookupBookingCode] = useState('');
  const [cancellingCode, setCancellingCode] = useState(false);

  // Create Tour Form State
  const [tourForm, setTourForm] = useState({
    destinationId: 1,
    title: '',
    description: '',
    durationDays: 3,
    basePrice: 3500000,
    coverImageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
  });

  // Add Departure Form State
  const [departureForm, setDepartureForm] = useState({
    departureDate: '',
    returnDate: '',
    price: 3500000,
    totalSeats: 25,
  });

  const fetchTours = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await tourApi.getTours();
      const items = Array.isArray(res.data) ? res.data : (res.data?.content || []);
      setTours(items);
    } catch (err) {
      showToast(err.message || 'Không thể tải danh sách tour', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const handleCreateTour = async (e) => {
    e.preventDefault();
    try {
      await operatorApi.createTour({
        ...tourForm,
        destinationId: Number(tourForm.destinationId),
        durationDays: Number(tourForm.durationDays),
        basePrice: Number(tourForm.basePrice),
      });
      showToast('Tạo tour mới thành công!', 'success');
      setShowCreateTourModal(false);
      setTourForm({
        destinationId: 1,
        title: '',
        description: '',
        durationDays: 3,
        basePrice: 3500000,
        coverImageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
      });
      fetchTours();
    } catch (err) {
      showToast(err.message || 'Không thể tạo tour mới', 'error');
    }
  };

  const handleAddDeparture = async (e) => {
    e.preventDefault();
    if (!selectedTourForDeparture) return;
    try {
      await operatorApi.addDeparture(selectedTourForDeparture.id, {
        departureDate: departureForm.departureDate,
        returnDate: departureForm.returnDate,
        price: Number(departureForm.price),
        totalSeats: Number(departureForm.totalSeats),
      });
      showToast(`Đã mở lịch khởi hành mới cho tour ${selectedTourForDeparture.title || selectedTourForDeparture.name}`, 'success');
      setShowAddDepartureModal(false);
      fetchTours();
    } catch (err) {
      showToast(err.message || 'Không thể mở lịch khởi hành', 'error');
    }
  };

  const handleSaveCapacity = async (departureId) => {
    try {
      await operatorApi.updateCapacity(
        departureId,
        Number(capacityEditForm.totalSeats),
        Number(capacityEditForm.availableSeats)
      );
      showToast('Cập nhật số lượng chỗ thành công!', 'success');
      setEditingDepartureId(null);
      fetchTours();
    } catch (err) {
      showToast(err.message || 'Không thể cập nhật số lượng chỗ', 'error');
    }
  };

  const toggleTourStatus = (tourId) => {
    setTours(prev => prev.map(t => {
      if (t.id === tourId) {
        const nextStatus = t.status === 'INACTIVE' ? 'PUBLISHED' : 'INACTIVE';
        showToast(`Đã chuyển trạng thái Tour #${tourId} sang: ${nextStatus}`, 'info');
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleOperatorCancelBooking = async (e) => {
    e.preventDefault();
    const code = lookupBookingCode.trim();
    if (!code) {
      showToast('Vui lòng nhập mã đơn đặt chỗ (Booking Code)', 'error');
      return;
    }

    if (!window.confirm(`Xác nhận hủy đơn hàng ${code}? Saga Orchestrator sẽ tự động hoàn trả vé tour, phòng khách sạn và hoàn tiền vào ví khách hàng.`)) {
      return;
    }

    setCancellingCode(true);
    try {
      await bookingApi.cancelBooking(code);
      showToast(`Đã kích hoạt Saga hủy đơn hàng ${code} thành công! Tiền đã được hoàn về ví người dùng.`, 'success');
      setLookupBookingCode('');
    } catch (err) {
      showToast(`Lỗi hủy đơn: ${err.message}`, 'error');
    } finally {
      setCancellingCode(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase">
                <Layers className="w-4 h-4" />
                <span>Tour Operator Management Portal</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                Quản lý Tour & Lịch trình Khởi hành
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Mở tour mới, thiết lập lịch khởi hành và điều chỉnh sức chứa (capacity) theo thời gian thực
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchTours}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </button>

              <button
                onClick={() => setShowCreateTourModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tạo Tour Mới</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Tour Operator Wallet & Revenue Overview */}
        <div className="bg-gradient-to-r from-teal-800 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-teal-500/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  Đối tác Điều hành Tour
                </span>
                <span className="text-xs text-slate-300">| Khấu trừ 10% hoa hồng nền tảng SmartTrip</span>
              </div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-white mt-1">
                <Wallet className="w-6 h-6 text-teal-400" />
                Ví Doanh Thu Đối Tác: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(wallet?.balance || 0)}
              </h2>
              <p className="text-xs text-teal-200">
                Doanh thu tour thực nhận 90% được hệ thống tự động quyết toán vào ví ngay khi khách hoàn tất đặt chỗ
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={toggleSettlementLedger}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-900/80 hover:bg-teal-900 text-teal-200 border border-teal-400/30 font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                <span>{showSettlementLedger ? 'Ẩn Bảng Sao Kê' : 'Xem Sao Kê Tại Đây'}</span>
                <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${showSettlementLedger ? 'rotate-90' : ''}`} />
              </button>

              <Link
                to="/wallet"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
              >
                <span>Mở Trang Ví & Rút Tiền</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Inline Expandable Settlement Table */}
          {showSettlementLedger && (
            <div className="mt-5 pt-4 border-t border-teal-500/20 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-teal-200 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Lịch sử quyết toán đơn tour thực nhận 90% (Khấu trừ 10% hoa hồng sàn)
                </span>
                <button
                  type="button"
                  onClick={fetchSettlementTransactions}
                  disabled={loadingSettlement}
                  className="text-xs text-teal-300 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingSettlement ? 'animate-spin' : ''}`} />
                  Làm mới
                </button>
              </div>

              {loadingSettlement ? (
                <div className="py-6 text-center text-xs text-teal-300/80 flex justify-center items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                  Đang tải sao kê quyết toán từ hệ thống...
                </div>
              ) : settlementTransactions.length === 0 ? (
                <div className="py-6 text-center text-xs text-teal-300/70 bg-black/20 rounded-xl">
                  Chưa có giao dịch quyết toán nào cho tài khoản này. Tiền sẽ tự động đổ về ngay khi có khách đặt tour!
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-teal-500/20 bg-slate-950/60">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 text-[11px] text-teal-200 uppercase tracking-wider border-b border-teal-500/20">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Mã GD</th>
                        <th className="px-4 py-2.5 font-semibold">Loại bút toán</th>
                        <th className="px-4 py-2.5 font-semibold">Số tiền</th>
                        <th className="px-4 py-2.5 font-semibold">Mã đơn (Booking)</th>
                        <th className="px-4 py-2.5 font-semibold">Thời gian</th>
                        <th className="px-4 py-2.5 font-semibold">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-teal-500/10">
                      {settlementTransactions.map((tx) => {
                        const isReversal = tx.transactionType === 'SETTLEMENT_REVERSAL';
                        return (
                          <tr key={tx.id || Math.random()} className="hover:bg-teal-500/5 transition-colors">
                            <td className="px-4 py-2.5 font-mono text-[11px] text-teal-400">#{tx.id}</td>
                            <td className="px-4 py-2.5">
                              {isReversal ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  Thu hồi (REVERSAL)
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                  Nhận 90% Tour (SETTLEMENT)
                                </span>
                              )}
                            </td>
                            <td className={`px-4 py-2.5 font-bold ${isReversal ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {isReversal ? '-' : '+'}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount || 0)}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-white">
                              {tx.referenceId ? (
                                <span className="bg-teal-950 px-2 py-0.5 rounded border border-teal-600/40">
                                  {tx.referenceId}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-2.5 text-slate-400 text-[11px]">
                              {tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                            </td>
                            <td className="px-4 py-2.5 text-slate-400 text-[11px]">
                              {isReversal ? 'Khấu trừ 90% do khách hủy tour hợp lệ' : 'Tự động giải ngân 90% từ đơn đặt tour'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Operator Emergency Cancellation & Refund Tool */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Công Cụ Hủy Đơn Hàng Khẩn Cấp & Bù Trừ Saga (Operator Tool)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              Chính sách hoàn tiền: &ge;7 ngày (100%), 3-6 ngày (50%), &lt;3 ngày (0%)
            </span>
          </div>

          <form onSubmit={handleOperatorCancelBooking} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={lookupBookingCode}
                onChange={(e) => setLookupBookingCode(e.target.value)}
                placeholder="Nhập mã đơn đặt chỗ cần hủy (ví dụ: BK-20261109-1234)..."
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={cancellingCode}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <XCircle className="w-4 h-4" />
              {cancellingCode ? 'Đang gửi lệnh Saga...' : 'Kích Hoạt Hủy & Hoàn Tiền'}
            </button>
          </form>
        </div>

        {/* Main Tours List */}
        {loading && (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-indigo-500" />
            Đang tải dữ liệu tour từ tour-service...
          </div>
        )}

        {!loading && tours.length === 0 && (
          <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            Chưa có tour nào. Hãy bấm "Tạo Tour Mới" để bắt đầu.
          </div>
        )}

        {!loading &&
          tours.map((tour) => {
            const isInactive = tour.status === 'INACTIVE';
            const departures = tour.upcomingDepartures || tour.departures || [];

            return (
              <div
                key={tour.id}
                className={`bg-white rounded-xl border shadow-xs overflow-hidden transition-all ${
                  isInactive ? 'opacity-70 border-slate-200 bg-slate-50/50' : 'border-slate-200'
                }`}
              >
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                      <img
                        src={tour.coverImageUrl || tour.imageUrl || 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=400&q=80'}
                        alt={tour.title || tour.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-indigo-600 font-bold">#{tour.id}</span>
                        <h3 className="font-bold text-slate-900 text-base">{tour.title || tour.name}</h3>
                        
                        {/* Status toggle button */}
                        <button
                          type="button"
                          onClick={() => toggleTourStatus(tour.id)}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 transition-colors ${
                            isInactive
                              ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title="Nhấn để đổi trạng thái mở bán"
                        >
                          <Power className="w-3 h-3" />
                          {tour.status || 'PUBLISHED'} (Click đổi)
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {tour.destinationName || tour.destination || tour.city || 'Việt Nam'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {tour.durationDays ? `${tour.durationDays} ngày` : (tour.duration || '3N2Đ')}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-900">
                          Giá gốc: {formatCurrency(tour.basePrice || tour.price)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedTourForDeparture(tour);
                      const days = tour.durationDays || 3;
                      setDepartureForm({
                        departureDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
                        returnDate: new Date(Date.now() + 86400000 * (7 + days)).toISOString().split('T')[0],
                        price: tour.basePrice || 3500000,
                        totalSeats: 25,
                      });
                      setShowAddDepartureModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors shrink-0"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Mở lịch khởi hành</span>
                  </button>
                </div>

                {/* Departures Table */}
                <div className="p-5 bg-slate-50/40">
                  <div className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
                    Lịch trình khởi hành & Quản lý sức chứa
                  </div>

                  {departures && departures.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2.5">Mã Lịch</th>
                            <th className="px-4 py-2.5">Ngày khởi hành</th>
                            <th className="px-4 py-2.5">Ngày về</th>
                            <th className="px-4 py-2.5">Giá vé</th>
                            <th className="px-4 py-2.5">Tổng số chỗ</th>
                            <th className="px-4 py-2.5">Số chỗ trống</th>
                            <th className="px-4 py-2.5">Trạng thái</th>
                            <th className="px-4 py-2.5 text-right">Điều chỉnh</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {departures.map((dep, idx) => {
                            const isEditing = editingDepartureId === dep.id;
                            const avail = dep.availableSeats !== undefined ? dep.availableSeats : (dep.totalSeats || 25);
                            const total = dep.totalSeats || 25;

                            return (
                              <tr key={dep.id || idx} className="hover:bg-slate-50/80">
                                <td className="px-4 py-3 font-mono font-bold text-indigo-600">
                                  #{dep.id || idx + 1}
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-800">
                                  {dep.departureDate}
                                </td>
                                <td className="px-4 py-3 text-slate-500">{dep.returnDate || 'Theo lịch'}</td>
                                <td className="px-4 py-3 font-semibold text-slate-900">
                                  {formatCurrency(dep.price || tour.basePrice)}
                                </td>

                                {/* Capacity Columns */}
                                {isEditing ? (
                                  <>
                                    <td className="px-4 py-3">
                                      <input
                                        type="number"
                                        value={capacityEditForm.totalSeats}
                                        onChange={(e) =>
                                          setCapacityEditForm({
                                            ...capacityEditForm,
                                            totalSeats: e.target.value,
                                          })
                                        }
                                        className="w-16 px-2 py-1 text-xs border rounded border-indigo-400 focus:outline-none"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <input
                                        type="number"
                                        value={capacityEditForm.availableSeats}
                                        onChange={(e) =>
                                          setCapacityEditForm({
                                            ...capacityEditForm,
                                            availableSeats: e.target.value,
                                          })
                                        }
                                        className="w-16 px-2 py-1 text-xs border rounded border-indigo-400 focus:outline-none"
                                      />
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="px-4 py-3 text-slate-700">{total} chỗ</td>
                                    <td className="px-4 py-3">
                                      <span
                                        className={`font-bold ${
                                          avail > 5
                                            ? 'text-emerald-600'
                                            : avail > 0
                                            ? 'text-amber-600'
                                            : 'text-rose-600'
                                        }`}
                                      >
                                        {avail} chỗ
                                      </span>
                                    </td>
                                  </>
                                )}

                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                                    {dep.status || 'SCHEDULED'}
                                  </span>
                                </td>

                                <td className="px-4 py-3 text-right">
                                  {isEditing ? (
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => handleSaveCapacity(dep.id)}
                                        className="p-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
                                        title="Lưu"
                                      >
                                        <Save className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setEditingDepartureId(null)}
                                        className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
                                        title="Hủy"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingDepartureId(dep.id);
                                        setCapacityEditForm({
                                          totalSeats: total,
                                          availableSeats: avail,
                                        });
                                      }}
                                      className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      <span>Sửa số chỗ</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic p-3 text-center bg-white rounded border border-dashed border-slate-200">
                      Chưa có lịch khởi hành sắp tới. Nhấn "Mở lịch khởi hành" để thiết lập chuyến đi.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Modal Tạo Tour Mới */}
      {showCreateTourModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-indigo-600" />
                <span>Tạo Tour Mới (Tour Operator)</span>
              </h2>
              <button
                onClick={() => setShowCreateTourModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTour} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên Tour Du Lịch</label>
                <input
                  type="text"
                  required
                  value={tourForm.title}
                  onChange={(e) => setTourForm({ ...tourForm, title: e.target.value })}
                  placeholder="Ví dụ: Khám phá Vịnh Hạ Long 3N2Đ"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Điểm đến (Destination ID)</label>
                  <input
                    type="number"
                    required
                    value={tourForm.destinationId}
                    onChange={(e) => setTourForm({ ...tourForm, destinationId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thời lượng (Số ngày)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={tourForm.durationDays}
                    onChange={(e) => setTourForm({ ...tourForm, durationDays: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Giá gốc (VND)</label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={tourForm.basePrice}
                  onChange={(e) => setTourForm({ ...tourForm, basePrice: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả Tour</label>
                <textarea
                  rows={3}
                  value={tourForm.description}
                  onChange={(e) => setTourForm({ ...tourForm, description: e.target.value })}
                  placeholder="Mô tả hành trình điểm nổi bật..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateTourModal(false)}
                  className="px-4 py-2 rounded-lg border text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Xác nhận Tạo Tour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mở Lịch Khởi Hành */}
      {showAddDepartureModal && selectedTourForDeparture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Mở Lịch Khởi Hành</h2>
                <div className="text-xs text-indigo-600 font-medium">{selectedTourForDeparture.title || selectedTourForDeparture.name}</div>
              </div>
              <button
                onClick={() => setShowAddDepartureModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDeparture} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày đi</label>
                  <input
                    type="date"
                    required
                    value={departureForm.departureDate}
                    onChange={(e) => setDepartureForm({ ...departureForm, departureDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày về</label>
                  <input
                    type="date"
                    required
                    value={departureForm.returnDate}
                    onChange={(e) => setDepartureForm({ ...departureForm, returnDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Giá vé / khách (VND)</label>
                <input
                  type="number"
                  required
                  value={departureForm.price}
                  onChange={(e) => setDepartureForm({ ...departureForm, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sức chứa (Tổng số chỗ)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={departureForm.totalSeats}
                  onChange={(e) => setDepartureForm({ ...departureForm, totalSeats: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddDepartureModal(false)}
                  className="px-4 py-2 rounded-lg border text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Mở Lịch Khởi Hành
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { TourOperatorPage };
