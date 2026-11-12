import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  Future<void> _switchDemoRole(BuildContext context, String email, String password, String roleName) async {
    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.login(email, password);
    if (context.mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Đã chuyển sang vai trò: $roleName'),
            backgroundColor: AppTheme.primaryColor,
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Đăng xuất', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              await context.read<AuthProvider>().logout();
              if (context.mounted) context.go('/login');
            },
            child: const Text('Đăng xuất'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final user = authProvider.currentUser;
    final role = authProvider.userRole;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Tài Khoản Cá Nhân', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.white,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              // 1. User Header Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.15),
                      child: Text(
                        (user?.fullName.isNotEmpty == true ? user!.fullName[0] : 'S').toUpperCase(),
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.primaryColor,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      user?.fullName ?? 'Người dùng SmartTrip',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.email ?? '',
                      style: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                      decoration: BoxDecoration(
                        color: _getRoleColor(role).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: _getRoleColor(role).withValues(alpha: 0.3)),
                      ),
                      child: Text(
                        _getRoleTitle(role).toUpperCase(),
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: _getRoleColor(role),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 2. Demo Role Switcher
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.swap_horiz, color: AppTheme.primaryColor, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Chuyển đổi 4 Vai Trò Demo (1-Tap)',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: 2.6,
                      children: [
                        _buildRoleButton(
                          context,
                          title: 'Khách hàng',
                          email: 'customer@smarttrip.com',
                          pass: '123456',
                          isSelected: role == 'customer',
                          icon: Icons.person,
                          color: Colors.blue,
                        ),
                        _buildRoleButton(
                          context,
                          title: 'Tour Operator',
                          email: 'operator@smarttrip.com',
                          pass: '123456',
                          isSelected: role == 'tour_operator',
                          icon: Icons.flight_takeoff,
                          color: Colors.orange,
                        ),
                        _buildRoleButton(
                          context,
                          title: 'Hotel Manager',
                          email: 'hotelier@smarttrip.com',
                          pass: '123456',
                          isSelected: role == 'hotel_manager',
                          icon: Icons.hotel,
                          color: Colors.teal,
                        ),
                        _buildRoleButton(
                          context,
                          title: 'Admin Hệ Thống',
                          email: 'admin@smarttrip.com',
                          pass: 'admin123',
                          isSelected: role == 'admin',
                          icon: Icons.admin_panel_settings,
                          color: Colors.purple,
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // 3. Role-specific Portal Navigation Cards
              if (role == 'tour_operator') ...[
                _buildPortalCard(
                  context,
                  title: 'Cổng Quản Lý Tour Operator',
                  subtitle: 'Tạo tour mới, chỉnh sửa và theo dõi khách đặt vé',
                  icon: Icons.business_center,
                  color: Colors.orange,
                  onTap: () => context.push('/operator'),
                ),
                const SizedBox(height: 12),
              ],

              if (role == 'hotel_manager') ...[
                _buildPortalCard(
                  context,
                  title: 'Cổng Quản Lý Khách Sạn (Hotelier)',
                  subtitle: 'Thêm khách sạn, cập nhật giá phòng & số lượng',
                  icon: Icons.hotel,
                  color: Colors.teal,
                  onTap: () => context.push('/hotelier'),
                ),
                const SizedBox(height: 12),
              ],

              if (role == 'admin') ...[
                _buildPortalCard(
                  context,
                  title: 'Bảng Điều Khiển Quản Trị (Admin Dashboard)',
                  subtitle: 'Thống kê KPI hệ thống, doanh thu và quản lý người dùng',
                  icon: Icons.dashboard_customize,
                  color: Colors.purple,
                  onTap: () => context.push('/admin'),
                ),
                const SizedBox(height: 12),
              ],

              // 4. App Info & Standalone Status
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    _buildInfoRow(Icons.storage, 'Cơ sở dữ liệu', 'SQLite FFI Engine (Offline-First)'),
                    const Divider(height: 20),
                    _buildInfoRow(Icons.lock, 'Chế độ hoạt động', 'Độc lập Standalone (Không phụ thuộc Docker)'),
                    const Divider(height: 20),
                    _buildInfoRow(Icons.info_outline, 'Phiên bản ứng dụng', '1.0.0+1 (Final Release)'),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // 5. Logout Button
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => _confirmLogout(context),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: const Icon(Icons.logout),
                  label: const Text('Đăng Xuất Tài Khoản', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRoleButton(
    BuildContext context, {
    required String title,
    required String email,
    required String pass,
    required bool isSelected,
    required IconData icon,
    required Color color,
  }) {
    return InkWell(
      onTap: () => _switchDemoRole(context, email, pass, title),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? color.withValues(alpha: 0.15) : const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? color : const Color(0xFFE2E8F0),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? color : const Color(0xFF64748B), size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: isSelected ? color : const Color(0xFF334155),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPortalCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: color.withValues(alpha: 0.3)),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.08),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: Color(0xFF94A3B8)),
        onTap: onTap,
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFF64748B)),
        const SizedBox(width: 12),
        Text(label, style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
        const Spacer(),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Color _getRoleColor(String role) {
    switch (role) {
      case 'admin':
        return Colors.purple;
      case 'tour_operator':
        return Colors.orange;
      case 'hotel_manager':
        return Colors.teal;
      default:
        return Colors.blue;
    }
  }

  String _getRoleTitle(String role) {
    switch (role) {
      case 'admin':
        return 'Quản trị viên (Admin)';
      case 'tour_operator':
        return 'Tour Operator';
      case 'hotel_manager':
        return 'Hotel Manager';
      default:
        return 'Khách hàng (Traveler)';
    }
  }
}
