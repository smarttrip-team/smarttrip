import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../models/tour_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/booking_provider.dart';
import '../../providers/tour_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/stat_card.dart';

class OperatorDashboardScreen extends StatefulWidget {
  const OperatorDashboardScreen({super.key});

  @override
  State<OperatorDashboardScreen> createState() => _OperatorDashboardScreenState();
}

class _OperatorDashboardScreenState extends State<OperatorDashboardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = context.read<AuthProvider>().currentUser;
      if (user != null && user.id != null) {
        context.read<TourProvider>().loadTours();
        context.read<BookingProvider>().loadOperatorBookings(user.id!);
      }
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat('#,###', 'vi_VN');
    final authProvider = context.watch<AuthProvider>();
    final tourProvider = context.watch<TourProvider>();
    final bookingProvider = context.watch<BookingProvider>();
    final user = authProvider.currentUser;

    final myTours = tourProvider.tours.where((t) => t.operatorId == user?.id || t.operatorId == 2).toList();
    final myBookings = bookingProvider.operatorBookings;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tour Operator Portal'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => context.push('/profile'),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.primaryColor,
          unselectedLabelColor: Colors.grey,
          indicatorColor: AppTheme.primaryColor,
          tabs: const [
            Tab(icon: Icon(Icons.tour), text: 'Quản Lý Tour (CRUD)'),
            Tab(icon: Icon(Icons.receipt_long), text: 'Khách Đặt Tour'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // TAB 1: QUẢN LÝ TOUR (CRUD)
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // KPI Cards
                Row(
                  children: [
                    Expanded(
                      child: StatCard(
                        title: 'Tổng số Tour',
                        value: '${myTours.length}',
                        icon: Icons.map,
                        color: Colors.blue,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: StatCard(
                        title: 'Lượt khách đặt',
                        value: '${myBookings.length}',
                        icon: Icons.people,
                        color: Colors.green,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Nút Thêm Tour Mới
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Danh sách Tour của bạn',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                    ),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primaryColor,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      ),
                      onPressed: () {
                        context.push('/operator/tour-form');
                      },
                      icon: const Icon(Icons.add, size: 18),
                      label: const Text('Thêm Tour Mới'),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Danh sách Tour
                Expanded(
                  child: myTours.isEmpty
                      ? const Center(child: Text('Bạn chưa có tour nào. Bấm nút Thêm Tour để tạo mới!'))
                      : ListView.builder(
                          itemCount: myTours.length,
                          itemBuilder: (context, index) {
                            final tour = myTours[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                leading: ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: Image.network(
                                    tour.imageUrl,
                                    width: 60,
                                    height: 60,
                                    fit: BoxFit.cover,
                                    errorBuilder: (ctx, err, stack) => Container(
                                      width: 60,
                                      height: 60,
                                      color: Colors.grey[200],
                                      child: const Icon(Icons.image),
                                    ),
                                  ),
                                ),
                                title: Text(
                                  tour.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontWeight: FontWeight.w700),
                                ),
                                subtitle: Text(
                                  '${tour.destination} • ${tour.duration}\n${currencyFormat.format(tour.price)} đ',
                                  style: const TextStyle(height: 1.4),
                                ),
                                isThreeLine: true,
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    // Sửa
                                    IconButton(
                                      icon: const Icon(Icons.edit, color: Colors.blue),
                                      onPressed: () {
                                        context.push('/operator/tour-form', extra: tour);
                                      },
                                    ),
                                    // Xóa
                                    IconButton(
                                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                                      onPressed: () {
                                        showDialog(
                                          context: context,
                                          builder: (ctx) => AlertDialog(
                                            title: const Text('Xác nhận xóa tour'),
                                            content: Text('Bạn có chắc muốn xóa "${tour.title}"?'),
                                            actions: [
                                              TextButton(
                                                onPressed: () => Navigator.pop(ctx),
                                                child: const Text('Hủy'),
                                              ),
                                              TextButton(
                                                onPressed: () async {
                                                  Navigator.pop(ctx);
                                                  await tourProvider.deleteTour(tour.id!);
                                                  if (context.mounted) {
                                                    ScaffoldMessenger.of(context).showSnackBar(
                                                      const SnackBar(content: Text('Đã xóa tour thành công')),
                                                    );
                                                  }
                                                },
                                                child: const Text('Xóa', style: TextStyle(color: Colors.red)),
                                              ),
                                            ],
                                          ),
                                        );
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
          ),

          // TAB 2: KHÁCH ĐẶT TOUR
          Padding(
            padding: const EdgeInsets.all(16),
            child: myBookings.isEmpty
                ? const Center(child: Text('Chưa có khách hàng nào đặt tour của bạn.'))
                : ListView.builder(
                    itemCount: myBookings.length,
                    itemBuilder: (context, index) {
                      final booking = myBookings[index];
                      final isConfirmed = booking.status == 'CONFIRMED';

                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: Padding(
                          padding: const EdgeInsets.all(14),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Mã vé: #${booking.id}',
                                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: isConfirmed ? const Color(0xFFDCFCE7) : const Color(0xFFFEE2E2),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      isConfirmed ? 'Đã xác nhận' : 'Đã hủy',
                                      style: TextStyle(
                                        color: isConfirmed ? Colors.green[800] : Colors.red[800],
                                        fontWeight: FontWeight.w600,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text('Tour: ${booking.tourTitle ?? "Mã tour #" + booking.tourId.toString()}'),
                              const SizedBox(height: 4),
                              Text('Ngày đi: ${booking.departureDate} • ${booking.adultCount} Lớn, ${booking.childCount} Trẻ em'),
                              const SizedBox(height: 4),
                              Text(
                                'Tổng tiền thu: ${currencyFormat.format(booking.totalAmount)} đ',
                                style: const TextStyle(color: Color(0xFFE11D48), fontWeight: FontWeight.w700),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
