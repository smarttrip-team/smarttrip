import 'package:flutter/foundation.dart';
import '../network/api_client.dart';
import '../../shared/models/models.dart';

class HotelProvider extends ChangeNotifier {
  List<Hotel> _hotels = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Hotel> get hotels => _hotels;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchHotels() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiClient.get('/api/v1/hotels');
      if (res.statusCode == 200) {
        final dynamic data = ApiClient.decode(res);
        final list = (data is List) ? data : (data['content'] ?? data['data'] ?? []);
        _hotels = (list as List).map((h) => Hotel.fromJson(h)).toList();
        _isLoading = false;
        notifyListeners();
      } else {
        _errorMessage = 'Không thể tải danh sách khách sạn (${res.statusCode})';
        _isLoading = false;
        notifyListeners();
      }
    } catch (e) {
      _errorMessage = 'Lỗi kết nối Hotel Service: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> createHotel({
    required String name,
    required String address,
    required String city,
    required int starRating,
    required String description,
    required List<Map<String, dynamic>> roomTypes,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final payload = {
        'name': name,
        'address': address,
        'city': city,
        'starRating': starRating,
        'description': description,
        'roomTypes': roomTypes,
      };

      final res = await ApiClient.post('/api/v1/hotels', payload);
      _isLoading = false;

      if (res.statusCode == 200 || res.statusCode == 201) {
        await fetchHotels();
        return true;
      } else {
        final err = ApiClient.decode(res);
        _errorMessage = (err is Map) ? (err['message'] ?? 'Thêm khách sạn thất bại') : 'Lỗi (${res.statusCode})';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Lỗi thêm khách sạn: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> batchUpdateInventory({
    required int hotelId,
    required int roomTypeId,
    required String startDate,
    required String endDate,
    required int totalRooms,
    required double price,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final payload = {
        'hotelId': hotelId,
        'roomTypeId': roomTypeId,
        'startDate': startDate,
        'endDate': endDate,
        'totalRooms': totalRooms,
        'price': price,
        'status': 'AVAILABLE',
      };

      final res = await ApiClient.post('/api/v1/hotels/inventories/batch', payload);
      _isLoading = false;

      if (res.statusCode == 200 || res.statusCode == 201 || res.statusCode == 204) {
        notifyListeners();
        return true;
      } else {
        final err = ApiClient.decode(res);
        _errorMessage = (err is Map) ? (err['message'] ?? 'Cập nhật tồn kho/giá phòng thất bại') : 'Lỗi (${res.statusCode})';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Lỗi cập nhật tồn kho phòng: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
}
