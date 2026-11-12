import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../models/hotel_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/hotel_provider.dart';
import '../../widgets/role_switcher_bottom_sheet.dart';
import '../../widgets/stat_card.dart';

class HotelierDashboardScreen extends StatefulWidget {
  const HotelierDashboardScreen({super.key});

  @override
  State<HotelierDashboardScreen> createState() => _HotelierDashboardScreenState();
}

class _HotelierDashboardScreenState extends State<HotelierDashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<HotelProvider>().loadHotels();
    });
  }

  void _showAddHotelModal(BuildContext context, int managerId) {
    final nameCtrl = TextEditingController();
    final locationCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final roomsCtrl = TextEditingController(text: '50');
    final imageCtrl = TextEditingController(text: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800');
    int starRating = 4;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 24,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Thêm Khách Sạn Mới',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: nameCtrl,
                      decoration: InputDecoration(
                        labelText: 'Tên Khách sạn / Resort',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: locationCtrl,
                      decoration: InputDecoration(
                        labelText: 'Địa điểm / Thành phố (Đà Nẵng, Nha Trang...)',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: priceCtrl,
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              labelText: 'Giá phòng / đêm (VNĐ)',
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            controller: roomsCtrl,
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              labelText: 'Tổng số phòng',
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Text('Xếp hạng sao: ', style: TextStyle(fontWeight: FontWeight.w600)),
                        const SizedBox(width: 8),
                        ...List.generate(5, (index) {
                          final star = index + 1;
                          return IconButton(
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            icon: Icon(
                              star <= starRating ? Icons.star : Icons.star_border,
                              color: Colors.amber,
                              size: 28,
                            ),
                            onPressed: () => setModalState(() => starRating = star),
                          );
                        }),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextField(
                      controller: imageCtrl,
                      decoration: InputDecoration(
                        labelText: 'URL Ảnh bìa (Unsplash)',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.teal,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () async {
                          final name = nameCtrl.text.trim();
                          final loc = locationCtrl.text.trim();
                          final price = double.tryParse(priceCtrl.text.trim().replaceAll(',', '')) ?? 0.0;
                          final rooms = int.tryParse(roomsCtrl.text.trim()) ?? 50;

                          if (name.isNotEmpty && loc.isNotEmpty && price > 0) {
                            final hotel = HotelModel(
                              managerId: managerId,
                              name: name,
                              location: loc,
                              pricePerNight: price,
                              imageUrl: imageCtrl.text.trim(),
                              starRating: starRating,
                              totalRooms: rooms,
                            );

                            final success = await context.read<HotelProvider>().addHotel(hotel);
                            if (ctx.mounted) Navigator.pop(ctx);

                            if (context.mounted && success) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Thêm khách sạn thành công!'),
                                  backgroundColor: Colors.teal,
                                ),
                              );
                            }
                          }
                        },
                        child: const Text('Lưu Khách Sạn', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat('#,###', 'vi_VN');
    final hotelProvider = context.watch<HotelProvider>();
    final user = context.watch<AuthProvider>().currentUser;
    final hotels = hotelProvider.hotels;

    final totalRooms = hotels.fold<int>(0, (sum, h) => sum + h.totalRooms);
    final avgPrice = hotels.isNotEmpty
        ? hotels.fold<double>(0.0, (sum, h) => sum + h.pricePerNight) / hotels.length
        : 0.0;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: 'Quay lại',
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/home');
            }
          },
        ),
        title: const Text('Cổng Khách Sạn', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.swap_horiz_rounded),
            tooltip: 'Đổi vai trò',
            onPressed: () => showRoleSwitcherBottomSheet(context),
          ),
          IconButton(
            icon: const Icon(Icons.home_outlined),
            tooltip: 'Trang chủ Khách hàng',
            onPressed: () => context.go('/home'),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Đăng xuất',
            onPressed: () => showLogoutConfirmDialog(context),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_business),
        label: const Text('Thêm Khách Sạn'),
        onPressed: () => _showAddHotelModal(context, user?.id ?? 3),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async => await hotelProvider.loadHotels(),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Role Banner Card
                Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.teal.shade200),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.teal.withValues(alpha: 0.08),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.teal.shade50,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.hotel_rounded, color: Colors.teal, size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Vai trò: Quản lý Khách sạn (Hotelier)',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F766E)),
                            ),
                            Text(
                              user?.email ?? 'hotelier@smarttrip.com',
                              style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.teal,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          elevation: 0,
                        ),
                        icon: const Icon(Icons.swap_horiz, size: 16),
                        label: const Text('Đổi Role', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        onPressed: () => showRoleSwitcherBottomSheet(context),
                      ),
                    ],
                  ),
                ),

                // KPI Stats Grid
                Row(
                  children: [
                    Expanded(
                      child: StatCard(
                        title: 'Tổng Khách Sạn',
                        value: '${hotels.length}',
                        icon: Icons.hotel,
                        color: Colors.teal,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: StatCard(
                        title: 'Tổng Số Phòng',
                        value: '$totalRooms',
                        icon: Icons.meeting_room,
                        color: Colors.blue,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                StatCard(
                  title: 'Giá Trung Bình / Đêm',
                  value: '${currencyFormat.format(avgPrice)} đ',
                  icon: Icons.price_check,
                  color: Colors.orange,
                ),

                const SizedBox(height: 24),

                // Hotels List Section
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Khách Sạn & Resort (${hotels.length})',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                if (hotelProvider.isLoading)
                  const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator()))
                else if (hotels.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Center(
                      child: Text('Chưa có khách sạn nào. Nhấn "Thêm Khách Sạn" để tạo mới!'),
                    ),
                  )
                else
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: hotels.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 14),
                    itemBuilder: (context, index) {
                      final hotel = hotels[index];
                      return _buildHotelCard(hotel, currencyFormat);
                    },
                  ),
                const SizedBox(height: 80), // Extra space for FAB
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHotelCard(HotelModel hotel, NumberFormat currencyFormat) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
            child: Image.network(
              hotel.imageUrl,
              height: 150,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                height: 150,
                color: Colors.teal.shade50,
                child: const Icon(Icons.hotel, size: 48, color: Colors.teal),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        hotel.name,
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Row(
                      children: List.generate(
                        hotel.starRating,
                        (_) => const Icon(Icons.star, size: 14, color: Colors.amber),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 14, color: Color(0xFF64748B)),
                    const SizedBox(width: 4),
                    Text(hotel.location, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
                    const Spacer(),
                    Text('${hotel.totalRooms} phòng', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                  ],
                ),
                const SizedBox(height: 12),
                const Divider(height: 1),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Giá phòng / đêm', style: TextStyle(fontSize: 12, color: Color(0xFF94A3B8))),
                    Text(
                      '${currencyFormat.format(hotel.pricePerNight)} đ',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.teal),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
