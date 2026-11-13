class BookingModel {
  final int? id;
  final int userId;
  final int tourId;
  final int? hotelId;
  final String departureDate;
  final int adultCount;
  final int childCount;
  final double tourAmount;
  final double hotelAmount;
  final double totalAmount;
  final String status; // 'CONFIRMED', 'COMPLETED', 'CANCELLED'
  final String createdAt;

  // Extra fields for UI display
  final String? tourTitle;
  final String? tourImage;
  final String? destination;
  final String? hotelName;
  final String? customerName;
  final String? customerPhone;
  final String? customerEmail;

  BookingModel({
    this.id,
    required this.userId,
    required this.tourId,
    this.hotelId,
    required this.departureDate,
    required this.adultCount,
    required this.childCount,
    this.tourAmount = 0.0,
    this.hotelAmount = 0.0,
    required this.totalAmount,
    this.status = 'CONFIRMED',
    required this.createdAt,
    this.tourTitle,
    this.tourImage,
    this.destination,
    this.hotelName,
    this.customerName,
    this.customerPhone,
    this.customerEmail,
  });

  // Business revenue getters (90% Tour, 90% Hotel, 10% System Commission)
  double get effectiveTourAmount => tourAmount > 0 ? tourAmount : (totalAmount - hotelAmount);
  double get operatorRevenue => effectiveTourAmount * 0.90;
  double get operatorCommissionFee => effectiveTourAmount * 0.10;

  double get hotelierRevenue => hotelAmount * 0.90;
  double get hotelierCommissionFee => hotelAmount * 0.10;

  double get systemCommission => totalAmount * 0.10;

  bool get isCompleted => status == 'COMPLETED';
  bool get isConfirmed => status == 'CONFIRMED';
  bool get isCancelled => status == 'CANCELLED';

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'userId': userId,
      'tourId': tourId,
      'hotelId': hotelId,
      'departureDate': departureDate,
      'adultCount': adultCount,
      'childCount': childCount,
      'tourAmount': tourAmount,
      'hotelAmount': hotelAmount,
      'totalAmount': totalAmount,
      'status': status,
      'createdAt': createdAt,
    };
  }

  factory BookingModel.fromMap(Map<String, dynamic> map) {
    final total = (map['totalAmount'] as num?)?.toDouble() ?? 0.0;
    final hAmt = (map['hotelAmount'] as num?)?.toDouble() ?? 0.0;
    double tAmt = (map['tourAmount'] as num?)?.toDouble() ?? 0.0;
    if (tAmt == 0.0 && total > 0.0) {
      tAmt = total - hAmt;
    }

    return BookingModel(
      id: map['id'] as int?,
      userId: map['userId'] as int? ?? 0,
      tourId: map['tourId'] as int? ?? 0,
      hotelId: map['hotelId'] as int?,
      departureDate: map['departureDate'] as String? ?? '',
      adultCount: map['adultCount'] as int? ?? 1,
      childCount: map['childCount'] as int? ?? 0,
      tourAmount: tAmt,
      hotelAmount: hAmt,
      totalAmount: total,
      status: map['status'] as String? ?? 'CONFIRMED',
      createdAt: map['createdAt'] as String? ?? '',
      tourTitle: map['tourTitle'] as String?,
      tourImage: map['tourImage'] as String?,
      destination: map['destination'] as String?,
      hotelName: map['hotelName'] as String?,
      customerName: map['customerName'] as String?,
      customerPhone: map['customerPhone'] as String?,
      customerEmail: map['customerEmail'] as String?,
    );
  }

  BookingModel copyWith({
    int? id,
    int? userId,
    int? tourId,
    int? hotelId,
    String? departureDate,
    int? adultCount,
    int? childCount,
    double? tourAmount,
    double? hotelAmount,
    double? totalAmount,
    String? status,
    String? createdAt,
    String? tourTitle,
    String? tourImage,
    String? destination,
    String? hotelName,
    String? customerName,
    String? customerPhone,
    String? customerEmail,
  }) {
    return BookingModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      tourId: tourId ?? this.tourId,
      hotelId: hotelId ?? this.hotelId,
      departureDate: departureDate ?? this.departureDate,
      adultCount: adultCount ?? this.adultCount,
      childCount: childCount ?? this.childCount,
      tourAmount: tourAmount ?? this.tourAmount,
      hotelAmount: hotelAmount ?? this.hotelAmount,
      totalAmount: totalAmount ?? this.totalAmount,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      tourTitle: tourTitle ?? this.tourTitle,
      tourImage: tourImage ?? this.tourImage,
      destination: destination ?? this.destination,
      hotelName: hotelName ?? this.hotelName,
      customerName: customerName ?? this.customerName,
      customerPhone: customerPhone ?? this.customerPhone,
      customerEmail: customerEmail ?? this.customerEmail,
    );
  }
}
