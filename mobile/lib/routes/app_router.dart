import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';

GoRouter createRouter(AuthProvider authProvider) {
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: authProvider,
    redirect: (context, state) {
      final isAuth = authProvider.isAuthenticated;
      final isLoggingIn = state.matchedLocation == '/login' || state.matchedLocation == '/register';

      if (!isAuth && !isLoggingIn) {
        return '/login';
      }

      if (isAuth && isLoggingIn) {
        final role = authProvider.userRole;
        if (role == 'tour_operator') return '/operator';
        if (role == 'hotel_manager') return '/hotelier';
        if (role == 'admin') return '/admin';
        return '/home';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => _RoleWelcomeScreen(
          roleTitle: 'Khách hàng (Customer)',
          color: Colors.blue,
          icon: Icons.person,
          authProvider: authProvider,
        ),
      ),
      GoRoute(
        path: '/operator',
        builder: (context, state) => _RoleWelcomeScreen(
          roleTitle: 'Đối tác Tour (Tour Operator)',
          color: Colors.orange,
          icon: Icons.directions_bus,
          authProvider: authProvider,
        ),
      ),
      GoRoute(
        path: '/hotelier',
        builder: (context, state) => _RoleWelcomeScreen(
          roleTitle: 'Đối tác Khách sạn (Hotel Manager)',
          color: Colors.teal,
          icon: Icons.hotel,
          authProvider: authProvider,
        ),
      ),
      GoRoute(
        path: '/admin',
        builder: (context, state) => _RoleWelcomeScreen(
          roleTitle: 'Quản trị viên hệ thống (Admin)',
          color: Colors.red,
          icon: Icons.admin_panel_settings,
          authProvider: authProvider,
        ),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => Scaffold(
          appBar: AppBar(title: const Text('Hồ sơ')),
          body: Center(
            child: ElevatedButton(
              onPressed: () => authProvider.logout(),
              child: const Text('Đăng xuất'),
            ),
          ),
        ),
      ),
    ],
  );
}

class _RoleWelcomeScreen extends StatelessWidget {
  final String roleTitle;
  final Color color;
  final IconData icon;
  final AuthProvider authProvider;

  const _RoleWelcomeScreen({
    required this.roleTitle,
    required this.color,
    required this.icon,
    required this.authProvider,
  });

  @override
  Widget build(BuildContext context) {
    final user = authProvider.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: Text(roleTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Đăng xuất',
            onPressed: () async {
              await authProvider.logout();
              if (context.mounted) context.go('/login');
            },
          ),
        ],
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircleAvatar(
                radius: 40,
                backgroundColor: color.withOpacity(0.15),
                child: Icon(icon, size: 48, color: color),
              ),
              const SizedBox(height: 16),
              Text(
                'Xin chào, ${user?.fullName ?? "Người dùng"}!',
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                'Email: ${user?.email ?? ""}\nVai trò: $roleTitle',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.grey, fontSize: 14),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: color, foregroundColor: Colors.white),
                onPressed: () async {
                  await authProvider.logout();
                  if (context.mounted) context.go('/login');
                },
                icon: const Icon(Icons.logout),
                label: const Text('Đăng Xuất Demo'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
