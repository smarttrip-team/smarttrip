import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

void showRoleSwitcherBottomSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => const RoleSwitcherBottomSheet(),
  );
}

void showLogoutConfirmDialog(BuildContext context) {
  showDialog(
    context: context,
    builder: (ctx) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: const Row(
        children: [
          Icon(Icons.logout, color: Colors.red),
          SizedBox(width: 8),
          Text('Đăng Xuất', style: TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
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
            if (context.mounted) {
              context.go('/login');
            }
          },
          child: const Text('Đăng xuất'),
        ),
      ],
    ),
  );
}

class RoleSwitcherBottomSheet extends StatelessWidget {
  const RoleSwitcherBottomSheet({super.key});

  Future<void> _switchRole(
    BuildContext context, {
    required String email,
    required String password,
    required String roleName,
    required String targetRoute,
  }) async {
    Navigator.pop(context); // Close bottom sheet
    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.login(email, password);

    if (context.mounted && success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Expanded(child: Text('Đã chuyển sang vai trò: $roleName')),
            ],
          ),
          backgroundColor: AppTheme.primaryColor,
          duration: const Duration(seconds: 2),
          behavior: SnackBarBehavior.floating,
        ),
      );
      context.go(targetRoute);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final currentRole = authProvider.userRole;
    final user = authProvider.currentUser;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.only(top: 16, bottom: 28, left: 20, right: 20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Drag Handle
          Center(
            child: Container(
              width: 44,
              height: 4,
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Chuyển Đổi Vai Trò',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Chọn vai trò để trải nghiệm tính năng tương ứng',
                    style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Color(0xFF64748B)),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Current User Status
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(Icons.account_circle, color: Color(0xFF475569), size: 22),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Đang đăng nhập: ${user?.fullName ?? "Người dùng"} (${user?.email ?? ""})',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 4 Roles Options
          _buildRoleTile(
            context,
            title: 'Khách hàng (Traveler)',
            subtitle: 'Khám phá tour du lịch, đặt vé, nạp tiền ví SmartTrip',
            icon: Icons.person_rounded,
            color: Colors.blue,
            email: 'customer@smarttrip.com',
            pass: '123456',
            targetRoute: '/home',
            isSelected: currentRole == 'customer',
          ),
          const SizedBox(height: 10),

          _buildRoleTile(
            context,
            title: 'Tour Operator (Đối tác Tour)',
            subtitle: 'Đăng tour mới, chỉnh sửa giá/lịch trình, duyệt vé khách đặt',
            icon: Icons.flight_takeoff_rounded,
            color: Colors.orange,
            email: 'operator@smarttrip.com',
            pass: '123456',
            targetRoute: '/operator',
            isSelected: currentRole == 'tour_operator',
          ),
          const SizedBox(height: 10),

          _buildRoleTile(
            context,
            title: 'Hotel Manager (Quản lý Khách sạn)',
            subtitle: 'Thêm khách sạn/resort, quản lý phòng và giá phòng theo đêm',
            icon: Icons.hotel_rounded,
            color: Colors.teal,
            email: 'hotelier@smarttrip.com',
            pass: '123456',
            targetRoute: '/hotelier',
            isSelected: currentRole == 'hotel_manager',
          ),
          const SizedBox(height: 10),

          _buildRoleTile(
            context,
            title: 'Quản trị viên (Admin Hệ Thống)',
            subtitle: 'Thống kê KPI toàn sàn, theo dõi doanh thu ví, phân quyền',
            icon: Icons.admin_panel_settings_rounded,
            color: Colors.purple,
            email: 'admin@smarttrip.com',
            pass: 'admin123',
            targetRoute: '/admin',
            isSelected: currentRole == 'admin',
          ),
          const SizedBox(height: 16),

          // Direct Navigation to Home
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              icon: const Icon(Icons.home_outlined),
              label: const Text('Về Trang Chủ Khách Hàng (Home)'),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF334155),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                Navigator.pop(context);
                context.go('/home');
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleTile(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required String email,
    required String pass,
    required String targetRoute,
    required bool isSelected,
  }) {
    return InkWell(
      onTap: () => _switchRole(
        context,
        email: email,
        password: pass,
        roleName: title,
        targetRoute: targetRoute,
      ),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? color.withValues(alpha: 0.08) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? color : const Color(0xFFE2E8F0),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(
                          title,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: isSelected ? color : const Color(0xFF1E293B),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (isSelected) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: color,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'Hiện tại',
                            style: TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            Icon(
              isSelected ? Icons.check_circle : Icons.chevron_right,
              color: isSelected ? color : const Color(0xFF94A3B8),
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}
