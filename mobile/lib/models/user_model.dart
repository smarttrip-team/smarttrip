class UserModel {
  final int? id;
  final String fullName;
  final String email;
  final String password;
  final String phone;
  final String role; // 'customer', 'tour_operator', 'hotel_manager', 'admin'
  final String status; // 'active', 'blocked'

  UserModel({
    this.id,
    required this.fullName,
    required this.email,
    required this.password,
    required this.phone,
    required this.role,
    this.status = 'active',
  });

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'fullName': fullName,
      'email': email,
      'password': password,
      'phone': phone,
      'role': role,
      'status': status,
    };
  }

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'] as int?,
      fullName: map['fullName'] as String? ?? '',
      email: map['email'] as String? ?? '',
      password: map['password'] as String? ?? '',
      phone: map['phone'] as String? ?? '',
      role: map['role'] as String? ?? 'customer',
      status: map['status'] as String? ?? 'active',
    );
  }

  UserModel copyWith({
    int? id,
    String? fullName,
    String? email,
    String? password,
    String? phone,
    String? role,
    String? status,
  }) {
    return UserModel(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      email: email ?? this.email,
      password: password ?? this.password,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      status: status ?? this.status,
    );
  }
}
