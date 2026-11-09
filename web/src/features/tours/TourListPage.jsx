import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, Calendar, MapPin, Users, ArrowRight, Star, Hotel, Check, 
  Sparkles, Search, SlidersHorizontal, RotateCcw, X, Clock, Info, ShieldCheck 
} from 'lucide-react';
import { tourApi } from '../../services/api';
import { RICH_TOURS_DATA } from './TourDetailPage';

// High quality seed tours with realistic itineraries
const SEED_TOURS = [
  {
    id: 101,
    name: 'Khám phá Vịnh Hạ Long - Đảo Cát Bà 3N2Đ',
    description: 'Du thuyền 5 sao đẳng cấp, tham quan Hang Sửng Sốt, chèo thuyền Kayak và nghỉ đêm trên vịnh di sản thiên nhiên thế giới.',
    destination: 'Quảng Ninh',
    duration: '3 Ngày 2 Đêm',
    durationDays: 3,
    basePrice: 3500000,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    departures: [
      { id: 201, departureDate: '2026-11-20', returnDate: '2026-11-22', availableSeats: 15, totalSeats: 30, price: 3500000 },
      { id: 202, departureDate: '2026-12-05', returnDate: '2026-12-07', availableSeats: 8, totalSeats: 30, price: 3650000 },
      { id: 207, departureDate: '2026-12-20', returnDate: '2026-12-22', availableSeats: 25, totalSeats: 30, price: 3500000 },
    ],
    hotelOption: {
      hotelId: 1,
      hotelName: 'Vinpearl Resort & Spa Hạ Long',
      roomTypeId: 10,
      roomName: 'Deluxe Ocean View Room',
      price: 1200000,
    },
    itinerary: [
      { day: 1, title: 'Hà Nội - Cảng Tuần Châu - Vịnh Hạ Long', detail: 'Xe đón khách tại điểm hẹn, di chuyển cao tốc đến Tuần Châu. Lên du thuyền 5 sao thưởng thức buffet trưa ngắm nhìn hòn Đỉnh Hương, hòn Gà Chọi.' },
      { day: 2, title: 'Hang Sửng Sốt - Chèo Kayak Hang Luồn - Đảo Ti Tốp', detail: 'Tập Thái Cực Quyền đón bình minh. Khám phá vẻ đẹp kỳ vĩ của Hang Sửng Sốt, tự do chèo thuyền kayak và tắm biển ngắm toàn cảnh vịnh từ đỉnh Ti Tốp.' },
      { day: 3, title: 'Làng chài Cửa Vạn - Cát Bà - Hà Nội', detail: 'Tham quan làng chài nổi cổ kính, thưởng thức bữa trưa chia tay trên vịnh trước khi du thuyền cập bến trở về Hà Nội.' },
    ]
  },
  {
    id: 102,
    name: 'Đà Nẵng - Bán Đảo Sơn Trà - Phố Cổ Hội An 4N3Đ',
    description: 'Hành trình di sản miền Trung: Cầu Vàng Bà Nà Hills, lặn ngắm san hô Cù Lao Chàm và thả hoa đăng phố cổ Hội An về đêm.',
    destination: 'Đà Nẵng & Hội An',
    duration: '4 Ngày 3 Đêm',
    durationDays: 4,
    basePrice: 4200000,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
    departures: [
      { id: 203, departureDate: '2026-11-25', returnDate: '2026-11-28', availableSeats: 12, totalSeats: 25, price: 4200000 },
      { id: 204, departureDate: '2026-12-10', returnDate: '2026-12-13', availableSeats: 20, totalSeats: 25, price: 4200000 },
    ],
    hotelOption: {
      hotelId: 2,
      hotelName: 'TMS Hotel Da Nang Beach',
      roomTypeId: 20,
      roomName: 'Premier Ocean View Twin',
      price: 1400000,
    },
    itinerary: [
      { day: 1, title: 'Đón sân bay Đà Nẵng - Bán Đảo Sơn Trà - Chùa Linh Ứng', detail: 'Xe đón khách tại sân bay Đà Nẵng, viếng thăm tượng Phật Bà Quan Âm cao nhất Việt Nam tại chùa Linh Ứng và tắm biển Mỹ Khê.' },
      { day: 2, title: 'Bà Nà Hills - Cầu Vàng Bàn Tay Khổng Lồ', detail: 'Chinh phục tuyến cáp treo đạt nhiều kỷ lục thế giới, check-in Cầu Vàng mờ sương và tham quan làng Pháp cổ tích cùng Fantasy Park.' },
      { day: 3, title: 'Ngũ Hành Sơn - Phố Cổ Hội An lung linh đèn lồng', detail: 'Khám phá động Huyền Không, làng đá mỹ nghệ Non Nước. Buổi chiều dạo bước phố cổ Hội An, thưởng thức Cao Lầu và thả đèn hoa đăng sông Hoài.' },
      { day: 4, title: 'Chợ Hàn mua sắm đặc sản - Tiễn sân bay', detail: 'Mua sắm chả bò, mực rim me tại Chợ Hàn. Xe tiễn quý khách ra sân bay Đà Nẵng, kết thúc hành trình miền Trung.' },
    ]
  },
  {
    id: 103,
    name: 'Thiên đường biển đảo Phú Quốc - Sunset Town 3N2Đ',
    description: 'Nghỉ dưỡng biển ngọc, cáp treo Hòn Thơm vượt biển dài nhất thế giới, Grand World thành phố không ngủ và safari bán hoang dã.',
    destination: 'Kiên Giang',
    duration: '3 Ngày 2 Đêm',
    durationDays: 3,
    basePrice: 5100000,
    rating: 4.95,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    departures: [
      { id: 205, departureDate: '2026-12-01', returnDate: '2026-12-03', availableSeats: 10, totalSeats: 20, price: 5100000 },
      { id: 206, departureDate: '2026-12-15', returnDate: '2026-12-17', availableSeats: 6, totalSeats: 20, price: 5300000 },
    ],
    hotelOption: {
      hotelId: 3,
      hotelName: 'Novotel Phu Quoc Resort',
      roomTypeId: 30,
      roomName: 'Superior Suite Sea Facing',
      price: 1800000,
    },
    itinerary: [
      { day: 1, title: 'Đón sân bay Phú Quốc - Sunset Town Thị Trấn Hoàng Hôn', detail: 'Đón khách tại sân bay, nhận phòng nghỉ ngơi. Chiều khám phá Cầu Hôn Kiss Bridge và thưởng thức show diễn nhạc nước Kiss of The Sea.' },
      { day: 2, title: 'Tour 4 Đảo - Cáp Treo Hòn Thơm - Lặn Ngắm San Hô', detail: 'Cano cao tốc đưa khách qua Hòn Mây Rút, Hòn Gầm Ghì lặn ngắm san hô tự nhiên. Trải nghiệm công viên nước Aquatopia trên đảo Hòn Thơm.' },
      { day: 3, title: 'Grand World Thành Phố Không Ngủ - Mua sắm ngọc trai', detail: 'Du ngoạn kênh đào Venice phiên bản Phú Quốc, ghé thăm cơ sở nuôi cấy ngọc trai và nước mắm truyền thống trước khi ra sân bay.' },
    ]
  }
];

