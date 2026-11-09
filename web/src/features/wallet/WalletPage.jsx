import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, CheckCircle2, AlertCircle, Clock, Shield, Sparkles, CreditCard } from 'lucide-react';
import { useAuthWallet } from '../../context/AuthWalletContext';
import { walletApi } from '../../services/api';

export const WalletPage = () => {
  const { currentUserId, currentUserName, wallet, loadingWallet, refreshWallet, showToast } = useAuthWallet();
  const [topUpAmount, setTopUpAmount] = useState('5000000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [customKey, setCustomKey] = useState('');

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
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">{type}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <Wallet className="w-8 h-8 text-indigo-600" />
            Ví điện tử mô phỏng (Mock Wallet)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý số dư, nạp tiền kiểm thử và tra cứu lịch sử ghi sổ bất biến (Immutable Ledger) cho {currentUserName}
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
          <RefreshCw className={`w-4 h-4 ${(loadingWallet || loadingTx) ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
          Làm mới
        </button>
      </div>

      {/* Balance Cards & Top-up Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Visual Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase font-semibold tracking-wider text-indigo-200 flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> SmartTrip Mock Wallet
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                {wallet.status}
              </span>
            </div>

            <div>
              <p className="text-xs text-indigo-200">Số dư khả dụng</p>
              <h2 className="text-3xl font-extrabold tracking-tight mt-0.5">
                {formatVND(wallet.balance)}
              </h2>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between text-xs text-indigo-200">
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

          <div className="pt-6 flex justify-between items-end text-xs text-indigo-200">
            <div>
              <p className="text-[10px] uppercase text-indigo-300">Chủ ví</p>
              <p className="font-medium text-white">{currentUserName}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-indigo-300">User ID</p>
              <p className="font-mono font-medium text-white">#{currentUserId}</p>
            </div>
          </div>
        </div>

        {/* Top-up Form Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Nạp tiền giả lập vào ví (Mock Top-Up)
            </h3>
            <span className="text-xs text-slate-400">Không trừ tiền thật - Hỗ trợ idempotency</span>
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
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold ring-2 ring-indigo-500/20'
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
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">VND</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Idempotency Key (Tùy chọn test trùng lặp):
                </label>
                <input
                  type="text"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="Để trống để tự tạo UUID ngẫu nhiên"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-100 disabled:opacity-50 transition-all"
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
      </div>

      {/* Transaction Ledger Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Lịch sử ghi sổ giao dịch (Immutable Ledger)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mọi biến động số dư (nạp, tạm giữ, quyết toán, hoàn tiền) được ghi nhận chi tiết, không thể sửa đổi
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {transactions.length} bản ghi
          </span>
        </div>

        {loadingTx ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-sm">Đang tải lịch sử giao dịch...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Chưa có giao dịch nào được ghi nhận cho tài khoản này.</p>
            <p className="text-xs text-slate-400 mt-1">Hãy nạp tiền thử nghiệm ở phía trên!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-semibold">Mã GD</th>
                  <th className="px-6 py-3 font-semibold">Loại giao dịch</th>
                  <th className="px-6 py-3 font-semibold">Số tiền</th>
                  <th className="px-6 py-3 font-semibold">Số dư sau GD</th>
                  <th className="px-6 py-3 font-semibold">Đơn hàng (Booking)</th>
                  <th className="px-6 py-3 font-semibold">Thời gian</th>
                  <th className="px-6 py-3 font-semibold">Mô tả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const isPositive = tx.transactionType === 'TOP_UP' || tx.transactionType === 'REFUND';
                  return (
                    <tr key={tx.id || Math.random()} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-xs text-slate-500">
                        #{tx.id}
                      </td>
                      <td className="px-6 py-3.5">
                        {getTxBadge(tx.transactionType)}
                      </td>
                      <td className={`px-6 py-3.5 font-semibold ${isPositive ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {isPositive ? '+' : '-'}{formatVND(tx.amount)}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-700">
                        {formatVND(tx.balanceAfter)}
                      </td>
                      <td className="px-6 py-3.5">
                        {tx.bookingId ? (
                          <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {tx.bookingId}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-500">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : 'Vừa xong'}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-500 max-w-xs truncate">
                        {tx.description || tx.idempotencyKey || '—'}
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
