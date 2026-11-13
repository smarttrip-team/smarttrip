import 'package:flutter/material.dart';
import '../database/database_helper.dart';
import '../models/booking_model.dart';

class BookingProvider extends ChangeNotifier {
  List<BookingModel> _userBookings = [];
  List<BookingModel> _operatorBookings = [];
  List<BookingModel> _hotelierBookings = [];
  List<BookingModel> _adminBookings = [];

  Map<String, double> _operatorRevenueStats = {
    'completedRevenue': 0.0,
    'pendingRevenue': 0.0,
    'commissionFee': 0.0,
  };

  Map<String, double> _hotelierRevenueStats = {
    'completedRevenue': 0.0,
    'pendingRevenue': 0.0,
    'commissionFee': 0.0,
  };

  Map<String, dynamic> _adminRevenueStats = {
    'userCount': 0,
    'tourCount': 0,
    'hotelCount': 0,
    'bookingCount': 0,
    'completedBookingCount': 0,
    'totalVolume': 0.0,
    'systemCommission': 0.0,
    'operatorPayout': 0.0,
    'hotelierPayout': 0.0,
  };

  bool _isLoading = false;
  String? _errorMessage;

  List<BookingModel> get userBookings => _userBookings;
  List<BookingModel> get operatorBookings => _operatorBookings;
  List<BookingModel> get hotelierBookings => _hotelierBookings;
  List<BookingModel> get adminBookings => _adminBookings;

  Map<String, double> get operatorRevenueStats => _operatorRevenueStats;
  Map<String, double> get hotelierRevenueStats => _hotelierRevenueStats;
  Map<String, dynamic> get adminRevenueStats => _adminRevenueStats;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // 1. Tải danh sách vé của khách hàng
  Future<void> loadUserBookings(int userId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _userBookings = await DatabaseHelper.instance.getUserBookings(userId);
    } catch (e) {
      _errorMessage = 'Lỗi tải danh sách vé: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // 2. Tải danh sách đơn đặt cho Tour Operator kèm thống kê 90%
  Future<void> loadOperatorBookings(int operatorId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _operatorBookings = await DatabaseHelper.instance.getBookingsForOperator(operatorId);
      _operatorRevenueStats = await DatabaseHelper.instance.getOperatorRevenueStats(operatorId);
    } catch (e) {
      _errorMessage = 'Lỗi tải danh sách khách đặt: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // 3. Tải danh sách đơn đặt cho Hotel Manager kèm thống kê 90%
  Future<void> loadHotelierBookings(int managerId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _hotelierBookings = await DatabaseHelper.instance.getBookingsForHotelier(managerId);
      _hotelierRevenueStats = await DatabaseHelper.instance.getHotelierRevenueStats(managerId);
    } catch (e) {
      _errorMessage = 'Lỗi tải danh sách khách đặt phòng: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // 4. Tải danh sách toàn bộ đơn đặt cho Admin kèm thống kê 10%
  Future<void> loadAdminBookings() async {
    _isLoading = true;
    notifyListeners();
    try {
      _adminBookings = await DatabaseHelper.instance.getAllBookingsForAdmin();
      _adminRevenueStats = await DatabaseHelper.instance.getAdminStats();
    } catch (e) {
      _errorMessage = 'Lỗi tải danh sách đơn toàn sàn: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // 5. Đặt tour và trừ tiền ví
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
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final bookingId = await DatabaseHelper.instance.createBookingAndPay(
        userId: userId,
        tourId: tourId,
        hotelId: hotelId,
        departureDate: departureDate,
        adultCount: adultCount,
        childCount: childCount,
        tourAmount: tourAmount,
        hotelAmount: hotelAmount,
        totalAmount: totalAmount,
      );

      if (bookingId == null) {
        _errorMessage = 'Số dư trong ví không đủ để thanh toán tour này!';
        _isLoading = false;
        notifyListeners();
        return null;
      }

      await loadUserBookings(userId);
      _isLoading = false;
      notifyListeners();
      return bookingId;
    } catch (e) {
      _errorMessage = 'Lỗi trong quá trình thanh toán: $e';
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  // 6. Hoàn tất chuyến đi (xong tour) -> Kích hoạt phân chia doanh thu:
  // 90% tour cho Operator, 90% hotel cho Hotelier, 10% cho Admin
  Future<bool> completeBooking(int bookingId, {int? operatorId, int? hotelierId}) async {
    _isLoading = true;
    notifyListeners();
    try {
      final success = await DatabaseHelper.instance.completeBooking(bookingId);
      if (success) {
        if (operatorId != null) await loadOperatorBookings(operatorId);
        if (hotelierId != null) await loadHotelierBookings(hotelierId);
        await loadAdminBookings();
      }
      return success;
    } catch (e) {
      _errorMessage = 'Lỗi xác nhận hoàn thành tour: $e';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // 7. Hủy tour và hoàn tiền 100%
  Future<bool> cancelBookingAndRefund(int bookingId, int userId) async {
    _isLoading = true;
    notifyListeners();
    try {
      final success = await DatabaseHelper.instance.cancelBookingAndRefund(bookingId, userId);
      if (success) {
        await loadUserBookings(userId);
      }
      return success;
    } catch (e) {
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
