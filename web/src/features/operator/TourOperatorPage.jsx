import React, { useState, useEffect } from 'react';
import { 
  Compass, Plus, Calendar, MapPin, DollarSign, Users, CheckCircle2, 
  AlertCircle, Briefcase, RefreshCw, ChevronDown, ChevronUp, Layers, 
  Clock, ArrowRight, Sparkles, Building, Power, Search, ShieldCheck, XCircle
} from 'lucide-react';
import { tourApi, operatorApi, bookingApi } from '../../services/api';
import { useAuthWallet } from '../../context/AuthWalletContext';

const PRESET_DESTINATIONS = [
  { id: 1, name: 'Vịnh Hạ Long', city: 'Quảng Ninh' },
  { id: 2, name: 'Bán Đảo Sơn Trà & Hội An', city: 'Đà Nẵng' },
  { id: 3, name: 'Đảo Ngọc Phú Quốc', city: 'Kiên Giang' },
  { id: 4, name: 'Thủ Đô Ngàn Năm Văn Hiến', city: 'Hà Nội' },
  { id: 5, name: 'Thành Phố Ngàn Hoa Sương Mù', city: 'Đà Lạt' },
];

export const TourOperatorPage = () => {
  const { currentUserId, currentUserName, isOperator, showToast } = useAuthWallet();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTourId, setExpandedTourId] = useState(null);

  // Modals state
  const [showCreateTourModal, setShowCreateTourModal] = useState(false);
  const [showDepartureModal, setShowDepartureModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);

  // Create tour form state
  const [tourForm, setTourForm] = useState({
    title: '',
    destinationId: 1,
    durationDays: 3,
    basePrice: 3500000,
    description: '',
  });
  const [submittingTour, setSubmittingTour] = useState(false);

  // Add departure form state
  const [departureForm, setDepartureForm] = useState({
    departureDate: '',
    returnDate: '',
    price: 3500000,
    totalSeats: 30,
  });
  const [submittingDeparture, setSubmittingDeparture] = useState(false);

  // Operator Quick Booking Cancel State (Issue #41)
  const [lookupBookingCode, setLookupBookingCode] = useState('');
  const [cancellingCode, setCancellingCode] = useState(false);

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const fetchTours = async () => {
    setLoading(true);
    try {
      const res = await tourApi.getTours();
      const items = Array.isArray(res.data) ? res.data : (res?.data?.content || []);
      if (items.length > 0) {
        setTours(items);
        if (!expandedTourId) setExpandedTourId(items[0].id);
      } else {
        setTours([]);
      }
    } catch (err) {
      console.warn('Could not load tours from backend, setting fallback:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, []);

  // Handle tour creation
  const handleCreateTour = async (e) => {
    e.preventDefault();
    if (!tourForm.title.trim()) {
      showToast('Vui lòng nhập tên tour du lịch', 'error');
      return;
    }

    setSubmittingTour(true);
    try {
      const payload = {
        destinationId: Number(tourForm.destinationId),
        title: tourForm.title.trim(),
        description: tourForm.description.trim(),
        durationDays: Number(tourForm.durationDays),
        basePrice: Number(tourForm.basePrice),
      };

      const res = await operatorApi.createTour(payload);
      showToast(`Tạo tour thành công: "${payload.title}"`, 'success');
      
      const newTour = res.data || {
        id: Date.now(),
        ...payload,
        destinationName: PRESET_DESTINATIONS.find(d => d.id === payload.destinationId)?.name || 'Việt Nam',
        status: 'PUBLISHED',
        upcomingDepartures: [],
      };

      setTours(prev => [newTour, ...prev]);
      setExpandedTourId(newTour.id);
      setShowCreateTourModal(false);
      setTourForm({
        title: '',
        destinationId: 1,
        durationDays: 3,
        basePrice: 3500000,
        description: '',
      });
    } catch (err) {
      showToast(`Không thể tạo tour: ${err.message}`, 'error');
    } finally {
      setSubmittingTour(false);
    }
  };

  // Toggle tour status (ACTIVE / INACTIVE) (Issue #41)
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

  // Open departure modal for specific tour
  const openDepartureModal = (tour) => {
    setSelectedTour(tour);
    const today = new Date();
    const depart = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const days = tour.durationDays || 3;
    const ret = new Date(today.getTime() + (7 + days) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setDepartureForm({
      departureDate: depart,
      returnDate: ret,
      price: tour.basePrice || 3500000,
      totalSeats: 30,
    });
    setShowDepartureModal(true);
  };

  // Handle add departure
  const handleAddDeparture = async (e) => {
    e.preventDefault();
    if (!selectedTour) return;

    if (!departureForm.departureDate || !departureForm.returnDate) {
      showToast('Vui lòng chọn ngày khởi hành và ngày về', 'error');
      return;
    }

    setSubmittingDeparture(true);
    try {
      const payload = {
        departureDate: departureForm.departureDate,
        returnDate: departureForm.returnDate,
        price: Number(departureForm.price),
        totalSeats: Number(departureForm.totalSeats),
      };

      const res = await operatorApi.addDeparture(selectedTour.id, payload);
      showToast(`Đã thêm lịch khởi hành ngày ${payload.departureDate} cho Tour "${selectedTour.title || selectedTour.name}"`, 'success');

      const newDep = res.data || {
        id: Date.now(),
        tourId: selectedTour.id,
        ...payload,
        availableSeats: payload.totalSeats,
        status: 'SCHEDULED',
      };

      // Update tours list in state
      setTours(prev => prev.map(t => {
        if (t.id === selectedTour.id) {
          const deps = t.upcomingDepartures || t.departures || [];
          return {
            ...t,
            upcomingDepartures: [...deps, newDep],
            departures: [...deps, newDep],
          };
        }
        return t;
      }));

      setShowDepartureModal(false);
    } catch (err) {
      showToast(`Lỗi thêm lịch khởi hành: ${err.message}`, 'error');
    } finally {
      setSubmittingDeparture(false);
    }
  };

  // Operator Quick Booking Cancel Action (Issue #41)
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

  // Stats calculation
  const totalTours = tours.length;
  const totalDepartures = tours.reduce((sum, t) => sum + (t.upcomingDepartures?.length || t.departures?.length || 0), 0);
  const totalSeats = tours.reduce((sum, t) => {
    const deps = t.upcomingDepartures || t.departures || [];
    return sum + deps.reduce((s, d) => s + (d.totalSeats || 0), 0);
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" />
              Tour Operator Portal • Issue #7 & #41
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Quản Trị Nhà Điều Hành Tour
            </h1>
            <p className="text-slate-300 text-sm">
              Khởi tạo tour du lịch mới, cập nhật bảng giá, phân bổ lịch khởi hành và đồng bộ tồn chỗ tự động với SAGA Orchestrator.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchTours}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Làm Mới
            </button>
            <button
              onClick={() => setShowCreateTourModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Thêm Tour Mới
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-xs text-slate-400 block font-medium">Tổng Số Tour</span>
            <span className="text-2xl font-bold text-white mt-1 block">{totalTours}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-xs text-slate-400 block font-medium">Tổng Lịch Khởi Hành</span>
            <span className="text-2xl font-bold text-indigo-300 mt-1 block">{totalDepartures}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-xs text-slate-400 block font-medium">Tổng Chỗ Phục Vụ</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">{totalSeats} chỗ</span>
          </div>
          <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-xs text-slate-400 block font-medium">Trạng Thái Hệ Thống</span>
            <span className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              SAGA Outbox Online
            </span>
          </div>
        </div>
      </div>

      {/* Operator Emergency Cancellation & Refund Tool (Issue #41) */}
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

      {/* Main Content: Tours & Departures */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Danh Sách Tour Tuyến Đang Hoạt Động
          </h2>
          <span className="text-xs text-slate-500">
            Nhà điều hành: <strong>{currentUserName}</strong> (ID: #{currentUserId})
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-slate-600 font-medium text-sm">Đang tải dữ liệu tour từ máy chủ...</p>
          </div>
        ) : tours.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Chưa có tour nào trong hệ thống</h3>
            <p className="text-slate-500 text-xs mt-1 mb-4">
              Nhấn "Thêm Tour Mới" để bắt đầu phát hành lịch trình du lịch cho khách hàng.
            </p>
            <button
              onClick={() => setShowCreateTourModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Tạo Tour Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tours.map((tour) => {
              const isExpanded = expandedTourId === tour.id;
              const departures = tour.upcomingDepartures || tour.departures || [];
              const isInactive = tour.status === 'INACTIVE';

              return (
                <div
                  key={tour.id}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:border-slate-300 ${
                    isInactive ? 'opacity-70 border-slate-200 bg-slate-50/50' : 'border-slate-200'
                  }`}
                >
                  {/* Tour Header Summary */}
                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Mã: #{tour.id}
                        </span>
                        
                        {/* Status badge with toggle button (Issue #41) */}
                        <button
                          type="button"
                          onClick={() => toggleTourStatus(tour.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 transition-colors ${
                            isInactive
                              ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title="Nhấn để bật/tắt trạng thái mở bán"
                        >
                          <Power className="w-3 h-3" />
                          {tour.status || 'PUBLISHED'} (Click đổi)
                        </button>

                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {tour.destinationName || tour.destination || 'Điểm đến nội địa'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {tour.durationDays ? `${tour.durationDays} Ngày` : (tour.duration || '3N2Đ')}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {tour.title || tour.name}
                      </h3>
                      {tour.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">
                          {tour.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Giá Cơ Bản</span>
                        <span className="text-base font-extrabold text-indigo-700">
                          {formatVND(tour.basePrice || tour.price)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDepartureModal(tour)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Thêm Lịch Đi
                        </button>

                        <button
                          onClick={() => setExpandedTourId(isExpanded ? null : tour.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Departures Table */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/60 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-600" />
                          Các Lịch Khởi Hành Sắp Tới ({departures.length})
                        </h4>
                        <button
                          onClick={() => openDepartureModal(tour)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          + Thêm đợt khởi hành mới
                        </button>
                      </div>

                      {departures.length === 0 ? (
                        <div className="text-center py-6 text-xs text-slate-400 bg-white rounded-xl border border-slate-200/60">
                          Tour này chưa có lịch khởi hành. Hãy nhấn "Thêm Lịch Đi" để tạo suất mở bán.
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                          <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead className="bg-slate-50 font-semibold text-slate-600">
                              <tr>
                                <th className="px-4 py-2.5 text-left">Mã Lịch</th>
                                <th className="px-4 py-2.5 text-left">Ngày Đi &rarr; Ngày Về</th>
                                <th className="px-4 py-2.5 text-left">Giá Vé Khách</th>
                                <th className="px-4 py-2.5 text-left">Sức Chứa / Tồn Chỗ</th>
                                <th className="px-4 py-2.5 text-left">Trạng Thái</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                              {departures.map((dep, idx) => {
                                const avail = dep.availableSeats !== undefined ? dep.availableSeats : (dep.totalSeats || 30);
                                const total = dep.totalSeats || 30;
                                const percent = total > 0 ? Math.round((avail / total) * 100) : 0;

                                return (
                                  <tr key={dep.id || idx} className="hover:bg-slate-50/70">
                                    <td className="px-4 py-3 font-mono font-bold text-indigo-600">
                                      #{dep.id || idx + 1}
                                    </td>
                                    <td className="px-4 py-3 font-medium">
                                      {dep.departureDate} &rarr; {dep.returnDate || 'Theo lịch'}
                                    </td>
                                    <td className="px-4 py-3 font-bold text-slate-900">
                                      {formatVND(dep.price || tour.basePrice)}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="space-y-1 max-w-[140px]">
                                        <div className="flex justify-between text-[11px] font-semibold">
                                          <span>{avail} còn trống</span>
                                          <span className="text-slate-400">/ {total} chỗ</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                          <div
                                            className={`h-full rounded-full ${
                                              percent > 40 ? 'bg-emerald-500' : percent > 15 ? 'bg-amber-500' : 'bg-rose-500'
                                            }`}
                                            style={{ width: `${percent}%` }}
                                          />
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                        {dep.status || 'SCHEDULED'}
                                      </span>
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
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Thêm Tour Mới */}
      {showCreateTourModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Tạo Tuyến Tour Du Lịch Mới</h3>
                  <p className="text-xs text-slate-300">Nhà điều hành: {currentUserName}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateTourModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTour} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên chuyến đi (Tour Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={tourForm.title}
                  onChange={(e) => setTourForm({ ...tourForm, title: e.target.value })}
                  placeholder="Ví dụ: Tour Khám phá Vịnh Hạ Long - Đảo Ti Tốp 2N1Đ"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Điểm đến (Destination) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={tourForm.destinationId}
                    onChange={(e) => setTourForm({ ...tourForm, destinationId: Number(e.target.value) })}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {PRESET_DESTINATIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Số ngày đi (Days) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={tourForm.durationDays}
                    onChange={(e) => setTourForm({ ...tourForm, durationDays: Number(e.target.value) })}
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Giá cơ bản niêm yết (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="100000"
                  step="50000"
                  required
                  value={tourForm.basePrice}
                  onChange={(e) => setTourForm({ ...tourForm, basePrice: Number(e.target.value) })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Định dạng hiển thị: {formatVND(tourForm.basePrice)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mô tả hành trình du lịch
                </label>
                <textarea
                  rows="3"
                  value={tourForm.description}
                  onChange={(e) => setTourForm({ ...tourForm, description: e.target.value })}
                  placeholder="Giới thiệu điểm nhấn, phương tiện di chuyển, dịch vụ bao gồm trong tour..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTourModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingTour}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-indigo-100"
                >
                  {submittingTour ? 'Đang tạo...' : 'Lưu & Phát Hành Tour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Thêm Lịch Khởi Hành */}
      {showDepartureModal && selectedTour && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-indigo-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Thêm Lịch Khởi Hành</h3>
                  <p className="text-xs text-indigo-200 truncate max-w-[240px]">
                    {selectedTour.title || selectedTour.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDepartureModal(false)}
                className="text-white/70 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDeparture} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ngày khởi hành <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={departureForm.departureDate}
                    onChange={(e) => setDepartureForm({ ...departureForm, departureDate: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ngày kết thúc <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={departureForm.returnDate}
                    onChange={(e) => setDepartureForm({ ...departureForm, returnDate: e.target.value })}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Giá vé đợt này (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="100000"
                  step="50000"
                  required
                  value={departureForm.price}
                  onChange={(e) => setDepartureForm({ ...departureForm, price: Number(e.target.value) })}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Định dạng: {formatVND(departureForm.price)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tổng số ghế mở bán (Seats) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={departureForm.totalSeats}
                  onChange={(e) => setDepartureForm({ ...departureForm, totalSeats: Number(e.target.value) })}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDepartureModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingDeparture}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md shadow-indigo-100"
                >
                  {submittingDeparture ? 'Đang lưu...' : 'Thêm Khởi Hành'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
