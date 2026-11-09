import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthWallet } from '../../context/AuthWalletContext';
import { authApi } from '../../services/api';

export const UserProfileModal = ({ isOpen, onClose }) => {
  const { currentUserId, currentUserName, currentUserEmail, roles, showToast } = useAuthWallet();

  const [fullName, setFullName] = useState(currentUserName);
  const [phone, setPhone] = useState('0901234567');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFullName(currentUserName);
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const res = await authApi.getProfile();
          if (res?.data) {
            setFullName(res.data.fullName || currentUserName);
            if (res.data.phone) setPhone(res.data.phone);
          }
        } catch (err) {
          console.warn('Could not load profile from backend, using current state:', err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [isOpen, currentUserName]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await authApi.updateProfile({ fullName: fullName.trim(), phone: phone.trim() });
      showToast('Cập nhật thông tin hồ sơ thành công!', 'success');
      onClose();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Cập nhật thất bại' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-base">
              {currentUserName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-base">Hồ Sơ Cá Nhân</h3>
              <p className="text-xs text-slate-300">ID: #{currentUserId} • {currentUserEmail}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {message && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 ${
              message.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{message.text}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Địa chỉ Email (Đăng nhập)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                disabled
                value={currentUserEmail}
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Họ và tên
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Số điện thoại liên hệ
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Vai trò hệ thống (Roles)
            </label>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {(roles || []).map((r) => (
                <span
                  key={r}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-100"
            >
              {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
