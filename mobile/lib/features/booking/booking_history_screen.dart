import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/storage/session_storage.dart';
import '../../core/providers/booking_provider.dart';
import '../../shared/models/models.dart';

class BookingHistoryScreen extends StatefulWidget {
  const BookingHistoryScreen({super.key});

  @override
  State<BookingHistoryScreen> createState() => _BookingHistoryScreenState();
}

class _BookingHistoryScreenState extends State<BookingHistoryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final userId = SessionStorage.userId ?? 10;
      context.read<BookingProvider>().fetchBookings(userId);
    });
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
      case 'COMPLETED':
        return Colors.green;
      case 'PENDING':
      case 'PROCESSING':
        return Colors.blue;
      case 'CANCELLED':
      case 'COMPENSATED':
        return Colors.orange;
      case 'FAILED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingProv = context.watch<BookingProvider>();
    final bookings = bookingProv.bookings;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Chuyến đi của tôi'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              final userId = SessionStorage.userId ?? 10;
              context.read<BookingProvider>().fetchBookings(userId);
            },
          ),
        ],
      ),
      body: bookingProv.isLoading && bookings.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : bookingProv.errorMessage != null && bookings.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 48, color: Colors.red),
                      const SizedBox(height: 12),
                      Text(bookingProv.errorMessage!),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () {
                          final userId = SessionStorage.userId ?? 10;
                          context.read<BookingProvider>().fetchBookings(userId);
                        },
                        child: const Text('Thử lại'),
                      ),
                    ],
                  ),
                )
              : bookings.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.airplane_ticket_outlined, size: 64, color: Colors.grey.shade400),
                          const SizedBox(height: 12),
                          const Text('Bạn chưa có chuyến đi nào được đặt.'),
                          const SizedBox(height: 8),
                          Text(
                            'Hãy khám phá danh mục tour và trải nghiệm dịch vụ!',
                            style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: () async {
                        final userId = SessionStorage.userId ?? 10;
                        await context.read<BookingProvider>().fetchBookings(userId);
                      },
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: bookings.length,
                        itemBuilder: (context, index) {
                          final booking = bookings[index];
                          final statusColor = _getStatusColor(booking.status);

                          return Card(
                            elevation: 0,
                            margin: const EdgeInsets.only(bottom: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: BorderSide(color: Colors.grey.shade200),
                            ),
                            child: InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: () {
                                context.push('/bookings/tracking/${booking.bookingCode}');
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(16.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          booking.bookingCode,
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: statusColor.withAlpha(30),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Text(
                                            booking.status,
                                            style: TextStyle(
                                              color: statusColor,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const Divider(height: 20),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        const Text('Tổng tiền thanh toán:', style: TextStyle(color: Colors.grey)),
                                        Text(
                                          formatVND(booking.totalAmount),
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                            color: Colors.indigo,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          'Ngày tạo: ${booking.createdAt != null ? booking.createdAt!.split('T')[0] : "Hôm nay"}',
                                          style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                                        ),
                                        const Row(
                                          children: [
                                            Text(
                                              'Theo dõi Saga',
                                              style: TextStyle(fontSize: 13, color: Colors.indigo, fontWeight: FontWeight.bold),
                                            ),
                                            Icon(Icons.chevron_right, size: 18, color: Colors.indigo),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
