import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../models/booking_model.dart';
import '../../providers/booking_provider.dart';

class AllBookingsScreen extends StatefulWidget {
  const AllBookingsScreen({super.key});

  @override
  State<AllBookingsScreen> createState() => _AllBookingsScreenState();
}

class _AllBookingsScreenState extends State<AllBookingsScreen> {
  String _filter = 'ALL';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BookingProvider>().loadAdminBookings();
    });
  }

  Future<void> _confirmCompleteBooking(BookingModel booking) async {
    final currencyFormat = NumberFormat('#,###', 'vi_VN');
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.verified, color: Colors.purple, size: 28),
            SizedBox(width: 8),
            Text('Xác Nhận Xong Tour'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Admin xác nhận hoàn thành tour cho mã đơn #${booking.id}?'),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.purple.shade50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.purple.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Phân chia theo tỷ lệ 90/90/10:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.purple)),
                  const SizedBox(height: 4),
                  Text('• ✈️ Tour Operator (90% tour): +${currencyFormat.format(booking.operatorRevenue)} đ', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  Text('• 🏨 Hotelier (90% hotel): +${currencyFormat.format(booking.hotelierRevenue)} đ', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                  Text('• 🛡️ Hệ thống SmartTrip (10% sàn): +${currencyFormat.format(booking.systemCommission)} đ', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.purple)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy', style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.purple, foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Xác nhận hoàn thành'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final success = await context.read<BookingProvider>().completeBooking(booking.id!);
      if (mounted && success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Đã hoàn thành tour #${booking.id}! Đã ghi nhận 10% hoa hồng sàn (+${currencyFormat.format(booking.systemCommission)} đ).'),
            backgroundColor: Colors.purple,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat('#,###', 'vi_VN');
    final bookingProvider = context.watch<BookingProvider>();
    final allBookings = bookingProvider.adminBookings;

    final filteredBookings = allBookings.where((b) {
      if (_filter == 'CONFIRMED') return b.isConfirmed;
      if (_filter == 'COMPLETED') return b.isCompleted;
      if (_filter == 'CANCELLED') return b.isCancelled;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Quản Lý Đơn Đặt & Chia Doanh Thu', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => context.read<BookingProvider>().loadAdminBookings(),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _buildFilterChip('ALL', 'Tất cả (${allBookings.length})'),
                  const SizedBox(width: 8),
                  _buildFilterChip('CONFIRMED', 'Chờ xong tour (${allBookings.where((b) => b.isConfirmed).length})'),
                  const SizedBox(width: 8),
                  _buildFilterChip('COMPLETED', 'Đã xong tour (${allBookings.where((b) => b.isCompleted).length})'),
                  const SizedBox(width: 8),
                  _buildFilterChip('CANCELLED', 'Đã hủy (${allBookings.where((b) => b.isCancelled).length})'),
                ],
              ),
            ),
          ),

          // Policy Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.purple.shade50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.purple.shade200),
            ),
            child: const Row(
              children: [
                Icon(Icons.pie_chart, color: Colors.purple, size: 22),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Tỷ lệ doanh thu sau khi xong tour: 90% cho Hotel, 90% cho Tour Op, 10% cho Hệ Thống.',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF6B21A8)),
                  ),
                ),
              ],
            ),
          ),

          // Bookings List
          Expanded(
            child: bookingProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : filteredBookings.isEmpty
                    ? const Center(child: Text('Không có đơn đặt tour nào trong danh mục này.'))
                    : ListView.separated(
                        padding: const EdgeInsets.only(left: 16, right: 16, bottom: 24),
                        itemCount: filteredBookings.length,
                        separatorBuilder: (context, _) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final b = filteredBookings[index];
                          Color statusBg = const Color(0xFFEFF6FF);
                          Color statusColor = Colors.blue;
                          String statusText = 'CHỜ XONG TOUR';

                          if (b.isCompleted) {
                            statusBg = const Color(0xFFDCFCE7);
                            statusColor = Colors.green.shade800;
                            statusText = 'ĐÃ XONG TOUR (ĐÃ PHÂN CHIA)';
                          } else if (b.isCancelled) {
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
                                      'Mã đơn: #${b.id}',
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
                                  'Tour: ${b.tourTitle ?? "Mã tour #${b.tourId}"}',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF1E293B)),
                                ),
                                if (b.hotelName != null) ...[
                                  const SizedBox(height: 4),
                                  Text('Khách sạn đi kèm: ${b.hotelName}', style: const TextStyle(fontSize: 13, color: Colors.teal)),
                                ],
                                const SizedBox(height: 4),
                                Text(
                                  'Khách hàng: ${b.customerName ?? "Khách SmartTrip"} • SĐT: ${b.customerPhone ?? "0901234567"}',
                                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Ngày đi: ${b.departureDate} • ${b.adultCount} Lớn, ${b.childCount} Trẻ em',
                                  style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                ),
                                const SizedBox(height: 10),
                                const Divider(height: 1),
                                const SizedBox(height: 8),

                                // Bảng phân chia 90 / 90 / 10
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text('Tổng tiền khách trả:', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                                    Text(
                                      '${currencyFormat.format(b.totalAmount)} đ',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFFE11D48)),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAFC),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: const Color(0xFFE2E8F0)),
                                  ),
                                  child: Column(
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          const Text('✈️ Tour Operator (90% tour):', style: TextStyle(fontSize: 12, color: Color(0xFF475569))),
                                          Text('${currencyFormat.format(b.operatorRevenue)} đ', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.orange)),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          const Text('🏨 Hotelier (90% hotel):', style: TextStyle(fontSize: 12, color: Color(0xFF475569))),
                                          Text('${currencyFormat.format(b.hotelierRevenue)} đ', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.teal)),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          const Text('🛡️ Phí Sàn SmartTrip (10%):', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.purple)),
                                          Text('${currencyFormat.format(b.systemCommission)} đ', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.purple)),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),

                                if (b.isConfirmed) ...[
                                  const SizedBox(height: 10),
                                  Align(
                                    alignment: Alignment.centerRight,
                                    child: ElevatedButton.icon(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.purple,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                      icon: const Icon(Icons.check_circle_outline, size: 16),
                                      label: const Text('Xác Nhận Xong Tour', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                      onPressed: () => _confirmCompleteBooking(b),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _filter == key;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => setState(() => _filter = key),
      selectedColor: Colors.purple.shade100,
      labelStyle: TextStyle(
        color: isSelected ? Colors.purple.shade900 : const Color(0xFF64748B),
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        fontSize: 12,
      ),
    );
  }
}
