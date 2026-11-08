import React from 'react';
import { Compass, Mail, Phone, MapPin, Heart, ShieldCheck, Clock, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const CURRENT_YEAR = 2026;

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 mt-20 border-t border-slate-800">
      {/* Values bar */}
      <div className="border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Bảo đảm giá tốt</h4>
              <p className="text-xs text-slate-400 mt-0.5">Cam kết giá minh bạch & hoàn tiền theo chính sách</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Chất lượng hàng đầu</h4>
              <p className="text-xs text-slate-400 mt-0.5">Đối tác lữ hành & khách sạn 4-5 sao uy tín</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Hỗ trợ 24/7</h4>
              <p className="text-xs text-slate-400 mt-0.5">Đội ngũ tư vấn sẵn sàng phục vụ mọi lúc mọi nơi</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Đặt tour tức thì</h4>
              <p className="text-xs text-slate-400 mt-0.5">Xác nhận chỗ trực tuyến qua Saga Orchestrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Smart<span className="text-primary-400">Trip</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            Hệ sinh thái du lịch thông minh SmartTrip — mang đến trải nghiệm đặt tour, khách sạn và dịch vụ lữ hành tiện lợi, an toàn và cá nhân hóa nhất Việt Nam.
          </p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-400 shrink-0" />
              <span>Tòa nhà FPT Polytechnic, TP. Hồ Chí Minh & Hà Nội</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary-400 shrink-0" />
              <span>1900 6868 (8:00 - 22:00)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary-400 shrink-0" />
              <span>hotro@smarttrip.vn</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Điểm đến nổi bật</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/tours?keyword=Đà Nẵng" className="hover:text-primary-400 transition-colors">Đà Nẵng & Hội An</Link></li>
            <li><Link to="/tours?keyword=Phú Quốc" className="hover:text-primary-400 transition-colors">Phú Quốc Đảo Ngọc</Link></li>
            <li><Link to="/tours?keyword=Sapa" className="hover:text-primary-400 transition-colors">Sapa Săn Mây</Link></li>
            <li><Link to="/tours?keyword=Hạ Long" className="hover:text-primary-400 transition-colors">Vịnh Hạ Long</Link></li>
            <li><Link to="/tours?keyword=Nha Trang" className="hover:text-primary-400 transition-colors">Nha Trang Biển Xanh</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Dịch vụ & Tiện ích</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/tours" className="hover:text-primary-400 transition-colors">Danh sách Tour</Link></li>
            <li><a href="#destinations" className="hover:text-primary-400 transition-colors">Combo Khách sạn</a></li>
            <li><span className="hover:text-primary-400 cursor-pointer">Chính sách hủy & hoàn tiền</span></li>
            <li><span className="hover:text-primary-400 cursor-pointer">Bảo hiểm du lịch</span></li>
            <li><span className="hover:text-primary-400 cursor-pointer">Ví điện tử Mock Wallet</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Về SmartTrip</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="hover:text-primary-400 cursor-pointer">Giới thiệu dự án</span></li>
            <li><span className="hover:text-primary-400 cursor-pointer">Kiến trúc Microservices</span></li>
            <li><span className="hover:text-primary-400 cursor-pointer">Điều khoản dịch vụ</span></li>
            <li><span className="hover:text-primary-400 cursor-pointer">Chính sách bảo mật</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p className="flex items-center justify-center gap-1">
          © {CURRENT_YEAR} SmartTrip Team. Phát triển với <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> bởi Nguyen Hong Thai & Le Quang Vinh.
        </p>
      </div>
    </footer>
  );
};
