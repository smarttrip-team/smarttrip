import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Sparkles,
  CreditCard,
  Building2,
  Percent,
  Landmark,
  Send,
  HelpCircle,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuthWallet } from '../../context/AuthWalletContext';
import { walletApi } from '../../services/api';

export const WalletPage = () => {
  const { currentUserId, currentUserName, currentUserEmail, currentRole, wallet, loadingWallet, refreshWallet, showToast } = useAuthWallet();

  // Roles check
  const isOperator = currentRole === 'ROLE_TOUR_OPERATOR';
  const isHotelier = currentRole === 'ROLE_HOTEL_MANAGER';
  const isPartner = isOperator || isHotelier;
  const isAdmin = currentRole === 'ROLE_ADMIN';
  const isCustomer = !isPartner && !isAdmin;

  // Top-Up Form State (for Customer)
  const [topUpAmount, setTopUpAmount] = useState('5000000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customKey, setCustomKey] = useState('');

  // Payout Form State (for Partner)
  const [payoutAmount, setPayoutAmount] = useState('5000000');
  const [payoutBank, setPayoutBank] = useState('Vietcombank');
  const [payoutAccount, setPayoutAccount] = useState('1029384756');
  const [payoutBeneficiary, setPayoutBeneficiary] = useState(currentUserName || 'Nguyễn Hồng Thái');
  const [isPayoutSubmitting, setIsPayoutSubmitting] = useState(false);

  // Transactions
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const presetAmounts = [
    { label: '1.000.000 đ', value: '1000000' },
    { label: '2.000.000 đ', value: '2000000' },
    { label: '5.000.000 đ', value: '5000000' },
    { label: '10.000.000 đ', value: '10000000' },
    { label: '20.000.000 đ', value: '20000000' },
  ];

  const fetchTransactions = async () => {
    setLoadingTx(true);
    try {
      const res = await walletApi.getTransactions(currentUserId);
      if (res?.data) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.warn('Could not load transactions:', err.message);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    refreshWallet(currentUserId);
    fetchTransactions();
  }, [currentUserId]);

  // Handle Customer Top-Up
  const handleTopUp = async (e) => {
    e.preventDefault();
    const amount = Number(topUpAmount);
    if (!amount || amount <= 0) {
      showToast('Vui lòng nhập số tiền hợp lệ (> 0)', 'error');
      return;
    }

    const idempotencyKey = customKey.trim() || `topup-${currentUserId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setIsSubmitting(true);
    try {
      await walletApi.topUp({
        userId: currentUserId,
        amount: amount,
        idempotencyKey: idempotencyKey,
      });
      showToast(`Nạp thành công ${formatVND(amount)} vào ví!`, 'success');
      setCustomKey('');
      await refreshWallet(currentUserId);
      await fetchTransactions();
    } catch (err) {
      showToast(`Nạp tiền thất bại: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Partner Payout / Withdraw Simulation
  const handlePayout = (e) => {
    e.preventDefault();
    const amount = Number(payoutAmount);
    if (!amount || amount <= 0) {
      showToast('Vui lòng nhập số tiền rút hợp lệ (> 0)', 'error');
      return;
    }
    if (amount > (wallet.balance || 0)) {
      showToast(`Số dư khả dụng (${formatVND(wallet.balance)}) không đủ để rút ${formatVND(amount)}!`, 'error');
      return;
    }

    setIsPayoutSubmitting(true);
    setTimeout(() => {
      setIsPayoutSubmitting(false);
      showToast(
        `Đã lập lệnh rút ${formatVND(amount)} về tài khoản ${payoutAccount} (${payoutBank}) thành công! Tiền sẽ được ngân hàng xử lý.`,
        'success'
      );
    }, 900);
  };

  const getTxBadge = (type) => {
    switch (type) {
      case 'TOP_UP':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><ArrowDownLeft className="w-3 h-3" /> Nạp tiền (TOP_UP)</span>;
      case 'HOLD':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><Clock className="w-3 h-3" /> Tạm giữ (HOLD)</span>;
      case 'CAPTURE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800"><ArrowUpRight className="w-3 h-3" /> Trừ tiền (CAPTURE)</span>;
      case 'REFUND':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800"><CheckCircle2 className="w-3 h-3" /> Hoàn tiền (REFUND)</span>;
      case 'RELEASE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800"><RefreshCw className="w-3 h-3" /> Hủy giữ (RELEASE)</span>;
      case 'SETTLEMENT_TOUR':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800"><ArrowDownLeft className="w-3 h-3" /> Nhận tiền Tour 90% (SETTLEMENT)</span>;
      case 'SETTLEMENT_HOTEL':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><ArrowDownLeft className="w-3 h-3" /> Nhận tiền KS 90% (SETTLEMENT)</span>;
      case 'COMMISSION_REVENUE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800"><ArrowDownLeft className="w-3 h-3" /> Hoa hồng sàn 10% (COMMISSION)</span>;
      case 'SETTLEMENT_REVERSAL':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800"><ArrowUpRight className="w-3 h-3" /> Thu hồi quyết toán (REVERSAL)</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{type}</span>;
    }
  };

  // Dynamic visual styling based on user role
  const getHeaderInfo = () => {
    if (isOperator) {
      return {
        title: 'Ví Doanh Thu & Sao Kê Quyết Toán Tour',
        subtitle: `Theo dõi dòng tiền tự động giải ngân 90% từ các đơn đặt tour, khấu trừ 10% hoa hồng sàn SmartTrip cho ${currentUserName}`,
        badge: 'Tour Operator Settlement',
        cardGradient: 'from-teal-800 via-teal-900 to-slate-900 border-teal-500/30',
        cardTitle: 'VÍ DOANH THU ĐỐI TÁC TOUR',
        badgeColor: 'bg-teal-400/20 text-teal-300 border-teal-400/30',
      };
    }
    if (isHotelier) {
      return {
        title: 'Ví Doanh Thu & Sao Kê Quyết Toán Khách Sạn',
        subtitle: `Theo dõi dòng tiền tự động giải ngân 90% từ dịch vụ lưu trú, khấu trừ 10% hoa hồng sàn SmartTrip cho ${currentUserName}`,
        badge: 'Hotel Manager Settlement',
        cardGradient: 'from-emerald-800 via-emerald-900 to-slate-900 border-emerald-500/30',
        cardTitle: 'VÍ DOANH THU ĐỐI TÁC KHÁCH SẠN',
        badgeColor: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
      };
    }
    if (isAdmin) {
      return {
        title: 'Quỹ Doanh Thu & Hoa Hồng Nền Tảng',
        subtitle: `Quản lý 10% phí hoa hồng sàn SmartTrip thu về từ các giao dịch tour và phòng trên toàn hệ thống`,
        badge: 'SmartTrip Platform Treasury',
        cardGradient: 'from-indigo-800 via-purple-900 to-slate-900 border-purple-500/30',
        cardTitle: 'QUỸ HOA HỒNG NỀN TẢNG (10%)',
        badgeColor: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
      };
    }
    return {
      title: 'Ví điện tử SmartTrip Pay',
      subtitle: `Quản lý số dư, nạp tiền kiểm thử và thanh toán đặt tour & khách sạn cho ${currentUserName}`,
      badge: 'SmartTrip Customer Wallet',
      cardGradient: 'from-indigo-700 via-indigo-600 to-indigo-900 border-indigo-400/20',
      cardTitle: 'VÍ TIỀN KHÁCH HÀNG',
      badgeColor: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${headerInfo.badgeColor}`}>
              {headerInfo.badge}
            </span>
            <span className="text-xs text-slate-500 font-mono">User ID: #{currentUserId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <Wallet className="w-8 h-8 text-sky-600" />
            {headerInfo.title}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {headerInfo.subtitle}
          </p>
        </div>
        <button
          onClick={() => {
            refreshWallet(currentUserId);
            fetchTransactions();
            showToast('Đã làm mới dữ liệu ví', 'info');
          }}
          disabled={loadingWallet || loadingTx}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium shadow-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${(loadingWallet || loadingTx) ? 'animate-spin text-sky-600' : 'text-slate-400'}`} />
          Làm mới
        </button>
      </div>

      {/* Balance Cards & Operations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Visual Card */}
        <div className={`lg:col-span-1 bg-gradient-to-br ${headerInfo.cardGradient} rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden border`}>
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-semibold tracking-wider text-slate-200 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> {headerInfo.cardTitle}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                {wallet.status}
              </span>
            </div>

            <div>
              <p className="text-xs text-slate-300">
                {isPartner ? 'Doanh thu thực nhận khả dụng (90%)' : isAdmin ? 'Tổng quỹ hoa hồng sàn tích lũy (10%)' : 'Số dư khả dụng'}
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight mt-0.5">
                {formatVND(wallet.balance)}
              </h2>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-slate-300">
              <div>
                <span>Đang tạm giữ (Hold):</span>
                <span className="font-semibold text-amber-300 block text-sm">
                  {formatVND(wallet.heldAmount)}
                </span>
              </div>
              <div className="text-right">
                <span>Tổng tài sản:</span>
                <span className="font-semibold text-white block text-sm">
                  {formatVND(wallet.balance + wallet.heldAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-between items-end text-xs text-slate-300">
            <div>
              <p className="text-[10px] uppercase text-slate-400">Chủ tài khoản</p>
              <p className="font-medium text-white">{currentUserName}</p>
              <p className="text-[11px] text-slate-400 font-mono">{currentUserEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-slate-400">Database ID</p>
              <p className="font-mono font-medium text-white">#{currentUserId}</p>
            </div>
          </div>
        </div>

        {/* Action Panel: Customer Top-Up VS Partner Settlement & Payout */}
        {isCustomer ? (
          /* Customer: Top-Up Form */
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-600" />
                Nạp tiền vào ví SmartTrip Pay (Top-Up)
              </h3>
              <span className="text-xs text-slate-400">Hỗ trợ Idempotency Key chống nạp trùng</span>
            </div>

            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Chọn số tiền nhanh:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {presetAmounts.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setTopUpAmount(p.value)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                        topUpAmount === p.value
                          ? 'border-sky-600 bg-sky-50 text-sky-700 font-semibold ring-2 ring-sky-500/20'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Số tiền nạp (VND):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="10000"
                      step="10000"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      placeholder="Nhập số tiền..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">VND</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Idempotency Key (Tùy chọn kiểm thử):
                  </label>
                  <input
                    type="text"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="Để trống để tự tạo UUID ngẫu nhiên"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Dự kiến số dư sau nạp: <strong className="text-emerald-600">{formatVND(wallet.balance + Number(topUpAmount || 0))}</strong>
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 shadow-md shadow-sky-100 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Nạp tiền ngay
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : isPartner ? (
          /* Partner (Operator / Hotelier): Revenue Share & Payout Request */
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-teal-600" />
                Chính Sách Quyết Toán & Rút Doanh Thu Đối Tác (Payout)
              </h3>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Tỷ lệ chia sẻ: Đối tác 90% | Sàn 10%
              </span>
            </div>

            {/* Policy 3-card highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-teal-50/60 rounded-xl p-3 border border-teal-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 mb-1">
                  <Percent className="w-4 h-4 text-teal-600" />
                  <span>90% Doanh Thu</span>
                </div>
                <p className="text-[11px] text-teal-700 leading-snug">
                  Tự động chuyển vào ví đối tác ngay khi khách hàng xác nhận thanh toán tour.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  <span>10% Hoa Hồng Sàn</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Khấu trừ tự động phục vụ duy trì hạ tầng Saga phân tán, quảng bá và hỗ trợ 24/7.
                </p>
              </div>

              <div className="bg-rose-50/60 rounded-xl p-3 border border-rose-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 mb-1">
                  <RefreshCw className="w-4 h-4 text-rose-600" />
                  <span>Bù Trừ Hoàn Tiền</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-snug">
                  Nếu khách hủy tour hợp lệ, hệ thống hoàn tiền và thu hồi đúng 90% đã quyết toán.
                </p>
              </div>
            </div>

            {/* Payout / Withdrawal Form */}
            <form onSubmit={handlePayout} className="space-y-4 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-teal-600" />
                Yêu cầu rút doanh thu về tài khoản ngân hàng (Payout)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Số tiền rút (VND):
                  </label>
                  <input
                    type="number"
                    min="500000"
                    step="500000"
                    max={wallet.balance || 0}
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Ngân hàng thụ hưởng:
                  </label>
                  <select
                    value={payoutBank}
                    onChange={(e) => setPayoutBank(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Vietcombank">Vietcombank (VCB)</option>
                    <option value="Techcombank">Techcombank (TCB)</option>
                    <option value="MB Bank">Ngân hàng Quân đội (MB)</option>
                    <option value="BIDV">BIDV</option>
                    <option value="VPBank">VPBank</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Số tài khoản nhận:
                  </label>
                  <input
                    type="text"
                    value={payoutAccount}
                    onChange={(e) => setPayoutAccount(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setPayoutAmount(String(Math.floor(wallet.balance || 0)))}
                  className="text-xs text-teal-600 hover:text-teal-700 font-semibold underline"
                >
                  Rút toàn bộ số dư ({formatVND(wallet.balance)})
                </button>

                <button
                  type="submit"
                  disabled={isPayoutSubmitting || (wallet.balance || 0) <= 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 text-white font-semibold text-sm hover:bg-teal-700 shadow-md shadow-teal-100 disabled:opacity-50 transition-all"
                >
                  {isPayoutSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Đang chuyển lệnh...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Xác nhận rút tiền
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Admin Platform View */
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Percent className="w-5 h-5 text-purple-600" />
                Cơ Chế Thu Phí Nền Tảng SmartTrip Platform (10% Commission)
              </h3>
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                Saga Multi-Party Settlement
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-purple-50/60 rounded-xl p-4 border border-purple-100 space-y-2">
                <span className="text-xs font-bold text-purple-900 uppercase">10% Hoa Hồng Tour & Phòng</span>
                <p className="text-xs text-purple-800 leading-relaxed">
                  Khi Saga Orchestrator bước vào giai đoạn <code>CAPTURE_PAYMENT</code>, hệ thống tự động bóc tách doanh thu và kết chuyển 10% trực tiếp vào ví Admin quỹ sàn.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase">Quyết Toán Tức Thì (Instant Payout)</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  90% tiền tour được chuyển ngay cho Tour Operator, và 90% tiền phòng được chuyển ngay cho Quản lý khách sạn mà không cần đối soát thủ công cuối tháng.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Ledger Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {isPartner ? 'Lịch sử ghi sổ quyết toán & đối soát đơn hàng (Immutable Ledger)' : 'Lịch sử ghi sổ giao dịch (Immutable Ledger)'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPartner
                ? 'Mọi khoản giải ngân 90%, khấu trừ 10% hoa hồng và thu hồi bù trừ đều được kiểm toán bất biến theo mã đơn hàng'
                : 'Mọi biến động số dư (nạp, tạm giữ, quyết toán, hoàn tiền) được ghi nhận chi tiết, không thể sửa đổi'}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {transactions.length} bản ghi
          </span>
        </div>

        {loadingTx ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
            <p className="text-sm">Đang tải lịch sử giao dịch...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Chưa có giao dịch nào được ghi nhận cho tài khoản này.</p>
            <p className="text-xs text-slate-400 mt-1">
              {isPartner ? 'Khi có khách hàng đặt tour hoặc phòng, tiền quyết toán sẽ tự động đổ về đây!' : 'Hãy nạp tiền thử nghiệm ở phía trên!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-semibold">Mã GD</th>
                  <th className="px-6 py-3 font-semibold">Loại giao dịch</th>
                  <th className="px-6 py-3 font-semibold">Số tiền</th>
                  <th className="px-6 py-3 font-semibold">Đơn hàng (Booking)</th>
                  <th className="px-6 py-3 font-semibold">Thời gian</th>
                  <th className="px-6 py-3 font-semibold">Ghi chú đối soát</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const isPositive = ['TOP_UP', 'REFUND', 'SETTLEMENT_TOUR', 'SETTLEMENT_HOTEL', 'COMMISSION_REVENUE'].includes(tx.transactionType);
                  const isReversal = tx.transactionType === 'SETTLEMENT_REVERSAL';
                  return (
                    <tr key={tx.id || Math.random()} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-xs text-slate-500">
                        #{tx.id}
                      </td>
                      <td className="px-6 py-3.5">
                        {getTxBadge(tx.transactionType)}
                      </td>
                      <td className={`px-6 py-3.5 font-semibold ${isReversal ? 'text-rose-600' : isPositive ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {isPositive ? '+' : '-'}{formatVND(tx.amount)}
                      </td>
                      <td className="px-6 py-3.5">
                        {tx.referenceId ? (
                          <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200 font-semibold">
                            {tx.referenceId}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-500">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-500 max-w-xs truncate">
                        {tx.description || (isReversal ? 'Thu hồi 90% doanh thu do khách hủy đơn' : isPositive ? 'Thanh toán thành công từ hệ thống' : '—')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
