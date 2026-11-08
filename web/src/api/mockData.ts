import type { Tour } from '../types/tour';
import type { HotelPackage } from '../types/hotel';

export const MOCK_TOURS: Tour[] = [
  {
    id: 1,
    destinationId: 101,
    destinationName: 'Đà Nẵng & Hội An',
    city: 'Đà Nẵng',
    country: 'Việt Nam',
    title: 'Khám Phá Di Sản Đà Nẵng - Bà Nà Hills - Phố Cổ Hội An',
    description: 'Trải nghiệm cây Cầu Vàng nổi tiếng thế giới, khám phá phố cổ Hội An lung linh đèn lồng và thư giãn bên bãi biển Mỹ Khê xinh đẹp. Tour trọn gói ăn uống, cáp treo và hướng dẫn viên nhiệt tình.',
    durationDays: 4,
    basePrice: 4200000,
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1000&q=80',
    rating: 4.9,
    reviewCount: 128,
    highlights: ['Check-in Cầu Vàng - Bà Nà Hills', 'Thả đèn hoa đăng trên sông Hoài Hội An', 'Thưởng thức ẩm thực miền Trung chuẩn vị'],
    itinerary: [
      { day: 1, title: 'Đón sân bay - Bán đảo Sơn Trà - Bãi biển Mỹ Khê', content: 'Xe đón quý khách tại sân bay Đà Nẵng, viếng chùa Linh Ứng Bãi Bụt và tắm biển Mỹ Khê.' },
      { day: 2, title: 'Bà Nà Hills - Cầu Vàng trên mây', content: 'Khám phá khu du lịch Sun World Bà Nà Hills, check-in Cầu Vàng, làng Pháp và khu vui chơi Fantasy Park.' },
      { day: 3, title: 'Ngũ Hành Sơn - Phố cổ Hội An về đêm', content: 'Khám phá danh thắng Ngũ Hành Sơn, thăm làng đá Non Nước, dạo phố cổ Hội An và thưởng thức cao lầu.' },
      { day: 4, title: 'Chợ Hàn mua sắm đặc sản - Tiễn sân bay', content: 'Mua sắm hải sản khô và quà lưu niệm tại chợ Hàn trước khi ra sân bay Đà Nẵng.' }
    ],
    upcomingDepartures: [
      { id: 201, tourId: 1, departureDate: '2026-12-01', returnDate: '2026-12-04', price: 4200000, totalSeats: 25, availableSeats: 12, status: 'OPEN' },
      { id: 202, tourId: 1, departureDate: '2026-12-15', returnDate: '2026-12-18', price: 4500000, totalSeats: 25, availableSeats: 8, status: 'OPEN' },
      { id: 203, tourId: 1, departureDate: '2027-01-05', returnDate: '2027-01-08', price: 4800000, totalSeats: 30, availableSeats: 25, status: 'OPEN' }
    ]
  },
  {
    id: 2,
    destinationId: 102,
    destinationName: 'Phú Quốc Đảo Ngọc',
    city: 'Phú Quốc',
    country: 'Việt Nam',
    title: 'Nghỉ Dưỡng Thiên Đường Phú Quốc - Grand World - Cáp Treo Hòn Thơm',
    description: 'Tận hưởng kỳ nghỉ trong mơ tại đảo ngọc Phú Quốc với làn nước biển trong vắt như ngọc bích, thưởng ngoạn cáp treo 3 dây vượt biển dài nhất thế giới và vui chơi bất tận tại Grand World.',
    durationDays: 3,
    basePrice: 5500000,
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
    rating: 4.8,
    reviewCount: 95,
    highlights: ['Trải nghiệm cáp treo Hòn Thơm vượt biển', 'Thành phố không ngủ Grand World', 'Lặn ngắm san hô tại quần đảo An Thới'],
    itinerary: [
      { day: 1, title: 'Đón sân bay Phú Quốc - Check-in Sunset Sanato', content: 'Nhận phòng nghỉ ngơi, chiều ngắm hoàng hôn rực rỡ tại bãi biển Sunset Sanato và thưởng thức hải sản đêm.' },
      { day: 2, title: 'Tour cano 4 đảo - Cáp treo Hòn Thơm Sun World', content: 'Cano siêu tốc đưa du khách lặn ngắm san hô tự nhiên, bay trên không trung cùng cáp treo Hòn Thơm.' },
      { day: 3, title: 'Tham quan trại ngọc trai - Dinh Cậu - Tiễn khách', content: 'Khám phá quy trình cấy ngọc trai Phú Quốc, viếng Dinh Cậu cầu may mắn và tiễn sân bay.' }
    ],
    upcomingDepartures: [
      { id: 204, tourId: 2, departureDate: '2026-11-28', returnDate: '2026-11-30', price: 5500000, totalSeats: 20, availableSeats: 4, status: 'OPEN' },
      { id: 205, tourId: 2, departureDate: '2026-12-10', returnDate: '2026-12-12', price: 5500000, totalSeats: 20, availableSeats: 15, status: 'OPEN' }
    ]
  },
  {
    id: 3,
    destinationId: 103,
    destinationName: 'Sapa Nóc Nhà Đông Dương',
    city: 'Sapa',
    country: 'Việt Nam',
    title: 'Chinh Phục Đỉnh Fansipan Huyền Bí - Bản Cát Cát - Thung Lũng Mường Hoa',
    description: 'Hành trình săn mây tuyệt đẹp nơi núi rừng Tây Bắc. Chinh phục đỉnh thiêng Fansipan hùng vĩ 3.143m và trải nghiệm văn hóa thổ cẩm bản địa đặc sắc.',
    durationDays: 3,
    basePrice: 3200000,
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=80',
    rating: 4.7,
    reviewCount: 84,
    highlights: ['Chạm tay vào cột mốc Fansipan 3.143m', 'Ngắm mùa lúa chín/ ruộng bậc thang Mường Hoa', 'Tìm hiểu văn hóa dân tộc tại bản Cát Cát'],
    itinerary: [
      { day: 1, title: 'Hà Nội - Cao tốc Lào Cai - Check-in Sapa', content: 'Xe Limousine đón tại Hà Nội đi Sapa. Chiều dạo quanh Nhà thờ Đá Sapa và hồ trung tâm thơ mộng.' },
      { day: 2, title: 'Cáp treo Fansipan Legend - Bản Cát Cát', content: 'Đi tàu hỏa leo núi Mường Hoa, đi cáp treo lên đỉnh Fansipan. Chiều thăm bản Cát Cát xinh đẹp.' },
      { day: 3, title: 'Đèo Ô Quy Hồ - Cổng Trời - Về lại Hà Nội', content: 'Ngắm nhìn tứ đại đỉnh đèo Ô Quy Hồ hùng vĩ trước khi xe đưa đoàn về điểm hẹn Hà Nội.' }
    ],
    upcomingDepartures: [
      { id: 206, tourId: 3, departureDate: '2026-12-05', returnDate: '2026-12-07', price: 3200000, totalSeats: 25, availableSeats: 18, status: 'OPEN' },
      { id: 207, tourId: 3, departureDate: '2026-12-20', returnDate: '2026-12-22', price: 3400000, totalSeats: 25, availableSeats: 2, status: 'OPEN' }
    ]
  },
  {
    id: 4,
    destinationId: 104,
    destinationName: 'Vịnh Hạ Long Kỳ Quan',
    city: 'Quảng Ninh',
    country: 'Việt Nam',
    title: 'Du Thuyền 5 Sao Vịnh Hạ Long - Hang Sửng Sốt - Đảo Ti Tốp',
    description: 'Thưởng ngoạn kỳ quan thiên nhiên thế giới trên du thuyền đẳng cấp sang trọng. Bơi lội tại đảo Ti Tốp, chèo thuyền kayak qua hang Luồn và ngắm hoàng hôn huyền ảo trên vịnh.',
    durationDays: 2,
    basePrice: 3900000,
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    rating: 4.9,
    reviewCount: 160,
    highlights: ['Trải nghiệm ngủ đêm trên vịnh Hạ Long', 'Tiệc Sunset Party trên Sundeck du thuyền', 'Chèo Kayak khám phá hang động tự nhiên'],
    itinerary: [
      { day: 1, title: 'Cảng Tuần Châu - Thăm Hang Sửng Sốt - Sunset Party', content: 'Lên tàu thưởng thức bữa trưa buffet, tham quan hang Sửng Sốt và ngắm hoàng hôn lãng mạn.' },
      { day: 2, title: 'Tập Thái Cực Quyền buổi sáng - Đảo Ti Tốp - Cảng Tuần Châu', content: 'Đón bình minh trong lành, tắm biển và leo đỉnh Ti Tốp ngắm toàn cảnh Vịnh Hạ Long.' }
    ],
    upcomingDepartures: [
      { id: 208, tourId: 4, departureDate: '2026-12-02', returnDate: '2026-12-03', price: 3900000, totalSeats: 20, availableSeats: 10, status: 'OPEN' },
      { id: 209, tourId: 4, departureDate: '2026-12-16', returnDate: '2026-12-17', price: 4100000, totalSeats: 20, availableSeats: 6, status: 'OPEN' }
    ]
  },
  {
    id: 5,
    destinationId: 105,
    destinationName: 'Nha Trang Biển Xanh',
    city: 'Nha Trang',
    country: 'Việt Nam',
    title: 'Tour Biển Đảo Nha Trang - VinWonders - Lặn Biển Hòn Mun',
    description: 'Hòa mình vào thiên đường biển nhiệt đới với rạn san hô rực rỡ sắc màu tại Hòn Mun và khám phá công viên giải trí kỷ lục VinWonders Nha Trang.',
    durationDays: 4,
    basePrice: 4600000,
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    rating: 4.8,
    reviewCount: 78,
    highlights: ['Lặn biển ngắm san hô khu bảo tồn Hòn Mun', 'Vui chơi giải trí thả ga tại VinWonders', 'Thưởng thức tiệc hải sản tươi sống trên bè'],
    itinerary: [
      { day: 1, title: 'Đón sân bay Cam Ranh - Nhận phòng khách sạn', content: 'Xe đón quý khách về trung tâm thành phố, tắm biển Trần Phú và dạo chợ đêm Nha Trang.' },
      { day: 2, title: 'Khám phá 3 đảo VIP - Lặn ngắm san hô', content: 'Cano cao tốc đưa đoàn đến Hòn Mun, bãi Tranh và thưởng thức bữa trưa hải sản trên làng chài.' },
      { day: 3, title: 'Oanh tạc công viên giải trí VinWonders', content: 'Trải nghiệm vòng quay mặt trời, thủy cung và show biểu diễn Tata Show hoành tráng.' },
      { day: 4, title: 'Tắm bùn khoáng nóng Tháp Bà - Tiễn sân bay', content: 'Thư giãn ngâm bùn khoáng tự nhiên phục hồi sức khỏe trước khi ra sân bay.' }
    ],
    upcomingDepartures: [
      { id: 210, tourId: 5, departureDate: '2026-12-08', returnDate: '2026-12-11', price: 4600000, totalSeats: 25, availableSeats: 14, status: 'OPEN' }
    ]
  },
  {
    id: 6,
    destinationId: 106,
    destinationName: 'Hà Giang Cao Nguyên Đá',
    city: 'Hà Giang',
    country: 'Việt Nam',
    title: 'Hành Trình Chinh Phục Cột Cờ Lũng Cú - Đèo Mã Pí Lèng - Sông Nho Quế',
    description: 'Cung đường phượt huyền thoại qua miền đá nở hoa. Chiêm ngưỡng hẻm vực Tu Sản sâu nhất Đông Nam Á và du thuyền êm đềm trên dòng sông Nho Quế xanh ngọc bích.',
    durationDays: 3,
    basePrice: 3500000,
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80',
    rating: 4.9,
    reviewCount: 112,
    highlights: ['Đi thuyền dưới hẻm Tu Sản - Sông Nho Quế', 'Chạm tay vào cờ Tổ quốc tại Lũng Cú', 'Check-in dốc Thẩm Mã uốn lượn ngoạn mục'],
    itinerary: [
      { day: 1, title: 'Hà Nội - Hà Giang - Quản Bạ - Đồng Văn', content: 'Vượt cổng trời Quản Bạ ngắm Núi Đôi Cô Tiên, dạo phố cổ Đồng Văn rực rỡ ánh đèn.' },
      { day: 2, title: 'Cột cờ Lũng Cú - Mã Pí Lèng - Sông Nho Quế', content: 'Chinh phục cột cờ cực Bắc Lũng Cú, vượt đèo Mã Pí Lèng và đi thuyền sông Nho Quế.' },
      { day: 3, title: 'Dinh thự Vua Mèo họ Vương - Về lại Hà Nội', content: 'Thăm dinh thự họ Vương với kiến trúc độc đáo trước khi lên xe về lại thủ đô.' }
    ],
    upcomingDepartures: [
      { id: 211, tourId: 6, departureDate: '2026-12-12', returnDate: '2026-12-14', price: 3500000, totalSeats: 18, availableSeats: 5, status: 'OPEN' }
    ]
  }
];

