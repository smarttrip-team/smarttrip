import 'package:flutter/material.dart';
import '../database/database_helper.dart';
import '../models/booking_model.dart';

class BookingProvider extends ChangeNotifier {
  List<BookingModel> _userBookings = [];
  List<BookingModel> _operatorBookings = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<BookingModel> get userBookings => _userBookings;
  List<BookingModel> get operatorBookings => _operatorBookings;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

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

  Future<void> loadOperatorBookings(int operatorId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _operatorBookings = await DatabaseHelper.instance.getBookingsForOperator(operatorId);
    } catch (e) {
      _errorMessage = 'Lỗi tải danh sách khách đặt: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<int?> createBookingAndPay({
    required int userId,
    required int tourId,
    int? hotelId,
    required String departureDate,
    required int adultCount,
    required int childCount,
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
