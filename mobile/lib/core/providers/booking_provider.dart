import 'package:flutter/foundation.dart';
import '../network/api_client.dart';
import '../../shared/models/models.dart';

class BookingProvider extends ChangeNotifier {
  List<Booking> _bookings = [];
  SagaStatus? _currentSagaStatus;
  Booking? _currentBookingDetails;
  bool _isLoading = false;
  String? _errorMessage;

  List<Booking> get bookings => _bookings;
  SagaStatus? get currentSagaStatus => _currentSagaStatus;
  Booking? get currentBookingDetails => _currentBookingDetails;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchBookings(int customerId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiClient.get('/api/v1/bookings?customerId=$customerId');
      if (res.statusCode == 200) {
        final dynamic data = ApiClient.decode(res);
        final list = (data is List) ? data : (data['content'] ?? data['data'] ?? []);
        final parsed = (list as List).map((b) => Booking.fromJson(b)).toList();
        _bookings = parsed.reversed.toList();
        _isLoading = false;
        notifyListeners();
      } else {
        _errorMessage = 'Không thể tải lịch sử đặt chỗ (${res.statusCode})';
        _isLoading = false;
        notifyListeners();
      }
    } catch (e) {
      _errorMessage = 'Lỗi kết nối Booking Service: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchSagaStatus(String bookingCode, {bool isSilent = false}) async {
    if (!isSilent) {
      _isLoading = true;
      _errorMessage = null;
      notifyListeners();
    }

    try {
      // 1. Saga Status
      final sagaRes = await ApiClient.get('/api/v1/bookings/$bookingCode/saga');
      if (sagaRes.statusCode == 200) {
        _currentSagaStatus = SagaStatus.fromJson(ApiClient.decode(sagaRes));
      }

      // 2. Booking Details
      final bRes = await ApiClient.get('/api/v1/bookings/$bookingCode');
      if (bRes.statusCode == 200) {
        _currentBookingDetails = Booking.fromJson(ApiClient.decode(bRes));
      }

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Lỗi theo dõi tiến trình Saga: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> cancelBooking(String bookingCode, int customerId) async {
    try {
      final res = await ApiClient.post('/api/v1/bookings/$bookingCode/cancel', {});
      if (res.statusCode == 200 || res.statusCode == 202) {
        await fetchSagaStatus(bookingCode, isSilent: true);
        await fetchBookings(customerId);
        return true;
      } else {
        final err = ApiClient.decode(res);
        _errorMessage = (err is Map) ? (err['message'] ?? 'Hủy tour thất bại') : 'Lỗi (${res.statusCode})';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Lỗi gửi yêu cầu hủy: $e';
      notifyListeners();
      return false;
    }
  }

  Future<String?> createBooking(Map<String, dynamic> bookingPayload) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiClient.post('/api/v1/bookings', bookingPayload);
      _isLoading = false;

      if (res.statusCode == 200 || res.statusCode == 201 || res.statusCode == 202) {
        final data = ApiClient.decode(res);
        final bookingCode = data['bookingCode'] ?? data['code'];
        notifyListeners();
        return bookingCode;
      } else {
        final err = ApiClient.decode(res);
        _errorMessage = (err is Map) ? (err['message'] ?? 'Đặt tour thất bại') : 'Lỗi (${res.statusCode})';
        notifyListeners();
        return null;
      }
    } catch (e) {
      _errorMessage = 'Lỗi gửi đơn đặt chỗ: $e';
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }
}
