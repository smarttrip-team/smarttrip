import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'customer@smarttrip.com');
  final _passwordController = TextEditingController(text: '123456');
  final _formKey = GlobalKey<FormState>();

  void _fillDemoAccount(String email, String password) {
    setState(() {
      _emailController.text = email;
      _passwordController.text = password;
    });
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.login(
      _emailController.text,
      _passwordController.text,
    );

    if (!mounted) return;

    if (success) {
      final role = authProvider.userRole;
      if (role == 'tour_operator') {
        context.go('/operator');
      } else if (role == 'hotel_manager') {
        context.go('/hotelier');
      } else if (role == 'admin') {
        context.go('/admin');
      } else {
        context.go('/home');
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.errorMessage ?? 'Đăng nhập thất bại'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo & Tiêu đề
                  Center(
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: AppTheme.primaryColor.withOpacity(0.12),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.travel_explore,
                        color: AppTheme.primaryColor,
                        size: 48,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'SmartTrip Mobile',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Ứng dụng Du lịch & Đặt Tour Thông Minh',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Ô nhập Email
                  AppTextField(
                    controller: _emailController,
                    label: 'Email',
                    hint: 'Nhập email của bạn',
                    prefixIcon: Icons.email_outlined,
                    keyboardType: TextInputType.emailAddress,
                    validator: (val) => val == null || val.isEmpty ? 'Vui lòng nhập email' : null,
                  ),
                  const SizedBox(height: 16),

                  // Ô nhập Password
                  AppTextField(
                    controller: _passwordController,
                    label: 'Mật khẩu',
                    hint: 'Nhập mật khẩu',
                    prefixIcon: Icons.lock_outline,
                    obscureText: true,
                    validator: (val) => val == null || val.isEmpty ? 'Vui lòng nhập mật khẩu' : null,
                  ),
                  const SizedBox(height: 24),

                  // Nút Đăng nhập
                  AppButton(
                    text: 'Đăng Nhập',
                    isLoading: authProvider.isLoading,
                    onPressed: _handleLogin,
                  ),
                  const SizedBox(height: 16),

                  // Đăng ký
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('Chưa có tài khoản? '),
                      GestureDetector(
                        onTap: () => context.push('/register'),
                        child: const Text(
                          'Đăng ký ngay',
                          style: TextStyle(
                            color: AppTheme.primaryColor,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),

                  // VÙNG SHORTCUT DEMO 4 ROLES DÀNH CHO GIẢNG VIÊN / CHẤM BÀI
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFCBD5E1)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.flash_on, color: Colors.amber, size: 20),
                            SizedBox(width: 6),
                            Text(
                              'Shortcut Demo 4 Roles (Chọn nhanh)',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF334155),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            ActionChip(
                              avatar: const Icon(Icons.person, size: 16, color: Colors.blue),
                              label: const Text('Khách hàng'),
                              onPressed: () => _fillDemoAccount('customer@smarttrip.com', '123456'),
                            ),
                            ActionChip(
                              avatar: const Icon(Icons.directions_bus, size: 16, color: Colors.orange),
                              label: const Text('Tour Operator'),
                              onPressed: () => _fillDemoAccount('operator@smarttrip.com', '123456'),
                            ),
                            ActionChip(
                              avatar: const Icon(Icons.hotel, size: 16, color: Colors.teal),
                              label: const Text('Hotel Manager'),
                              onPressed: () => _fillDemoAccount('hotelier@smarttrip.com', '123456'),
                            ),
                            ActionChip(
                              avatar: const Icon(Icons.admin_panel_settings, size: 16, color: Colors.red),
                              label: const Text('Admin'),
                              onPressed: () => _fillDemoAccount('admin@smarttrip.com', 'admin123'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
