import 'package:flutter/foundation.dart';
import '../network/api_client.dart';
import '../../shared/models/models.dart';

class TourProvider extends ChangeNotifier {
  List<Tour> _tours = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _searchQuery = '';

  List<Tour> get tours => _tours;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get searchQuery => _searchQuery;

  List<Tour> get filteredTours {
    if (_searchQuery.trim().isEmpty) return _tours;
    final query = _searchQuery.toLowerCase().trim();
    return _tours.where((t) {
      final titleMatch = t.title.toLowerCase().contains(query);
      final destMatch = (t.destinationName ?? '').toLowerCase().contains(query);
      final descMatch = t.description.toLowerCase().contains(query);
      return titleMatch || destMatch || descMatch;
    }).toList();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<void> fetchTours() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiClient.get('/api/v1/tours');
      if (res.statusCode == 200) {
        final dynamic data = ApiClient.decode(res);
        List items = [];
        if (data is List) {
          items = data;
        } else if (data is Map && data['content'] != null) {
          items = data['content'];
        } else if (data is Map && data['data'] != null) {
          items = data['data'] is List ? data['data'] : (data['data']['content'] ?? []);
        }

        _tours = items.map((t) => Tour.fromJson(t)).toList();
        _isLoading = false;
        notifyListeners();
      } else {
        _errorMessage = 'Không thể tải danh sách tour (${res.statusCode})';
        _isLoading = false;
        notifyListeners();
      }
    } catch (e) {
      _errorMessage = 'Lỗi kết nối Tour Service: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  Tour? findById(int tourId) {
    try {
      return _tours.firstWhere((t) => t.id == tourId);
    } catch (_) {
      return null;
    }
  }
}
