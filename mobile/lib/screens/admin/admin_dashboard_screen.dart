import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../../database/database_helper.dart';
import '../../providers/auth_provider.dart';
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin System Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadStats,
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => context.push('/profile'),
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

                  // Doanh thu giao dịch ví
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.monetization_on, color: Colors.amber, size: 24),
                            SizedBox(width: 8),
                            Text(
                              'Tổng dòng tiền thanh toán qua Ví:',
                              style: TextStyle(color: Colors.white70, fontSize: 14),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '${currencyFormat.format(_stats['totalVolume'])} đ',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                          ),
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
