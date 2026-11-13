import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/booking_provider.dart';
import '../../providers/tour_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/role_switcher_bottom_sheet.dart';
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
        title: const Text('Tour Operator Portal'),
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
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.primaryColor,
          unselectedLabelColor: Colors.grey,
          indicatorColor: AppTheme.primaryColor,
          tabs: const [
            Tab(icon: Icon(Icons.tour), text: 'Quản Lý Tour (CRUD)'),
            Tab(icon: Icon(Icons.receipt_long), text: 'Khách Đặt & Doanh Thu (90%)'),
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
                // Role Banner Card
                Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.orange.shade200),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.orange.withValues(alpha: 0.08),
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
                          color: Colors.orange.shade50,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.flight_takeoff_rounded, color: Colors.orange, size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Vai trò: Tour Operator',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFFC2410C)),
                            ),
                            Text(
                              user?.email ?? 'operator@smarttrip.com',
                              style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.orange,
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

          // TAB 2: KHÁCH ĐẶT TOUR & DOANH THU 90%
          RefreshIndicator(
            onRefresh: () async {
              if (user?.id != null) {
                await bookingProvider.loadOperatorBookings(user!.id!);
              }
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Thẻ Doanh Thu Tour Thực Nhận 90% (Sau khi xong tour)
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFFEA580C), Color(0xFFC2410C)],
                      ),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.orange.withValues(alpha: 0.2),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.monetization_on, color: Colors.amber, size: 24),
                            SizedBox(width: 8),
                            Text(
                              'Doanh Thu Tour Thực Nhận (90%):',
                              style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${currencyFormat.format(bookingProvider.operatorRevenueStats['completedRevenue'] ?? 0)} đ',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 10),
                        const Divider(color: Colors.white24, height: 1),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Chờ xong tour: ${currencyFormat.format(bookingProvider.operatorRevenueStats['pendingRevenue'] ?? 0)} đ',
                              style: const TextStyle(color: Colors.white70, fontSize: 12),
                            ),
                            const Text(
                              'Phí sàn SmartTrip: 10%',
                              style: TextStyle(color: Colors.amberAccent, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Lưu ý chính sách
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF7ED),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.orange.shade200),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.info_outline, color: Colors.orange, size: 20),
                        SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Chính sách: Bạn nhận 90% tiền tour sau khi khách hoàn thành chuyến đi (xong tour). Bấm "Xong Tour" bên dưới để hoàn tất.',
                            style: TextStyle(fontSize: 12, color: Color(0xFF9A3412)),
                          ),
                        ),
                      ],
                    ),
                  ),

                  Text(
                    'Khách Đặt Tour (${myBookings.length})',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                  ),
                  const SizedBox(height: 12),

                  if (myBookings.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                      child: const Center(child: Text('Chưa có khách hàng nào đặt tour của bạn.')),
                    )
                  else
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: myBookings.length,
                      separatorBuilder: (context, _) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final booking = myBookings[index];
                        Color statusBg = const Color(0xFFEFF6FF);
                        Color statusColor = Colors.blue;
                        String statusText = 'CHỜ XONG TOUR';

                        if (booking.isCompleted) {
                          statusBg = const Color(0xFFDCFCE7);
                          statusColor = Colors.green.shade800;
                          statusText = 'ĐÃ XONG TOUR (ĐÃ NHẬN TIỀN)';
                        } else if (booking.isCancelled) {
                          statusBg = const Color(0xFFFEE2E2);
                          statusColor = Colors.red.shade800;
                          statusText = 'ĐÃ HỦY';
                        }

                        return Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.04),
                                blurRadius: 10,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Mã vé: #${booking.id}',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(10)),
                                    child: Text(
                                      statusText,
                                      style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 11),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Tour: ${booking.tourTitle ?? "Mã tour #${booking.tourId}"}',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.orange),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Khách hàng: ${booking.customerName ?? "Khách SmartTrip"} • SĐT: ${booking.customerPhone ?? "0901234567"}',
                                style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Ngày đi: ${booking.departureDate} • ${booking.adultCount} Lớn, ${booking.childCount} Trẻ em',
                                style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                              ),
                              const SizedBox(height: 12),
                              const Divider(height: 1),
                              const SizedBox(height: 10),

                              // Phân chia doanh thu 90%
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Tiền tour: ${currencyFormat.format(booking.tourAmount)} đ',
                                        style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'Thực nhận (90%): +${currencyFormat.format(booking.operatorRevenue)} đ',
                                        style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.orange, fontSize: 14),
                                      ),
                                    ],
                                  ),
                                  if (booking.isConfirmed)
                                    ElevatedButton.icon(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.orange,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                      icon: const Icon(Icons.check_circle_outline, size: 16),
                                      label: const Text('Xong Tour', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                      onPressed: () async {
                                        final opId = user?.id ?? 2;
                                        final success = await bookingProvider.completeBooking(booking.id!, operatorId: opId);
                                        if (context.mounted && success) {
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text('Đã hoàn thành tour #${booking.id}! +${currencyFormat.format(booking.operatorRevenue)} đ đã cộng vào ví của bạn.'),
                                              backgroundColor: Colors.orange,
                                            ),
                                          );
                                        }
                                      },
                                    ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
