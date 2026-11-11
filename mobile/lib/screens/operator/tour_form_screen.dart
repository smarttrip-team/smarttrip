import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../models/tour_model.dart';
import '../../providers/auth_provider.dart';
import '../../providers/tour_provider.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';

class TourFormScreen extends StatefulWidget {
  final TourModel? tour;

  const TourFormScreen({super.key, this.tour});

  @override
  State<TourFormScreen> createState() => _TourFormScreenState();
}

class _TourFormScreenState extends State<TourFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _titleController;
  late TextEditingController _destinationController;
  late TextEditingController _durationController;
  late TextEditingController _priceController;
  late TextEditingController _imageUrlController;
  late TextEditingController _descriptionController;
  String _category = 'Biển đảo';

  final List<String> _categories = ['Biển đảo', 'Vùng cao', 'Nghỉ dưỡng', 'Văn hóa'];

  @override
  void initState() {
    super.initState();
    final t = widget.tour;
    _titleController = TextEditingController(text: t?.title ?? '');
    _destinationController = TextEditingController(text: t?.destination ?? '');
    _durationController = TextEditingController(text: t?.duration ?? '3N2Đ');
    _priceController = TextEditingController(text: t != null ? t.price.toStringAsFixed(0) : '');
    _imageUrlController = TextEditingController(
      text: t?.imageUrl ?? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    );
    _descriptionController = TextEditingController(text: t?.description ?? '');
    if (t != null && _categories.contains(t.category)) {
      _category = t.category;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _destinationController.dispose();
    _durationController.dispose();
    _priceController.dispose();
    _imageUrlController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _saveTour() async {
    if (!_formKey.currentState!.validate()) return;

    final user = context.read<AuthProvider>().currentUser;
    final tourProvider = context.read<TourProvider>();
    final isEditing = widget.tour != null;

    final price = double.tryParse(_priceController.text) ?? 0.0;

    final newTour = TourModel(
      id: widget.tour?.id,
      operatorId: widget.tour?.operatorId ?? user?.id ?? 2,
      title: _titleController.text.trim(),
      destination: _destinationController.text.trim(),
      description: _descriptionController.text.trim(),
      price: price,
      duration: _durationController.text.trim(),
      imageUrl: _imageUrlController.text.trim(),
      category: _category,
      rating: widget.tour?.rating ?? 5.0,
    );

    bool success;
    if (isEditing) {
      success = await tourProvider.updateTour(newTour);
    } else {
      success = await tourProvider.addTour(newTour);
    }

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(isEditing ? 'Cập nhật tour thành công!' : 'Tạo tour mới thành công!'),
          backgroundColor: Colors.green,
        ),
      );
      context.pop();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Có lỗi xảy ra khi lưu tour!'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.tour != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Chỉnh Sửa Tour' : 'Thêm Tour Mới'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AppTextField(
                controller: _titleController,
                label: 'Tên chuyến đi / Tour',
                hint: 'Ví dụ: Khám phá Đảo Ngọc Phú Quốc',
                validator: (val) => val == null || val.isEmpty ? 'Vui lòng nhập tên tour' : null,
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    child: AppTextField(
                      controller: _destinationController,
                      label: 'Điểm đến',
                      hint: 'Phú Quốc',
                      validator: (val) => val == null || val.isEmpty ? 'Vui lòng nhập điểm đến' : null,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AppTextField(
                      controller: _durationController,
                      label: 'Thời lượng',
                      hint: '3N2Đ',
                      validator: (val) => val == null || val.isEmpty ? 'Ví dụ: 3N2Đ' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              AppTextField(
                controller: _priceController,
                label: 'Giá tour (VNĐ)',
                hint: '3500000',
                keyboardType: TextInputType.number,
                validator: (val) => val == null || double.tryParse(val) == null ? 'Vui lòng nhập giá hợp lệ' : null,
              ),
              const SizedBox(height: 16),

              const Text(
                'Danh mục tour',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFCBD5E1)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _category,
                    isExpanded: true,
                    items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _category = val);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),

              AppTextField(
                controller: _imageUrlController,
                label: 'Link ảnh bìa Tour (URL)',
                hint: 'https://...',
                validator: (val) => val == null || val.isEmpty ? 'Vui lòng nhập link ảnh' : null,
              ),
              const SizedBox(height: 16),

              AppTextField(
                controller: _descriptionController,
                label: 'Mô tả chi tiết lịch trình',
                hint: 'Giới thiệu các điểm tham quan, dịch vụ đi kèm...',
                maxLines: 4,
                validator: (val) => val == null || val.isEmpty ? 'Vui lòng nhập mô tả' : null,
              ),
              const SizedBox(height: 28),

              AppButton(
                text: isEditing ? 'Lưu Thay Đổi' : 'Tạo Tour Mới',
                onPressed: _saveTour,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
