import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'app/theme/app_theme.dart';
import 'app/router/app_router.dart';
import 'core/storage/session_storage.dart';
import 'core/providers/auth_provider.dart';
import 'core/providers/tour_provider.dart';
import 'core/providers/wallet_provider.dart';
import 'core/providers/booking_provider.dart';
import 'core/providers/hotel_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SessionStorage.init();
  final authProvider = AuthProvider();
  runApp(SmartTripApp(authProvider: authProvider));
}

class SmartTripApp extends StatefulWidget {
  final AuthProvider authProvider;
  const SmartTripApp({super.key, required this.authProvider});

  @override
  State<SmartTripApp> createState() => _SmartTripAppState();
}

class _SmartTripAppState extends State<SmartTripApp> {
  late final _router = createAppRouter(widget.authProvider);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthProvider>.value(value: widget.authProvider),
        ChangeNotifierProvider<TourProvider>(create: (_) => TourProvider()),
        ChangeNotifierProvider<WalletProvider>(create: (_) => WalletProvider()),
        ChangeNotifierProvider<BookingProvider>(create: (_) => BookingProvider()),
        ChangeNotifierProvider<HotelProvider>(create: (_) => HotelProvider()),
      ],
      child: MaterialApp.router(
        title: 'SmartTrip Mobile',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        routerConfig: _router,
      ),
    );
  }
}
