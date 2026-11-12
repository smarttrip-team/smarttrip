import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:smarttrip_mobile/database/database_helper.dart';
import 'package:smarttrip_mobile/models/hotel_model.dart';
import 'package:smarttrip_mobile/models/tour_model.dart';
import 'package:smarttrip_mobile/providers/auth_provider.dart';
import 'package:smarttrip_mobile/providers/tour_provider.dart';
import 'package:smarttrip_mobile/providers/hotel_provider.dart';
import 'package:smarttrip_mobile/providers/wallet_provider.dart';
import 'package:smarttrip_mobile/providers/booking_provider.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    await DatabaseHelper.instance.initInMemoryForTesting();
  });

  tearDown(() async {
    await DatabaseHelper.instance.closeForTesting();
  });

  group('1. DatabaseHelper & Auto-seeding Tests', () {
    test('Khởi tạo database và tự động seed 4 tài khoản cho 4 vai trò', () async {
      final allUsers = await DatabaseHelper.instance.getAllUsers();
      final customer = allUsers.firstWhere((u) => u.email == 'customer@smarttrip.com');
      final operator = allUsers.firstWhere((u) => u.email == 'operator@smarttrip.com');
      final hotelier = allUsers.firstWhere((u) => u.email == 'hotelier@smarttrip.com');
      final admin = allUsers.firstWhere((u) => u.email == 'admin@smarttrip.com');

      expect(customer.role, 'customer');
      expect(operator.role, 'tour_operator');
      expect(hotelier.role, 'hotel_manager');
      expect(admin.role, 'admin');
    });

    test('Seed danh sách Tours và Hotels ban đầu', () async {
      final tours = await DatabaseHelper.instance.getAllTours();
      final hotels = await DatabaseHelper.instance.getAllHotels();

      expect(tours.length, greaterThanOrEqualTo(5));
      expect(hotels.length, greaterThanOrEqualTo(4));
    });

    test('Seed số dư ví ban đầu cho khách hàng demo (10,000,000 VNĐ)', () async {
      final allUsers = await DatabaseHelper.instance.getAllUsers();
      final customer = allUsers.firstWhere((u) => u.email == 'customer@smarttrip.com');
      final balance = await DatabaseHelper.instance.getWalletBalance(customer.id!);
      expect(balance, equals(10000000.0));
    });
  });

  group('2. AuthProvider & Authentication Flow Tests', () {
    test('Đăng nhập thành công với tài khoản hợp lệ', () async {
      final authProvider = AuthProvider();
      final success = await authProvider.login('customer@smarttrip.com', '123456');

      expect(success, isTrue);
      expect(authProvider.isAuthenticated, isTrue);
      expect(authProvider.currentUser?.email, 'customer@smarttrip.com');
      expect(authProvider.userRole, 'customer');
      expect(authProvider.errorMessage, isNull);
    });

    test('Đăng nhập thất bại khi sai mật khẩu', () async {
      final authProvider = AuthProvider();
      final success = await authProvider.login('customer@smarttrip.com', 'wrongpassword');

      expect(success, isFalse);
      expect(authProvider.isAuthenticated, isFalse);
      expect(authProvider.errorMessage, isNotNull);
    });

    test('Đăng nhập 4 vai trò Demo trong hệ thống', () async {
      final authProvider = AuthProvider();

      // Login Operator
      final opSuccess = await authProvider.login('operator@smarttrip.com', '123456');
      expect(opSuccess, isTrue);
      expect(authProvider.userRole, 'tour_operator');

      // Login Hotel Manager
      final hotelSuccess = await authProvider.login('hotelier@smarttrip.com', '123456');
      expect(hotelSuccess, isTrue);
      expect(authProvider.userRole, 'hotel_manager');

      // Login Admin
      final adminSuccess = await authProvider.login('admin@smarttrip.com', 'admin123');
      expect(adminSuccess, isTrue);
      expect(authProvider.userRole, 'admin');
    });

    test('Đăng ký tài khoản mới thành công và nhận thưởng chào mừng 5 triệu', () async {
      final authProvider = AuthProvider();
      final success = await authProvider.register(
        fullName: 'Phạm Thị Lan',
        email: 'lanpham@smarttrip.com',
        password: 'password123',
        phone: '0988776655',
        role: 'customer',
      );

      expect(success, isTrue);
      expect(authProvider.isAuthenticated, isTrue);
      expect(authProvider.currentUser?.email, 'lanpham@smarttrip.com');

      // Kiểm tra ví được tự động tặng 5.000.000 VNĐ
      final walletBalance = await DatabaseHelper.instance.getWalletBalance(authProvider.currentUser!.id!);
      expect(walletBalance, equals(5000000.0));
    });

    test('Đăng xuất xóa session người dùng', () async {
      final authProvider = AuthProvider();
      await authProvider.login('customer@smarttrip.com', '123456');
      expect(authProvider.isAuthenticated, isTrue);

      await authProvider.logout();
      expect(authProvider.isAuthenticated, isFalse);
      expect(authProvider.currentUser, isNull);
    });
  });

  group('3. TourProvider & Live Search / Filter Tests', () {
    test('Tải danh sách tour và lọc theo từ khóa tìm kiếm', () async {
      final tourProvider = TourProvider();
      await tourProvider.loadTours();

      expect(tourProvider.tours.isNotEmpty, isTrue);
      final initialCount = tourProvider.tours.length;

      // Tìm kiếm từ khóa 'Đà Nẵng'
      tourProvider.searchTours('Đà Nẵng');
      expect(tourProvider.tours.length, lessThanOrEqualTo(initialCount));
      expect(tourProvider.tours.every((t) => t.title.toLowerCase().contains('đà nẵng') || t.destination.toLowerCase().contains('đà nẵng')), isTrue);

      // Reset tìm kiếm
      tourProvider.searchTours('');
      expect(tourProvider.tours.length, equals(initialCount));
    });

    test('Lọc tour theo thể loại (Category)', () async {
      final tourProvider = TourProvider();
      await tourProvider.loadTours();

      tourProvider.setCategory('Biển đảo');
      expect(tourProvider.tours.every((t) => t.category == 'Biển đảo'), isTrue);

      tourProvider.setCategory('Tất cả');
      expect(tourProvider.tours.length, greaterThan(1));
    });

    test('Thêm, cập nhật và xóa Tour của Tour Operator', () async {
      final tourProvider = TourProvider();
      final allUsers = await DatabaseHelper.instance.getAllUsers();
      final operator = allUsers.firstWhere((u) => u.email == 'operator@smarttrip.com');

      // 1. Thêm Tour mới
      final newTour = TourModel(
        operatorId: operator.id!,
        title: 'Tour Thử Nghiệm Quy Nhơn',
        destination: 'Quy Nhơn - Bình Định',
        description: 'Khám phá Kỳ Co, Eo Gió 3 ngày 2 đêm',
        price: 3200000.0,
        duration: '3 ngày 2 đêm',
        imageUrl: 'https://images.unsplash.com/photo-test',
        category: 'Biển đảo',
      );

      final addSuccess = await tourProvider.addTour(newTour);
      expect(addSuccess, isTrue);

      // Kiểm tra tour đã có trong DB
      final opTours = await tourProvider.getToursByOperator(operator.id!);
      final created = opTours.firstWhere((t) => t.title == 'Tour Thử Nghiệm Quy Nhơn');
      expect(created, isNotNull);

      // 2. Cập nhật Tour
      final updatedTour = created.copyWith(price: 3500000.0, title: 'Tour Quy Nhơn Cao Cấp');
      final updateSuccess = await tourProvider.updateTour(updatedTour);
      expect(updateSuccess, isTrue);

      // 3. Xóa Tour
      final deleteSuccess = await tourProvider.deleteTour(created.id!);
      expect(deleteSuccess, isTrue);
    });
  });

  group('4. HotelProvider & Hotel Management Tests', () {
    test('Tải danh sách khách sạn và chọn khách sạn liên kết', () async {
      final hotelProvider = HotelProvider();
      await hotelProvider.loadHotels();

      expect(hotelProvider.hotels.isNotEmpty, isTrue);
      final firstHotel = hotelProvider.hotels.first;

      hotelProvider.selectHotel(firstHotel);
      expect(hotelProvider.selectedHotel?.id, equals(firstHotel.id));

      hotelProvider.clearSelection();
      expect(hotelProvider.selectedHotel, isNull);
    });

    test('Thêm khách sạn mới cho Hotel Manager', () async {
      final hotelProvider = HotelProvider();
      final allUsers = await DatabaseHelper.instance.getAllUsers();
      final hotelManager = allUsers.firstWhere((u) => u.email == 'hotelier@smarttrip.com');

      final newHotel = HotelModel(
        managerId: hotelManager.id!,
        name: 'SmartTrip Luxury Resort Phan Thiết',
        location: 'Phan Thiết, Bình Thuận',
        pricePerNight: 1800000.0,
        imageUrl: 'https://images.unsplash.com/photo-hotel-test',
        starRating: 5,
        totalRooms: 60,
      );

      final success = await hotelProvider.addHotel(newHotel);
      expect(success, isTrue);

      final managerHotels = await hotelProvider.getHotelsByManager(hotelManager.id!);
      expect(managerHotels.any((h) => h.name == 'SmartTrip Luxury Resort Phan Thiết'), isTrue);
    });
  });

  group('5. WalletProvider & Transaction Ledger Tests', () {
    test('Tải số dư và nạp tiền vào Ví điện tử', () async {
      final walletProvider = WalletProvider();
      final allUsers = await DatabaseHelper.instance.getAllUsers();
      final customer = allUsers.firstWhere((u) => u.email == 'customer@smarttrip.com');

      await walletProvider.loadWallet(customer.id!);
      final initialBalance = walletProvider.balance;

      // Nạp 1,000,000 VNĐ
      final topUpSuccess = await walletProvider.topUp(customer.id!, 1000000.0);
      expect(topUpSuccess, isTrue);
      expect(walletProvider.balance, equals(initialBalance + 1000000.0));

      // Kiểm tra có ghi nhận lịch sử giao dịch (Ledger)
      expect(walletProvider.transactions.isNotEmpty, isTrue);
      final latestTx = walletProvider.transactions.first;
      expect(latestTx.amount, equals(1000000.0));
      expect(latestTx.type, equals('TOPUP'));
    });
  });

  group('6. BookingProvider & Booking / Cancellation Flow Tests', () {
    test('Đặt tour, trừ tiền ví tự động và kiểm tra lịch sử đặt chỗ', () async {
      final bookingProvider = BookingProvider();
      final allUsers = await DatabaseHelper.instance.getAllUsers();
      final customer = allUsers.firstWhere((u) => u.email == 'customer@smarttrip.com');

      final tours = await DatabaseHelper.instance.getAllTours();
      expect(tours.isNotEmpty, isTrue);
      final tour = tours.first;

      final initialWalletBalance = await DatabaseHelper.instance.getWalletBalance(customer.id!);
      final bookingTotal = 2500000.0;

      // Tạo đơn đặt chỗ
      final bookingId = await bookingProvider.createBookingAndPay(
        userId: customer.id!,
        tourId: tour.id!,
        hotelId: null,
        departureDate: '2026-12-25',
        adultCount: 1,
        childCount: 0,
        totalAmount: bookingTotal,
      );

      expect(bookingId, isNotNull);

      // Kiểm tra số dư ví đã bị trừ chính xác
      final updatedWalletBalance = await DatabaseHelper.instance.getWalletBalance(customer.id!);
      expect(updatedWalletBalance, equals(initialWalletBalance - bookingTotal));

      // Kiểm tra danh sách vé của khách
      await bookingProvider.loadUserBookings(customer.id!);
      final myBooking = bookingProvider.userBookings.firstWhere((b) => b.id == bookingId);
      expect(myBooking.status, equals('CONFIRMED'));
      expect(myBooking.totalAmount, equals(bookingTotal));
    });

    test('Hủy tour tự động hoàn 100% tiền về Ví điện tử', () async {
      final bookingProvider = BookingProvider();
      final allUsers = await DatabaseHelper.instance.getAllUsers();
      final customer = allUsers.firstWhere((u) => u.email == 'customer@smarttrip.com');

      final tours = await DatabaseHelper.instance.getAllTours();
      final tour = tours.first;
      final bookingAmount = 1800000.0;

      // 1. Đặt tour
      final bookingId = await bookingProvider.createBookingAndPay(
        userId: customer.id!,
        tourId: tour.id!,
        hotelId: null,
        departureDate: '2026-12-30',
        adultCount: 1,
        childCount: 0,
        totalAmount: bookingAmount,
      );
      expect(bookingId, isNotNull);

      final balanceBeforeCancel = await DatabaseHelper.instance.getWalletBalance(customer.id!);

      // 2. Hủy tour
      final cancelSuccess = await bookingProvider.cancelBookingAndRefund(bookingId!, customer.id!);
      expect(cancelSuccess, isTrue);

      // 3. Kiểm tra số dư ví được hoàn lại đầy đủ
      final balanceAfterCancel = await DatabaseHelper.instance.getWalletBalance(customer.id!);
      expect(balanceAfterCancel, equals(balanceBeforeCancel + bookingAmount));

      // 4. Kiểm tra trạng thái đơn đặt chỗ chuyển sang CANCELLED
      await bookingProvider.loadUserBookings(customer.id!);
      final cancelledBooking = bookingProvider.userBookings.firstWhere((b) => b.id == bookingId);
      expect(cancelledBooking.status, equals('CANCELLED'));
    });
  });

  group('7. Admin System & User Management Tests', () {
    test('Thống kê số liệu hệ thống KPI Dashboard', () async {
      final stats = await DatabaseHelper.instance.getAdminStats();
      expect(stats['userCount'], greaterThanOrEqualTo(4));
      expect(stats['tourCount'], greaterThanOrEqualTo(5));
      expect(stats['hotelCount'], greaterThanOrEqualTo(4));
    });

    test('Quản lý User: Phân quyền và Khóa/Kích hoạt tài khoản', () async {
      final allUsers = await DatabaseHelper.instance.getAllUsers();
      final customer = allUsers.firstWhere((u) => u.email == 'customer@smarttrip.com');

      // Thay đổi vai trò sang operator
      final roleRows = await DatabaseHelper.instance.updateUserRole(customer.id!, 'operator');
      expect(roleRows, greaterThan(0));

      final usersAfterRoleChange = await DatabaseHelper.instance.getAllUsers();
      final updatedRoleUser = usersAfterRoleChange.firstWhere((u) => u.id == customer.id);
      expect(updatedRoleUser.role, equals('operator'));

      // Khóa tài khoản (status = 'blocked')
      final blockRows = await DatabaseHelper.instance.updateUserStatus(customer.id!, 'blocked');
      expect(blockRows, greaterThan(0));

      final usersAfterBlock = await DatabaseHelper.instance.getAllUsers();
      final blockedUser = usersAfterBlock.firstWhere((u) => u.id == customer.id);
      expect(blockedUser.status, equals('blocked'));

      // Đăng nhập thử với tài khoản bị khóa -> Bị từ chối
      final authProvider = AuthProvider();
      final loginSuccess = await authProvider.login('customer@smarttrip.com', '123456');
      expect(loginSuccess, isFalse);
      expect(authProvider.errorMessage, contains('bị khóa'));

      // Kích hoạt lại tài khoản (status = 'active')
      final unblockRows = await DatabaseHelper.instance.updateUserStatus(customer.id!, 'active');
      expect(unblockRows, greaterThan(0));
    });
  });
}
