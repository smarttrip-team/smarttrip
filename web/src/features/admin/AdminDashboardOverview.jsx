import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, tourApi, hotelApi } from '../../services/api';
import {
  Activity,
  Users,
  Compass,
  Building2,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Server,
  Zap,
} from 'lucide-react';

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState({
    sagaCount: 0,
    userCount: 0,
    tourCount: 0,
    hotelCount: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [sagas, users, tours, hotels] = await Promise.allSettled([
          adminApi.getAllSagas(),
          adminApi.getUsers(),
          tourApi.getTours(),
          hotelApi.getHotels(),
        ]);

        setStats({
          sagaCount: sagas.status === 'fulfilled' ? sagas.value.data?.length || 0 : 0,
          userCount: users.status === 'fulfilled' ? users.value.data?.length || 0 : 0,
          tourCount: tours.status === 'fulfilled' ? (tours.value.data?.content || tours.value.data)?.length || 0 : 0,
          hotelCount: hotels.status === 'fulfilled' ? hotels.value.data?.length || 0 : 0,
        });
      } catch (e) {
        console.error('Error fetching dashboard stats', e);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>SmartTrip Administration</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Tổng quan Hệ thống Quản trị SmartTrip
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Bảng điều khiển trung tâm giám sát kiến trúc Microservices và các luồng nghiệp vụ
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Saga Orchestrations</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.sagaCount}</div>
            <div className="text-xs text-rose-600 mt-1 font-medium">Giao dịch phân tán đã ghi nhận</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Tài khoản Người dùng</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.userCount}</div>
            <div className="text-xs text-indigo-600 mt-1 font-medium">Customer, Operator, Hotelier, Admin</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Tours Đang Mở</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.tourCount}</div>
            <div className="text-xs text-amber-600 mt-1 font-medium">Danh mục tour toàn quốc</div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Khách sạn Liên kết</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">{stats.hotelCount}</div>
            <div className="text-xs text-emerald-600 mt-1 font-medium">Phòng lưu trú & inventory</div>
          </div>
        </div>

        {/* Portals Quick Access */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">
            Các Phân hệ Quản trị & Điều hành
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link
              to="/admin/sagas"
              className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-600 transition-colors">
                  Saga Monitoring Visualizer
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Mô hình trực quan hóa luồng Saga 5 bước, xem thời gian thực các lệnh bù trừ (Compensation) phục vụ báo cáo và demo.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-rose-600 pt-2">
                <span>Mở Visualizer</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                  Quản lý Người dùng
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Xem danh sách tài khoản, kiểm tra vai trò người dùng và thực hiện khóa hoặc kích hoạt tài khoản.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 pt-2">
                <span>Quản lý Tài khoản</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/operator"
              className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-md transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors">
                  Tour Operator Portal
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Khởi tạo tour mới, thiết lập lịch khởi hành và điều chỉnh sức chứa (total / available seats) trực tiếp.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 pt-2">
                <span>Vào Cổng Tour Operator</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/hotel-manager"
              className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                  Hotel Manager Portal
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Quản lý danh sách khách sạn, cơ cấu loại phòng và cập nhật số lượng phòng mở bán theo dải ngày.
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 pt-2">
                <span>Vào Cổng Hotelier</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
