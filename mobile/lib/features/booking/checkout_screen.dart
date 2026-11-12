import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/storage/session_storage.dart';
import '../../core/providers/wallet_provider.dart';
import '../../core/providers/booking_provider.dart';
import '../../shared/models/models.dart';
import '../hotels/hotel_selector_widget.dart';

class CheckoutScreen extends StatefulWidget {
  final Tour tour;
  final Departure departure;
  final int quantity;

  const CheckoutScreen({
    super.key,
    required this.tour,
    required this.departure,
    required this.quantity,
  });

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;
  late List<TextEditingController> _passengerNameControllers;

  HotelSelectionData? _hotelSelection;
  double _hotelSubtotal = 0.0;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: SessionStorage.fullName ?? 'Lê Quang Vĩnh');
    _phoneController = TextEditingController(text: '0909123456');
    _emailController = TextEditingController(text: SessionStorage.email ?? 'vinhle@smarttrip.com');

    _passengerNameControllers = List.generate(
      widget.quantity,
      (index) => TextEditingController(
        text: index == 0 ? (SessionStorage.fullName ?? 'Lê Quang Vĩnh') : 'Hành khách ${index + 1}',
      ),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final userId = SessionStorage.userId ?? 10;
      context.read<WalletProvider>().fetchWalletAndTransactions(userId);
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    for (var c in _passengerNameControllers) {
      c.dispose();
    }
    super.dispose();
  }

  double get _tourSubtotal => widget.departure.price * widget.quantity;
  double get _totalBill => _tourSubtotal + _hotelSubtotal;

  Future<void> _submitBooking() async {
    if (!_formKey.currentState!.validate()) return;

    final userId = SessionStorage.userId ?? 10;
    final randomId = DateTime.now().millisecondsSinceEpoch.toString() + Random().nextInt(1000).toString();
    final idempotencyKey = 'IDEM-MOB-$randomId';

    final passengers = <Map<String, dynamic>>[];
    for (int i = 0; i < widget.quantity; i++) {
      passengers.add({
        'fullName': _passengerNameControllers[i].text.trim(),
        'passengerType': 'ADULT',
        'idNumber': '04820000${1000 + i}',
        'birthDate': '1998-05-15',
      });
    }

    final payload = <String, dynamic>{
      'customerId': userId,
      'tourId': widget.tour.id,
      'departureId': widget.departure.id,
      'quantity': widget.quantity,
      'unitPrice': widget.departure.price,
      'contactName': _nameController.text.trim(),
      'contactPhone': _phoneController.text.trim(),
      'contactEmail': _emailController.text.trim(),
      'idempotencyKey': idempotencyKey,
      'passengers': passengers,
    };

    if (_hotelSelection != null) {
      payload['hotelDetails'] = [_hotelSelection!.toJson()];
    }

    setState(() => _isSubmitting = true);
    final bookingProv = context.read<BookingProvider>();
    final bookingCode = await bookingProv.createBooking(payload);
    setState(() => _isSubmitting = false);

    if (!mounted) return;
    if (bookingCode != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Đã gửi đơn: $bookingCode! Tiến trình Saga đang xử lý...'),
          backgroundColor: Colors.green,
        ),
      );
      context.pushReplacement('/bookings/tracking/$bookingCode');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(bookingProv.errorMessage ?? 'Đặt tour thất bại'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final walletProv = context.watch<WalletProvider>();
    final availableBalance = walletProv.availableBalance;
    final hasEnoughBalance = availableBalance >= _totalBill;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Xác nhận đặt tour & Khách sạn'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Tour Overview Card
              Card(
                color: Colors.indigo.shade50,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.tour.title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Ngày khởi hành: ${widget.departure.departureDate}'),
                          Text('Số khách: ${widget.quantity} người'),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Đơn giá tour:'),
                          Text(formatVND(widget.departure.price), style: const TextStyle(fontWeight: FontWeight.w600)),
                        ],
                      ),
                      const Divider(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Tiền tour:', style: TextStyle(fontWeight: FontWeight.bold)),
                          Text(formatVND(_tourSubtotal), style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Contact information
              Text(
                'Thông tin người liên hệ',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Họ và tên',
                  prefixIcon: Icon(Icons.person_outline),
                ),
                validator: (val) => val == null || val.isEmpty ? 'Vui lòng nhập họ tên' : null,
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        labelText: 'Số điện thoại',
                        prefixIcon: Icon(Icons.phone_outlined),
                      ),
                      validator: (val) => val == null || val.isEmpty ? 'Nhập SĐT' : null,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        prefixIcon: Icon(Icons.email_outlined),
                      ),
                      validator: (val) => val == null || val.isEmpty ? 'Nhập email' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Passenger List
              Text(
                'Danh sách hành khách (${widget.quantity} người)',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ...List.generate(widget.quantity, (index) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8.0),
                  child: TextFormField(
                    controller: _passengerNameControllers[index],
                    decoration: InputDecoration(
                      labelText: 'Hành khách ${index + 1}',
                      prefixIcon: const Icon(Icons.badge_outlined),
                    ),
                    validator: (val) => val == null || val.isEmpty ? 'Vui lòng nhập tên hành khách' : null,
                  ),
                );
              }),
              const SizedBox(height: 16),

              // HOTEL SELECTION WIDGET
              HotelSelectorWidget(
                defaultCheckInDate: widget.departure.departureDate,
                durationDays: widget.tour.durationDays,
                onSelectionChanged: (data, subtotal) {
                  setState(() {
                    _hotelSelection = data;
                    _hotelSubtotal = subtotal;
                  });
                },
              ),
              const SizedBox(height: 20),

              // WALLET CHECK (WalletProvider)
              Text(
                'Phương thức thanh toán & Số dư ví (WalletProvider)',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Card(
                elevation: 0,
                color: hasEnoughBalance ? Colors.green.shade50 : Colors.red.shade50,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(
                    color: hasEnoughBalance ? Colors.green.shade300 : Colors.red.shade300,
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.account_balance_wallet, color: Colors.indigo),
                              SizedBox(width: 8),
                              Text('Ví SmartTrip Pay', style: TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                          walletProv.isLoading
                              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                              : Text(
                                  formatVND(availableBalance),
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: hasEnoughBalance ? Colors.green.shade800 : Colors.red.shade800,
                                  ),
                                ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Tổng tiền cần giữ (Hold):'),
                          Text(formatVND(_totalBill), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        ],
                      ),
                      if (!hasEnoughBalance && !walletProv.isLoading) ...[
                        const Divider(height: 16),
                        Row(
                          children: [
                            const Icon(Icons.warning_amber_rounded, color: Colors.red, size: 20),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Text(
                                'Số dư khả dụng không đủ! Đơn hàng sẽ bị bù trừ (Rollback) nếu không nạp tiền.',
                                style: TextStyle(fontSize: 12, color: Colors.red),
                              ),
                            ),
                            TextButton(
                              onPressed: () {
                                context.push('/wallet');
                              },
                              child: const Text('Nạp ví ngay'),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 90),
            ],
          ),
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 10,
              offset: Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Tổng thanh toán:', style: TextStyle(color: Colors.grey, fontSize: 12)),
                    Text(
                      formatVND(_totalBill),
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.indigo,
                      ),
                    ),
                  ],
                ),
              ),
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitBooking,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.indigo,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                      )
                    : const Text('Xác nhận & Khởi chạy Saga'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
