import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  String get _platformName {
    if (kIsWeb) return 'Web Browser';
    try {
      if (Platform.isWindows) return 'Windows Desktop (Win32)';
      if (Platform.isAndroid) return 'Android OS';
      if (Platform.isIOS) return 'Apple iOS';
      if (Platform.isMacOS) return 'macOS Desktop';
      if (Platform.isLinux) return 'Linux Desktop';
    } catch (_) {}
    return 'Desktop/Client';
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tài khoản của tôi'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // User Avatar Card
            Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 44,
                    backgroundColor: Colors.indigo.shade100,
                    child: Text(
                      (auth.fullName ?? 'U').substring(0, 1).toUpperCase(),
                      style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.indigo),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    auth.fullName ?? 'Khách hàng SmartTrip',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    auth.email ?? 'chưa đăng nhập',
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.indigo.withAlpha(25),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'Role: ${auth.role ?? "ROLE_CUSTOMER"}',
                          style: const TextStyle(fontSize: 12, color: Colors.indigo, fontWeight: FontWeight.bold),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.teal.withAlpha(25),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'Nền tảng: $_platformName',
                          style: const TextStyle(fontSize: 12, color: Colors.teal, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Hotel Manager Shortcut (Issue #59 & #61)
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: Colors.indigo.shade200, width: 1.5),
              ),
              color: Colors.indigo.shade50.withAlpha(100),
              child: ListTile(
                leading: const CircleAvatar(
                  backgroundColor: Colors.indigo,
                  child: Icon(Icons.apartment_rounded, color: Colors.white),
                ),
                title: const Text(
                  'Hotel Manager Portal',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Text(
                  auth.isHotelManager
                      ? 'Quản lý CRUD khách sạn, cấu hình giá & tồn kho phòng'
                      : 'Cần quyền ROLE_HOTEL_MANAGER (Chuyển đổi demo bên dưới)',
                  style: const TextStyle(fontSize: 12),
                ),
                trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                onTap: () {
                  context.push('/hotel-manager');
                },
              ),
            ),
            const SizedBox(height: 16),

            // Role Switcher Helper for Demo
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: Colors.grey.shade200),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Chuyển đổi vai trò kiểm thử (Demo Switcher):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () {
                              auth.switchRoleDemo(
                                newRole: 'ROLE_CUSTOMER',
                                newEmail: 'vinhle@smarttrip.com',
                                newName: 'Lê Quang Vĩnh (Customer)',
                              );
                            },
                            child: const Text('Customer', style: TextStyle(fontSize: 12)),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.teal, foregroundColor: Colors.white),
                            onPressed: () {
                              auth.switchRoleDemo(
                                newRole: 'ROLE_HOTEL_MANAGER',
                                newEmail: 'hotelier@smarttrip.com',
                                newName: 'Lê Quang Vĩnh (Hotelier)',
                              );
                            },
                            child: const Text('Hotelier', style: TextStyle(fontSize: 12)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // System Information Card
            Card(
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: Colors.grey.shade200),
              ),
              child: const Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Thông tin Hệ thống & Microservices', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    Divider(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('API Gateway:'),
                        Text('Port 8080 (Spring Cloud Gateway)', style: TextStyle(fontWeight: FontWeight.w500)),
                      ],
                    ),
                    SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Service Registry:'),
                        Text('Eureka Server (Port 8761)', style: TextStyle(fontWeight: FontWeight.w500)),
                      ],
                    ),
                    SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Message Broker:'),
                        Text('RabbitMQ (Saga Orchestration)', style: TextStyle(fontWeight: FontWeight.w500)),
                      ],
                    ),
                    SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Navigation Engine:'),
                        Text('GoRouter v14 with Route Guards', style: TextStyle(fontWeight: FontWeight.w500)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Logout Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () async {
                  await auth.logout();
                },
                icon: const Icon(Icons.logout, color: Colors.red),
                label: const Text('Đăng xuất phiên làm việc', style: TextStyle(color: Colors.red)),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.red),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
