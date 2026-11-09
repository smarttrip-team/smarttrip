import React, { useState, useEffect, useRef, useCallback } from 'react';
import { adminApi } from '../../services/api';
import { useAuthWallet } from '../../context/AuthWalletContext';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Clock,
  ShieldAlert,
  ChevronRight,
  Eye,
  RotateCcw,
  Layers,
  Sparkles,
  Info,
  Check,
  Copy,
} from 'lucide-react';

const STANDARD_STEPS = [
  { key: 'RESERVE_TOUR', label: '1. Reserve Tour', service: 'tour-service', desc: 'Khóa chỗ trống tour' },
  { key: 'RESERVE_HOTEL', label: '2. Reserve Hotel', service: 'hotel-service', desc: 'Giữ phòng khách sạn' },
  { key: 'AUTHORIZE_PAYMENT', label: '3. Authorize Payment', service: 'payment-service', desc: 'Tạm giữ số dư ví' },
  { key: 'CONFIRM_RESOURCES', label: '4. Confirm Resources', service: 'tour/hotel', desc: 'Xác nhận giữ chỗ chính thức' },
  { key: 'CAPTURE_PAYMENT', label: '5. Capture Payment', service: 'payment-service', desc: 'Trừ tiền ví hoàn tất' },
];

export default function SagaVisualizerPage() {
  const { showToast } = useAuthWallet();
  const [sagas, setSagas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSaga, setSelectedSaga] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [viewJson, setViewJson] = useState(false);

  const fetchSagas = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await adminApi.getAllSagas();
      const list = res.data || [];
      setSagas(list);
      // Auto select first saga if none selected or keep current selection updated
      setSelectedSaga((prev) => {
        if (!prev && list.length > 0) return list[0];
        if (prev) {
          const updated = list.find((s) => s.sagaId === prev.sagaId);
          return updated || prev;
        }
        return null;
      });
    } catch (err) {
      if (!isSilent) showToast(err.message || 'Không thể tải danh sách Saga', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSagas();
  }, [fetchSagas]);

  // Polling every 2.5 seconds when autoRefresh is enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchSagas(true);
    }, 2500);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchSagas]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('Đã sao chép mã Saga', 'info');
  };

  // Calculate statistics
  const totalCount = sagas.length;
  const completedCount = sagas.filter((s) => s.status === 'COMPLETED').length;
  const failedCount = sagas.filter((s) => s.status === 'FAILED' || s.status === 'COMPENSATED').length;
  const inProgressCount = sagas.filter((s) => s.status === 'STARTED' || s.status === 'PROCESSING' || s.status === 'COMPENSATING').length;
  const successRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  // Filtered list with multi-status matching (e.g. FAILED matches both FAILED and COMPENSATED)
  const filteredSagas = sagas.filter((s) => {
    let matchStatus = true;
    if (filterStatus === 'COMPLETED') {
      matchStatus = s.status === 'COMPLETED';
    } else if (filterStatus === 'PROCESSING' || filterStatus === 'STARTED') {
      matchStatus = s.status === 'PROCESSING' || s.status === 'STARTED' || s.status === 'COMPENSATING';
    } else if (filterStatus === 'FAILED' || filterStatus === 'COMPENSATED') {
      matchStatus = s.status === 'FAILED' || s.status === 'COMPENSATED';
    } else if (filterStatus !== 'ALL') {
      matchStatus = s.status === filterStatus;
    }

    const matchSearch =
      !searchQuery ||
      s.sagaId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.bookingCode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'COMPLETED',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'PROCESSING':
      case 'STARTED':
        return {
          icon: <Activity className="w-3.5 h-3.5 text-indigo-600 animate-spin" />,
          label: 'PROCESSING (RUNNING)',
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'COMPENSATING':
        return {
          icon: <RotateCcw className="w-3.5 h-3.5 text-amber-600 animate-spin" />,
          label: 'COMPENSATING',
          className: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'COMPENSATED':
        return {
          icon: <RotateCcw className="w-3.5 h-3.5 text-orange-600" />,
          label: 'COMPENSATED',
          className: 'bg-orange-50 text-orange-700 border-orange-200',
        };
      case 'FAILED':
        return {
          icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
          label: 'FAILED',
          className: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      default:
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />,
          label: status || 'UNKNOWN',
          className: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  const getStepStatus = (stepKey, saga) => {
    if (!saga || !saga.steps) return { status: 'PENDING', label: 'Chờ thực thi' };
    const step = saga.steps.find((s) => s.stepName === stepKey);
    if (!step) {
      if (saga.status === 'COMPLETED') return { status: 'COMPLETED', label: 'Thành công' };
      if (saga.status === 'FAILED') return { status: 'SKIPPED', label: 'Đã bỏ qua' };
      return { status: 'PENDING', label: 'Chờ thực thi' };
    }
    return {
      status: step.status,
      error: step.lastError,
      actionType: step.actionType,
      attemptCount: step.attemptCount,
      completedAt: step.completedAt,
    };
  };

  const calculateDuration = (startedAt, completedAt) => {
    if (!startedAt) return '—';
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    const diff = Math.max(0, end - start);
    if (diff < 1000) return `${diff}ms`;
    return `${(diff / 1000).toFixed(2)}s`;
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs tracking-wider uppercase">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>Admin Distributed Systems Monitor</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                Saga Monitoring & Visualizer
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Theo dõi thời gian thực tiến trình Saga Orchestration, trạng thái từng bước và luồng bù trừ (Compensation)
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  autoRefresh
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                <span>Auto Polling (2.5s)</span>
              </button>

              {/* Manual Refresh Button */}
              <button
                onClick={() => fetchSagas(false)}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-medium text-slate-500">Tổng số Saga</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{totalCount}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Tất cả giao dịch phân tán</div>
            </div>

            <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200 shadow-xs">
              <div className="text-xs font-medium text-emerald-700 flex items-center justify-between">
                <span>Hoàn tất thành công</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">{completedCount}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5">Booking CONFIRMED</div>
            </div>

            <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-200 shadow-xs">
              <div className="text-xs font-medium text-indigo-700 flex items-center justify-between">
                <span>Đang xử lý</span>
                <Activity className="w-4 h-4 text-indigo-600 animate-spin" />
              </div>
              <div className="text-2xl font-bold text-indigo-800 mt-1">{inProgressCount}</div>
              <div className="text-[10px] text-indigo-600 mt-0.5">Active or Compensating</div>
            </div>

            <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-200 shadow-xs">
              <div className="text-xs font-medium text-rose-700 flex items-center justify-between">
                <span>Thất bại / Bù trừ</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-bold text-rose-800 mt-1">{failedCount}</div>
              <div className="text-[10px] text-rose-600 mt-0.5">Compensated & Rollbacked</div>
            </div>

            <div className="bg-violet-50/50 p-3.5 rounded-xl border border-violet-200 shadow-xs col-span-2 md:col-span-1">
              <div className="text-xs font-medium text-violet-700 flex items-center justify-between">
                <span>Tỷ lệ thành công</span>
                <Sparkles className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-2xl font-bold text-violet-800 mt-1">{successRate}%</div>
              <div className="text-[10px] text-violet-600 mt-0.5">Reliability metric</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel: Saga Instances Table (5 columns) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Table Filter & Search Header */}
              <div className="p-4 border-b border-slate-200 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo Booking Code, Saga ID..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { key: 'ALL', label: 'ALL', count: totalCount },
                    { key: 'COMPLETED', label: 'COMPLETED', count: completedCount },
                    { key: 'PROCESSING', label: 'PROCESSING', count: inProgressCount },
                    { key: 'FAILED', label: 'FAILED / COMPENSATED', count: failedCount },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setFilterStatus(tab.key);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                        filterStatus === tab.key
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        filterStatus === tab.key
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sagas List */}
              <div className="divide-y divide-slate-100 max-h-[620px] overflow-y-auto">
                {loading && (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin mb-2 text-indigo-500" />
                    Đang tải dữ liệu Saga từ booking-service...
                  </div>
                )}

                {!loading && filteredSagas.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Không tìm thấy phiên Saga nào phù hợp.
                  </div>
                )}

                {!loading &&
                  filteredSagas.map((saga) => {
                    const isSelected = selectedSaga?.sagaId === saga.sagaId;
                    const badge = getStatusBadge(saga.status);
                    const durationStr = calculateDuration(saga.startedAt, saga.completedAt);
                    return (
                      <div
                        key={saga.sagaId}
                        onClick={() => setSelectedSaga(saga)}
                        className={`p-3.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50/70 border-l-4 border-indigo-600'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                            <span className="font-mono text-indigo-600">{saga.bookingCode || 'N/A'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[11px] text-slate-500">{saga.sagaType || 'BOOKING_CREATE'}</span>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.className}`}
                          >
                            {badge.icon}
                            <span>{saga.status}</span>
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-mono text-[10px] text-slate-400 truncate max-w-[180px]">
                            {saga.sagaId}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {durationStr}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Right Panel: Interactive Visualizer & Timeline Flow (7 columns) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedSaga ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {/* Header of Visualizer */}
                <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-indigo-300 font-medium flex items-center gap-2">
                        <span>MÃ BOOKING: {selectedSaga.bookingCode}</span>
                        <span>•</span>
                        <span>Loại: {selectedSaga.sagaType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold font-mono tracking-tight text-white">
                          {selectedSaga.sagaId}
                        </h2>
                        <button
                          onClick={() => copyToClipboard(selectedSaga.sagaId)}
                          className="p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                          title="Sao chép Saga ID"
                        >
                          {copiedId === selectedSaga.sagaId ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewJson(!viewJson)}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 transition-colors"
                      >
                        {viewJson ? 'Xem Graph' : 'Xem Raw JSON'}
                      </button>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          getStatusBadge(selectedSaga.status).className
                        }`}
                      >
                        {getStatusBadge(selectedSaga.status).icon}
                        <span>{selectedSaga.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Thời gian bắt đầu</span>
                      <span className="font-mono text-slate-200">
                        {selectedSaga.startedAt ? new Date(selectedSaga.startedAt).toLocaleTimeString() : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Thời gian hoàn tất</span>
                      <span className="font-mono text-slate-200">
                        {selectedSaga.completedAt ? new Date(selectedSaga.completedAt).toLocaleTimeString() : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Tổng thời gian chạy</span>
                      <span className="font-mono text-emerald-400 font-semibold">
                        {calculateDuration(selectedSaga.startedAt, selectedSaga.completedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Raw JSON View Option */}
                {viewJson ? (
                  <div className="p-4 bg-slate-900 text-slate-200 overflow-x-auto text-xs font-mono max-h-[500px]">
                    <pre>{JSON.stringify(selectedSaga, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="p-6 space-y-8">
                    {/* Failure Alert Banner if any */}
                    {(selectedSaga.status === 'FAILED' || selectedSaga.status === 'COMPENSATED' || selectedSaga.failureReason) && (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                            Lý do Thất bại & Kích hoạt Bù trừ (Compensation Triggered)
                          </div>
                          <div className="text-xs text-rose-700 font-medium">
                            {selectedSaga.failureReason || 'Lỗi xử lý giao dịch hoặc tài nguyên không khả dụng'}
                          </div>
                          <div className="text-[11px] text-rose-600">
                            Orchestrator đã gửi các lệnh bồi hoàn (Compensating Commands) để rollback dữ liệu, giải phóng chỗ ngồi và phòng khách sạn an toàn.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step-by-Step Interactive Visual Flowchart */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-indigo-600" />
                          Tiến trình 5 Bước Saga (Forward Flow)
                        </h3>
                        <span className="text-[11px] text-slate-400">Choreography & Orchestration</span>
                      </div>

                      <div className="space-y-3">
                        {STANDARD_STEPS.map((stepDef, idx) => {
                          const info = getStepStatus(stepDef.key, selectedSaga);
                          const isDone = info.status === 'COMPLETED';
                          const isFailed = info.status === 'FAILED';
                          const isPending = info.status === 'PENDING';

                          return (
                            <div
                              key={stepDef.key}
                              className={`p-3.5 rounded-xl border transition-all ${
                                isDone
                                  ? 'bg-emerald-50/40 border-emerald-200'
                                  : isFailed
                                  ? 'bg-rose-50/50 border-rose-300'
                                  : isPending
                                  ? 'bg-slate-50/60 border-slate-200 opacity-60'
                                  : 'bg-indigo-50/50 border-indigo-300 animate-pulse'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                                      isDone
                                        ? 'bg-emerald-600 text-white'
                                        : isFailed
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {isDone ? <Check className="w-4 h-4" /> : isFailed ? <XCircle className="w-4 h-4" /> : idx + 1}
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                      <span>{stepDef.label}</span>
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                                        {stepDef.service}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">{stepDef.desc}</div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      isDone
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : isFailed
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                                  >
                                    {info.status}
                                  </span>
                                  {info.completedAt && (
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                      {new Date(info.completedAt).toLocaleTimeString()}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Error display if this step failed */}
                              {isFailed && info.error && (
                                <div className="mt-2.5 p-2 rounded bg-rose-100 text-[11px] text-rose-800 font-mono">
                                  {info.error}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Compensation Flowchart (Visible if failed or compensating) */}
                    {(selectedSaga.status === 'FAILED' || selectedSaga.status === 'COMPENSATING' || selectedSaga.status === 'COMPENSATED') && (
                      <div className="pt-6 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                            <RotateCcw className="w-4 h-4 text-amber-600" />
                            Luồng Bù trừ Giao dịch (Compensating Flow)
                          </h3>
                          <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Rollback Executed
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
                            <div className="text-xs font-bold text-amber-900">1. Release Tour</div>
                            <div className="text-[11px] text-amber-700 mt-1">Trả lại số chỗ cho tour-service</div>
                            <div className="mt-2 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Đã giải phóng
                            </div>
                          </div>

                          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
                            <div className="text-xs font-bold text-amber-900">2. Release Hotel</div>
                            <div className="text-[11px] text-amber-700 mt-1">Mở lại phòng cho hotel-service</div>
                            <div className="mt-2 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Đã hoàn phòng
                            </div>
                          </div>

                          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
                            <div className="text-xs font-bold text-amber-900">3. Release / Refund Payment</div>
                            <div className="text-[11px] text-amber-700 mt-1">Giải phóng số tiền giữ trong ví</div>
                            <div className="mt-2 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Ví hoàn lại 100%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
                Chọn một Saga trong danh sách bên trái để xem mô hình trực quan hóa chi tiết.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
