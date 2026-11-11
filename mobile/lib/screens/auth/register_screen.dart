import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.register(
      fullName: _fullNameController.text,
      email: _emailController.text,
      password: _passwordController.text,
      phone: _phoneController.text,
      role: 'customer',
    );

    if (!mounted) return;

    if (success) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green, size: 28),
              SizedBox(width: 8),
              Text('Đăng ký thành công!'),
            ],
          ),
          content: const Text(
            'Tài khoản của bạn đã được khởi tạo thành công và được tặng sẵn 5.000.000 VNĐ vào ví điện tử!',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                context.go('/home');
              },
              child: const Text('Bắt đầu khám phá', style: TextStyle(fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.errorMessage ?? 'Đăng ký thất bại'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Đăng Ký Tài Khoản'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Chào mừng bạn đến với SmartTrip',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Tạo tài khoản để nhận ngay 5.000.000 đ vào ví',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 24),

                AppTextField(
                  controller: _fullNameController,
                  label: 'Họ và tên',
                  hint: 'Nguyễn Văn A',
                  prefixIcon: Icons.person_outline,
                  validator: (val) => val == null || val.isEmpty ? 'Vui lòng nhập họ tên' : null,
                ),
                const SizedBox(height: 16),

                AppTextField(
                  controller: _emailController,
                  label: 'Email',
                  hint: 'example@gmail.com',
                  prefixIcon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                  validator: (val) => val == null || !val.contains('@') ? 'Vui lòng nhập email hợp lệ' : null,
                ),
                const SizedBox(height: 16),

                AppTextField(
                  controller: _phoneController,
                  label: 'Số điện thoại',
                  hint: '0901234567',
                  prefixIcon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  validator: (val) => val == null || val.isEmpty ? 'Vui lòng nhập số điện thoại' : null,
                ),
                const SizedBox(height: 16),

                AppTextField(
                  controller: _passwordController,
                  label: 'Mật khẩu',
                  hint: 'Tối thiểu 6 ký tự',
                  prefixIcon: Icons.lock_outline,
                  obscureText: true,
                  validator: (val) => val == null || val.length < 6 ? 'Mật khẩu tối thiểu 6 ký tự' : null,
                ),
                const SizedBox(height: 28),

                AppButton(
                  text: 'Đăng Ký & Nhận Ví 5Tr',
                  isLoading: authProvider.isLoading,
                  onPressed: _handleRegister,
                ),
                const SizedBox(height: 16),

                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Đã có tài khoản? '),
                    GestureDetector(
                      onTap: () => context.pop(),
                      child: const Text(
                        'Đăng nhập',
                        style: TextStyle(
                          color: AppTheme.primaryColor,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
