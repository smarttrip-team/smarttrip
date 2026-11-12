import 'package:flutter/material.dart';
import '../../core/network/api_client.dart';
import '../../shared/models/models.dart';

class HotelSelectionData {
  final int hotelId;
  final String hotelName;
  final int roomTypeId;
  final String roomTypeName;
  final int roomQuantity;
  final String checkInDate;
  final String checkOutDate;
  final double pricePerNight;
  final double totalHotelPrice;

  HotelSelectionData({
    required this.hotelId,
    required this.hotelName,
    required this.roomTypeId,
    required this.roomTypeName,
    required this.roomQuantity,
    required this.checkInDate,
    required this.checkOutDate,
    required this.pricePerNight,
    required this.totalHotelPrice,
  });

  Map<String, dynamic> toJson() => {
        'hotelId': hotelId,
        'roomTypeId': roomTypeId,
        'quantity': roomQuantity,
        'checkInDate': checkInDate,
        'checkOutDate': checkOutDate,
      };
}

class HotelSelectorWidget extends StatefulWidget {
  final String defaultCheckInDate;
  final int durationDays;
  final Function(HotelSelectionData? data, double subtotal) onSelectionChanged;

  const HotelSelectorWidget({
    super.key,
    required this.defaultCheckInDate,
    required this.durationDays,
    required this.onSelectionChanged,
  });

  @override
  State<HotelSelectorWidget> createState() => _HotelSelectorWidgetState();
}

class _HotelSelectorWidgetState extends State<HotelSelectorWidget> {
  bool _includeHotel = false;
  bool _isLoading = false;
  List<Hotel> _hotels = [];
  String? _errorMessage;

  Hotel? _selectedHotel;
  RoomType? _selectedRoomType;
  int _roomQuantity = 1;
  late DateTime _checkInDate;
  late DateTime _checkOutDate;

  @override
  void initState() {
    super.initState();
    try {
      _checkInDate = DateTime.parse(widget.defaultCheckInDate);
    } catch (_) {
      _checkInDate = DateTime.now().add(const Duration(days: 3));
    }
    _checkOutDate = _checkInDate.add(Duration(days: widget.durationDays > 0 ? widget.durationDays : 1));
  }

