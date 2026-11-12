import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../features/auth/login_screen.dart';
import '../../features/tours/tour_list_screen.dart';
import '../../features/tours/tour_detail_screen.dart';
import '../../features/booking/checkout_screen.dart';
import '../../features/booking/booking_history_screen.dart';
import '../../features/booking/booking_tracking_screen.dart';
import '../../features/wallet/wallet_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/hotels/hotel_manager_screen.dart';
import '../../shared/models/models.dart';

GoRouter createAppRouter(AuthProvider authProvider) {
  return GoRouter(
    initialLocation: '/tours',
    refreshListenable: authProvider,
    redirect: (BuildContext context, GoRouterState state) {
      final isLoggedIn = authProvider.isLoggedIn;
      final isLoggingIn = state.matchedLocation == '/login';

      // 1. Unauthenticated Guard
      if (!isLoggedIn) {
        return isLoggingIn ? null : '/login';
      }

      // 2. Authenticated user accessing /login
      if (isLoggingIn) {
        return '/tours';
      }

      // 3. Hotel Manager Route Guard
      if (state.matchedLocation.startsWith('/hotel-manager')) {
        if (!authProvider.isHotelManager) {
          return '/profile';
        }
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/tours',
        builder: (context, state) => const MainNavigationScreen(initialIndex: 0),
        routes: [
          GoRoute(
            path: 'detail',
            builder: (context, state) {
              final tour = state.extra as Tour;
              return TourDetailScreen(tour: tour);
            },
          ),
          GoRoute(
            path: 'checkout',
            builder: (context, state) {
              final extra = state.extra as Map<String, dynamic>;
              return CheckoutScreen(
                tour: extra['tour'] as Tour,
                departure: extra['departure'] as Departure,
                quantity: extra['quantity'] as int,
              );
            },
          ),
        ],
      ),
      GoRoute(
        path: '/bookings',
        builder: (context, state) => const MainNavigationScreen(initialIndex: 1),
        routes: [
          GoRoute(
            path: 'tracking/:code',
            builder: (context, state) {
              final code = state.pathParameters['code'] ?? '';
              return BookingTrackingScreen(bookingCode: code);
            },
          ),
        ],
      ),
      GoRoute(
        path: '/wallet',
        builder: (context, state) => const MainNavigationScreen(initialIndex: 2),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const MainNavigationScreen(initialIndex: 3),
      ),
      GoRoute(
        path: '/hotel-manager',
        builder: (context, state) => const HotelManagerScreen(),
      ),
    ],
  );
}

class MainNavigationScreen extends StatefulWidget {
  final int initialIndex;
  const MainNavigationScreen({super.key, this.initialIndex = 0});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  late int _currentIndex;

  final List<Widget> _screens = const [
    TourListScreen(),
    BookingHistoryScreen(),
    WalletScreen(),
    ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
  }

  @override
  void didUpdateWidget(covariant MainNavigationScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialIndex != widget.initialIndex) {
      setState(() {
        _currentIndex = widget.initialIndex;
      });
    }
  }

  void _onTabTapped(int index) {
    setState(() => _currentIndex = index);
    switch (index) {
      case 0:
        context.go('/tours');
        break;
      case 1:
        context.go('/bookings');
        break;
      case 2:
        context.go('/wallet');
        break;
      case 3:
        context.go('/profile');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _onTabTapped,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Theme.of(context).primaryColor,
        unselectedItemColor: Colors.grey.shade600,
        selectedFontSize: 12,
        unselectedFontSize: 12,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.explore_outlined),
            activeIcon: Icon(Icons.explore),
            label: 'Khám phá',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.confirmation_number_outlined),
            activeIcon: Icon(Icons.confirmation_number),
            label: 'Chuyến đi',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.account_balance_wallet_outlined),
            activeIcon: Icon(Icons.account_balance_wallet),
            label: 'Ví Pay',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Tài khoản',
          ),
        ],
      ),
    );
  }
}
