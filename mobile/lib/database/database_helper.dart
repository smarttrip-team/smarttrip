import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import '../models/user_model.dart';
import '../models/tour_model.dart';
import '../models/hotel_model.dart';
import '../models/wallet_model.dart';
import '../models/booking_model.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  @visibleForTesting
  Future<void> initInMemoryForTesting() async {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
    if (_database != null) {
      await _database!.close();
      _database = null;
    }
    _database = await databaseFactory.openDatabase(
      inMemoryDatabasePath,
      options: OpenDatabaseOptions(
        version: 2,
        onCreate: _createDB,
      ),
    );
  }

  @visibleForTesting
  Future<void> closeForTesting() async {
    if (_database != null) {
      await _database!.close();
      _database = null;
    }
  }

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('smarttrip.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    if (!kIsWeb && (Platform.isWindows || Platform.isLinux)) {
      sqfliteFfiInit();
      databaseFactory = databaseFactoryFfi;
    }

    String dbPath;
    if (!kIsWeb && (Platform.isWindows || Platform.isLinux)) {
      final docDir = await getApplicationDocumentsDirectory();
      dbPath = join(docDir.path, 'SmartTrip', filePath);
      final dir = Directory(dirname(dbPath));
      if (!await dir.exists()) {
        await dir.create(recursive: true);
      }
    } else {
      final path = await getDatabasesPath();
      dbPath = join(path, filePath);
    }

    return await openDatabase(
      dbPath,
      version: 2,
      onCreate: _createDB,
      onUpgrade: (db, oldVersion, newVersion) async {
        if (oldVersion < 2) {
          try {
            await db.execute('ALTER TABLE bookings ADD COLUMN tourAmount REAL NOT NULL DEFAULT 0.0');
            await db.execute('ALTER TABLE bookings ADD COLUMN hotelAmount REAL NOT NULL DEFAULT 0.0');
          } catch (_) {}
        }
      },
    );
  }

  Future<void> _createDB(Database db, int version) async {
    // 1. Bảng Users
    await db.execute('''
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active'
      )
    ''');

    // 2. Bảng Tours
    await db.execute('''
      CREATE TABLE tours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operatorId INTEGER,
        title TEXT NOT NULL,
        destination TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        duration TEXT NOT NULL,
        imageUrl TEXT NOT NULL,
        category TEXT NOT NULL,
        rating REAL NOT NULL DEFAULT 5.0
      )
    ''');

    // 3. Bảng Hotels
    await db.execute('''
      CREATE TABLE hotels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        managerId INTEGER,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        pricePerNight REAL NOT NULL,
        imageUrl TEXT NOT NULL,
        starRating INTEGER NOT NULL DEFAULT 4,
        totalRooms INTEGER NOT NULL DEFAULT 50
      )
    ''');

    // 4. Bảng Wallets
    await db.execute('''
      CREATE TABLE wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER UNIQUE NOT NULL,
        balance REAL NOT NULL DEFAULT 0.0
      )
    ''');

    // 5. Bảng Wallet Transactions
    await db.execute('''
      CREATE TABLE wallet_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    ''');

    // 6. Bảng Bookings
    await db.execute('''
      CREATE TABLE bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        tourId INTEGER NOT NULL,
        hotelId INTEGER,
        departureDate TEXT NOT NULL,
        adultCount INTEGER NOT NULL,
        childCount INTEGER NOT NULL,
        tourAmount REAL NOT NULL DEFAULT 0.0,
        hotelAmount REAL NOT NULL DEFAULT 0.0,
        totalAmount REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'CONFIRMED',
        createdAt TEXT NOT NULL
      )
    ''');

    // Seed Data ban đầu
    await _seedInitialData(db);
  }

  Future<void> _seedInitialData(Database db) async {
    final now = DateTime.now().toIso8601String();

    // 1. Seed 4 tài khoản cho 4 vai trò
    final customerId = await db.insert('users', {
      'fullName': 'Nguyễn Hồng Thái',
      'email': 'customer@smarttrip.com',
      'password': '123456',
      'phone': '0901234567',
      'role': 'customer',
      'status': 'active',
    });

    final operatorId = await db.insert('users', {
      'fullName': 'SaigonTourist Operator',
      'email': 'operator@smarttrip.com',
      'password': '123456',
      'phone': '0912345678',
      'role': 'tour_operator',
      'status': 'active',
    });

    final hotelierId = await db.insert('users', {
      'fullName': 'Vinpearl Manager',
      'email': 'hotelier@smarttrip.com',
      'password': '123456',
      'phone': '0923456789',
      'role': 'hotel_manager',
      'status': 'active',
    });

    final adminId = await db.insert('users', {
      'fullName': 'System Administrator',
      'email': 'admin@smarttrip.com',
      'password': 'admin123',
      'phone': '0999999999',
      'role': 'admin',
      'status': 'active',
    });

    // 2. Cấp ví cho Customer: Tặng 10.000.000 VNĐ
    await db.insert('wallets', {
      'userId': customerId,
      'balance': 10000000.0,
    });

    await db.insert('wallet_transactions', {
      'userId': customerId,
      'amount': 10000000.0,
      'type': 'TOPUP',
      'description': 'Tặng 10 triệu VNĐ số dư trải nghiệm ban đầu',
      'createdAt': now,
    });

    // Cấp ví cho Operator, Hotelier và Admin
    await db.insert('wallets', {'userId': operatorId, 'balance': 50000000.0});
    await db.insert('wallets', {'userId': hotelierId, 'balance': 30000000.0});
    await db.insert('wallets', {'userId': adminId, 'balance': 0.0});

    // 3. Seed 6 Tour Du Lịch
    final toursData = [
      {
        'operatorId': operatorId,
        'title': 'Đà Nẵng - Hội An - Bà Nà Hills - Cầu Vàng',
        'destination': 'Đà Nẵng',
        'description': 'Khám phá thành phố đáng sống nhất Việt Nam, check-in Cầu Vàng lộng lẫy và phố cổ Hội An rực rỡ đèn lồng.',
        'price': 3890000.0,
        'duration': '3N2Đ',
        'imageUrl': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800',
        'category': 'Biển đảo',
        'rating': 4.9,
      },
      {
        'operatorId': operatorId,
        'title': 'Khám phá Đảo Ngọc Phú Quốc - Sunset Town & Grand World',
        'destination': 'Phú Quốc',
        'description': 'Thiên đường biển đảo nhiệt đới với cáp treo Hòn Thơm vượt biển, lặn ngắm san hô và ngắm hoàng hôn Bãi Sao.',
        'price': 5490000.0,
        'duration': '4N3Đ',
        'imageUrl': 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800',
        'category': 'Biển đảo',
        'rating': 4.8,
      },
      {
        'operatorId': operatorId,
        'title': 'Sa Pa - Chinh phục đỉnh Fansipan - Bản Cát Cát',
        'destination': 'Lào Cai',
        'description': 'Hành trình săn mây bồng bềnh tại nóc nhà Đông Dương, trải nghiệm văn hóa độc đáo của đồng bào vùng cao.',
        'price': 2950000.0,
        'duration': '3N2Đ',
        'imageUrl': 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
        'category': 'Vùng cao',
        'rating': 4.9,
      },
      {
        'operatorId': operatorId,
        'title': 'Hà Giang - Mã Pí Lèng - Du thuyền Sông Nho Quế',
        'destination': 'Hà Giang',
        'description': 'Chinh phục cung đường đèo hùng vĩ nhất Đông Bắc, check-in hẻm Tu Sản nước xanh ngọc bích tuyệt mỹ.',
        'price': 2750000.0,
        'duration': '3N2Đ',
        'imageUrl': 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?w=800',
        'category': 'Vùng cao',
        'rating': 4.9,
      },
      {
        'operatorId': operatorId,
        'title': 'Nha Trang - Vịnh Thiên Đường & VinWonders',
        'destination': 'Khánh Hòa',
        'description': 'Vui chơi thỏa thích tại công viên giải trí hàng đầu, tắm bùn khoáng nóng và du ngoạn 4 đảo vịnh Nha Trang.',
        'price': 3200000.0,
        'duration': '3N2Đ',
        'imageUrl': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        'category': 'Nghỉ dưỡng',
        'rating': 4.7,
      },
      {
        'operatorId': operatorId,
        'title': 'Ninh Bình - Quần thể Di sản Tràng An - Hang Múa',
        'destination': 'Ninh Bình',
        'description': 'Hạ Long trên cạn với phong cảnh non nước hữu tình, leo đỉnh Ngọa Long ngắm toàn cảnh Tam Cốc thơ mộng.',
        'price': 1850000.0,
        'duration': '2N1Đ',
        'imageUrl': 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800',
        'category': 'Văn hóa',
        'rating': 4.8,
      },
    ];

    for (var tour in toursData) {
      await db.insert('tours', tour);
    }

    // 4. Seed 4 Khách sạn
    final hotelsData = [
      {
        'managerId': hotelierId,
        'name': 'Vinpearl Resort & Spa Đà Nẵng',
        'location': 'Ngũ Hành Sơn, Đà Nẵng',
        'pricePerNight': 1650000.0,
        'imageUrl': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'starRating': 5,
        'totalRooms': 120,
      },
      {
        'managerId': hotelierId,
        'name': 'Novotel Phu Quoc Resort & Villas',
        'location': 'Dương Tơ, Phú Quốc',
        'pricePerNight': 1850000.0,
        'imageUrl': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        'starRating': 5,
        'totalRooms': 90,
      },
      {
        'managerId': hotelierId,
        'name': 'Hotel de la Coupole - MGallery Sa Pa',
        'location': 'Hoàng Liên, Sa Pa',
        'pricePerNight': 2200000.0,
        'imageUrl': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
        'starRating': 5,
        'totalRooms': 80,
      },
      {
        'managerId': hotelierId,
        'name': 'Sheraton Nha Trang Hotel & Spa',
        'location': 'Trần Phú, Nha Trang',
        'pricePerNight': 1450000.0,
        'imageUrl': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'starRating': 5,
        'totalRooms': 150,
      },
    ];

    for (var hotel in hotelsData) {
      await db.insert('hotels', hotel);
    }

    // 4. Seed Đơn đặt tour mẫu & Phân chia Doanh thu (90% Tour, 90% Hotel, 10% Sàn)
    // Đơn 1: Đã hoàn thành (xong tour) -> Đã ghi nhận doanh thu thực nhận
    final completedBookingId = await db.insert('bookings', {
      'userId': customerId,
      'tourId': 1,
      'hotelId': 4, // Sheraton Nha Trang Hotel & Spa
      'departureDate': '01/11/2026',
      'adultCount': 2,
      'childCount': 0,
      'tourAmount': 7780000.0,
      'hotelAmount': 1450000.0,
      'totalAmount': 9230000.0,
      'status': 'COMPLETED',
      'createdAt': now,
    });

    // Ghi nhận doanh thu seed cho đơn #1:
    // Operator: 7.780.000 * 0.9 = 7.002.000 đ
    await db.insert('wallet_transactions', {
      'userId': operatorId,
      'amount': 7002000.0,
      'type': 'REVENUE',
      'description': 'Doanh thu 90% tiền tour mã vé #$completedBookingId (Xong tour)',
      'createdAt': now,
    });
    // Hotelier: 1.450.000 * 0.9 = 1.305.000 đ
    await db.insert('wallet_transactions', {
      'userId': hotelierId,
      'amount': 1305000.0,
      'type': 'REVENUE',
      'description': 'Doanh thu 90% tiền phòng mã vé #$completedBookingId (Xong tour)',
      'createdAt': now,
    });
    // Admin: 9.230.000 * 0.1 = 923.000 đ
    await db.insert('wallet_transactions', {
      'userId': adminId,
      'amount': 923000.0,
      'type': 'COMMISSION',
      'description': '10% phí sàn hệ thống từ mã vé #$completedBookingId (Xong tour)',
      'createdAt': now,
    });

    // Đơn 2: Chờ hoàn thành (CONFIRMED) -> Người dùng có thể bấm nút "Xác Nhận Xong Tour" để kích hoạt phân chia tiền
    await db.insert('bookings', {
      'userId': customerId,
      'tourId': 2,
      'hotelId': 1, // Vinpearl Resort & Spa Phú Quốc
      'departureDate': '25/11/2026',
      'adultCount': 1,
      'childCount': 1,
      'tourAmount': 9333000.0,
      'hotelAmount': 2250000.0,
      'totalAmount': 11583000.0,
      'status': 'CONFIRMED',
      'createdAt': now,
    });
  }

  // ==================== USER OPERATIONS ====================
  Future<UserModel?> login(String email, String password) async {
    final db = await database;
    final res = await db.query(
      'users',
      where: 'email = ? AND password = ?',
      whereArgs: [email, password],
    );
    if (res.isNotEmpty) {
      return UserModel.fromMap(res.first);
    }
    return null;
  }

  Future<int> registerUser(UserModel user) async {
    final db = await database;
    final userId = await db.insert('users', user.toMap());
    // Tự động cấp ví ban đầu 5.000.000 VNĐ cho tài khoản đăng ký mới
    await db.insert('wallets', {
      'userId': userId,
      'balance': 5000000.0,
    });
    await db.insert('wallet_transactions', {
      'userId': userId,
      'amount': 5000000.0,
      'type': 'TOPUP',
      'description': 'Tặng 5 triệu VNĐ chào mừng thành viên mới',
      'createdAt': DateTime.now().toIso8601String(),
    });
    return userId;
  }

  Future<List<UserModel>> getAllUsers() async {
    final db = await database;
    final res = await db.query('users', orderBy: 'id ASC');
    return res.map((e) => UserModel.fromMap(e)).toList();
  }

  Future<int> updateUserRole(int userId, String newRole) async {
    final db = await database;
    return await db.update(
      'users',
      {'role': newRole},
      where: 'id = ?',
      whereArgs: [userId],
    );
  }

  Future<int> updateUserStatus(int userId, String newStatus) async {
    final db = await database;
    return await db.update(
      'users',
      {'status': newStatus},
      where: 'id = ?',
      whereArgs: [userId],
    );
  }

  // ==================== TOUR OPERATIONS ====================
  Future<List<TourModel>> getAllTours() async {
    final db = await database;
    final res = await db.query('tours', orderBy: 'id DESC');
    return res.map((e) => TourModel.fromMap(e)).toList();
  }

  Future<List<TourModel>> getToursByOperator(int operatorId) async {
    final db = await database;
    final res = await db.query(
      'tours',
      where: 'operatorId = ?',
      whereArgs: [operatorId],
      orderBy: 'id DESC',
    );
    return res.map((e) => TourModel.fromMap(e)).toList();
  }

  Future<TourModel?> getTourById(int id) async {
    final db = await database;
    final res = await db.query('tours', where: 'id = ?', whereArgs: [id]);
    if (res.isNotEmpty) return TourModel.fromMap(res.first);
    return null;
  }

  Future<int> insertTour(TourModel tour) async {
    final db = await database;
    return await db.insert('tours', tour.toMap());
  }

  Future<int> updateTour(TourModel tour) async {
    final db = await database;
    return await db.update(
      'tours',
      tour.toMap(),
      where: 'id = ?',
      whereArgs: [tour.id],
    );
  }

  Future<int> deleteTour(int id) async {
    final db = await database;
    return await db.delete('tours', where: 'id = ?', whereArgs: [id]);
  }

  // ==================== HOTEL OPERATIONS ====================
  Future<List<HotelModel>> getAllHotels() async {
    final db = await database;
    final res = await db.query('hotels', orderBy: 'id DESC');
    return res.map((e) => HotelModel.fromMap(e)).toList();
  }

  Future<List<HotelModel>> getHotelsByManager(int managerId) async {
    final db = await database;
    final res = await db.query(
      'hotels',
      where: 'managerId = ?',
      whereArgs: [managerId],
      orderBy: 'id DESC',
    );
    return res.map((e) => HotelModel.fromMap(e)).toList();
  }

  Future<HotelModel?> getHotelById(int id) async {
    final db = await database;
    final res = await db.query('hotels', where: 'id = ?', whereArgs: [id]);
    if (res.isNotEmpty) return HotelModel.fromMap(res.first);
    return null;
  }

  Future<int> insertHotel(HotelModel hotel) async {
    final db = await database;
    return await db.insert('hotels', hotel.toMap());
  }

  Future<int> updateHotel(HotelModel hotel) async {
    final db = await database;
    return await db.update(
      'hotels',
      hotel.toMap(),
      where: 'id = ?',
      whereArgs: [hotel.id],
    );
  }

  Future<int> deleteHotel(int id) async {
    final db = await database;
    return await db.delete('hotels', where: 'id = ?', whereArgs: [id]);
  }

  // ==================== WALLET OPERATIONS ====================
  Future<double> getWalletBalance(int userId) async {
    final db = await database;
    final res = await db.query('wallets', where: 'userId = ?', whereArgs: [userId]);
    if (res.isNotEmpty) {
      return (res.first['balance'] as num?)?.toDouble() ?? 0.0;
    }
    // Chưa có ví thì tạo ví mới
    await db.insert('wallets', {'userId': userId, 'balance': 0.0});
    return 0.0;
  }

  Future<bool> topUpWallet(int userId, double amount, String description) async {
    final db = await database;
    return await db.transaction((txn) async {
      final currentBalance = await txn.query('wallets', where: 'userId = ?', whereArgs: [userId]);
      double balance = 0.0;
      if (currentBalance.isNotEmpty) {
        balance = (currentBalance.first['balance'] as num?)?.toDouble() ?? 0.0;
        await txn.update(
          'wallets',
          {'balance': balance + amount},
          where: 'userId = ?',
          whereArgs: [userId],
        );
      } else {
        await txn.insert('wallets', {'userId': userId, 'balance': amount});
      }
      await txn.insert('wallet_transactions', {
        'userId': userId,
        'amount': amount,
        'type': 'TOPUP',
        'description': description,
        'createdAt': DateTime.now().toIso8601String(),
      });
      return true;
    });
  }

  Future<List<WalletTransactionModel>> getWalletTransactions(int userId) async {
    final db = await database;
    final res = await db.query(
      'wallet_transactions',
      where: 'userId = ?',
      whereArgs: [userId],
      orderBy: 'id DESC',
    );
    return res.map((e) => WalletTransactionModel.fromMap(e)).toList();
  }

  // ==================== BOOKING & PAYMENT OPERATIONS ====================
  Future<int?> createBookingAndPay({
    required int userId,
    required int tourId,
    int? hotelId,
    required String departureDate,
    required int adultCount,
    required int childCount,
    double? tourAmount,
    double? hotelAmount,
    required double totalAmount,
  }) async {
    final db = await database;
    return await db.transaction<int?>((txn) async {
      // 1. Kiểm tra số dư ví
      final walletRes = await txn.query('wallets', where: 'userId = ?', whereArgs: [userId]);
      if (walletRes.isEmpty) return null;
      final currentBalance = (walletRes.first['balance'] as num?)?.toDouble() ?? 0.0;
      if (currentBalance < totalAmount) {
        return null; // Không đủ tiền
      }

      // 2. Trừ tiền ví
      await txn.update(
        'wallets',
        {'balance': currentBalance - totalAmount},
        where: 'userId = ?',
        whereArgs: [userId],
      );

      // 3. Ghi log PAYMENT
      await txn.insert('wallet_transactions', {
        'userId': userId,
        'amount': totalAmount,
        'type': 'PAYMENT',
        'description': 'Thanh toán đặt tour mã #$tourId',
        'createdAt': DateTime.now().toIso8601String(),
      });

      // 4. Tính toán phần tiền Tour và Khách sạn
      final hAmt = hotelAmount ?? 0.0;
      final tAmt = tourAmount ?? (totalAmount - hAmt);

      // 5. Tạo Booking CONFIRMED
      final bookingId = await txn.insert('bookings', {
        'userId': userId,
        'tourId': tourId,
        'hotelId': hotelId,
        'departureDate': departureDate,
        'adultCount': adultCount,
        'childCount': childCount,
        'tourAmount': tAmt,
        'hotelAmount': hAmt,
        'totalAmount': totalAmount,
        'status': 'CONFIRMED',
        'createdAt': DateTime.now().toIso8601String(),
      });

      return bookingId;
    });
  }

  Future<bool> cancelBookingAndRefund(int bookingId, int userId) async {
    final db = await database;
    return await db.transaction((txn) async {
      // 1. Kiểm tra booking
      final res = await txn.query(
        'bookings',
        where: 'id = ? AND userId = ?',
        whereArgs: [bookingId, userId],
      );
      if (res.isEmpty) return false;
      final booking = res.first;
      if (booking['status'] == 'CANCELLED' || booking['status'] == 'COMPLETED') return false;

      final refundAmount = (booking['totalAmount'] as num?)?.toDouble() ?? 0.0;

      // 2. Cập nhật booking sang CANCELLED
      await txn.update(
        'bookings',
        {'status': 'CANCELLED'},
        where: 'id = ?',
        whereArgs: [bookingId],
      );

      // 3. Hoàn tiền vào ví 100%
      final walletRes = await txn.query('wallets', where: 'userId = ?', whereArgs: [userId]);
      if (walletRes.isNotEmpty) {
        final currentBalance = (walletRes.first['balance'] as num?)?.toDouble() ?? 0.0;
        await txn.update(
          'wallets',
          {'balance': currentBalance + refundAmount},
          where: 'userId = ?',
          whereArgs: [userId],
        );
      }

      // 4. Ghi log REFUND
      await txn.insert('wallet_transactions', {
        'userId': userId,
        'amount': refundAmount,
        'type': 'REFUND',
        'description': 'Hoàn trả 100% tiền hủy vé booking #$bookingId',
        'createdAt': DateTime.now().toIso8601String(),
      });

      return true;
    });
  }

  // Phân chia doanh thu sau khi hoàn thành xong tour:
  // 90% tiền tour cho Operator, 90% tiền phòng cho Hotelier, 10% tổng tiền cho Hệ thống
  Future<bool> completeBooking(int bookingId) async {
    final db = await database;
    return await db.transaction((txn) async {
      final res = await txn.rawQuery('''
        SELECT b.*, t.operatorId, h.managerId
        FROM bookings b
        LEFT JOIN tours t ON b.tourId = t.id
        LEFT JOIN hotels h ON b.hotelId = h.id
        WHERE b.id = ?
      ''', [bookingId]);

      if (res.isEmpty) return false;
      final booking = res.first;
      if (booking['status'] == 'COMPLETED' || booking['status'] == 'CANCELLED') {
        return false;
      }

      final total = (booking['totalAmount'] as num?)?.toDouble() ?? 0.0;
      double tourAmt = (booking['tourAmount'] as num?)?.toDouble() ?? 0.0;
      double hotelAmt = (booking['hotelAmount'] as num?)?.toDouble() ?? 0.0;
      if (tourAmt == 0.0 && hotelAmt == 0.0) {
        tourAmt = total;
      }

      final opRevenue = tourAmt * 0.90;
      final hotelRevenue = hotelAmt * 0.90;
      final sysRevenue = total * 0.10;
      final now = DateTime.now().toIso8601String();

      // 1. Cập nhật booking status = 'COMPLETED'
      await txn.update(
        'bookings',
        {'status': 'COMPLETED'},
        where: 'id = ?',
        whereArgs: [bookingId],
      );

      // 2. Cộng 90% tiền tour cho Tour Operator
      final opId = (booking['operatorId'] as int?) ?? 2;
      final opWallet = await txn.query('wallets', where: 'userId = ?', whereArgs: [opId]);
      if (opWallet.isNotEmpty) {
        final curBal = (opWallet.first['balance'] as num?)?.toDouble() ?? 0.0;
        await txn.update('wallets', {'balance': curBal + opRevenue}, where: 'userId = ?', whereArgs: [opId]);
      } else {
        await txn.insert('wallets', {'userId': opId, 'balance': opRevenue});
      }
      await txn.insert('wallet_transactions', {
        'userId': opId,
        'amount': opRevenue,
        'type': 'REVENUE',
        'description': 'Doanh thu 90% tiền tour mã đơn #$bookingId (Hoàn tất chuyến đi)',
        'createdAt': now,
      });

      // 3. Cộng 90% tiền phòng cho Hotel Manager (nếu có khách sạn)
      final hotelierId = booking['managerId'] as int?;
      if (hotelierId != null && hotelRevenue > 0) {
        final hWallet = await txn.query('wallets', where: 'userId = ?', whereArgs: [hotelierId]);
        if (hWallet.isNotEmpty) {
          final curBal = (hWallet.first['balance'] as num?)?.toDouble() ?? 0.0;
          await txn.update('wallets', {'balance': curBal + hotelRevenue}, where: 'userId = ?', whereArgs: [hotelierId]);
        } else {
          await txn.insert('wallets', {'userId': hotelierId, 'balance': hotelRevenue});
        }
        await txn.insert('wallet_transactions', {
          'userId': hotelierId,
          'amount': hotelRevenue,
          'type': 'REVENUE',
          'description': 'Doanh thu 90% tiền khách sạn mã đơn #$bookingId (Hoàn tất chuyến đi)',
          'createdAt': now,
        });
      }

      // 4. Cộng 10% hoa hồng sàn cho Quản trị viên (Admin)
      final adminUser = await txn.query('users', where: 'role = ?', whereArgs: ['admin'], limit: 1);
      final adminId = adminUser.isNotEmpty ? (adminUser.first['id'] as int) : 4;
      final adminWallet = await txn.query('wallets', where: 'userId = ?', whereArgs: [adminId]);
      if (adminWallet.isNotEmpty) {
        final curBal = (adminWallet.first['balance'] as num?)?.toDouble() ?? 0.0;
        await txn.update('wallets', {'balance': curBal + sysRevenue}, where: 'userId = ?', whereArgs: [adminId]);
      } else {
        await txn.insert('wallets', {'userId': adminId, 'balance': sysRevenue});
      }
      await txn.insert('wallet_transactions', {
        'userId': adminId,
        'amount': sysRevenue,
        'type': 'COMMISSION',
        'description': '10% phí hoa hồng sàn từ mã đơn #$bookingId (Hoàn tất chuyến đi)',
        'createdAt': now,
      });

      return true;
    });
  }

  Future<List<BookingModel>> getUserBookings(int userId) async {
    final db = await database;
    final res = await db.rawQuery('''
      SELECT b.*, t.title as tourTitle, t.imageUrl as tourImage, t.destination, h.name as hotelName,
             u.fullName as customerName, u.phone as customerPhone, u.email as customerEmail
      FROM bookings b
      LEFT JOIN tours t ON b.tourId = t.id
      LEFT JOIN hotels h ON b.hotelId = h.id
      LEFT JOIN users u ON b.userId = u.id
      WHERE b.userId = ?
      ORDER BY b.id DESC
    ''', [userId]);

    return res.map((e) => BookingModel.fromMap(e)).toList();
  }

  Future<List<BookingModel>> getBookingsForOperator(int operatorId) async {
    final db = await database;
    final res = await db.rawQuery('''
      SELECT b.*, t.title as tourTitle, t.imageUrl as tourImage, t.destination, h.name as hotelName,
             u.fullName as customerName, u.phone as customerPhone, u.email as customerEmail
      FROM bookings b
      INNER JOIN tours t ON b.tourId = t.id
      LEFT JOIN hotels h ON b.hotelId = h.id
      LEFT JOIN users u ON b.userId = u.id
      WHERE t.operatorId = ?
      ORDER BY b.id DESC
    ''', [operatorId]);

    return res.map((e) => BookingModel.fromMap(e)).toList();
  }

  Future<List<BookingModel>> getBookingsForHotelier(int managerId) async {
    final db = await database;
    final res = await db.rawQuery('''
      SELECT b.*, t.title as tourTitle, t.imageUrl as tourImage, t.destination, h.name as hotelName,
             u.fullName as customerName, u.phone as customerPhone, u.email as customerEmail
      FROM bookings b
      INNER JOIN hotels h ON b.hotelId = h.id
      LEFT JOIN tours t ON b.tourId = t.id
      LEFT JOIN users u ON b.userId = u.id
      WHERE h.managerId = ?
      ORDER BY b.id DESC
    ''', [managerId]);

    return res.map((e) => BookingModel.fromMap(e)).toList();
  }

  Future<List<BookingModel>> getAllBookingsForAdmin() async {
    final db = await database;
    final res = await db.rawQuery('''
      SELECT b.*, t.title as tourTitle, t.imageUrl as tourImage, t.destination, h.name as hotelName,
             u.fullName as customerName, u.phone as customerPhone, u.email as customerEmail
      FROM bookings b
      LEFT JOIN tours t ON b.tourId = t.id
      LEFT JOIN hotels h ON b.hotelId = h.id
      LEFT JOIN users u ON b.userId = u.id
      ORDER BY b.id DESC
    ''');

    return res.map((e) => BookingModel.fromMap(e)).toList();
  }

  Future<Map<String, double>> getOperatorRevenueStats(int operatorId) async {
    final db = await database;
    final completedRes = await db.rawQuery('''
      SELECT SUM(b.tourAmount) as compSum
      FROM bookings b
      INNER JOIN tours t ON b.tourId = t.id
      WHERE t.operatorId = ? AND b.status = 'COMPLETED'
    ''', [operatorId]);

    final pendingRes = await db.rawQuery('''
      SELECT SUM(b.tourAmount) as pendSum
      FROM bookings b
      INNER JOIN tours t ON b.tourId = t.id
      WHERE t.operatorId = ? AND b.status = 'CONFIRMED'
    ''', [operatorId]);

    final compTour = (completedRes.first['compSum'] as num?)?.toDouble() ?? 0.0;
    final pendTour = (pendingRes.first['pendSum'] as num?)?.toDouble() ?? 0.0;

    return {
      'completedRevenue': compTour * 0.90,
      'pendingRevenue': pendTour * 0.90,
      'commissionFee': compTour * 0.10,
    };
  }

  Future<Map<String, double>> getHotelierRevenueStats(int managerId) async {
    final db = await database;
    final completedRes = await db.rawQuery('''
      SELECT SUM(b.hotelAmount) as compSum
      FROM bookings b
      INNER JOIN hotels h ON b.hotelId = h.id
      WHERE h.managerId = ? AND b.status = 'COMPLETED'
    ''', [managerId]);

    final pendingRes = await db.rawQuery('''
      SELECT SUM(b.hotelAmount) as pendSum
      FROM bookings b
      INNER JOIN hotels h ON b.hotelId = h.id
      WHERE h.managerId = ? AND b.status = 'CONFIRMED'
    ''', [managerId]);

    final compHotel = (completedRes.first['compSum'] as num?)?.toDouble() ?? 0.0;
    final pendHotel = (pendingRes.first['pendSum'] as num?)?.toDouble() ?? 0.0;

    return {
      'completedRevenue': compHotel * 0.90,
      'pendingRevenue': pendHotel * 0.90,
      'commissionFee': compHotel * 0.10,
    };
  }

  // ==================== SYSTEM ADMIN KPI STATS ====================
  Future<Map<String, dynamic>> getAdminStats() async {
    final db = await database;
    final userCount = Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM users')) ?? 0;
    final tourCount = Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM tours')) ?? 0;
    final hotelCount = Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM hotels')) ?? 0;
    final bookingCount = Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM bookings')) ?? 0;
    final completedBookingCount = Sqflite.firstIntValue(await db.rawQuery("SELECT COUNT(*) FROM bookings WHERE status = 'COMPLETED'")) ?? 0;

    final totalVolRes = await db.rawQuery("SELECT SUM(totalAmount) as totalVol FROM bookings WHERE status = 'COMPLETED'");
    final totalVolume = (totalVolRes.first['totalVol'] as num?)?.toDouble() ?? 0.0;

    final totalTourRes = await db.rawQuery("SELECT SUM(tourAmount) as tourSum FROM bookings WHERE status = 'COMPLETED'");
    final totalTourSum = (totalTourRes.first['tourSum'] as num?)?.toDouble() ?? 0.0;

    final totalHotelRes = await db.rawQuery("SELECT SUM(hotelAmount) as hotelSum FROM bookings WHERE status = 'COMPLETED'");
    final totalHotelSum = (totalHotelRes.first['hotelSum'] as num?)?.toDouble() ?? 0.0;

    final systemCommission = totalVolume * 0.10;
    final operatorPayout = totalTourSum * 0.90;
    final hotelierPayout = totalHotelSum * 0.90;

    return {
      'userCount': userCount,
      'tourCount': tourCount,
      'hotelCount': hotelCount,
      'bookingCount': bookingCount,
      'completedBookingCount': completedBookingCount,
      'totalVolume': totalVolume,
      'systemCommission': systemCommission,
      'operatorPayout': operatorPayout,
      'hotelierPayout': hotelierPayout,
    };
  }
}