  Future<void> _fetchHotels() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await ApiClient.get('/api/v1/hotels');
      if (res.statusCode == 200) {
        final dynamic data = ApiClient.decode(res);
        final list = (data is List)
            ? data
            : (data['content'] ?? data['data'] ?? []);
        final parsed = (list as List).map((h) => Hotel.fromJson(h)).toList();

        setState(() {
          _hotels = parsed;
          if (_hotels.isNotEmpty) {
            _selectedHotel = _hotels.first;
            if (_selectedHotel!.roomTypes.isNotEmpty) {
              _selectedRoomType = _selectedHotel!.roomTypes.first;
            }
          }
          _isLoading = false;
        });
        _notifyParent();
      } else {
        setState(() {
          _errorMessage = 'Không thể tải danh sách khách sạn (${res.statusCode})';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Lỗi kết nối tới Hotel Service: $e';
        _isLoading = false;
      });
    }
  }

  void _notifyParent() {
    if (!_includeHotel || _selectedHotel == null || _selectedRoomType == null) {
      widget.onSelectionChanged(null, 0.0);
      return;
    }

    final nights = _checkOutDate.difference(_checkInDate).inDays;
    final validNights = nights > 0 ? nights : 1;
    final subtotal = validNights * _selectedRoomType!.basePricePerNight * _roomQuantity;

    final data = HotelSelectionData(
      hotelId: _selectedHotel!.id,
      hotelName: _selectedHotel!.name,
      roomTypeId: _selectedRoomType!.id,
      roomTypeName: _selectedRoomType!.name,
      roomQuantity: _roomQuantity,
      checkInDate: _checkInDate.toIso8601String().split('T')[0],
      checkOutDate: _checkOutDate.toIso8601String().split('T')[0],
      pricePerNight: _selectedRoomType!.basePricePerNight,
      totalHotelPrice: subtotal,
    );

    widget.onSelectionChanged(data, subtotal);
  }

  Future<void> _pickDate(bool isCheckIn) async {
    final initial = isCheckIn ? _checkInDate : _checkOutDate;
    final firstDate = isCheckIn ? DateTime.now() : _checkInDate.add(const Duration(days: 1));
    final picked = await showDatePicker(
      context: context,
      initialDate: initial.isBefore(firstDate) ? firstDate : initial,
      firstDate: firstDate,
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (picked != null) {
      setState(() {
        if (isCheckIn) {
          _checkInDate = picked;
          if (_checkOutDate.isBefore(_checkInDate.add(const Duration(days: 1)))) {
            _checkOutDate = _checkInDate.add(const Duration(days: 1));
          }
        } else {
          _checkOutDate = picked;
        }
      });
      _notifyParent();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: _includeHotel ? Colors.indigo.shade300 : Colors.grey.shade300,
          width: _includeHotel ? 1.5 : 1,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Checkbox Header
            Row(
              children: [
                Checkbox(
                  value: _includeHotel,
                  activeColor: Colors.indigo,
                  onChanged: (val) {
                    setState(() {
                      _includeHotel = val ?? false;
                    });
                    if (_includeHotel && _hotels.isEmpty) {
                      _fetchHotels();
                    } else {
                      _notifyParent();
                    }
                  },
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Đặt kèm khách sạn đối tác',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Phòng nghỉ chất lượng, thanh toán cùng tour qua Saga',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            if (_includeHotel) ...[
              const Divider(height: 24),
              if (_isLoading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.symmetric(vertical: 16.0),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (_errorMessage != null)
                Text(
                  _errorMessage!,
                  style: const TextStyle(color: Colors.red),
                )
              else if (_hotels.isEmpty)
                const Text('Không có khách sạn khả dụng.')
              else ...[
                // Hotel Dropdown
                const Text(
                  'Chọn khách sạn:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                DropdownButtonFormField<Hotel>(
                  value: _selectedHotel,
                  isExpanded: true,
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  items: _hotels.map((h) {
                    return DropdownMenuItem<Hotel>(
                      value: h,
                      child: Text(
                        '${h.name} (${h.starRating}★) - ${h.address}',
                        overflow: TextOverflow.ellipsis,
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    setState(() {
                      _selectedHotel = val;
                      if (val != null && val.roomTypes.isNotEmpty) {
                        _selectedRoomType = val.roomTypes.first;
                      } else {
                        _selectedRoomType = null;
                      }
                    });
                    _notifyParent();
                  },
                ),
                const SizedBox(height: 14),

                // Room Type Selector
                if (_selectedHotel != null && _selectedHotel!.roomTypes.isNotEmpty) ...[
                  const Text(
                    'Chọn loại phòng:',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<RoomType>(
                    value: _selectedRoomType,
                    isExpanded: true,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    items: _selectedHotel!.roomTypes.map((rt) {
                      return DropdownMenuItem<RoomType>(
                        value: rt,
                        child: Text(
                          '${rt.name} - ${formatVND(rt.basePricePerNight)}/đêm (Tối đa ${rt.capacityPerRoom} người)',
                          overflow: TextOverflow.ellipsis,
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      setState(() {
                        _selectedRoomType = val;
                      });
                      _notifyParent();
                    },
                  ),
                  const SizedBox(height: 14),
                ],

                // Date Selection (Check-in / Check-out)
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () => _pickDate(true),
                        child: InputDecorator(
                          decoration: InputDecoration(
                            labelText: 'Nhận phòng',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                          child: Text(
                            _checkInDate.toIso8601String().split('T')[0],
                            style: const TextStyle(fontWeight: FontWeight.w500),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: InkWell(
                        onTap: () => _pickDate(false),
                        child: InputDecorator(
                          decoration: InputDecoration(
                            labelText: 'Trả phòng',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          ),
                          child: Text(
                            _checkOutDate.toIso8601String().split('T')[0],
                            style: const TextStyle(fontWeight: FontWeight.w500),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Room quantity
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Số phòng:', style: TextStyle(fontWeight: FontWeight.bold)),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.remove_circle_outline),
                          onPressed: _roomQuantity > 1
                              ? () {
                                  setState(() => _roomQuantity--);
                                  _notifyParent();
                                }
                              : null,
                        ),
                        Text(
                          '$_roomQuantity',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        IconButton(
                          icon: const Icon(Icons.add_circle_outline),
                          onPressed: () {
                            setState(() => _roomQuantity++);
                            _notifyParent();
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ],
          ],
        ),
      ),
    );
  }
}
