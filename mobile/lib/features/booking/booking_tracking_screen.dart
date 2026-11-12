import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/storage/session_storage.dart';
import '../../core/providers/booking_provider.dart';
import '../../shared/models/models.dart';

class BookingTrackingScreen extends StatefulWidget {
  final String bookingCode;

  const BookingTrackingScreen({super.key, required this.bookingCode});

  @override
  State<BookingTrackingScreen> createState() => _BookingTrackingScreenState();
}

class _BookingTrackingScreenState extends State<BookingTrackingScreen> {
  Timer? _pollingTimer;
  bool _isCancelling = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BookingProvider>().fetchSagaStatus(widget.bookingCode);
    });

    // Poll every 3 seconds while in PROCESSING state
    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      final saga = context.read<BookingProvider>().currentSagaStatus;
      if (saga != null &&
          (saga.status == 'COMPLETED' ||
              saga.status == 'COMPENSATED' ||
              saga.status == 'FAILED')) {
        timer.cancel();
      } else {
        context.read<BookingProvider>().fetchSagaStatus(widget.bookingCode, isSilent: true);
      }
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _cancelBooking() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xác nhận hủy đặt tour'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Chính sách hoàn tiền tự động về ví SmartTrip:'),
            SizedBox(height: 8),
            Text('• Hủy trước 7 ngày: Hoàn 100% tiền về ví.'),
            Text('• Hủy trước 3 - 7 ngày: Hoàn 50% tiền về ví.'),
            Text('• Hủy dưới 3 ngày: Không được hoàn tiền.'),
            SizedBox(height: 12),
            Text('Saga bù trừ sẽ tự động nhả chỗ và hoàn tiền ví!'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Đóng'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red, foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Xác nhận hủy & Hoàn tiền'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;
    if (!mounted) return;

    setState(() => _isCancelling = true);
    final userId = SessionStorage.userId ?? 10;
    final bookingProv = context.read<BookingProvider>();
    final ok = await bookingProv.cancelBooking(widget.bookingCode, userId);
    setState(() => _isCancelling = false);

    if (!mounted) return;
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Đã gửi yêu cầu hủy tour thành công! Tiền được tự động hoàn về ví.'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(bookingProv.errorMessage ?? 'Không thể hủy đơn đặt tour'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'CONFIRMED':
        return Colors.green;
      case 'PROCESSING':
      case 'PENDING':
        return Colors.blue;
      case 'COMPENSATED':
      case 'CANCELLED':
        return Colors.orange;
      case 'FAILED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getStatusIcon(String status) {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'CONFIRMED':
        return Icons.check_circle;
      case 'PROCESSING':
      case 'PENDING':
        return Icons.sync;
      case 'COMPENSATED':
      case 'CANCELLED':
        return Icons.undo;
      case 'FAILED':
        return Icons.error;
      default:
        return Icons.help_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    final bookingProv = context.watch<BookingProvider>();
    final saga = bookingProv.currentSagaStatus;
    final bookingDetails = bookingProv.currentBookingDetails;
    final statusColor = saga != null ? _getStatusColor(saga.status) : Colors.grey;

    return Scaffold(
      appBar: AppBar(
        title: Text('Theo dõi Saga: ${widget.bookingCode}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => context.read<BookingProvider>().fetchSagaStatus(widget.bookingCode),
            tooltip: 'Làm mới',
          ),
        ],
      ),
      body: bookingProv.isLoading && saga == null
          ? const Center(child: CircularProgressIndicator())
          : bookingProv.errorMessage != null && saga == null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: Colors.red),
                        const SizedBox(height: 12),
                        Text(bookingProv.errorMessage!, textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: () => context.read<BookingProvider>().fetchSagaStatus(widget.bookingCode),
                          child: const Text('Thử lại'),
                        ),
                      ],
                    ),
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Status Banner
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: statusColor.withAlpha(25),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: statusColor.withAlpha(80)),
                        ),
                        child: Row(
                          children: [
                            Icon(_getStatusIcon(saga?.status ?? 'PROCESSING'), color: statusColor, size: 36),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Saga Status: ${saga?.status ?? "PROCESSING"}',
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: statusColor,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Bước hiện tại: ${saga?.currentStep ?? "Đang khởi tạo"}',
                                    style: TextStyle(color: Colors.grey.shade700, fontSize: 13),
                                  ),
                                  if (saga?.failureReason != null) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      'Lý do lỗi: ${saga!.failureReason}',
                                      style: const TextStyle(color: Colors.red, fontSize: 13, fontWeight: FontWeight.w500),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Booking Summary Card
                      if (bookingDetails != null)
                        Card(
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(color: Colors.grey.shade200),
                          ),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Chi tiết đơn hàng', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                const Divider(height: 20),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text('Mã đơn hàng:'),
                                    Text(bookingDetails.bookingCode, style: const TextStyle(fontWeight: FontWeight.bold)),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text('Tổng tiền:'),
                                    Text(
                                      formatVND(bookingDetails.totalAmount),
                                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo, fontSize: 16),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text('Trạng thái đơn:'),
                                    Chip(
                                      label: Text(
                                        bookingDetails.status,
                                        style: const TextStyle(fontSize: 12, color: Colors.white),
                                      ),
                                      backgroundColor: _getStatusColor(bookingDetails.status),
                                      padding: EdgeInsets.zero,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      const SizedBox(height: 20),

                      // Saga Orchestration Timeline
                      Text(
                        'Tiến trình phân tán Saga (RabbitMQ Orchestrator)',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),

                      if (saga == null || saga.steps.isEmpty)
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Row(
                              children: [
                                SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: statusColor),
                                ),
                                const SizedBox(width: 12),
                                const Text('Đang lắng nghe các Event trên RabbitMQ...'),
                              ],
                            ),
                          ),
                        )
                      else
                        ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: saga.steps.length,
                          itemBuilder: (context, index) {
                            final step = saga.steps[index];
                            final isDone = step.status.toUpperCase() == 'COMPLETED';
                            final isFailed = step.status.toUpperCase() == 'FAILED';

                            return Container(
                              margin: const EdgeInsets.only(bottom: 12),
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: isDone
                                      ? Colors.green.shade300
                                      : (isFailed ? Colors.red.shade300 : Colors.blue.shade300),
                                ),
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  CircleAvatar(
                                    radius: 14,
                                    backgroundColor: isDone
                                        ? Colors.green
                                        : (isFailed ? Colors.red : Colors.blue),
                                    child: Icon(
                                      isDone
                                          ? Icons.check
                                          : (isFailed ? Icons.close : Icons.hourglass_top),
                                      size: 16,
                                      color: Colors.white,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          step.stepName,
                                          style: const TextStyle(fontWeight: FontWeight.bold),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          'Trạng thái: ${step.status} ${step.actionType != null ? "(${step.actionType})" : ""}',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: isDone ? Colors.green.shade800 : (isFailed ? Colors.red : Colors.grey.shade700),
                                          ),
                                        ),
                                        if (step.lastError != null)
                                          Padding(
                                            padding: const EdgeInsets.only(top: 4.0),
                                            child: Text(
                                              'Lỗi: ${step.lastError}',
                                              style: const TextStyle(fontSize: 11, color: Colors.red),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      const SizedBox(height: 24),

                      // Cancel Booking Button (if eligible)
                      if (bookingDetails != null &&
                          bookingDetails.status != 'CANCELLED' &&
                          bookingDetails.status != 'FAILED') ...[
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            onPressed: _isCancelling ? null : _cancelBooking,
                            icon: const Icon(Icons.cancel_outlined, color: Colors.red),
                            label: _isCancelling
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.red),
                                  )
                                : const Text('Hủy đơn đặt tour (Tự động hoàn tiền ví)', style: TextStyle(color: Colors.red)),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Colors.red),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],
                    ],
                  ),
                ),
    );
  }
}