export const TourListPage = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState(SEED_TOURS);
  const [loading, setLoading] = useState(false);

  // Search & Filter State (Issue #17)
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('ALL');
  const [priceFilter, setPriceFilter] = useState('ALL'); // 'ALL' | 'UNDER_4M' | '4M_TO_5M' | 'OVER_5M'
  const [sortBy, setSortBy] = useState('DEFAULT'); // 'DEFAULT' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING_DESC'

  // Tour Detail Modal State (Issue #17)
  const [selectedTour, setSelectedTour] = useState(null);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [includeHotel, setIncludeHotel] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const res = await tourApi.getTours({ size: 50 });
        const items = Array.isArray(res?.data) ? res.data : (res?.data?.content || []);
        if (items.length > 0) {
          const mapped = items.map((t, idx) => {
            const rich = (RICH_TOURS_DATA && RICH_TOURS_DATA.find(r => r.id === t.id)) || (RICH_TOURS_DATA && RICH_TOURS_DATA[idx % RICH_TOURS_DATA.length]) || null;
            return {
              id: t.id,
              name: t.title || t.name || rich?.name,
              description: t.description || rich?.description || 'Khám phá hành trình di sản và thiên nhiên Việt Nam tuyệt đẹp cùng SmartTrip.',
              destination: t.destinationName || t.destination || rich?.destination || t.city || 'Việt Nam',
              city: t.city || rich?.city || 'Việt Nam',
              duration: t.duration || (t.durationDays ? `${t.durationDays} Ngày ${Math.max(1, t.durationDays - 1)} Đêm` : (rich?.duration || '3N2Đ')),
              durationDays: t.durationDays || rich?.durationDays || 3,
              basePrice: t.basePrice || t.price || rich?.basePrice || 3500000,
              imageUrl: t.imageUrl || rich?.images?.main || (SEED_TOURS[idx % SEED_TOURS.length] && SEED_TOURS[idx % SEED_TOURS.length].imageUrl),
              rating: rich?.rating || 4.9,
              departures: (t.upcomingDepartures && t.upcomingDepartures.length > 0)
                ? t.upcomingDepartures
                : (rich?.departures || t.departures),
              hotelOption: rich?.hotelOption || (SEED_TOURS[idx % SEED_TOURS.length] && SEED_TOURS[idx % SEED_TOURS.length].hotelOption),
              itinerary: rich?.itinerary || t.itinerary,
            };
          });
          setTours(mapped);
        }
      } catch (err) {
        console.info('Backend tours endpoint not ready, using seed tours:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  // Distinct destinations for filter pills
  const destinations = useMemo(() => {
    const list = tours.map(t => t.destination);
    return ['ALL', ...new Set(list)];
  }, [tours]);

  // Filtered & Sorted Tours
  const filteredTours = useMemo(() => {
    return tours.filter((t) => {
      // Keyword search
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase().trim();
        const matchName = t.name?.toLowerCase().includes(kw);
        const matchDest = t.destination?.toLowerCase().includes(kw);
        const matchDesc = t.description?.toLowerCase().includes(kw);
        if (!matchName && !matchDest && !matchDesc) return false;
      }

      // Destination filter
      if (selectedDestination !== 'ALL' && t.destination !== selectedDestination) {
        return false;
      }

      // Price filter
      const price = Number(t.basePrice || 0);
      if (priceFilter === 'UNDER_4M' && price >= 4000000) return false;
      if (priceFilter === '4M_TO_5M' && (price < 4000000 || price > 5000000)) return false;
      if (priceFilter === 'OVER_5M' && price <= 5000000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return Number(a.basePrice) - Number(b.basePrice);
      if (sortBy === 'PRICE_DESC') return Number(b.basePrice) - Number(a.basePrice);
      if (sortBy === 'RATING_DESC') return Number(b.rating || 0) - Number(a.rating || 0);
      return 0;
    });
  }, [tours, searchKeyword, selectedDestination, priceFilter, sortBy]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedDestination('ALL');
    setPriceFilter('ALL');
    setSortBy('DEFAULT');
  };

  // Open tour detail page matching design
  const handleOpenDetail = (tour) => {
    navigate('/tours/' + tour.id);
  };

  // Direct checkout action
  const handleProceedCheckout = (tour, chosenDep, withHotel) => {
    const dep = chosenDep || tour.departures?.[0];
    const params = new URLSearchParams({
      tourId: String(tour.id),
      tourName: tour.name,
      departureId: String(dep?.id || 201),
      departureDate: dep?.departureDate || '2026-11-20',
      unitPrice: String(dep?.price || tour.basePrice),
    });

    if (withHotel && tour.hotelOption) {
      params.append('hasHotel', 'true');
      params.append('hotelId', String(tour.hotelOption.hotelId));
      params.append('hotelName', tour.hotelOption.hotelName);
      params.append('roomTypeId', String(tour.hotelOption.roomTypeId));
      params.append('roomName', tour.hotelOption.roomName);
      params.append('hotelPrice', String(tour.hotelOption.price));
    }

    if (selectedTour) setSelectedTour(null);
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner with Integrated Search */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-xl border-b border-slate-800">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Nền Tảng Đặt Tour Phân Tán • Issue #17 & #41
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Khám Phá Việt Nam Cùng <span className="bg-gradient-to-r from-indigo-400 to-indigo-200 bg-clip-text text-transparent">SmartTrip</span>
          </h1>
          

          {/* Quick Search Box */}
          <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/15 shadow-2xl flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm kiếm tour (ví dụ: Hạ Long, Đà Nẵng, Phú Quốc, Biển, Cát Bà...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={() => {}}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Tìm Tour</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Filter Controls Bar (Issue #17 & Smart Dropdown) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Dropdown Selectors Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Destination Dropdown */}
              <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-xs">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Điểm đến</span>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="bg-transparent font-semibold text-slate-800 text-xs sm:text-sm focus:outline-none cursor-pointer pr-2 max-w-[200px] truncate"
                  >
                    <option value="ALL">Tất cả điểm đến ({destinations.length - 1} địa danh)</option>
                    {destinations.filter(d => d !== 'ALL').map((dest) => (
                      <option key={dest} value={dest}>
                        {dest}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price selector */}
              <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khoảng giá</span>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="bg-transparent font-semibold text-slate-800 text-xs sm:text-sm focus:outline-none cursor-pointer pr-2"
                  >
                    <option value="ALL">Mọi mức giá</option>
                    <option value="UNDER_4M">Dưới 4.000.000 đ</option>
                    <option value="4M_TO_5M">4.000.000 - 5.000.000 đ</option>
                    <option value="OVER_5M">Trên 5.000.000 đ</option>
                  </select>
                </div>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sắp xếp</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent font-semibold text-slate-800 text-xs sm:text-sm focus:outline-none cursor-pointer pr-2"
                  >
                    <option value="DEFAULT">Mặc định</option>
                    <option value="PRICE_ASC">Giá tăng dần</option>
                    <option value="PRICE_DESC">Giá giảm dần</option>
                    <option value="RATING_DESC">Đánh giá cao nhất</option>
                  </select>
                </div>
              </div>

              {/* Reset button if active filters */}
              {(searchKeyword || selectedDestination !== 'ALL' || priceFilter !== 'ALL' || sortBy !== 'DEFAULT') && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-semibold border border-rose-200 text-xs transition-colors shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xóa lọc</span>
                </button>
              )}
            </div>

            {/* Right: Quick tags for top popular destinations */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-400 font-medium text-[11px] mr-1 hidden sm:inline">Phổ biến:</span>
              {[
                { label: 'Tất cả', val: 'ALL' },
                { label: 'Đà Nẵng', val: 'Đà Nẵng & Bà Nà Hills' },
                { label: 'Hạ Long', val: 'Vịnh Hạ Long' },
                { label: 'Phú Quốc', val: 'Phú Quốc' },
                { label: 'Nha Trang', val: 'Vịnh Nha Trang Biển Xanh' },
                { label: 'Sa Pa', val: 'Sa Pa & Fansipan' },
              ].map((p) => {
                const isSelected = selectedDestination === p.val || (p.val === 'ALL' && selectedDestination === 'ALL');
                return (
                  <button
                    key={p.label}
                    onClick={() => setSelectedDestination(p.val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Tìm thấy <strong>{filteredTours.length}</strong> chuyến đi phù hợp
            </span>
            {searchKeyword && (
              <span>
                Từ khóa: <em>"{searchKeyword}"</em>
              </span>
            )}
          </div>
        </div>

        {/* Tour Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200">
            <Compass className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-slate-600 text-sm font-medium">Đang tải danh sách tour...</p>
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 space-y-3">
            <Compass className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy tour phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Không có tour nào khớp với bộ lọc hiện tại. Hãy thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
            >
              Đặt lại toàn bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="relative h-52 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => handleOpenDetail(tour)}>
                  <img
                    src={tour.imageUrl}
                    alt={tour.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-slate-800 shadow">
                      {tour.duration}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-600/90 backdrop-blur-md text-white shadow">
                      {tour.destination}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    {tour.rating}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2 cursor-pointer" onClick={() => handleOpenDetail(tour)}>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {tour.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {tour.description}
                    </p>
                  </div>

                  {/* Departures Preview */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        Khởi hành gần nhất:
                      </span>
                      <span className="font-semibold text-slate-800">
                        {tour.departures?.[0]?.departureDate || '2026-11-20'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                        Chỗ còn trống:
                      </span>
                      <span className="font-semibold text-emerald-600">
                        {tour.departures?.[0]?.availableSeats || 10} chỗ
                      </span>
                    </div>

                    {tour.hotelOption && (
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Hotel className="w-3.5 h-3.5 text-amber-500" />
                          Tùy chọn KS:
                        </span>
                        <span className="font-medium text-slate-700 truncate max-w-[150px]">
                          {tour.hotelOption.hotelName}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block">Giá từ</span>
                      <span className="text-xl font-bold text-indigo-700">
                        {formatVND(tour.basePrice)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenDetail(tour)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleProceedCheckout(tour, null, Boolean(tour.hotelOption))}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-100 group-hover:gap-2 transition-all"
                      >
                        Đặt ngay
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tour Detail Modal (Issue #17) */}
      {selectedTour && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            {/* Modal Header Cover */}
            <div className="relative h-64 overflow-hidden bg-slate-900 text-white">
              <img
                src={selectedTour.imageUrl}
                alt={selectedTour.name}
                className="w-full h-full object-cover opacity-60"
              />
              <button
                onClick={() => setSelectedTour(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center text-white text-lg transition-colors z-20"
              >
                ✕
              </button>

              <div className="absolute bottom-4 left-6 right-6 z-10 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 text-slate-900">
                    {selectedTour.duration}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-600 text-white">
                    {selectedTour.destination}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    {selectedTour.rating}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold leading-tight drop-shadow-md">
                  {selectedTour.name}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[calc(85vh-16rem)] overflow-y-auto text-xs">
              {/* Overview */}
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">Mô tả chuyến đi</h4>
                <p className="text-slate-600 leading-relaxed text-xs">
                  {selectedTour.description}
                </p>
              </div>

              {/* Itinerary Timeline */}
              {selectedTour.itinerary && selectedTour.itinerary.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Lịch trình chi tiết ({selectedTour.itinerary.length} Ngày)
                  </h4>
                  <div className="space-y-3 pl-2 border-l-2 border-indigo-200">
                    {selectedTour.itinerary.map((step) => (
                      <div key={step.day} className="relative pl-4 space-y-0.5">
                        <div className="absolute -left-[1.35rem] top-0.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow-sm" />
                        <span className="font-bold text-indigo-700 block text-xs">
                          Ngày {step.day}: {step.title}
                        </span>
                        <p className="text-slate-600 text-xs leading-relaxed">{step.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Departures Selection */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Chọn lịch khởi hành mong muốn
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(selectedTour.departures || []).map((dep) => {
                    const isSelected = selectedDeparture?.id === dep.id;
                    return (
                      <button
                        key={dep.id}
                        type="button"
                        onClick={() => setSelectedDeparture(dep)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-900 text-xs">
                            {dep.departureDate} &rarr; {dep.returnDate || 'Theo lịch'}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-500">{dep.availableSeats} chỗ còn trống</span>
                          <span className="font-bold text-indigo-700">{formatVND(dep.price || selectedTour.basePrice)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hotel Add-on Option */}
              {selectedTour.hotelOption && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeHotel}
                        onChange={(e) => setIncludeHotel(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Hotel className="w-4 h-4 text-amber-600" />
                        Tích hợp đặt phòng khách sạn đối tác (Saga Distributed)
                      </span>
                    </label>
                    <span className="text-xs font-bold text-amber-700">
                      +{formatVND(selectedTour.hotelOption.price)} / đêm
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 pl-6">
                    {selectedTour.hotelOption.hotelName} — Hạng phòng:{' '}
                    <strong>{selectedTour.hotelOption.roomName}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Action */}
            <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Tổng giá dự kiến:</span>
                <span className="text-2xl font-extrabold text-indigo-700">
                  {formatVND(
                    (selectedDeparture?.price || selectedTour.basePrice) +
                    (includeHotel && selectedTour.hotelOption ? selectedTour.hotelOption.price : 0)
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedTour(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold w-1/2 sm:w-auto"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => handleProceedCheckout(selectedTour, selectedDeparture, includeHotel)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-2 w-1/2 sm:w-auto"
                >
                  Tiến Hành Đặt Chỗ
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
