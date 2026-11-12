import 'package:flutter/material.dart';
import '../database/database_helper.dart';
import '../models/wallet_model.dart';

class WalletProvider extends ChangeNotifier {
  double _balance = 0.0;
  List<WalletTransactionModel> _transactions = [];
  bool _isLoading = false;

  double get balance => _balance;
  List<WalletTransactionModel> get transactions => _transactions;
  bool get isLoading => _isLoading;

  Future<void> loadWallet(int userId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _balance = await DatabaseHelper.instance.getWalletBalance(userId);
      _transactions = await DatabaseHelper.instance.getWalletTransactions(userId);
    } catch (e) {
      debugPrint('Error loading wallet: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> topUp(int userId, double amount) async {
    _isLoading = true;
    notifyListeners();
    try {
      final success = await DatabaseHelper.instance.topUpWallet(
        userId,
        amount,
        'Nạp nhanh số dư ví trải nghiệm',
      );
      if (success) {
        await loadWallet(userId);
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
