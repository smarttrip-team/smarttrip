import 'package:flutter/foundation.dart';
import '../network/api_client.dart';
import '../storage/session_storage.dart';

class AuthProvider extends ChangeNotifier {
  bool _isLoading = false;
  String? _errorMessage;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isLoggedIn => SessionStorage.isLoggedIn;
  String? get token => SessionStorage.token;
  int? get userId => SessionStorage.userId;
  String? get email => SessionStorage.email;
  String? get fullName => SessionStorage.fullName;
  String? get role => SessionStorage.role;

  bool get isHotelManager {
    final r = (SessionStorage.role ?? '').toUpperCase();
    return r.contains('HOTEL') || r.contains('ADMIN');
  }

  Future<bool> login(String emailInput, String passwordInput) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final res = await ApiClient.post('/api/v1/auth/login', {
        'email': emailInput.trim(),
        'password': passwordInput,
      });

      if (res.statusCode == 200) {
        final dynamic data = ApiClient.decode(res);
        final tokenVal = data['token'] ?? data['data']?['token'];
        final userIdVal = (data['id'] ?? data['userId'] ?? 10).toString();
        final emailVal = data['email'] ?? emailInput.trim();
        final fullNameVal = data['fullName'] ?? 'Người dùng SmartTrip';
        final roles = data['roles'] as List?;
        final roleVal = roles != null && roles.isNotEmpty ? roles.first.toString() : 'ROLE_CUSTOMER';

        if (tokenVal == null) throw Exception('Không nhận được token xác thực.');

        await SessionStorage.saveSession(
          token: tokenVal,
          userId: userIdVal,
          email: emailVal,
          fullName: fullNameVal,
          role: roleVal,
        );

        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        final err = ApiClient.decode(res);
        _errorMessage = (err is Map) ? (err['message'] ?? 'Đăng nhập thất bại') : 'Lỗi (${res.statusCode})';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> switchRoleDemo({required String newRole, required String newEmail, required String newName}) async {
    await SessionStorage.saveSession(
      token: SessionStorage.token ?? 'demo-token',
      userId: (SessionStorage.userId ?? 10).toString(),
      email: newEmail,
      fullName: newName,
      role: newRole,
    );
    notifyListeners();
  }

  Future<void> logout() async {
    await SessionStorage.clear();
    notifyListeners();
  }
}
