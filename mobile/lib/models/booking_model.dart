class BookingModel {
  final int? id;
  final int userId;
  final int tourId;
  final int? hotelId;
  final String departureDate;
  final int adultCount;
  final int childCount;
  final double totalAmount;
  final String status; // 'CONFIRMED', 'CANCELLED'
  final String createdAt;
  
  // Extra fields for UI display
  final String? tourTitle;
  final String? tourImage;
  final String? destination;
  final String? hotelName;

  BookingModel({
    this.id,
    required this.userId,
    required this.tourId,
    this.hotelId,
    required this.departureDate,
    required this.adultCount,
    required this.childCount,
    required this.totalAmount,
    this.status = 'CONFIRMED',
    required this.createdAt,
    this.tourTitle,
    this.tourImage,
    this.destination,
    this.hotelName,
  });

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'userId': userId,
      'tourId': tourId,
      'hotelId': hotelId,
      'departureDate': departureDate,
      'adultCount': adultCount,
      'childCount': childCount,
      'totalAmount': totalAmount,
      'status': status,
      'createdAt': createdAt,
    };
  }

  factory BookingModel.fromMap(Map<String, dynamic> map) {
    return BookingModel(
      id: map['id'] as int?,
      userId: map['userId'] as int? ?? 0,
      tourId: map['tourId'] as int? ?? 0,
      hotelId: map['hotelId'] as int?,
      departureDate: map['departureDate'] as String? ?? '',
      adultCount: map['adultCount'] as int? ?? 1,
      childCount: map['childCount'] as int? ?? 0,
      totalAmount: (map['totalAmount'] as num?)?.toDouble() ?? 0.0,
      status: map['status'] as String? ?? 'CONFIRMED',
      createdAt: map['createdAt'] as String? ?? '',
      tourTitle: map['tourTitle'] as String?,
      tourImage: map['tourImage'] as String?,
      destination: map['destination'] as String?,
      hotelName: map['hotelName'] as String?,
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
    double? totalAmount,
    String? status,
    String? createdAt,
    String? tourTitle,
    String? tourImage,
    String? destination,
    String? hotelName,
  }) {
    return BookingModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      tourId: tourId ?? this.tourId,
      hotelId: hotelId ?? this.hotelId,
      departureDate: departureDate ?? this.departureDate,
      adultCount: adultCount ?? this.adultCount,
      childCount: childCount ?? this.childCount,
      totalAmount: totalAmount ?? this.totalAmount,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      tourTitle: tourTitle ?? this.tourTitle,
      tourImage: tourImage ?? this.tourImage,
      destination: destination ?? this.destination,
      hotelName: hotelName ?? this.hotelName,
    );
  }
}
