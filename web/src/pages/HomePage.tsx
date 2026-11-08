import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { HeroBanner } from '../components/home/HeroBanner';
import { Destinations } from '../components/home/Destinations';
import { FeaturedTours } from '../components/home/FeaturedTours';
import { tourApi } from '../api/tourApi';
import { ShieldCheck, Zap, Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { data: featuredTours = [], isLoading } = useQuery({
    queryKey: ['featuredTours'],
    queryFn: () => tourApi.getFeaturedTours(),
  });

  return (
    <div className="min-h-screen">
      {/* 1. Hero Banner with Quick Search */}
      <HeroBanner />

      {/* 2. Popular Destinations */}
      <Destinations />

      {/* 3. Featured & Best Selling Tours */}
      <FeaturedTours tours={featuredTours} isLoading={isLoading} />

      {/* 4. Why Choose SmartTrip Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block mb-2">
            Tại Sao Chọn SmartTrip?
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Nền Tảng Đặt Tour Thông Minh & Tin Cậy
          </h2>
          <p className="mt-3 text-slate-500 text-sm">
            Ứng dụng công nghệ Saga Orchestrator và kiến trúc Microservices hiện đại để đảm bảo trải nghiệm đặt tour thông suốt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-6">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Xác Nhận Giữ Chỗ Tức Thì</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Hệ thống Saga điều phối giữ chỗ đồng bộ giữa Tour và Khách sạn, tự động hoàn trả kho vé nếu có sự cố.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Chính Sách Hoàn Tiền Rõ Ràng</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Hoàn tiền 100% khi hủy trước 7 ngày, 50% trước 3-7 ngày trực tiếp vào tài khoản Mock Wallet của bạn.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Dịch Vụ Tuyển Chọn 4-5 Sao</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Tất cả các tour và phòng khách sạn đều được kiểm định chất lượng, xe đưa đón cao cấp và hướng dẫn viên tận tâm.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
