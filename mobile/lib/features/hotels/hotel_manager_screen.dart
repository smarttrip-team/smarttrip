import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/providers/hotel_provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../shared/models/models.dart';

class HotelManagerScreen extends StatefulWidget {
  const HotelManagerScreen({super.key});

  @override
  State<HotelManagerScreen> createState() => _HotelManagerScreenState();
}

class _HotelManagerScreenState extends State<HotelManagerScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Form Create Hotel
  final _hotelFormKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  int _starRating = 4;
  final _stdPriceCtrl = TextEditingController(text: '800000');
  final _dlxPriceCtrl = TextEditingController(text: '1200000');
  bool _isCreatingHotel = false;

  // Form Batch Inventory
  final _invFormKey = GlobalKey<FormState>();
  Hotel? _selectedHotel;
  RoomType? _selectedRoomType;
  DateTime _startDate = DateTime.now().add(const Duration(days: 1));
  DateTime _endDate = DateTime.now().add(const Duration(days: 30));
  final _roomsCountCtrl = TextEditingController(text: '15');
  final _invPriceCtrl = TextEditingController(text: '950000');
  bool _isUpdatingInv = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<HotelProvider>().fetchHotels();
    });
  }

  @override
  void dispose() {
    _tabController.dispose();
    _nameCtrl.dispose();
    _addressCtrl.dispose();
    _cityCtrl.dispose();
    _descCtrl.dispose();
    _stdPriceCtrl.dispose();
    _dlxPriceCtrl.dispose();
    _roomsCountCtrl.dispose();
    _invPriceCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitCreateHotel() async {
    if (!_hotelFormKey.currentState!.validate()) return;

    setState(() => _isCreatingHotel = true);
    final hotelProv = context.read<HotelProvider>();

    final stdPrice = double.tryParse(_stdPriceCtrl.text.trim()) ?? 800000;
    final dlxPrice = double.tryParse(_dlxPriceCtrl.text.trim()) ?? 1200000;

    final roomTypes = [
      {
        'name': 'Standard Room',
        'basePricePerNight': stdPrice,
        'capacityPerRoom': 2,
      },
      {
        'name': 'Deluxe Sea View',
        'basePricePerNight': dlxPrice,
        'capacityPerRoom': 3,
      },
    ];

    final success = await hotelProv.createHotel(
      name: _nameCtrl.text.trim(),
      address: _addressCtrl.text.trim(),
      city: _cityCtrl.text.trim(),
      starRating: _starRating,
      description: _descCtrl.text.trim(),
      roomTypes: roomTypes,
    );

    setState(() => _isCreatingHotel = false);

    if (!mounted) return;
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tạo khách sạn mới thành công!'), backgroundColor: Colors.green),
      );
      _nameCtrl.clear();
      _addressCtrl.clear();
      _cityCtrl.clear();
      _descCtrl.clear();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(hotelProv.errorMessage ?? 'Tạo khách sạn thất bại'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _submitBatchInventory() async {
    if (_selectedHotel == null || _selectedRoomType == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn khách sạn và loại phòng')),
      );
      return;
    }

    if (!_invFormKey.currentState!.validate()) return;

    setState(() => _isUpdatingInv = true);
    final hotelProv = context.read<HotelProvider>();

    final rooms = int.tryParse(_roomsCountCtrl.text.trim()) ?? 10;
    final price = double.tryParse(_invPriceCtrl.text.trim()) ?? 900000;

    final success = await hotelProv.batchUpdateInventory(
      hotelId: _selectedHotel!.id,
      roomTypeId: _selectedRoomType!.id,
      startDate: _startDate.toIso8601String().split('T')[0],
      endDate: _endDate.toIso8601String().split('T')[0],
      totalRooms: rooms,
      price: price,
    );

    setState(() => _isUpdatingInv = false);

    if (!mounted) return;
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Cập nhật thành công $rooms phòng (${formatVND(price)}/đêm) cho ${_selectedHotel!.name}!'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(hotelProv.errorMessage ?? 'Cập nhật thất bại'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    // Role Guard Check
    if (!auth.isHotelManager) {
      return Scaffold(
        appBar: AppBar(title: const Text('Hotel Manager Portal')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.gpp_bad_rounded, size: 64, color: Colors.orange),
                const SizedBox(height: 16),
                const Text(
                  'Quyền truy cập bị giới hạn',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  'Tài khoản hiện tại (${auth.email}) có vai trò ${auth.role}. Bạn cần quyền ROLE_HOTEL_MANAGER hoặc ROLE_ADMIN để vào trang này.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey.shade600),
                ),
                const SizedBox(height: 20),
                ElevatedButton.icon(
                  onPressed: () {
                    auth.switchRoleDemo(
                      newRole: 'ROLE_HOTEL_MANAGER',
                      newEmail: 'hotelier@smarttrip.com',
                      newName: 'Quản lý Khách sạn (Demo)',
                    );
                  },
                  icon: const Icon(Icons.swap_horiz_rounded),
                  label: const Text('Bật chế độ Hotel Manager (Demo)'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Hotel Manager Portal'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(icon: Icon(Icons.hotel_rounded), text: 'Khách sạn & Tạo mới'),
            Tab(icon: Icon(Icons.price_change_rounded), text: 'Giá & Tồn kho phòng'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // TAB 1: Danh sách & Tạo khách sạn
          _buildHotelListAndCreateTab(),

          // TAB 2: Batch Inventory & Pricing
          _buildInventoryTab(),
        ],
      ),
    );
  }

  Widget _buildHotelListAndCreateTab() {
    return Consumer<HotelProvider>(
      builder: (context, hotelProv, _) {
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.indigo.shade50,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.business_rounded, color: Colors.indigo, size: 36),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Quản lý hệ thống khách sạn đối tác',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          Text(
                            'Thêm mới khách sạn và cấu hình phòng mở bán phục vụ tour du lịch.',
                            style: TextStyle(fontSize: 12, color: Colors.black54),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Existing Hotels List
              Text(
                'Danh sách khách sạn hiện có (${hotelProv.hotels.length})',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              const SizedBox(height: 10),
              if (hotelProv.isLoading)
                const Center(child: CircularProgressIndicator())
              else if (hotelProv.hotels.isEmpty)
                const Text('Chưa có khách sạn nào được ghi nhận.')
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: hotelProv.hotels.length,
                  itemBuilder: (context, idx) {
                    final h = hotelProv.hotels[idx];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.indigo.shade100,
                          child: Text('${h.starRating}★', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        ),
                        title: Text(h.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('${h.address} - ${h.roomTypes.length} loại phòng'),
                        trailing: const Icon(Icons.check_circle_outline, color: Colors.green),
                      ),
                    );
                  },
                ),
              const Divider(height: 36),

              // Form Add New Hotel
              const Text(
                'Thêm khách sạn đối tác mới (POST /api/v1/hotels)',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.indigo),
              ),
              const SizedBox(height: 12),
              Form(
                key: _hotelFormKey,
                child: Column(
                  children: [
                    TextFormField(
                      controller: _nameCtrl,
                      decoration: const InputDecoration(labelText: 'Tên khách sạn *'),
                      validator: (v) => v == null || v.isEmpty ? 'Nhập tên khách sạn' : null,
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _addressCtrl,
                      decoration: const InputDecoration(labelText: 'Địa chỉ đường phố *'),
                      validator: (v) => v == null || v.isEmpty ? 'Nhập địa chỉ' : null,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _cityCtrl,
                            decoration: const InputDecoration(labelText: 'Thành phố *'),
                            validator: (v) => v == null || v.isEmpty ? 'Nhập thành phố' : null,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: DropdownButtonFormField<int>(
                            value: _starRating,
                            decoration: const InputDecoration(labelText: 'Hạng sao'),
                            items: [3, 4, 5].map((s) => DropdownMenuItem(value: s, child: Text('$s Sao'))).toList(),
                            onChanged: (v) => setState(() => _starRating = v ?? 4),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    TextFormField(
                      controller: _descCtrl,
                      decoration: const InputDecoration(labelText: 'Mô tả tiện ích khách sạn'),
                      maxLines: 2,
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _stdPriceCtrl,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Giá Standard/đêm (VNĐ)'),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextFormField(
                            controller: _dlxPriceCtrl,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Giá Deluxe/đêm (VNĐ)'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isCreatingHotel ? null : _submitCreateHotel,
                        icon: const Icon(Icons.add_business_rounded),
                        label: _isCreatingHotel
                            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Text('Tạo khách sạn & Mở loại phòng'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildInventoryTab() {
    return Consumer<HotelProvider>(
      builder: (context, hotelProv, _) {
        if (hotelProv.hotels.isEmpty) {
          return const Center(child: Text('Vui lòng thêm khách sạn trước khi cập nhật tồn kho'));
        }

        if (_selectedHotel == null && hotelProv.hotels.isNotEmpty) {
          _selectedHotel = hotelProv.hotels.first;
          if (_selectedHotel!.roomTypes.isNotEmpty) {
            _selectedRoomType = _selectedHotel!.roomTypes.first;
          }
        }

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _invFormKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Cập nhật Giá & Số lượng phòng theo đợt',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                Text(
                  'Áp dụng thuật toán Batch Update đồng bộ vào bảng hotel_room_inventories',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
                const SizedBox(height: 16),

                // Select Hotel
                const Text('Chọn khách sạn:', style: TextStyle(fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                DropdownButtonFormField<Hotel>(
                  value: _selectedHotel,
                  isExpanded: true,
                  items: hotelProv.hotels.map((h) => DropdownMenuItem(value: h, child: Text(h.name))).toList(),
                  onChanged: (v) {
                    setState(() {
                      _selectedHotel = v;
                      if (v != null && v.roomTypes.isNotEmpty) {
                        _selectedRoomType = v.roomTypes.first;
                      } else {
                        _selectedRoomType = null;
                      }
                    });
                  },
                ),
                const SizedBox(height: 12),

                // Select Room Type
                if (_selectedHotel != null && _selectedHotel!.roomTypes.isNotEmpty) ...[
                  const Text('Chọn loại phòng:', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  DropdownButtonFormField<RoomType>(
                    value: _selectedRoomType,
                    isExpanded: true,
                    items: _selectedHotel!.roomTypes.map((rt) => DropdownMenuItem(value: rt, child: Text(rt.name))).toList(),
                    onChanged: (v) => setState(() => _selectedRoomType = v),
                  ),
                  const SizedBox(height: 12),
                ],

                // Dates
                Row(
                  children: [
                    Expanded(
                      child: InkWell(
                        onTap: () async {
                          final p = await showDatePicker(
                            context: context,
                            initialDate: _startDate,
                            firstDate: DateTime.now(),
                            lastDate: DateTime.now().add(const Duration(days: 365)),
                          );
                          if (p != null) setState(() => _startDate = p);
                        },
                        child: InputDecorator(
                          decoration: const InputDecoration(labelText: 'Từ ngày'),
                          child: Text(_startDate.toIso8601String().split('T')[0]),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: InkWell(
                        onTap: () async {
                          final p = await showDatePicker(
                            context: context,
                            initialDate: _endDate,
                            firstDate: _startDate,
                            lastDate: DateTime.now().add(const Duration(days: 365)),
                          );
                          if (p != null) setState(() => _endDate = p);
                        },
                        child: InputDecorator(
                          decoration: const InputDecoration(labelText: 'Đến ngày'),
                          child: Text(_endDate.toIso8601String().split('T')[0]),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Rooms count & Price
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _roomsCountCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Số phòng mở bán/ngày'),
                        validator: (v) => v == null || v.isEmpty ? 'Nhập số phòng' : null,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextFormField(
                        controller: _invPriceCtrl,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Giá áp dụng (VNĐ/đêm)'),
                        validator: (v) => v == null || v.isEmpty ? 'Nhập giá' : null,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isUpdatingInv ? null : _submitBatchInventory,
                    icon: const Icon(Icons.sync_alt_rounded),
                    label: _isUpdatingInv
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('Đồng bộ giá & tồn kho phòng (Batch Update)'),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.teal),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
