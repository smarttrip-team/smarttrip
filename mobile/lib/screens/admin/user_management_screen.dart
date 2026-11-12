import 'package:flutter/material.dart';
import '../../database/database_helper.dart';
import '../../models/user_model.dart';

class UserManagementScreen extends StatefulWidget {
  const UserManagementScreen({super.key});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen> {
  List<UserModel> _users = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() => _isLoading = true);
    final users = await DatabaseHelper.instance.getAllUsers();
    setState(() {
      _users = users;
      _isLoading = false;
    });
  }

  void _showRoleDialog(UserModel user) {
    String selectedRole = user.role;
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text('Phân quyền cho ${user.fullName}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RadioListTile<String>(
                title: const Text('Customer (Khách hàng)'),
                value: 'customer',
                groupValue: selectedRole,
                onChanged: (val) => setDialogState(() => selectedRole = val!),
              ),
              RadioListTile<String>(
                title: const Text('Tour Operator (Đối tác Tour)'),
                value: 'tour_operator',
                groupValue: selectedRole,
                onChanged: (val) => setDialogState(() => selectedRole = val!),
              ),
              RadioListTile<String>(
                title: const Text('Hotel Manager (Đối tác KS)'),
                value: 'hotel_manager',
                groupValue: selectedRole,
                onChanged: (val) => setDialogState(() => selectedRole = val!),
              ),
              RadioListTile<String>(
                title: const Text('Admin (Quản trị viên)'),
                value: 'admin',
                groupValue: selectedRole,
                onChanged: (val) => setDialogState(() => selectedRole = val!),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Hủy'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(ctx);
                await DatabaseHelper.instance.updateUserRole(user.id!, selectedRole);
                _loadUsers();
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Đã cập nhật vai trò cho ${user.fullName}!')),
                  );
                }
              },
              child: const Text('Lưu'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản Lý Người Dùng'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadUsers,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _users.length,
              itemBuilder: (context, index) {
                final user = _users[index];
                final isBlocked = user.status == 'blocked';

                Color roleColor = Colors.blue;
                String roleText = 'Khách hàng';
                if (user.role == 'tour_operator') {
                  roleColor = Colors.orange;
                  roleText = 'Tour Operator';
                } else if (user.role == 'hotel_manager') {
                  roleColor = Colors.teal;
                  roleText = 'Hotel Manager';
                } else if (user.role == 'admin') {
                  roleColor = Colors.red;
                  roleText = 'Admin';
                }

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: roleColor.withOpacity(0.15),
                              child: Text(
                                user.fullName.isNotEmpty ? user.fullName[0].toUpperCase() : 'U',
                                style: TextStyle(color: roleColor, fontWeight: FontWeight.bold),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    user.fullName,
                                    style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                                  ),
                                  Text(
                                    user.email,
                                    style: const TextStyle(color: Colors.grey, fontSize: 13),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: roleColor.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                roleText,
                                style: TextStyle(color: roleColor, fontWeight: FontWeight.w700, fontSize: 11),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Trạng thái: ${isBlocked ? "Đã khóa" : "Hoạt động"}',
                              style: TextStyle(
                                color: isBlocked ? Colors.red : Colors.green,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                            Row(
                              children: [
                                TextButton.icon(
                                  onPressed: () => _showRoleDialog(user),
                                  icon: const Icon(Icons.security, size: 16),
                                  label: const Text('Đổi quyền'),
                                ),
                                IconButton(
                                  icon: Icon(
                                    isBlocked ? Icons.lock_open : Icons.lock_outline,
                                    color: isBlocked ? Colors.green : Colors.red,
                                  ),
                                  tooltip: isBlocked ? 'Mở khóa' : 'Khóa tài khoản',
                                  onPressed: () async {
                                    final newStatus = isBlocked ? 'active' : 'blocked';
                                    await DatabaseHelper.instance.updateUserStatus(user.id!, newStatus);
                                    _loadUsers();
                                  },
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
