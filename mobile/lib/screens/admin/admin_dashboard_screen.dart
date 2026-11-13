import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../database/database_helper.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/role_switcher_bottom_sheet.dart';
import '../../widgets/stat_card.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  Map<String, dynamic> _stats = {
    'userCount': 0,
    'tourCount': 0,
    'hotelCount': 0,
    'bookingCount': 0,
    'totalVolume': 0.0,
  };
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    setState(() => _isLoading = true);
    final stats = await DatabaseHelper.instance.getAdminStats();
    setState(() {
      _stats = stats;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat('#,###', 'vi_VN');
    final user = context.watch<AuthProvider>().currentUser;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          tooltip: 'Quay lại',
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/home');
            }
          },
        ),
        title: const Text('Admin System Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.swap_horiz_rounded),
            tooltip: 'Đổi vai trò',
            onPressed: () => showRoleSwitcherBottomSheet(context),
          ),
          IconButton(
            icon: const Icon(Icons.home_outlined),
            tooltip: 'Trang chủ Khách hàng',
            onPressed: () => context.go('/home'),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Làm mới',
            onPressed: _loadStats,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Đăng xuất',
            onPressed: () => showLogoutConfirmDialog(context),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Role Banner Card
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.purple.shade200),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.purple.withValues(alpha: 0.08),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.purple.shade50,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.admin_panel_settings_rounded, color: Colors.purple, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Vai trò: Quản trị viên (Admin)',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF7E22CE)),
                              ),
                              Text(
                                user?.email ?? 'admin@smarttrip.com',
                                style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                              ),
                            ],
                          ),
                        ),
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.purple,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            elevation: 0,
                          ),
                          icon: const Icon(Icons.swap_horiz, size: 16),
                          label: const Text('Đổi Role', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                          onPressed: () => showRoleSwitcherBottomSheet(context),
                        ),
                      ],
                    ),
                  ),

                  const Text(
                    'Tổng quan toàn hệ thống',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF1E293B)),
                  ),
                  const SizedBox(height: 16),

                  // 4 Thẻ KPI
                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          title: 'Người dùng',
                          value: '${_stats['userCount']}',
                          icon: Icons.people,
                          color: Colors.blue,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: StatCard(
                          title: 'Tours đăng bán',
                          value: '${_stats['tourCount']}',
                          icon: Icons.tour,
                          color: Colors.orange,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          title: 'Khách sạn',
                          value: '${_stats['hotelCount']}',
                          icon: Icons.hotel,
                          color: Colors.teal,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: StatCard(
                          title: 'Đơn đặt tour',
                          value: '${_stats['bookingCount']}',
                          icon: Icons.receipt,
                          color: Colors.purple,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Doanh thu giao dịch ví & Phân chia 90/90/10
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF581C87), Color(0xFF3B0764)],
                      ),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.purple.withValues(alpha: 0.25),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.monetization_on, color: Colors.amber, size: 24),
                            SizedBox(width: 8),
                            Text(
                              'Doanh Thu Phí Sàn SmartTrip (10%):',
                              style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${currencyFormat.format(_stats['systemCommission'] ?? 0)} đ',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 12),
                        const Divider(color: Colors.white24, height: 1),
                        const SizedBox(height: 10),
                        const Text(
                          'Cơ cấu dòng tiền sau khi xong tour (90/90/10):',
                          style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('✈️ Chi trả Tour Operators (90%):', style: TextStyle(color: Colors.white70, fontSize: 12)),
                            Text('${currencyFormat.format(_stats['operatorPayout'] ?? 0)} đ', style: const TextStyle(color: Colors.orangeAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('🏨 Chi trả Hoteliers (90%):', style: TextStyle(color: Colors.white70, fontSize: 12)),
                            Text('${currencyFormat.format(_stats['hotelierPayout'] ?? 0)} đ', style: const TextStyle(color: Colors.tealAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('💰 Tổng tiền tour đã hoàn thành:', style: TextStyle(color: Colors.white70, fontSize: 12)),
                            Text('${currencyFormat.format(_stats['totalVolume'] ?? 0)} đ', style: const TextStyle(color: Colors.amberAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Menu Quản lý
                  const Text(
                    'Chức năng quản trị',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 12),

                  Card(
                    child: ListTile(
                      leading: const CircleAvatar(
                        backgroundColor: Color(0xFFF3E8FF),
                        child: Icon(Icons.receipt_long, color: Colors.purple),
                      ),
                      title: const Text('Quản lý Đơn đặt Tour & Doanh thu 90/90/10', style: TextStyle(fontWeight: FontWeight.w700)),
                      subtitle: const Text('Xem tất cả đơn đặt tour của khách, duyệt xong tour & chia tiền'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        context.push('/admin/bookings');
                      },
                    ),
                  ),
                  const SizedBox(height: 8),

                  Card(
                    child: ListTile(
                      leading: const CircleAvatar(
                        backgroundColor: Color(0xFFE0F2FE),
                        child: Icon(Icons.manage_accounts, color: Colors.blue),
                      ),
                      title: const Text('Quản lý Người dùng & Phân quyền', style: TextStyle(fontWeight: FontWeight.w700)),
                      subtitle: const Text('Khóa/mở khóa tài khoản, cấp quyền Tour Op, Hotelier'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        context.push('/admin/users');
                      },
                    ),
                  ),
                  const SizedBox(height: 8),

                  Card(
                    child: ListTile(
                      leading: const CircleAvatar(
                        backgroundColor: Color(0xFFDCFCE7),
                        child: Icon(Icons.travel_explore, color: Colors.green),
                      ),
                      title: const Text('Xem giao diện Khách hàng (Preview)', style: TextStyle(fontWeight: FontWeight.w700)),
                      subtitle: const Text('Trải nghiệm ứng dụng từ góc nhìn của khách đặt tour'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        context.push('/home');
                      },
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
