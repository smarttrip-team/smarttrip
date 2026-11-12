import 'package:shared_preferences/shared_preferences.dart';

class SessionStorage {
  static const _keyToken = 'smarttrip_token';
  static const _keyUserId = 'smarttrip_user_id';
  static const _keyEmail = 'smarttrip_email';
  static const _keyFullName = 'smarttrip_full_name';
  static const _keyRole = 'smarttrip_role';

  static String? _cachedToken;
  static int? _cachedUserId;
  static String? _cachedEmail;
  static String? _cachedFullName;
  static String? _cachedRole;

  static String? get token => _cachedToken;
  static int? get userId => _cachedUserId;
  static String? get email => _cachedEmail;
  static String? get fullName => _cachedFullName;
  static String? get role => _cachedRole;

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _cachedToken = prefs.getString(_keyToken);
    final uidStr = prefs.getString(_keyUserId);
    _cachedUserId = uidStr != null ? int.tryParse(uidStr) : 10;
    _cachedEmail = prefs.getString(_keyEmail) ?? 'vinhle@smarttrip.com';
    _cachedFullName = prefs.getString(_keyFullName) ?? 'Lê Quang Vĩnh';
    _cachedRole = prefs.getString(_keyRole) ?? 'CUSTOMER';
  }

  static Future<void> saveSession({
    required String token,
    required String userId,
    required String email,
    required String fullName,
    required String role,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyToken, token);
    await prefs.setString(_keyUserId, userId);
    await prefs.setString(_keyEmail, email);
    await prefs.setString(_keyFullName, fullName);
    await prefs.setString(_keyRole, role);

    _cachedToken = token;
    _cachedUserId = int.tryParse(userId) ?? 10;
    _cachedEmail = email;
    _cachedFullName = fullName;
    _cachedRole = role;
  }

  static Future<String?> getToken() async {
    if (_cachedToken != null) return _cachedToken;
    final prefs = await SharedPreferences.getInstance();
    _cachedToken = prefs.getString(_keyToken);
    return _cachedToken;
  }

  static Future<String?> getUserId() async {
    if (_cachedUserId != null) return _cachedUserId.toString();
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_keyUserId) ?? '10';
  }

  static bool get isLoggedIn => _cachedToken != null && _cachedToken!.isNotEmpty;

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    _cachedToken = null;
    _cachedUserId = null;
    _cachedEmail = null;
    _cachedFullName = null;
    _cachedRole = null;
  }
}
