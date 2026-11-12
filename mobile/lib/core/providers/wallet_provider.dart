import 'dart:math';
import 'package:flutter/foundation.dart';
import '../network/api_client.dart';
import '../../shared/models/models.dart';

class WalletProvider extends ChangeNotifier {
  Wallet? _wallet;
  List<WalletTransaction> _transactions = [];
  bool _isLoading = false;
  String? _errorMessage;

  Wallet? get wallet => _wallet;
  List<WalletTransaction> get transactions => _transactions;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  double get availableBalance => (_wallet?.balance ?? 0) - (_wallet?.heldAmount ?? 0);
  double get balance => _wallet?.balance ?? 0;
  double get heldAmount => _wallet?.heldAmount ?? 0;

  Future<void> fetchWalletAndTransactions(int userId) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // 1. Fetch Wallet Balance
      final walletRes = await ApiClient.get('/api/v1/wallets/user/$userId');
      if (walletRes.statusCode == 200) {
        final wData = ApiClient.decode(walletRes);
        _wallet = Wallet.fromJson(wData);
      }

      // 2. Fetch Transactions Ledger
      final txRes = await ApiClient.get('/api/v1/wallet/transactions?userId=$userId');
      if (txRes.statusCode == 200) {
        final dynamic tData = ApiClient.decode(txRes);
        final list = (tData is List) ? tData : (tData['content'] ?? tData['data'] ?? []);
        _transactions = (list as List).map((t) => WalletTransaction.fromJson(t)).toList();
      }

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _errorMessage = 'Lỗi tải dữ liệu ví: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> topUp({required int userId, required double amount}) async {
    if (amount <= 0) {
      _errorMessage = 'Số tiền nạp phải lớn hơn 0';
      notifyListeners();
      return false;
    }

    final randomId = DateTime.now().millisecondsSinceEpoch.toString() + Random().nextInt(1000).toString();
    final idempotencyKey = 'TOPUP-MOB-$randomId';

    try {
      final res = await ApiClient.post('/api/v1/wallet/top-ups', {
        'userId': userId,
        'amount': amount,
        'idempotencyKey': idempotencyKey,
      });

      if (res.statusCode == 200 || res.statusCode == 201) {
        // Refresh balance & transactions
        await fetchWalletAndTransactions(userId);
        return true;
      } else {
        final err = ApiClient.decode(res);
        _errorMessage = (err is Map) ? (err['message'] ?? 'Nạp tiền thất bại') : 'Lỗi (${res.statusCode})';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Lỗi nạp tiền: $e';
      notifyListeners();
      return false;
    }
  }
}
