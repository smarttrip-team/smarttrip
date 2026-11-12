import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../models/tour_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/booking_provider.dart';
import '../../providers/hotel_provider.dart';
import '../../providers/wallet_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_button.dart';

class BookingScreen extends StatefulWidget {
  final TourModel tour;

  const BookingScreen({super.key, required this.tour});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  DateTime _departureDate = DateTime.now().add(const Duration(days: 3));
  int _adultCount = 1;
  int _childCount = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = context.read<AuthProvider>().currentUser;
      if (user != null && user.id != null) {
        context.read<WalletProvider>().loadWallet(user.id!);
      }
    });
  }

  Future<void> _selectDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _departureDate,
      firstDate: DateTime.now().add(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() {
        _departureDate = picked;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat('#,###', 'vi_VN');
    final dateFormat = DateFormat('dd/MM/yyyy');
    final hotelProvider = context.watch<HotelProvider>();
    final walletProvider = context.watch<WalletProvider>();
    final bookingProvider = context.watch<BookingProvider>();
    final authProvider = context.watch<AuthProvider>();

    final selectedHotel = hotelProvider.selectedHotel;

    // Tính toán chi phí: Trẻ em = 70% giá vé người lớn
    final tourTotal = (_adultCount * widget.tour.price) + (_childCount * widget.tour.price * 0.7);
    final hotelTotal = selectedHotel != null ? selectedHotel.pricePerNight : 0.0;
    final grandTotal = tourTotal + hotelTotal;

    final userBalance = walletProvider.balance;
    final isEnoughBalance = userBalance >= grandTotal;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Xác Nhận Đặt Tour'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thông tin Tour tóm tắt
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.network(
                      widget.tour.imageUrl,
                      width: 80,
                      height: 80,
                      fit: BoxFit.cover,
                      errorBuilder: (ctx, err, stack) => Container(width: 80, height: 80, color: Colors.grey[300]),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.tour.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '${currencyFormat.format(widget.tour.price)} đ / vé',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFFE11D48),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Chọn Ngày Khởi Hành
            const Text(
              'Ngày khởi hành',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: _selectDate,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFCBD5E1)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_month, color: AppTheme.primaryColor),
                    const SizedBox(width: 12),
                    Text(
                      dateFormat.format(_departureDate),
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                    ),
                    const Spacer(),
                    const Text('Thay đổi', style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Chọn Số Lượng Khách
            const Text(
              'Số lượng hành khách',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  // Người lớn
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Người lớn', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          Text('Từ 12 tuổi trở lên', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                        ],
                      ),
                      Row(
                        children: [
                          IconButton(
                            onPressed: _adultCount > 1 ? () => setState(() => _adultCount--) : null,
                            icon: const Icon(Icons.remove_circle_outline),
                          ),
                          Text('$_adultCount', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                          IconButton(
                            onPressed: () => setState(() => _adultCount++),
                            icon: const Icon(Icons.add_circle_outline, color: AppTheme.primaryColor),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Divider(height: 16),
                  // Trẻ em
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Trẻ em (70% giá)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                          Text('Dưới 12 tuổi', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                        ],
                      ),
                      Row(
                        children: [
                          IconButton(
                            onPressed: _childCount > 0 ? () => setState(() => _childCount--) : null,
                            icon: const Icon(Icons.remove_circle_outline),
                          ),
                          Text('$_childCount', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                          IconButton(
                            onPressed: () => setState(() => _childCount++),
                            icon: const Icon(Icons.add_circle_outline, color: AppTheme.primaryColor),
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Khách Sạn Kèm Theo
            if (selectedHotel != null) ...[
              const Text(
                'Khách sạn đã chọn đi kèm',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.hotel, color: Colors.green),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        selectedHotel.name,
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                      ),
                    ),
                    Text(
                      '+${currencyFormat.format(selectedHotel.pricePerNight)} đ',
                      style: const TextStyle(fontWeight: FontWeight.w700, color: Colors.green),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Thông tin Ví Điện Tử
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isEnoughBalance ? const Color(0xFFEFF6FF) : const Color(0xFFFEF2F2),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isEnoughBalance ? const Color(0xFF93C5FD) : const Color(0xFFFCA5A5),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.account_balance_wallet,
                        color: isEnoughBalance ? AppTheme.primaryColor : Colors.red,
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'Số dư Ví điện tử:',
                        style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                      ),
                      const Spacer(),
                      Text(
                        '${currencyFormat.format(userBalance)} đ',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: isEnoughBalance ? AppTheme.primaryColor : Colors.red,
                        ),
                      ),
                    ],
                  ),
                  if (!isEnoughBalance) ...[
                    const SizedBox(height: 8),
                    const Text(
                      'Số dư ví không đủ để thanh toán tour này. Bạn có thể bấm nút Nạp tiền nhanh bên dưới.',
                      style: TextStyle(color: Colors.red, fontSize: 12),
                    ),
                    const SizedBox(height: 8),
                    TextButton.icon(
                      style: TextButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.red,
                      ),
                      onPressed: () {
                        context.push('/wallet');
                      },
                      icon: const Icon(Icons.add_card, size: 18),
                      label: const Text('Mở Ví & Nạp Thêm Tiền'),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Bảng Tổng Hợp Chi Phí
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Vé người lớn ($_adultCount x)'),
                      Text('${currencyFormat.format(_adultCount * widget.tour.price)} đ'),
                    ],
                  ),
                  if (_childCount > 0) ...[
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Vé trẻ em ($_childCount x)'),
                        Text('${currencyFormat.format(_childCount * widget.tour.price * 0.7)} đ'),
                      ],
                    ),
                  ],
                  if (selectedHotel != null) ...[
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Phụ phí khách sạn'),
                        Text('${currencyFormat.format(selectedHotel.pricePerNight)} đ'),
                      ],
                    ),
                  ],
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Tổng thanh toán:',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                      ),
                      Text(
                        '${currencyFormat.format(grandTotal)} đ',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFFE11D48),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),

            // Nút Xác Nhận Thanh Toán
            AppButton(
              text: 'Xác Nhận & Trừ Tiền Ví',
              isLoading: bookingProvider.isLoading,
              onPressed: !isEnoughBalance
                  ? null
                  : () async {
                      final userId = authProvider.currentUser?.id;
                      if (userId == null) return;

                      final bookingId = await bookingProvider.createBookingAndPay(
                        userId: userId,
                        tourId: widget.tour.id!,
                        hotelId: selectedHotel?.id,
                        departureDate: dateFormat.format(_departureDate),
                        adultCount: _adultCount,
                        childCount: _childCount,
                        totalAmount: grandTotal,
                      );

                      if (!mounted) return;

                      if (bookingId != null) {
                        // Tải lại ví
                        walletProvider.loadWallet(userId);
                        hotelProvider.clearSelection();

                        showDialog(
                          context: context,
                          barrierDismissible: false,
                          builder: (ctx) => AlertDialog(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            title: const Row(
                              children: [
                                Icon(Icons.check_circle, color: Colors.green, size: 28),
                                SizedBox(width: 8),
                                Text('Đặt Tour Thành Công!'),
                              ],
                            ),
                            content: Text(
                              'Mã vé: #$bookingId\nTổng tiền đã trừ từ ví: ${currencyFormat.format(grandTotal)} đ.\n\nBạn có thể quản lý hoặc hủy tour để nhận lại 100% tiền hoàn trong mục "Chuyến đi của tôi".',
                            ),
                            actions: [
                              TextButton(
                                onPressed: () {
                                  Navigator.pop(ctx);
                                  context.go('/bookings');
                                },
                                child: const Text(
                                  'Xem Vé Của Tôi',
                                  style: TextStyle(fontWeight: FontWeight.w700),
                                ),
                              ),
                            ],
                          ),
                        );
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(bookingProvider.errorMessage ?? 'Thanh toán thất bại'),
                            backgroundColor: Colors.redAccent,
                          ),
                        );
                      }
                    },
            ),
          ],
        ),
      ),
    );
  }
}
