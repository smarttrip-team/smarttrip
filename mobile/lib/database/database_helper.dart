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
      version: 1,
      onCreate: _createDB,
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

    await db.insert('users', {
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

    // Cấp ví cho Operator và Hotelier
    await db.insert('wallets', {'userId': operatorId, 'balance': 50000000.0});
    await db.insert('wallets', {'userId': hotelierId, 'balance': 30000000.0});

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

      // 4. Tạo Booking CONFIRMED
      final bookingId = await txn.insert('bookings', {
        'userId': userId,
        'tourId': tourId,
        'hotelId': hotelId,
        'departureDate': departureDate,
        'adultCount': adultCount,
        'childCount': childCount,
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
      if (booking['status'] == 'CANCELLED') return false;

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

  Future<List<BookingModel>> getUserBookings(int userId) async {
    final db = await database;
    final res = await db.rawQuery('''
      SELECT b.*, t.title as tourTitle, t.imageUrl as tourImage, t.destination, h.name as hotelName
      FROM bookings b
      LEFT JOIN tours t ON b.tourId = t.id
      LEFT JOIN hotels h ON b.hotelId = h.id
      WHERE b.userId = ?
      ORDER BY b.id DESC
    ''', [userId]);

    return res.map((e) => BookingModel.fromMap(e)).toList();
  }

  Future<List<BookingModel>> getBookingsForOperator(int operatorId) async {
    final db = await database;
    final res = await db.rawQuery('''
      SELECT b.*, t.title as tourTitle, t.imageUrl as tourImage, t.destination, h.name as hotelName
      FROM bookings b
      INNER JOIN tours t ON b.tourId = t.id
      LEFT JOIN hotels h ON b.hotelId = h.id
      WHERE t.operatorId = ?
      ORDER BY b.id DESC
    ''', [operatorId]);

    return res.map((e) => BookingModel.fromMap(e)).toList();
  }

  // ==================== SYSTEM ADMIN KPI STATS ====================
  Future<Map<String, dynamic>> getAdminStats() async {
    final db = await database;
    final userCount = Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM users')) ?? 0;
    final tourCount = Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM tours')) ?? 0;
    final hotelCount = Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM hotels')) ?? 0;
    final bookingCount = Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM bookings')) ?? 0;
    final totalVolRes = await db.rawQuery("SELECT SUM(amount) as totalVol FROM wallet_transactions WHERE type = 'PAYMENT'");
    final totalVolume = (totalVolRes.first['totalVol'] as num?)?.toDouble() ?? 0.0;

    return {
      'userCount': userCount,
      'tourCount': tourCount,
      'hotelCount': hotelCount,
      'bookingCount': bookingCount,
      'totalVolume': totalVolume,
    };
  }
}
