import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../database/database_helper.dart';
import '../models/user_model.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _currentUser;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _currentUser != null;
  String get userRole => _currentUser?.role ?? 'guest';

  AuthProvider() {
    _loadUserFromSession();
  }

  Future<void> _loadUserFromSession() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString('current_user');
    if (userJson != null) {
      try {
        _currentUser = UserModel.fromMap(jsonDecode(userJson));
        notifyListeners();
      } catch (e) {
        prefs.remove('current_user');
      }
    }
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final user = await DatabaseHelper.instance.login(email.trim(), password);
      if (user == null) {
        _errorMessage = 'Email hoặc mật khẩu không chính xác!';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      if (user.status == 'blocked') {
        _errorMessage = 'Tài khoản của bạn đã bị khóa bởi Quản trị viên!';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      _currentUser = user;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('current_user', jsonEncode(user.toMap()));

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Lỗi đăng nhập: $e';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register({
    required String fullName,
    required String email,
    required String password,
    required String phone,
    String role = 'customer',
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final newUser = UserModel(
        fullName: fullName.trim(),
        email: email.trim(),
        password: password,
        phone: phone.trim(),
        role: role,
        status: 'active',
      );

      final id = await DatabaseHelper.instance.registerUser(newUser);
      _currentUser = newUser.copyWith(id: id);

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('current_user', jsonEncode(_currentUser!.toMap()));

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Email này đã tồn tại trong hệ thống!';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('current_user');
    notifyListeners();
  }
}
