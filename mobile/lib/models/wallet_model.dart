class WalletModel {
  final int? id;
  final int userId;
  final double balance;

  WalletModel({
    this.id,
    required this.userId,
    required this.balance,
  });

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'userId': userId,
      'balance': balance,
    };
  }

  factory WalletModel.fromMap(Map<String, dynamic> map) {
    return WalletModel(
      id: map['id'] as int?,
      userId: map['userId'] as int? ?? 0,
      balance: (map['balance'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class WalletTransactionModel {
  final int? id;
  final int userId;
  final double amount;
  final String type; // 'TOPUP', 'PAYMENT', 'REFUND'
  final String description;
  final String createdAt;

  WalletTransactionModel({
    this.id,
    required this.userId,
    required this.amount,
    required this.type,
    required this.description,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'userId': userId,
      'amount': amount,
      'type': type,
      'description': description,
      'createdAt': createdAt,
    };
  }

  factory WalletTransactionModel.fromMap(Map<String, dynamic> map) {
    return WalletTransactionModel(
      id: map['id'] as int?,
      userId: map['userId'] as int? ?? 0,
      amount: (map['amount'] as num?)?.toDouble() ?? 0.0,
      type: map['type'] as String? ?? 'TOPUP',
      description: map['description'] as String? ?? '',
      createdAt: map['createdAt'] as String? ?? '',
    );
  }
}
