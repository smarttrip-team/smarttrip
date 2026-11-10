import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { hotelApi, hotelManagerApi, walletApi } from '../../services/api';
import { useAuthWallet } from '../../context/AuthWalletContext';
import {
  Building2,
  Wallet,
  ArrowUpRight,
  ChevronRight,
  Calendar,
  BedDouble,
  DollarSign,
  MapPin,
  RefreshCw,
  PlusCircle,
  Save,
  CheckCircle2,
  CalendarRange,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function HotelManagerPage() {
  const { showToast, wallet, currentUserId } = useAuthWallet();

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
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Selected for inventory batch update
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState(null);

  // Inventory Batch Form State
  const [inventoryForm, setInventoryForm] = useState({
    startDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    availableRooms: 15,
    priceOverride: 1200000,
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchHotels = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await hotelApi.getHotels();
      const list = res.data || [];
      setHotels(list);
      if (list.length > 0 && !selectedHotel) {
        setSelectedHotel(list[0]);
        if (list[0].roomTypes && list[0].roomTypes.length > 0) {
          setSelectedRoomType(list[0].roomTypes[0]);
        }
      }
    } catch (err) {
      showToast(err.message || 'Không thể tải danh sách khách sạn', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedHotel, showToast]);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    if (!selectedRoomType) {
      showToast('Vui lòng chọn loại phòng cần cập nhật!', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await hotelManagerApi.updateInventory(selectedRoomType.id, {
        roomTypeId: selectedRoomType.id,
        startDate: inventoryForm.startDate,
        endDate: inventoryForm.endDate,
        totalRooms: Number(inventoryForm.availableRooms),
        availableRooms: Number(inventoryForm.availableRooms),
        priceOverride: Number(inventoryForm.priceOverride),
      });

      showToast(
        `Cập nhật kho phòng cho loại "${selectedRoomType.name}" từ ${inventoryForm.startDate} đến ${inventoryForm.endDate} thành công!`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Không thể cập nhật số lượng phòng', 'error');
    } finally {
      setSubmitting(false);
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
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs tracking-wider uppercase">
                <Building2 className="w-4 h-4" />
                <span>Hotel Manager Portal</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                Quản lý Khách sạn & Cập nhật Số lượng phòng theo ngày
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Thiết lập số lượng phòng trống (Available Rooms) và bảng giá linh hoạt theo từng dải ngày lưu trú
              </p>
            </div>

            <button
              onClick={fetchHotels}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hotel Manager Wallet & Revenue Overview */}
        <div className="bg-gradient-to-r from-emerald-800 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-emerald-500/20 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Đối tác Khách Sạn
                </span>
                <span className="text-xs text-slate-300">| Khấu trừ 10% hoa hồng nền tảng SmartTrip</span>
              </div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-white mt-1">
                <Wallet className="w-6 h-6 text-emerald-400" />
                Ví Doanh Thu Khách Sạn: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(wallet?.balance || 0)}
              </h2>
              <p className="text-xs text-emerald-200">
                Doanh thu tiền phòng thực nhận 90% được hệ thống tự động quyết toán vào ví ngay khi khách đặt phòng
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={toggleSettlementLedger}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-900/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-400/30 font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                <span>{showSettlementLedger ? 'Ẩn Bảng Sao Kê' : 'Xem Sao Kê Tại Đây'}</span>
                <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${showSettlementLedger ? 'rotate-90' : ''}`} />
              </button>

              <Link
                to="/wallet"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
              >
                <span>Mở Trang Ví & Rút Tiền</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Inline Expandable Settlement Table */}
          {showSettlementLedger && (
            <div className="mt-5 pt-4 border-t border-emerald-500/20 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Lịch sử quyết toán tiền phòng lưu trú 90% (Khấu trừ 10% hoa hồng sàn)
                </span>
                <button
                  type="button"
                  onClick={fetchSettlementTransactions}
                  disabled={loadingSettlement}
                  className="text-xs text-emerald-300 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingSettlement ? 'animate-spin' : ''}`} />
                  Làm mới
                </button>
              </div>

              {loadingSettlement ? (
                <div className="py-6 text-center text-xs text-emerald-300/80 flex justify-center items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  Đang tải sao kê quyết toán khách sạn...
                </div>
              ) : settlementTransactions.length === 0 ? (
                <div className="py-6 text-center text-xs text-emerald-300/70 bg-black/20 rounded-xl">
                  Chưa có giao dịch quyết toán phòng nào. Tiền sẽ tự động đổ về ngay khi có khách đặt phòng kèm tour!
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-emerald-500/20 bg-slate-950/60">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 text-[11px] text-emerald-200 uppercase tracking-wider border-b border-emerald-500/20">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Mã GD</th>
                        <th className="px-4 py-2.5 font-semibold">Loại bút toán</th>
                        <th className="px-4 py-2.5 font-semibold">Số tiền</th>
                        <th className="px-4 py-2.5 font-semibold">Mã đơn (Booking)</th>
                        <th className="px-4 py-2.5 font-semibold">Thời gian</th>
                        <th className="px-4 py-2.5 font-semibold">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-500/10">
                      {settlementTransactions.map((tx) => {
                        const isReversal = tx.transactionType === 'SETTLEMENT_REVERSAL';
                        return (
                          <tr key={tx.id || Math.random()} className="hover:bg-emerald-500/5 transition-colors">
                            <td className="px-4 py-2.5 font-mono text-[11px] text-emerald-400">#{tx.id}</td>
                            <td className="px-4 py-2.5">
                              {isReversal ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  Thu hồi (REVERSAL)
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Nhận 90% Tiền Phòng
                                </span>
                              )}
                            </td>
                            <td className={`px-4 py-2.5 font-bold ${isReversal ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {isReversal ? '-' : '+'}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount || 0)}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-white">
                              {tx.referenceId ? (
                                <span className="bg-emerald-950 px-2 py-0.5 rounded border border-emerald-600/40">
                                  {tx.referenceId}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-2.5 text-slate-400 text-[11px]">
                              {tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                            </td>
                            <td className="px-4 py-2.5 text-slate-400 text-[11px]">
                              {isReversal ? 'Khấu trừ 90% do khách hủy phòng hợp lệ' : 'Tự động giải ngân 90% tiền phòng'}
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Hotels & Room Types (6 columns) */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              Danh sách Khách sạn & Loại phòng
            </h2>

            {loading && (
              <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
                <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-emerald-500" />
                Đang tải dữ liệu khách sạn từ hotel-service...
              </div>
            )}

            {!loading && hotels.length === 0 && (
              <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 text-xs">
                Chưa có dữ liệu khách sạn.
              </div>
            )}

            {!loading &&
              hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className={`bg-white rounded-xl border transition-all overflow-hidden ${
                    selectedHotel?.id === hotel.id
                      ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                      : 'border-slate-200 shadow-xs'
                  }`}
                >
                  <div
                    onClick={() => {
                      setSelectedHotel(hotel);
                      if (hotel.roomTypes && hotel.roomTypes.length > 0) {
                        setSelectedRoomType(hotel.roomTypes[0]);
                      }
                    }}
                    className="p-4 cursor-pointer hover:bg-slate-50/50 flex items-start justify-between border-b border-slate-100"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-600">#{hotel.id}</span>
                        <h3 className="font-bold text-slate-900 text-sm">{hotel.name}</h3>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {hotel.address || hotel.city || 'Đà Nẵng'}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {hotel.starRating || 4} Sao
                    </span>
                  </div>

                  {/* Room Types inside Hotel */}
                  <div className="p-4 bg-slate-50/50 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Các loại phòng:
                    </div>
                    {hotel.roomTypes && hotel.roomTypes.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {hotel.roomTypes.map((rt) => {
                          const isRtSelected = selectedRoomType?.id === rt.id;
                          return (
                            <div
                              key={rt.id}
                              onClick={() => {
                                setSelectedHotel(hotel);
                                setSelectedRoomType(rt);
                                setInventoryForm((prev) => ({
                                  ...prev,
                                  priceOverride: rt.basePrice || 1200000,
                                }));
                              }}
                              className={`p-3 rounded-lg border cursor-pointer text-xs transition-all ${
                                isRtSelected
                                  ? 'bg-emerald-50 border-emerald-400 font-semibold'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{rt.name}</span>
                                <BedDouble className="w-4 h-4 text-emerald-600" />
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1">
                                Sức chứa: {rt.maxOccupancy || 2} khách
                              </div>
                              <div className="text-[11px] font-semibold text-slate-800 mt-0.5">
                                Giá gốc: {formatCurrency(rt.basePrice)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic">Chưa có loại phòng</div>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Right Panel: Daily Inventory Batch Update Form (6 columns) */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CalendarRange className="w-4 h-4 text-emerald-600" />
              Cập nhật Số lượng phòng theo ngày (Batch Inventory)
            </h2>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <div className="text-xs font-semibold text-emerald-900">
                  Đang chọn:{' '}
                  <span className="font-bold text-emerald-800">
                    {selectedHotel ? selectedHotel.name : 'Chưa chọn'}
                  </span>
                </div>
                <div className="text-xs text-emerald-700 mt-0.5">
                  Loại phòng:{' '}
                  <span className="font-bold">
                    {selectedRoomType ? `${selectedRoomType.name} (ID: ${selectedRoomType.id})` : 'Chưa chọn'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleUpdateInventory} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Từ ngày (Start Date)</label>
                    <input
                      type="date"
                      required
                      value={inventoryForm.startDate}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, startDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Đến ngày (End Date)</label>
                    <input
                      type="date"
                      required
                      value={inventoryForm.endDate}
                      onChange={(e) => setInventoryForm({ ...inventoryForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số lượng phòng mở bán / ngày (Available Rooms)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={inventoryForm.availableRooms}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, availableRooms: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Hệ thống sẽ cập nhật số phòng trống này cho từng ngày trong dải ngày đã chọn.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Giá phòng áp dụng / đêm (VND)
                  </label>
                  <input
                    type="number"
                    step="50000"
                    required
                    value={inventoryForm.priceOverride}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, priceOverride: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !selectedRoomType}
                    className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{submitting ? 'Đang cập nhật kho phòng...' : 'Lưu cập nhật số lượng phòng'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
