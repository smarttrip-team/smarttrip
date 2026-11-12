import 'package:go_router/go_router.dart';
import '../models/tour_model.dart';
import '../providers/auth_provider.dart';
import '../screens/admin/admin_dashboard_screen.dart';
import '../screens/admin/user_management_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/booking/booking_screen.dart';
import '../screens/home/main_navigation_screen.dart';
import '../screens/hotel/hotelier_dashboard_screen.dart';
import '../screens/operator/operator_dashboard_screen.dart';
import '../screens/operator/tour_form_screen.dart';
import '../screens/tour/tour_detail_screen.dart';

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
        builder: (context, state) => const MainNavigationScreen(initialTab: 0),
      ),
      GoRoute(
        path: '/bookings',
        builder: (context, state) => const MainNavigationScreen(initialTab: 1),
      ),
      GoRoute(
        path: '/wallet',
        builder: (context, state) => const MainNavigationScreen(initialTab: 2),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const MainNavigationScreen(initialTab: 3),
      ),
      GoRoute(
        path: '/tour/:id',
        builder: (context, state) {
          final tour = state.extra as TourModel;
          return TourDetailScreen(tour: tour);
        },
      ),
      GoRoute(
        path: '/booking',
        builder: (context, state) {
          final tour = state.extra as TourModel;
          return BookingScreen(tour: tour);
        },
      ),
      GoRoute(
        path: '/operator',
        builder: (context, state) => const OperatorDashboardScreen(),
      ),
      GoRoute(
        path: '/operator/tour-form',
        builder: (context, state) {
          final tour = state.extra as TourModel?;
          return TourFormScreen(tour: tour);
        },
      ),
      GoRoute(
        path: '/hotelier',
        builder: (context, state) => const HotelierDashboardScreen(),
      ),
      GoRoute(
        path: '/admin',
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: '/admin/users',
        builder: (context, state) => const UserManagementScreen(),
      ),
    ],
  );
}
