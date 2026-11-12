import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../shared/models/models.dart';

class TourDetailScreen extends StatefulWidget {
  final Tour tour;

  const TourDetailScreen({super.key, required this.tour});

  @override
  State<TourDetailScreen> createState() => _TourDetailScreenState();
}

class _TourDetailScreenState extends State<TourDetailScreen> {
  Departure? _selectedDeparture;
  int _quantity = 1;

  @override
  void initState() {
    super.initState();
    if (widget.tour.upcomingDepartures.isNotEmpty) {
      _selectedDeparture = widget.tour.upcomingDepartures.first;
    }
  }

  @override
  Widget build(BuildContext context) {
    final tour = widget.tour;
    final unitPrice = _selectedDeparture?.price ?? tour.basePrice;
    final tourSubtotal = unitPrice * _quantity;

    return Scaffold(
      appBar: AppBar(
        title: Text(tour.title),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cover Image
            Container(
              height: 220,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                image: tour.coverImageUrl != null && tour.coverImageUrl!.isNotEmpty
                    ? DecorationImage(
                        image: NetworkImage(tour.coverImageUrl!),
                        fit: BoxFit.cover,
                      )
                    : null,
              ),
              child: (tour.coverImageUrl == null || tour.coverImageUrl!.isEmpty)
                  ? const Center(
                      child: Icon(Icons.landscape, size: 72, color: Colors.grey),
                    )
                  : null,
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title and Location
                  Text(
                    tour.title,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on, size: 18, color: Colors.redAccent),
                      const SizedBox(width: 4),
                      Text(
                        tour.destinationName ?? 'Việt Nam',
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(width: 16),
                      const Icon(Icons.schedule, size: 18, color: Colors.blueAccent),
                      const SizedBox(width: 4),
                      Text('${tour.durationDays} ngày'),
                    ],
                  ),
                  const Divider(height: 32),

                  // Description
                  Text(
                    'Mô tả tour',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    tour.description.isNotEmpty
                        ? tour.description
                        : 'Khám phá những danh lam thắng cảnh tuyệt đẹp cùng dịch vụ chuyên nghiệp hàng đầu.',
                    style: TextStyle(color: Colors.grey.shade800, height: 1.4),
                  ),
                  const Divider(height: 32),

                  // Departure schedule selector
                  Text(
                    'Chọn ngày khởi hành',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 12),
                  if (tour.upcomingDepartures.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.orange.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.info_outline, color: Colors.orange),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text('Hiện tại chưa có lịch khởi hành mở bán.'),
                          ),
                        ],
                      ),
                    )
                  else
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: tour.upcomingDepartures.map((dep) {
                        final isSelected = _selectedDeparture?.id == dep.id;
                        final isSoldOut = dep.availableSeats <= 0;
                        return ChoiceChip(
                          selected: isSelected,
                          label: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                dep.departureDate,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: isSelected ? Colors.white : Colors.black87,
                                ),
                              ),
                              Text(
                                formatVND(dep.price),
                                style: TextStyle(
                                  fontSize: 12,
                                  color: isSelected ? Colors.white70 : Colors.indigo,
                                ),
                              ),
                              Text(
                                isSoldOut ? 'Hết chỗ' : 'Còn ${dep.availableSeats} chỗ',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: isSoldOut ? Colors.red : (isSelected ? Colors.white70 : Colors.grey.shade600),
                                ),
                              ),
                            ],
                          ),
                          onSelected: isSoldOut
                              ? null
                              : (selected) {
                                  if (selected) {
                                    setState(() {
                                      _selectedDeparture = dep;
                                    });
                                  }
                                },
                        );
                      }).toList(),
                    ),
                  const SizedBox(height: 24),

                  // Quantity Selector
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Số lượng khách',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove_circle_outline),
                            onPressed: _quantity > 1
                                ? () => setState(() => _quantity--)
                                : null,
                          ),
                          Text(
                            '$_quantity',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.add_circle_outline),
                            onPressed: () {
                              final maxSeats = _selectedDeparture?.availableSeats ?? 10;
                              if (_quantity < maxSeats) {
                                setState(() => _quantity++);
                              }
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ],
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
                    const Text('Tổng tiền tour', style: TextStyle(color: Colors.grey)),
                    Text(
                      formatVND(tourSubtotal),
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.indigo,
                      ),
                    ),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: (_selectedDeparture != null && _selectedDeparture!.availableSeats >= _quantity)
                    ? () {
                        context.push(
                          '/tours/checkout',
                          extra: {
                            'tour': tour,
                            'departure': _selectedDeparture!,
                            'quantity': _quantity,
                          },
                        );
                      }
                    : null,
                icon: const Icon(Icons.arrow_forward),
                label: const Text('Đặt tour ngay'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.indigo,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
