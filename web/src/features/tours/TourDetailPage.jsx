import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Star, Share2, Heart, Calendar, Users, 
  Hotel as HotelIcon, ChevronDown, ChevronUp, ShieldCheck, 
  Sparkles, Check, Clock, Info, CheckCircle2 
} from 'lucide-react';
import { tourApi, hotelApi } from '../../services/api';
import { useAuthWallet } from '../../context/AuthWalletContext';

// 17 Comprehensive Rich Tours (Matched 1-1 with smarttrip_tour_db)
export const RICH_TOURS_DATA = [
  {
    id: 1,
    code: "ST-0001",
    name: "Khám Phá Di Sản Đà Nẵng - Bà Nà Hills - Phố Cổ Hội An",
    description: "Hành trình di sản miền Trung: Cầu Vàng Bà Nà Hills, lặn ngắm san hô Cù Lao Chàm và thả hoa đăng phố cổ Hội An về đêm.",
    city: "Đà Nẵng",
    location: "Đà Nẵng, Việt Nam",
    destination: "Đà Nẵng & Hội An",
    duration: "4 Ngày 3 Đêm",
    durationDays: 4,
    basePrice: 4200000,
    rating: 4.9,
    reviewsCount: 128,
    images: {
      main: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 1, departureDate: "2026-12-01", returnDate: "2026-12-04", price: 4200000, availableSeats: 12, totalSeats: 25 },
      { id: 2, departureDate: "2026-12-15", returnDate: "2026-12-18", price: 4500000, availableSeats: 8, totalSeats: 25 },
      { id: 3, departureDate: "2027-01-05", returnDate: "2027-01-08", price: 4800000, availableSeats: 25, totalSeats: 30 },
    ],
    hotelOption: {
      hotelId: 1,
      hotelName: "Vinpearl Luxury Đà Nẵng",
      stars: 5,
      isOfficialPartner: true,
      address: "Đường Trường Sa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng",
      rooms: [
        { id: 1, name: "Deluxe Hướng Biển (Ocean View)", available: 8, surcharge: 1200000 },
        { id: 2, name: "Executive Suite Ban Công Riêng", available: 3, surcharge: 2100000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Đón sân bay - Bán đảo Sơn Trà - Bãi biển Mỹ Khê", detail: "Xe và HDV đón quý khách tại sân bay Đà Nẵng. Khởi hành tham quan bán đảo Sơn Trà, viếng Linh Ứng Tự với tượng Phật Bà Quan Âm cao 67m ngắm toàn cảnh biển Đà Nẵng. Buổi chiều tự do tắm biển Mỹ Khê." },
      { day: 2, code: "N2", title: "Bà Nà Hills - Check-in Cầu Vàng Bàn Tay Khổng Lồ - Làng Pháp", detail: "Chinh phục tuyến cáp treo đạt nhiều kỷ lục Guinness. Check-in siêu phẩm Cầu Vàng Bàn Tay Khổng Lồ mờ sương, dạo bước giữa quảng trường Làng Pháp cổ kính và trải nghiệm hơn 100 trò chơi tại Fantasy Park." },
      { day: 3, code: "N3", title: "Danh thắng Ngũ Hành Sơn - Phố cổ Hội An lung linh đèn lồng", detail: "Khám phá Động Huyền Không, chùa Tam Thai tại Ngũ Hành Sơn. Buổi chiều di chuyển về phố cổ Hội An, tham quan Chùa Cầu Nhật Bản, nhà cổ Tấn Ký, thưởng thức Cao Lầu và thả hoa đăng ước nguyện trên sông Hoài." },
      { day: 4, code: "N4", title: "Mua sắm đặc sản Chợ Hàn - Tiễn sân bay Đà Nẵng", detail: "Tự do dạo phố, mua sắm đặc sản chả bò, tré, mực rim me tại Chợ Hàn trung tâm thành phố. Xe đưa đoàn ra sân bay Đà Nẵng làm thủ tục chuyến bay về, kết thúc chuyến tham quan trọn vẹn." },
    ]
  },
  {
    id: 2,
    code: "ST-0002",
    name: "Du Thuyền 5 Sao Vịnh Hạ Long - Đảo Cát Bà - Hang Sửng Sốt",
    description: "Du thuyền 5 sao đẳng cấp, tham quan Hang Sửng Sốt, chèo thuyền Kayak và nghỉ đêm trên vịnh di sản thiên nhiên thế giới.",
    city: "Quảng Ninh",
    location: "Quảng Ninh, Việt Nam",
    destination: "Vịnh Hạ Long",
    duration: "3 Ngày 2 Đêm",
    durationDays: 3,
    basePrice: 3500000,
    rating: 4.95,
    reviewsCount: 96,
    images: {
      main: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 4, departureDate: "2026-11-20", returnDate: "2026-11-22", price: 3500000, availableSeats: 15, totalSeats: 30 },
      { id: 5, departureDate: "2026-12-05", returnDate: "2026-12-07", price: 3650000, availableSeats: 18, totalSeats: 30 },
      { id: 6, departureDate: "2026-12-20", returnDate: "2026-12-22", price: 3500000, availableSeats: 22, totalSeats: 30 },
    ],
    hotelOption: {
      hotelId: 2,
      hotelName: "Vinpearl Resort & Spa Hạ Long",
      stars: 5,
      isOfficialPartner: true,
      address: "Đảo Rều, Bãi Cháy, TP. Hạ Long, Quảng Ninh",
      rooms: [
        { id: 3, name: "Deluxe Sea View Room", available: 10, surcharge: 1100000 },
        { id: 4, name: "Panoramic Ocean Suite", available: 4, surcharge: 1950000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Hà Nội - Cảng tàu quốc tế Tuần Châu - Lên du thuyền 5 sao", detail: "Đón khách tại điểm hẹn, di chuyển cao tốc đến Tuần Châu. Lên du thuyền thưởng thức buffet trưa chào mừng trong lúc ngắm nhìn hòn Đỉnh Hương, hòn Gà Chọi." },
      { day: 2, code: "N2", title: "Hang Sửng Sốt - Chèo Kayak Hang Luồn - Đảo Ti Tốp", detail: "Tập Thái Cực Quyền đón bình minh trên boong tàu. Khám phá vẻ đẹp kỳ vĩ của Hang Sửng Sốt, tự do chèo thuyền kayak và ngắm toàn cảnh vịnh từ đỉnh Ti Tốp." },
      { day: 3, code: "N3", title: "Làng chài Cửa Vạn - Vịnh Lan Hạ - Cập bến Tuần Châu", detail: "Tham quan làng chài nổi cổ kính bằng thuyền nan của ngư dân bản địa. Thưởng thức bữa trưa chia tay trước khi du thuyền cập bến trở về." },
    ]
  },
  {
    id: 3,
    code: "ST-0003",
    name: "Thiên Đường Biển Đảo Phú Quốc - Cáp Treo Hòn Thơm - Sunset Town",
    description: "Nghỉ dưỡng biển ngọc, cáp treo Hòn Thơm vượt biển dài nhất thế giới, Grand World thành phố không ngủ và safari bán hoang dã.",
    city: "Kiên Giang",
    location: "Phú Quốc, Việt Nam",
    destination: "Đảo Ngọc Phú Quốc",
    duration: "4 Ngày 3 Đêm",
    durationDays: 4,
    basePrice: 5100000,
    rating: 4.92,
    reviewsCount: 145,
    images: {
      main: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 7, departureDate: "2026-12-01", returnDate: "2026-12-04", price: 5100000, availableSeats: 10, totalSeats: 20 },
      { id: 8, departureDate: "2026-12-15", returnDate: "2026-12-18", price: 5300000, availableSeats: 14, totalSeats: 20 },
      { id: 9, departureDate: "2027-01-10", returnDate: "2027-01-13", price: 5500000, availableSeats: 20, totalSeats: 25 },
    ],
    hotelOption: {
      hotelId: 3,
      hotelName: "Novotel Phu Quoc Resort",
      stars: 5,
      isOfficialPartner: true,
      address: "Khu du lịch Bãi Trường, Xã Dương Tơ, TP. Phú Quốc",
      rooms: [
        { id: 5, name: "Superior Ocean View", available: 9, surcharge: 1350000 },
        { id: 6, name: "Beachfront Bungalow", available: 2, surcharge: 2400000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Đón sân bay Phú Quốc - Sunset Town Thị Trấn Hoàng Hôn", detail: "Đón khách tại sân bay, nhận phòng nghỉ ngơi. Chiều check-in Cầu Hôn Kiss Bridge và thưởng thức show diễn nhạc nước Kiss of The Sea." },
      { day: 2, code: "N2", title: "Cano Tour 4 Đảo - Cáp Treo Hòn Thơm - Lặn Ngắm San Hô", detail: "Cano cao tốc đưa khách qua Hòn Mây Rút, Hòn Gầm Ghì lặn ngắm san hô tự nhiên. Trải nghiệm công viên nước Aquatopia trên đảo Hòn Thơm." },
      { day: 3, code: "N3", title: "Vinpearl Safari - Grand World Thành Phố Không Ngủ", detail: "Tham quan vườn thú bán hoang dã lớn nhất Việt Nam. Chiều du ngoạn kênh đào Venice, xem show Tinh Hoa Việt Nam rực rỡ." },
      { day: 4, code: "N4", title: "Làng chài Hàm Ninh - Mua sắm ngọc trai - Tiễn sân bay", detail: "Thưởng thức hải sản Hàm Ninh, ghé thăm cơ sở ngọc trai và xưởng nước mắm truyền thống trước khi xe đưa ra sân bay." },
    ]
  },
  {
    id: 4,
    code: "ST-0004",
    name: "Sa Pa Mờ Sương - Chinh Phục Nóc Nhà Đông Dương Fansipan",
    description: "Trải nghiệm cáp treo 3 dây kỷ lục Fansipan Legend, khám phá bản Cát Cát thơ mộng và thưởng thức ẩm thực Tây Bắc.",
    city: "Lào Cai",
    location: "Sa Pa, Lào Cai",
    destination: "Sa Pa Thị Trấn Mờ Sương",
    duration: "3 Ngày 2 Đêm",
    durationDays: 3,
    basePrice: 2950000,
    rating: 4.88,
    reviewsCount: 84,
    images: {
      main: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 10, departureDate: "2026-11-28", returnDate: "2026-11-30", price: 2950000, availableSeats: 16, totalSeats: 25 },
      { id: 11, departureDate: "2026-12-12", returnDate: "2026-12-14", price: 3100000, availableSeats: 11, totalSeats: 25 },
      { id: 12, departureDate: "2026-12-26", returnDate: "2026-12-28", price: 3400000, availableSeats: 19, totalSeats: 25 },
    ],
    hotelOption: {
      hotelId: 4,
      hotelName: "Hotel de la Coupole - MGallery Sapa",
      stars: 5,
      isOfficialPartner: true,
      address: "1 Hoàng Liên, Thị xã Sa Pa, Lào Cai",
      rooms: [
        { id: 7, name: "Classic King Mountain View", available: 6, surcharge: 1450000 },
        { id: 8, name: "Executive Suite View Thung Lũng", available: 3, surcharge: 2600000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Hà Nội - Cao tốc Nội Bài Lào Cai - Bản Cát Cát thơ mộng", detail: "Khởi hành đi Sa Pa. Chiều tản bộ thăm bản Cát Cát của người H'Mông, ngắm nhìn cọn nước khổng lồ và thác Tiên Sa." },
      { day: 2, code: "N2", title: "Chinh phục đỉnh thiêng Fansipan 3.143m - Đèo Ô Quy Hồ", detail: "Đi tàu hỏa leo núi Mường Hoa, cáp treo lên đỉnh Fansipan - Nóc nhà Đông Dương. Chiều ngắm hoàng hôn rực lửa trên đèo Ô Quy Hồ." },
      { day: 3, code: "N3", title: "Nhà thờ Đá Sa Pa - Mua sắm đặc sản mầm đá - Hà Nội", detail: "Dạo quanh quảng trường Sa Pa, mua sắm thảo dược, thịt trâu gác bếp và lên xe trở về Hà Nội." },
    ]
  },
  {
    id: 5,
    code: "ST-0005",
    name: "Hùng Vĩ Hà Giang - Chinh Phục Mã Pí Lèng - Chèo Thuyền Hẻm Tu Sản",
    description: "Khám phá cao nguyên đá Đồng Văn, vượt đèo Mã Pí Lèng ngắm dòng Nho Quế và check-in cột cờ Lũng Cú cực Bắc Tổ quốc.",
    city: "Hà Giang",
    location: "Hà Giang, Việt Nam",
    destination: "Cao Nguyên Đá Hà Giang",
    duration: "4 Ngày 3 Đêm",
    durationDays: 4,
    basePrice: 3850000,
    rating: 4.96,
    reviewsCount: 112,
    images: {
      main: "https://images.unsplash.com/photo-1608659597669-b45511779f93?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 13, departureDate: "2026-12-03", returnDate: "2026-12-06", price: 3850000, availableSeats: 9, totalSeats: 20 },
      { id: 14, departureDate: "2026-12-17", returnDate: "2026-12-20", price: 3950000, availableSeats: 15, totalSeats: 20 },
      { id: 15, departureDate: "2027-01-07", returnDate: "2027-01-10", price: 4100000, availableSeats: 18, totalSeats: 20 },
    ],
    hotelOption: {
      hotelId: 5,
      hotelName: "P'apiu Resort Hà Giang",
      stars: 5,
      isOfficialPartner: true,
      address: "Xã Yên Định, Huyện Bắc Mê, Hà Giang",
      rooms: [
        { id: 9, name: "Mellow Mountain Chalet", available: 5, surcharge: 1200000 },
        { id: 10, name: "The Fluffy Cloud Villa", available: 2, surcharge: 2200000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Hà Nội - Cột mốc số 0 Hà Giang - Cổng trời Quản Bạ", detail: "Khởi hành qua Tuyên Quang đến Hà Giang. Check-in km số 0 và chiêm ngưỡng Núi Đôi Cô Tiên tại Quản Bạ." },
      { day: 2, code: "N2", title: "Dinh thự Vua Mèo - Cột cờ Lũng Cú cực Bắc Tổ quốc", detail: "Khám phá kiến trúc độc đáo Dinh thự họ Vương, chinh phục cột cờ Lũng Cú linh thiêng và nghỉ đêm tại phố cổ Đồng Văn." },
      { day: 3, code: "N3", title: "Đệ nhất hùng quan Mã Pí Lèng - Du thuyền Hẻm Tu Sản", detail: "Chinh phục một trong tứ đại đỉnh đèo hiểm trở, đi thuyền xuôi dòng sông Nho Quế xanh biếc ngắm vách đá dựng đứng." },
      { day: 4, code: "N4", title: "Chợ phiên vùng cao - Dốc Thẩm Mã - Trở về Hà Nội", detail: "Trải nghiệm không khí rực rỡ sắc màu thổ cẩm chợ phiên, check-in khúc cua Dốc Thẩm Mã huyền thoại." },
    ]
  },
  {
    id: 6,
    code: "ST-0006",
    name: "Ninh Bình Non Nước Hữu Tình - Tràng An Thuyền Nan - Cố Đô Hoa Lư",
    description: "Ngồi thuyền nan xuôi dòng Tràng An qua các hang động kỳ ảo, viếng chùa Bái Đính và ngắm toàn cảnh Tam Cốc từ Hang Múa.",
    city: "Ninh Bình",
    location: "Ninh Bình, Việt Nam",
    destination: "Quần Thể Danh Thắng Tràng An",
    duration: "2 Ngày 1 Đêm",
    durationDays: 2,
    basePrice: 1850000,
    rating: 4.87,
    reviewsCount: 79,
    images: {
      main: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 16, departureDate: "2026-11-21", returnDate: "2026-11-22", price: 1850000, availableSeats: 20, totalSeats: 35 },
      { id: 17, departureDate: "2026-12-05", returnDate: "2026-12-06", price: 1850000, availableSeats: 24, totalSeats: 35 },
      { id: 18, departureDate: "2026-12-19", returnDate: "2026-12-20", price: 1950000, availableSeats: 28, totalSeats: 35 },
    ],
    hotelOption: {
      hotelId: 6,
      hotelName: "Emeralda Resort Ninh Bình",
      stars: 5,
      isOfficialPartner: true,
      address: "Khu bảo tồn Vân Long, Gia Vân, Gia Viễn, Ninh Bình",
      rooms: [
        { id: 11, name: "Superior Double Garden View", available: 12, surcharge: 850000 },
        { id: 12, name: "Deluxe Heritage Pool Access", available: 5, surcharge: 1500000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Hà Nội - Cố Đô Hoa Lư - Thuyền nan Tràng An Bái Đính", detail: "Viếng đền Vua Đinh, Vua Lê. Ngồi thuyền nan len lỏi qua 12 hang động nước lung linh của Tràng An." },
      { day: 2, code: "N2", title: "Chinh phục Hang Múa - Đầm sen Vân Long - Hà Nội", detail: "Leo gần 500 bậc đá lên đỉnh Ngọa Long ngắm toàn cảnh Tam Cốc ngoạn mục, thưởng thức đặc sản dê núi cơm cháy." },
    ]
  },
  {
    id: 7,
    code: "ST-0007",
    name: "Cố Đô Huế Cổ Kính - Đại Nội Hoàng Thành - Nghe Ca Huế Sông Hương",
    description: "Tham quan di tích Đại Nội triều Nguyễn, chùa Thiên Mụ, lăng Khải Định và thưởng thức bữa tối ẩm thực cung đình trên thuyền rồng.",
    city: "Thừa Thiên Huế",
    location: "TP. Huế, Việt Nam",
    destination: "Cố Đô Huế Di Sản",
    duration: "3 Ngày 2 Đêm",
    durationDays: 3,
    basePrice: 2900000,
    rating: 4.89,
    reviewsCount: 65,
    images: {
      main: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 19, departureDate: "2026-11-27", returnDate: "2026-11-29", price: 2900000, availableSeats: 14, totalSeats: 25 },
      { id: 20, departureDate: "2026-12-11", returnDate: "2026-12-13", price: 3000000, availableSeats: 17, totalSeats: 25 },
      { id: 21, departureDate: "2027-01-08", returnDate: "2027-01-10", price: 3150000, availableSeats: 22, totalSeats: 25 },
    ],
    hotelOption: {
      hotelId: 7,
      hotelName: "Silk Path Grand Hue Hotel & Spa",
      stars: 5,
      isOfficialPartner: true,
      address: "2 Lê Lợi, Phường Vĩnh Ninh, TP. Huế",
      rooms: [
        { id: 13, name: "Classic River View", available: 8, surcharge: 950000 },
        { id: 14, name: "Imperial Suite King", available: 3, surcharge: 1800000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Đón sân bay Phú Bài - Đại Nội Kinh Thành Huế", detail: "Tham quan Ngọ Môn, Điện Thái Hòa, Tử Cấm Thành. Thưởng thức chè hẻm cung đình Huế." },
      { day: 2, code: "N2", title: "Chùa Thiên Mụ - Lăng Khải Định - Ca Huế du thuyền sông Hương", detail: "Đi thuyền rồng viếng Thiên Mụ cổ tự, chiêm ngưỡng lăng Khải Định tinh xảo và nghe ca trù Huế buổi tối." },
      { day: 3, code: "N3", title: "Chợ Đông Ba mua nón bài thơ - Tiễn khách sân bay", detail: "Mua sắm kẹo mè xửng, tôm chua, hạt sen Tịnh Tâm tại chợ Đông Ba danh tiếng." },
    ]
  },
  {
    id: 8,
    code: "ST-0008",
    name: "Quy Nhơn Biển Xanh Cát Trắng - Kỳ Co Eo Gió - Lặn Ngắm San Hô",
    description: "Check-in Eo Gió đón hoàng hôn đẹp nhất Việt Nam, cano sang bãi Kỳ Co tắm biển nước trong vắt và thưởng thức hải sản tươi ngon.",
    city: "Bình Định",
    location: "Quy Nhơn, Bình Định",
    destination: "Quy Nhơn - Kỳ Co Eo Gió",
    duration: "3 Ngày 2 Đêm",
    durationDays: 3,
    basePrice: 3400000,
    rating: 4.91,
    reviewsCount: 73,
    images: {
      main: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 22, departureDate: "2026-12-04", returnDate: "2026-12-06", price: 3400000, availableSeats: 11, totalSeats: 20 },
      { id: 23, departureDate: "2026-12-18", returnDate: "2026-12-20", price: 3550000, availableSeats: 15, totalSeats: 20 },
      { id: 24, departureDate: "2027-01-15", returnDate: "2027-01-17", price: 3700000, availableSeats: 21, totalSeats: 25 },
    ],
    hotelOption: {
      hotelId: 8,
      hotelName: "FLC City Hotel Beach Quy Nhon",
      stars: 5,
      isOfficialPartner: true,
      address: "An Dương Vương, Phường Trần Phú, TP. Quy Nhơn",
      rooms: [
        { id: 15, name: "Deluxe Ocean Twin", available: 7, surcharge: 1100000 },
        { id: 16, name: "Sea View Balcony Suite", available: 2, surcharge: 1900000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Đón sân bay Phù Cát - Tháp Đôi Chăm Pa - Ghềnh Ráng Tiên Sa", detail: "Viếng mộ thi sĩ Hàn Mặc Tử, tắm bãi đá Trứng Hoàng Hậu và thưởng thức bánh xèo tôm nhảy." },
      { day: 2, code: "N2", title: "Cano siêu tốc bãi biển Kỳ Co - Chiêm ngưỡng Eo Gió hùng vĩ", detail: "Tắm biển Kỳ Co với làn nước hai màu kỳ diệu, lặn ngắm rạn san hô Bãi Dứa và dạo bước con đường ven biển Eo Gió." },
      { day: 3, code: "N3", title: "Tượng Phật chùa Ông Núi - Tiễn sân bay", detail: "Chinh phục tượng Phật ngồi cao nhất Đông Nam Á và xe đưa đoàn ra sân bay Phù Cát." },
    ]
  },
  {
    id: 9,
    code: "ST-0009",
    name: "Nha Trang Vịnh Ngọc Biển Xanh - VinWonders - Lặn Biển Hòn Mun",
    description: "Nghỉ dưỡng phố biển, vui chơi bất tận tại đảo Hòn Tre VinWonders, du ngoạn vịnh ngắm rạn san hô rực rỡ tại khu bảo tồn Hòn Mun.",
    city: "Khánh Hòa",
    location: "Nha Trang, Khánh Hòa",
    destination: "Vịnh Nha Trang",
    duration: "4 Ngày 3 Đêm",
    durationDays: 4,
    basePrice: 4500000,
    rating: 4.93,
    reviewsCount: 138,
    images: {
      main: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 25, departureDate: "2026-11-26", returnDate: "2026-11-29", price: 4500000, availableSeats: 18, totalSeats: 30 },
      { id: 26, departureDate: "2026-12-10", returnDate: "2026-12-13", price: 4650000, availableSeats: 13, totalSeats: 30 },
      { id: 27, departureDate: "2027-01-07", returnDate: "2027-01-10", price: 4900000, availableSeats: 24, totalSeats: 30 },
    ],
    hotelOption: {
      hotelId: 9,
      hotelName: "InterContinental Nha Trang",
      stars: 5,
      isOfficialPartner: true,
      address: "32-34 Trần Phú, Lộc Thọ, TP. Nha Trang",
      rooms: [
        { id: 17, name: "Classic Ocean Facing", available: 11, surcharge: 1400000 },
        { id: 18, name: "King Panoramic Suite", available: 4, surcharge: 2500000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Đón sân bay Cam Ranh - Dạo biển Trần Phú - Tháp Bà Ponagar", detail: "Khám phá quần thể đền tháp Chăm Pa cổ kính thế kỷ thứ 8 và ngâm bùn khoáng nóng thư giãn." },
      { day: 2, code: "N2", title: "Du thuyền khám phá Vịnh Nha Trang - Lặn biển Hòn Mun", detail: "Đi cano cao tốc lặn ngắm san hô tại Hòn Mun, tiệc bar nổi trên biển và chèo SUP tại Bãi Tranh." },
      { day: 3, code: "N3", title: "Oanh tạc thế giới giải trí VinWonders Hòn Tre", detail: "Trải nghiệm cáp treo vượt biển, công viên nước hàng đầu châu Á và thưởng thức show diễn thực cảnh Tata Show." },
      { day: 4, code: "N4", title: "Chợ Đầm mua hải sản khô - Tiễn sân bay", detail: "Mua mực một nắng, yến sào Khánh Hòa làm quà và làm thủ tục bay về." },
    ]
  },
  {
    id: 10,
    code: "ST-0010",
    name: "Đà Lạt Ngàn Hoa Mộng Mơ - Hồ Tuyền Lâm - Đồi Chè Cầu Đất",
    description: "Khám phá thành phố sương mù, săn mây đồi chè Cầu Đất, dạo chơi vườn hoa cẩm tú cầu và cắm trại ngắm sao bên hồ Tuyền Lâm.",
    city: "Lâm Đồng",
    location: "Đà Lạt, Lâm Đồng",
    destination: "Đà Lạt Thành Phố Ngàn Hoa",
    duration: "3 Ngày 2 Đêm",
    durationDays: 3,
    basePrice: 2800000,
    rating: 4.9,
    reviewsCount: 156,
    images: {
      main: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 28, departureDate: "2026-12-02", returnDate: "2026-12-04", price: 2800000, availableSeats: 12, totalSeats: 25 },
      { id: 29, departureDate: "2026-12-16", returnDate: "2026-12-18", price: 2950000, availableSeats: 16, totalSeats: 25 },
      { id: 30, departureDate: "2026-12-30", returnDate: "2027-01-01", price: 3400000, availableSeats: 20, totalSeats: 30 },
    ],
    hotelOption: {
      hotelId: 10,
      hotelName: "Dalat Edensee Lake Resort & Spa",
      stars: 5,
      isOfficialPartner: true,
      address: "Khu du lịch Hồ Tuyền Lâm, Phường 4, TP. Đà Lạt",
      rooms: [
        { id: 19, name: "Mimosa Deluxe Pine Forest", available: 8, surcharge: 1150000 },
        { id: 20, name: "Jasmine Lake View Villa", available: 3, surcharge: 2200000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Đón sân bay Liên Khương - Quảng trường Lâm Viên - Hồ Xuân Hương", detail: "Check-in nụ hoa Atiso khổng lồ, đạp xe quanh hồ Xuân Hương và dạo chợ đêm ăn bánh tráng nướng." },
      { day: 2, code: "N2", title: "Săn mây Cầu Đất - Thiền Viện Trúc Lâm - Thác Datanla", detail: "Dậy sớm đón bình minh biển mây Cầu Đất, đi máng trượt xuyên rừng thông Datanla kỳ thú." },
      { day: 3, code: "N3", title: "Vườn dâu tây công nghệ cao - Nhà ga xe lửa cổ - Tiễn bay", detail: "Tự tay hái dâu tây chín mọng, check-in đầu máy xe lửa hơi nước cổ nhất Đông Dương." },
    ]
  },
  {
    id: 11,
    code: "ST-0011",
    name: "Văn Hóa Sông Nước Miền Tây - Chợ Nổi Cái Răng Cần Thơ",
    description: "Trải nghiệm chợ nổi lúc sáng sớm, ghé thăm vườn trái cây trĩu quả miệt vườn và thưởng thức đờn ca tài tử Nam Bộ.",
    city: "Cần Thơ",
    location: "Cần Thơ, Miền Tây",
    destination: "Thủ Phủ Miền Tây Cần Thơ",
    duration: "2 Ngày 1 Đêm",
    durationDays: 2,
    basePrice: 1650000,
    rating: 4.85,
    reviewsCount: 52,
    images: {
      main: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 31, departureDate: "2026-11-28", returnDate: "2026-11-29", price: 1650000, availableSeats: 19, totalSeats: 30 },
      { id: 32, departureDate: "2026-12-12", returnDate: "2026-12-13", price: 1700000, availableSeats: 22, totalSeats: 30 },
      { id: 33, departureDate: "2027-01-09", returnDate: "2027-01-10", price: 1800000, availableSeats: 26, totalSeats: 30 },
    ],
    hotelOption: {
      hotelId: 11,
      hotelName: "Victoria Can Tho Resort",
      stars: 5,
      isOfficialPartner: true,
      address: "Cồn Cái Khế, Phường Cái Khế, Ninh Kiều, Cần Thơ",
      rooms: [
        { id: 21, name: "Superior River Garden", available: 10, surcharge: 800000 },
        { id: 22, name: "Deluxe Song Hau Suite", available: 4, surcharge: 1400000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "TP.HCM - Bến Ninh Kiều Cần Thơ - Nhà cổ Bình Thủy", detail: "Khởi hành miền Tây, chiêm ngưỡng nhà cổ Bình Thủy trứ danh bối cảnh phim L'Amant." },
      { day: 2, code: "N2", title: "Đi thuyền khám phá Chợ Nổi Cái Răng - Vườn trái cây Mỹ Khánh", detail: "Ăn hủ tiếu tô trên ghe nổi, thưởng thức trái cây miệt vườn và đờn ca tài tử trước khi về lại Sài Gòn." },
    ]
  },
  {
    id: 12,
    code: "ST-0012",
    name: "Thảo Nguyên Mộc Châu Xanh Ngát - Đồi Chè Trái Tim - Thác Dải Yếm",
    description: "Tận hưởng không khí trong lành miền thảo nguyên, hái dâu tây nông trại, ngắm mùa hoa cải trắng và check-in Cầu kính Tình Yêu.",
    city: "Sơn La",
    location: "Mộc Châu, Sơn La",
    destination: "Cao Nguyên Mộc Châu",
    duration: "2 Ngày 1 Đêm",
    durationDays: 2,
    basePrice: 1750000,
    rating: 4.86,
    reviewsCount: 48,
    images: {
      main: "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 34, departureDate: "2026-11-21", returnDate: "2026-11-22", price: 1750000, availableSeats: 15, totalSeats: 30 },
      { id: 35, departureDate: "2026-12-05", returnDate: "2026-12-06", price: 1850000, availableSeats: 17, totalSeats: 30 },
      { id: 36, departureDate: "2026-12-19", returnDate: "2026-12-20", price: 1950000, availableSeats: 25, totalSeats: 30 },
    ],
    hotelOption: {
      hotelId: 12,
      hotelName: "Mường Thanh Luxury Mộc Châu",
      stars: 5,
      isOfficialPartner: true,
      address: "Tiểu khu Bó Bun, TT. Nông Trường Mộc Châu, Sơn La",
      rooms: [
        { id: 23, name: "Deluxe Valley King", available: 9, surcharge: 750000 },
        { id: 24, name: "Executive Suite", available: 3, surcharge: 1350000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Hà Nội - Đèo Thung Khe mây phủ - Rừng thông Bản Áng", detail: "Ăn ngô nướng đèo Thung Khe, đạp xe ngắm hoa tam giác mạch và cắm trại rừng thông." },
      { day: 2, code: "N2", title: "Đồi chè Trái Tim - Cầu kính Bạch Long - Về Hà Nội", detail: "Chụp ảnh đồi chè ô long xanh ngắt, thử thách lòng dũng cảm trên cầu kính đi bộ dài nhất thế giới." },
    ]
  },
  {
    id: 13,
    code: "ST-0013",
    name: "Côn Đảo Tâm Linh Hào Khí - Bãi Đầm Trầu - Viếng Mộ Cô Sáu",
    description: "Hành trình ý nghĩa về nguồn tại nghĩa trang Hàng Dương, khám phá nhà tù Côn Đảo và thư giãn tại bãi biển Đầm Trầu cát vàng mịn.",
    city: "Bà Rịa - Vũng Tàu",
    location: "Côn Đảo, Bà Rịa - Vũng Tàu",
    destination: "Côn Đảo Hùng Thiêng",
    duration: "3 Ngày 2 Đêm",
    durationDays: 3,
    basePrice: 5600000,
    rating: 4.97,
    reviewsCount: 167,
    images: {
      main: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 37, departureDate: "2026-12-04", returnDate: "2026-12-06", price: 5600000, availableSeats: 8, totalSeats: 20 },
      { id: 38, departureDate: "2026-12-18", returnDate: "2026-12-20", price: 5800000, availableSeats: 12, totalSeats: 20 },
      { id: 39, departureDate: "2027-01-15", returnDate: "2027-01-17", price: 6200000, availableSeats: 16, totalSeats: 20 },
    ],
    hotelOption: {
      hotelId: 13,
      hotelName: "Six Senses Côn Đảo",
      stars: 5,
      isOfficialPartner: true,
      address: "Bãi Đất Dốc, Thị trấn Côn Đảo, Bà Rịa - Vũng Tàu",
      rooms: [
        { id: 25, name: "Ocean View Pool Villa", available: 4, surcharge: 2800000 },
        { id: 26, name: "Ocean Front Multi-level Villa", available: 1, surcharge: 4500000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Bay đến Côn Đảo - Bãi Đầm Trầu ngắm máy bay hạ cánh", detail: "Tắm biển bãi Đầm Trầu nước trong vắt, buổi đêm dâng hương tưởng niệm các anh hùng tại Nghĩa trang Hàng Dương và mộ Cô Sáu." },
      { day: 2, code: "N2", title: "Hệ thống nhà tù Côn Đảo - Chuồng cọp Pháp Mỹ - Miếu Bà Phi Yến", detail: "Thăm di tích lịch sử địa ngục trần gian và viếng chùa Núi Một ngắm vịnh Côn Sơn từ trên cao." },
      { day: 3, code: "N3", title: "Hòn Bảy Cạnh xem rùa biển - Mua mứt hạt bàng - Tiễn bay", detail: "Trải nghiệm thiên nhiên bảo tồn biển hoang sơ trước khi đáp chuyến bay về." },
    ]
  },
  {
    id: 14,
    code: "ST-0014",
    name: "Vương Quốc Hang Động Quảng Bình - Động Thiên Đường - Suối Nước Moọc",
    description: "Chiêm ngưỡng thạch nhũ lung linh kỳ vĩ trong lòng Động Thiên Đường và hòa mình vào làn nước xanh ngọc bích tại suối Moọc.",
    city: "Quảng Bình",
    location: "Đồng Hới, Quảng Bình",
    destination: "Vương Quốc Hang Động Phong Nha",
    duration: "3 Ngày 2 Đêm",
    durationDays: 3,
    basePrice: 3200000,
    rating: 4.9,
    reviewsCount: 71,
    images: {
      main: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 40, departureDate: "2026-11-27", returnDate: "2026-11-29", price: 3200000, availableSeats: 14, totalSeats: 25 },
      { id: 41, departureDate: "2026-12-11", returnDate: "2026-12-13", price: 3350000, availableSeats: 19, totalSeats: 25 },
      { id: 42, departureDate: "2027-01-08", returnDate: "2027-01-10", price: 3500000, availableSeats: 21, totalSeats: 25 },
    ],
    hotelOption: {
      hotelId: 14,
      hotelName: "Sun Spa Resort Quảng Bình",
      stars: 5,
      isOfficialPartner: true,
      address: "Mỹ Cảnh, Bảo Ninh, TP. Đồng Hới, Quảng Bình",
      rooms: [
        { id: 27, name: "Superior Garden View", available: 8, surcharge: 950000 },
        { id: 28, name: "Ocean Pool Villa", available: 3, surcharge: 1850000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Đón ga/sân bay Đồng Hới - Đồi cát Quang Phú", detail: "Trượt cát trên đồi cát trắng ven biển và dạo biển Nhật Lệ thơ mộng." },
      { day: 2, code: "N2", title: "Hoàng cung trong lòng đất Động Thiên Đường - Chèo kayak Suối Moọc", detail: "Đi cầu gỗ xuyên lòng động chiêm ngưỡng cung thạch nhũ hàng triệu năm tuổi và tắm suối mát lạnh." },
      { day: 3, code: "N3", title: "Động Phong Nha bằng thuyền máy - Tiễn khách", detail: "Ngồi thuyền ngược sông Son vào cửa hang Phong Nha lung linh ánh sáng kỳ ảo." },
    ]
  },
  {
    id: 15,
    code: "ST-0015",
    name: "Mù Cang Chải Mùa Lúa Chín - Ruộng Bậc Thang La Pán Tẩn",
    description: "Chinh phục đèo Khau Phạ hiểm trở, săn ảnh đồi mâm xôi vàng óng mùa gặt và giao lưu văn hóa dân tộc H'Mông mến khách.",
    city: "Yên Bái",
    location: "Mù Cang Chải, Yên Bái",
    destination: "Mù Cang Chải Mùa Vàng",
    duration: "3 Ngày 2 Đêm",
    durationDays: 3,
    basePrice: 2650000,
    rating: 4.94,
    reviewsCount: 88,
    images: {
      main: "https://images.unsplash.com/photo-1608659597669-b45511779f93?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 43, departureDate: "2026-12-04", returnDate: "2026-12-06", price: 2650000, availableSeats: 10, totalSeats: 20 },
      { id: 44, departureDate: "2026-12-18", returnDate: "2026-12-20", price: 2750000, availableSeats: 14, totalSeats: 20 },
      { id: 45, departureDate: "2027-01-15", returnDate: "2027-01-17", price: 2900000, availableSeats: 17, totalSeats: 20 },
    ],
    hotelOption: {
      hotelId: 15,
      hotelName: "Mu Cang Chai Eco Lodge",
      stars: 4,
      isOfficialPartner: true,
      address: "Bản Hua Khắt, Xã Nậm Khắt, Mù Cang Chải, Yên Bái",
      rooms: [
        { id: 29, name: "Bungalow Ban Công Thung Lũng", available: 6, surcharge: 750000 },
        { id: 30, name: "Family Suite Panorama", available: 2, surcharge: 1300000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Hà Nội - Đèo Ách - Thung lũng Tú Lệ nếp thơm", detail: "Thưởng thức cốm Tú Lệ ngọt ngào, tắm suối khoáng nóng bản Chao." },
      { day: 2, code: "N2", title: "Chinh phục Đèo Khau Phạ - Đồi Mâm Xôi La Pán Tẩn", detail: "Điểm bay dù lượn Khau Phạ, xe ôm bản địa đưa lên ngọn đồi mâm xôi biểu tượng." },
      { day: 3, code: "N3", title: "Rừng trúc Mù Cang Chải - Khởi hành về Hà Nội", detail: "Chụp ảnh rừng trúc xanh mướt như phim kiếm hiệp trước khi khởi hành trở về." },
    ]
  },
  {
    id: 16,
    code: "ST-0016",
    name: "Huyền Thoại Đại Ngàn Đắk Lắk - Thác Dray Nur - Buôn Đôn Cổ Kính",
    description: "Chiêm ngưỡng thác nước hùng vĩ nhất Tây Nguyên Dray Nur, cưỡi thuyền độc mộc hồ Lắk và tìm hiểu phong tục nhà dài Ê Đê.",
    city: "Đắk Lắk",
    location: "Buôn Ma Thuột, Đắk Lắk",
    destination: "Tây Nguyên Huyền Thoại",
    duration: "3 Ngày 2 Đêm",
    durationDays: 3,
    basePrice: 2900000,
    rating: 4.88,
    reviewsCount: 57,
    images: {
      main: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 46, departureDate: "2026-11-27", returnDate: "2026-11-29", price: 2900000, availableSeats: 15, totalSeats: 25 },
      { id: 47, departureDate: "2026-12-11", returnDate: "2026-12-13", price: 3050000, availableSeats: 18, totalSeats: 25 },
      { id: 48, departureDate: "2027-01-08", returnDate: "2027-01-10", price: 3200000, availableSeats: 23, totalSeats: 25 },
    ],
    hotelOption: {
      hotelId: 16,
      hotelName: "Coffee Tour Resort Buôn Ma Thuột",
      stars: 4,
      isOfficialPartner: true,
      address: "56-58 Nguyễn Chí Thanh, Tân An, TP. Buôn Ma Thuột",
      rooms: [
        { id: 31, name: "Traditional Chalet King", available: 8, surcharge: 800000 },
        { id: 32, name: "Highlands Garden Suite", available: 3, surcharge: 1400000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Đón sân bay Buôn Ma Thuột - Bảo tàng Thế giới Cà phê", detail: "Check-in bảo tàng cà phê kiến trúc nhà dài cách điệu, thưởng thức ly espresso Ban Mê đậm đà." },
      { day: 2, code: "N2", title: "Thác Dray Nur cuồn cuộn - Bản Đôn cầu treo vượt sông Sêrêpôk", detail: "Chiêm ngưỡng thác nước hùng vĩ, thăm nhà cổ Vua Voi và đi cầu treo tre dài nhất Tây Nguyên." },
      { day: 3, code: "N3", title: "Chèo thuyền độc mộc Hồ Lắk - Tiễn sân bay", detail: "Ngắm bình minh thơ mộng trên hồ Lắk, ghé buôn Jun tìm hiểu văn hóa cồng chiêng." },
    ]
  },
  {
    id: 17,
    code: "ST-0017",
    name: "Đảo Ngọc Cát Bà - Vịnh Lan Hạ Hoang Sơ - Vườn Quốc Gia Cát Bà",
    description: "Du ngoạn vịnh Lan Hạ êm đềm, chèo kayak qua hang Sáng Tối, tắm biển Ba Trái Đào và trekking rừng kim giao vườn quốc gia.",
    city: "Hải Phòng",
    location: "Cát Bà, Hải Phòng",
    destination: "Đảo Cát Bà & Vịnh Lan Hạ",
    duration: "2 Ngày 1 Đêm",
    durationDays: 2,
    basePrice: 2200000,
    rating: 4.89,
    reviewsCount: 94,
    images: {
      main: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80",
      sub1: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80",
      sub2: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    },
    departures: [
      { id: 49, departureDate: "2026-11-21", returnDate: "2026-11-22", price: 2200000, availableSeats: 17, totalSeats: 30 },
      { id: 50, departureDate: "2026-12-05", returnDate: "2026-12-06", price: 2300000, availableSeats: 21, totalSeats: 30 },
      { id: 51, departureDate: "2026-12-19", returnDate: "2026-12-20", price: 2450000, availableSeats: 25, totalSeats: 30 },
    ],
    hotelOption: {
      hotelId: 17,
      hotelName: "Flamingo Cát Bà Beach Resort",
      stars: 5,
      isOfficialPartner: true,
      address: "Bãi tắm Cát Cò 1 & 2, Thị trấn Cát Bà, Hải Phòng",
      rooms: [
        { id: 33, name: "Premier Mountain Cliff", available: 11, surcharge: 1100000 },
        { id: 34, name: "Deluxe Lan Ha Bay Facing", available: 4, surcharge: 1750000 },
      ]
    },
    itinerary: [
      { day: 1, code: "N1", title: "Hà Nội/Hải Phòng - Cáp treo Cát Hải - Du thuyền vịnh Lan Hạ", detail: "Trải nghiệm cáp treo vượt biển, du thuyền đưa khách ngắm làng chài Cái Bèo cổ kính và tắm biển Ba Trái Đào." },
      { day: 2, code: "N2", title: "Chèo kayak Hang Sáng Tối - Vườn Quốc Gia Cát Bà - Trở về", detail: "Chèo kayak luồn qua vòm hang nước ngập, check-in rừng kim giao Đỉnh Ngự Lâm trước khi về." },
    ]
  }
];

export const TourDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuthWallet();

  const tourIdNumber = Number(id) || 1;
  const tour = useMemo(() => {
    return RICH_TOURS_DATA.find((t) => t.id === tourIdNumber) || RICH_TOURS_DATA[0];
  }, [tourIdNumber]);

  // Selected departure (default to first)
  const [selectedDeparture, setSelectedDeparture] = useState(() => tour.departures?.[0] || null);

  // Hotel option & Selected room
  const [includeHotel, setIncludeHotel] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(() => tour.hotelOption?.rooms?.[0] || null);

  // Guests quantity stepper
  const [guestsCount, setGuestsCount] = useState(1);

  // Accordion active day
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Liked state
  const [isLiked, setIsLiked] = useState(false);

  // Sync state when tour changes
  useEffect(() => {
    if (tour) {
      setSelectedDeparture(tour.departures?.[0] || null);
      setSelectedRoom(tour.hotelOption?.rooms?.[0] || null);
      setIncludeHotel(Boolean(tour.hotelOption));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [tour]);

  const formatVND = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount || 0) + " đ";
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const dayNames = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        const dayOfWeek = dayNames[d.getDay()] || "Thứ";
        return `${dayOfWeek}, ${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch {
      // fallback
    }
    return dateStr;
  };

  const formatSimpleDate = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
      return `${days[d.getDay()]}, ${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Price calculations
  const unitTourPrice = selectedDeparture?.price || tour.basePrice;
  const tourSubtotal = unitTourPrice * guestsCount;
  const hotelSurcharge = (includeHotel && selectedRoom) ? (selectedRoom.surcharge || 0) : 0;
  const grandTotal = tourSubtotal + hotelSurcharge;

  // Handle proceed to checkout
  const handleProceedCheckout = () => {
    const params = new URLSearchParams({
      tourId: String(tour.id),
      tourName: tour.name,
      departureId: String(selectedDeparture?.id || 1),
      departureDate: selectedDeparture?.departureDate || "2026-12-01",
      unitPrice: String(unitTourPrice),
      quantity: String(guestsCount),
      hasHotel: includeHotel && selectedRoom ? "true" : "false",
      hotelId: String(tour.hotelOption?.hotelId || 1),
      hotelName: tour.hotelOption?.hotelName || "",
      roomTypeId: String(selectedRoom?.id || 1),
      roomName: selectedRoom?.name || "",
      hotelPrice: String(hotelSurcharge),
    });

    navigate(`/checkout?${params.toString()}`, {
      state: {
        tour,
        selectedDeparture,
        includeHotel: includeHotel && !!selectedRoom,
        selectedRoom,
        guestsCount,
        grandTotal,
      }
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Top Banner Container matching user screenshots */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3">
        {/* Breadcrumb Back Link */}
        <Link 
          to="/tours" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách tour
        </Link>

        {/* Tour Meta Info & Action Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              {tour.location}
            </span>
            <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {tour.rating}
              <span className="text-slate-500 font-normal">({tour.reviewsCount} đánh giá)</span>
            </span>
            <span className="text-slate-400">• Mã tour: <strong className="text-slate-700 font-mono font-medium">{tour.code}</strong></span>
          </div>

          {/* Social Share & Wishlist Heart */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button 
              type="button"
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  showToast?.("Đã sao chép liên kết tour vào bộ nhớ tạm!", "success");
                }
              }}
              className="p-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-sky-600 shadow-xs transition-colors"
              title="Chia sẻ tour"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              type="button"
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2.5 rounded-full border shadow-xs transition-colors ${
                isLiked 
                  ? "bg-rose-50 border-rose-200 text-rose-600" 
                  : "bg-white border-slate-200 text-slate-600 hover:text-rose-500 hover:bg-rose-50"
              }`}
              title="Lưu vào danh sách yêu thích"
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Tour Title (Large Bold H1) */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug mb-6">
          {tour.name}
        </h1>

        {/* 3-Image Gallery Layout (Matching Image 1) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden shadow-sm mb-8">
          {/* Main Large Image (2 columns on md) */}
          <div className="md:col-span-2 h-[260px] sm:h-[360px] md:h-[420px] relative overflow-hidden bg-slate-100 group">
            <img 
              src={tour.images.main} 
              alt={tour.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* 2 Sub Images Stacked Vertically */}
          <div className="hidden md:flex flex-col gap-3 h-[420px]">
            <div className="h-1/2 overflow-hidden bg-slate-100 group relative">
              <img 
                src={tour.images.sub1} 
                alt={`${tour.name} cảnh đẹp 1`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            <div className="h-1/2 overflow-hidden bg-slate-100 group relative">
              <img 
                src={tour.images.sub2} 
                alt={`${tour.name} cảnh đẹp 2`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid: 2 Columns (Matching Image 2) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT COLUMN: Departures, Hotel Add-on, Itinerary */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Danh sách ngày khởi hành */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" />
                Chọn Ngày Khởi Hành Phù Hợp
              </h2>
              
              <div className="space-y-3">
                {tour.departures.map((dep) => {
                  const isSelected = selectedDeparture?.id === dep.id;
                  return (
                    <div 
                      key={dep.id}
                      onClick={() => setSelectedDeparture(dep)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected 
                          ? "border-sky-500 bg-sky-50/40 ring-1 ring-sky-500 shadow-xs" 
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      {/* Left: Radio & Dates */}
                      <div className="flex items-center gap-3.5">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? "border-sky-600 bg-sky-600" : "border-slate-300 bg-white"
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm sm:text-base">
                            <span>{formatSimpleDate(dep.departureDate)}</span>
                            <span className="text-slate-400 font-normal">→</span>
                            <span className="text-slate-600 font-normal">{formatSimpleDate(dep.returnDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Available Seats & Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 pl-8 sm:pl-0">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          🌿 Còn {dep.availableSeats} / {dep.totalSeats} chỗ
                        </span>
                        <span className="text-base font-extrabold text-sky-600 whitespace-nowrap">
                          {formatVND(dep.price)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Tùy Chọn Khách Sạn & Resort Đi Kèm (Tùy Chọn) */}
            {tour.hotelOption && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <HotelIcon className="w-5 h-5 text-sky-600" />
                      Tùy Chọn Khách Sạn & Resort Đi Kèm (Tùy Chọn)
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Nâng cấp kỳ nghỉ với gói phòng khách sạn 4-5 sao liên kết giá ưu đãi độc quyền.
                    </p>
                  </div>
                  {/* Toggle Include Hotel */}
                  <button 
                    type="button"
                    onClick={() => {
                      if (includeHotel) {
                        setIncludeHotel(false);
                      } else {
                        setIncludeHotel(true);
                        if (!selectedRoom && tour.hotelOption.rooms?.[0]) {
                          setSelectedRoom(tour.hotelOption.rooms[0]);
                        }
                      }
                    }}
                    className={`self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                      includeHotel 
                        ? "bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100" 
                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {includeHotel ? "✓ Đang áp dụng" : "+ Chọn gói phòng"}
                  </button>
                </div>

                {includeHotel ? (
                  <div className="space-y-4 pt-1">
                    {/* Hotel Header Info */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                            {tour.hotelOption.hotelName}
                          </h3>
                          <div className="flex text-amber-400">
                            {Array.from({ length: tour.hotelOption.stars || 5 }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {tour.hotelOption.address}
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                        Đối tác lưu trú chính thức
                      </span>
                    </div>

                    {/* Room Options Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {tour.hotelOption.rooms.map((room) => {
                        const isRoomSelected = selectedRoom?.id === room.id;
                        return (
                          <div 
                            key={room.id}
                            onClick={() => setSelectedRoom(room)}
                            className={`cursor-pointer p-4 rounded-xl border transition-all ${
                              isRoomSelected
                                ? "border-sky-500 bg-sky-50/40 ring-1 ring-sky-500 shadow-xs"
                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <h4 className="font-bold text-sm text-slate-800 line-clamp-1">
                                {room.name}
                              </h4>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isRoomSelected ? "border-sky-600 bg-sky-600" : "border-slate-300"
                              }`}>
                                {isRoomSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 mb-2.5">
                              Còn {room.available} phòng trống
                            </p>

                            <div className="text-xs font-bold text-sky-600 pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span>Phụ thu:</span>
                              <span className="text-sm font-extrabold text-sky-700">
                                +{formatVND(room.surcharge)} / đêm
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs text-center border border-dashed border-slate-200">
                    Bạn chưa chọn gói phòng khách sạn liên kết. Nhấn nút <strong>"+ Chọn gói phòng"</strong> ở trên nếu muốn bổ sung chỗ nghỉ 4-5 sao ưu đãi.
                  </div>
                )}
              </div>
            )}

            {/* 3. Lịch Trình Chi Tiết Từng Ngày (Accordion) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-600" />
                  Lịch Trình Chi Tiết Từng Ngày
                </h2>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {tour.durationDays} ngày trải nghiệm
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {tour.itinerary.map((dayItem, idx) => {
                  const isOpen = activeDayIndex === idx;
                  return (
                    <div 
                      key={dayItem.code}
                      className="border border-slate-200 rounded-xl overflow-hidden transition-all bg-white"
                    >
                      <button 
                        type="button"
                        onClick={() => setActiveDayIndex(isOpen ? -1 : idx)}
                        className={`w-full p-4 flex items-center justify-between gap-3 text-left font-semibold transition-colors ${
                          isOpen ? "bg-sky-50/50 text-sky-900" : "hover:bg-slate-50 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {dayItem.code}
                          </span>
                          <span className="text-sm sm:text-base font-bold">
                            {dayItem.title}
                          </span>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-sky-600 shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="p-4 sm:p-5 pt-2 text-sm text-slate-600 leading-relaxed border-t border-sky-100 bg-sky-50/20">
                          {dayItem.detail}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Booking Summary Card (Matching Image 2) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 space-y-6">
              
              {/* Giá tour trọn gói header */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  GIÁ TOUR TRỌN GÓI
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-sky-600 tracking-tight">
                    {formatVND(unitTourPrice)}
                  </span>
                  <span className="text-sm text-slate-500 font-medium">/ khách</span>
                </div>
              </div>

              {/* Box ngày khởi hành đã chọn */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  NGÀY KHỞI HÀNH ĐÃ CHỌN
                </span>
                <div className="font-bold text-slate-800 text-sm pt-0.5">
                  {formatDateDisplay(selectedDeparture?.departureDate)}
                </div>
                <div className="text-xs text-slate-500">
                  Còn {selectedDeparture?.availableSeats || 0} chỗ trống
                </div>
              </div>

              {/* Stepper số lượng khách */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-600" />
                  SỐ LƯỢNG KHÁCH
                </span>
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                  <span className="text-xs sm:text-sm font-medium text-slate-700">
                    Người lớn (từ 12 tuổi):
                  </span>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      disabled={guestsCount <= 1}
                      onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-slate-800 text-sm">
                      {guestsCount}
                    </span>
                    <button 
                      type="button"
                      disabled={guestsCount >= (selectedDeparture?.availableSeats || 10)}
                      onClick={() => setGuestsCount(guestsCount + 1)}
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs pt-1 border-t border-slate-100">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Tiền tour ({guestsCount} khách):</span>
                  <span className="font-semibold text-slate-800">{formatVND(tourSubtotal)}</span>
                </div>
                {includeHotel && selectedRoom && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="line-clamp-1">Phòng {selectedRoom.name}:</span>
                    <span className="font-semibold text-amber-700">+{formatVND(hotelSurcharge)}</span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-800">Tổng thanh toán:</span>
                  <span className="text-2xl font-black text-sky-600 tracking-tight">
                    {formatVND(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Action Button: Tiến Hành Đặt Tour -> */}
              <button 
                type="button"
                onClick={handleProceedCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-200 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
              >
                <span>Tiến Hành Đặt Tour</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>

              {/* Trust & Guarantee Bullets */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-sky-600 font-bold">🛡️</span>
                  <span>Chính sách hoàn tiền 100% trước 7 ngày</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">⚡</span>
                  <span>Xác nhận chỗ tự động qua Saga</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">✔️</span>
                  <span>Bảo hiểm du lịch trọn gói theo chuyến</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;