export const MOCK_DESTINATIONS = [
  { id: 101, name: 'Đà Nẵng', toursCount: 14, imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80' },
  { id: 102, name: 'Phú Quốc', toursCount: 18, imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80' },
  { id: 103, name: 'Sapa', toursCount: 9, imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80' },
  { id: 104, name: 'Hạ Long', toursCount: 12, imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' },
  { id: 105, name: 'Nha Trang', toursCount: 15, imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' },
  { id: 106, name: 'Hà Giang', toursCount: 8, imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80' }
];

export const MOCK_HOTEL_PACKAGES: Record<number, HotelPackage> = {
  1: {
    hotelId: 501,
    hotelName: 'Vinpearl Luxury Đà Nẵng',
    city: 'Đà Nẵng',
    address: 'Đường Trường Sa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng',
    starRating: 5,
    roomTypes: [
      { roomTypeId: 601, roomName: 'Deluxe Hướng Biển (Ocean View)', pricePerNight: 1200000, availableRooms: 8, maxOccupancy: 2 },
      { roomTypeId: 602, roomName: 'Executive Suite Ban Công Riêng', pricePerNight: 2100000, availableRooms: 3, maxOccupancy: 3 }
    ]
  },
  2: {
    hotelId: 502,
    hotelName: 'Novotel Phu Quoc Resort',
    city: 'Phú Quốc',
    address: 'Bãi Trường, Dương Tơ, Phú Quốc',
    starRating: 5,
    roomTypes: [
      { roomTypeId: 603, roomName: 'Superior Hướng Vườn', pricePerNight: 1400000, availableRooms: 10, maxOccupancy: 2 },
      { roomTypeId: 604, roomName: 'Villa Hồ Bơi Riêng (Private Pool)', pricePerNight: 3200000, availableRooms: 2, maxOccupancy: 4 }
    ]
  },
  3: {
    hotelId: 503,
    hotelName: 'Hotel de la Coupole - MGallery Sapa',
    city: 'Sapa',
    address: '01 Hoàng Liên, Sa Pa, Lào Cai',
    starRating: 5,
    roomTypes: [
      { roomTypeId: 605, roomName: 'Classic King Room Sapa View', pricePerNight: 1800000, availableRooms: 6, maxOccupancy: 2 },
      { roomTypeId: 606, roomName: 'Deluxe Suite Ban Công Săn Mây', pricePerNight: 2800000, availableRooms: 4, maxOccupancy: 2 }
    ]
  }
};
