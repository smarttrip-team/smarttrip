import 'package:intl/intl.dart';

final currencyFormatter = NumberFormat.currency(locale: 'vi_VN', symbol: '₫');

String formatVND(num? amount) {
  if (amount == null) return '0 ₫';
  return currencyFormatter.format(amount);
}

// ==================== TOUR MODELS ====================
class Tour {
  final int id;
  final String title;
  final String description;
  final double basePrice;
  final String? coverImageUrl;
  final int durationDays;
  final String? destinationName;
  final List<Departure> upcomingDepartures;

  Tour({
    required this.id,
    required this.title,
    required this.description,
    required this.basePrice,
    this.coverImageUrl,
    required this.durationDays,
    this.destinationName,
    required this.upcomingDepartures,
  });

  factory Tour.fromJson(Map<String, dynamic> json) {
    var departures = <Departure>[];
    if (json['upcomingDepartures'] != null) {
      departures = (json['upcomingDepartures'] as List)
          .map((d) => Departure.fromJson(d))
          .toList();
    }
    return Tour(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      basePrice: (json['basePrice'] ?? 0).toDouble(),
      coverImageUrl: json['coverImageUrl'],
      durationDays: json['durationDays'] ?? 1,
      destinationName: json['destinationName'] ?? json['city'],
      upcomingDepartures: departures,
    );
  }
}

class Departure {
  final int id;
  final String departureDate;
  final double price;
  final int availableSeats;
  final int totalSeats;

  Departure({
    required this.id,
    required this.departureDate,
    required this.price,
    required this.availableSeats,
    required this.totalSeats,
  });

  factory Departure.fromJson(Map<String, dynamic> json) {
    return Departure(
      id: json['id'] ?? 0,
      departureDate: json['departureDate'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      availableSeats: json['availableSeats'] ?? 0,
      totalSeats: json['totalSeats'] ?? 0,
    );
  }
}

// ==================== HOTEL MODELS (MEMBER 2 DOMAIN) ====================
class Hotel {
  final int id;
  final String name;
  final String address;
  final String? city;
  final int starRating;
  final String? description;
  final List<RoomType> roomTypes;

  Hotel({
    required this.id,
    required this.name,
    required this.address,
    this.city,
    required this.starRating,
    this.description,
    required this.roomTypes,
  });

  factory Hotel.fromJson(Map<String, dynamic> json) {
    var types = <RoomType>[];
    if (json['roomTypes'] != null) {
      types = (json['roomTypes'] as List)
          .map((r) => RoomType.fromJson(r))
          .toList();
    }
    return Hotel(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      address: json['address'] ?? '',
      city: json['city'],
      starRating: json['starRating'] ?? 4,
      description: json['description'],
      roomTypes: types,
    );
  }
}

class RoomType {
  final int id;
  final String name;
  final double basePricePerNight;
  final int capacityPerRoom;

  RoomType({
    required this.id,
    required this.name,
    required this.basePricePerNight,
    required this.capacityPerRoom,
  });

  factory RoomType.fromJson(Map<String, dynamic> json) {
    return RoomType(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      basePricePerNight: (json['basePricePerNight'] ?? 0).toDouble(),
      capacityPerRoom: json['capacityPerRoom'] ?? 2,
    );
  }
}

// ==================== WALLET MODELS (MEMBER 2 DOMAIN) ====================
class Wallet {
  final int id;
  final int userId;
  final double balance;
  final double heldAmount;
  final String currency;
  final String status;

  Wallet({
    required this.id,
    required this.userId,
    required this.balance,
    required this.heldAmount,
    required this.currency,
    required this.status,
  });

  factory Wallet.fromJson(Map<String, dynamic> json) {
    return Wallet(
      id: json['id'] ?? 0,
      userId: json['userId'] ?? 0,
      balance: (json['balance'] ?? 0).toDouble(),
      heldAmount: (json['heldAmount'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'VND',
      status: json['status'] ?? 'ACTIVE',
    );
  }
}

class WalletTransaction {
  final int id;
  final String type; // TOP_UP, HOLD, CAPTURE, REFUND, RELEASE
  final double amount;
  final double balanceAfter;
  final String? referenceType;
  final String? referenceId;
  final String? description;
  final String? createdAt;

  WalletTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.balanceAfter,
    this.referenceType,
    this.referenceId,
    this.description,
    this.createdAt,
  });

  factory WalletTransaction.fromJson(Map<String, dynamic> json) {
    return WalletTransaction(
      id: json['id'] ?? 0,
      type: json['type'] ?? '',
      amount: (json['amount'] ?? 0).toDouble(),
      balanceAfter: (json['balanceAfter'] ?? 0).toDouble(),
      referenceType: json['referenceType'],
      referenceId: json['referenceId']?.toString(),
      description: json['description'],
      createdAt: json['createdAt'],
    );
  }
}

// ==================== BOOKING & SAGA MODELS (MEMBER 2 DOMAIN) ====================
class Booking {
  final int id;
  final String bookingCode;
  final int customerId;
  final String status; // PENDING, CONFIRMED, CANCELLED, FAILED
  final double totalAmount;
  final String currency;
  final String? createdAt;
  final List<dynamic> items;

  Booking({
    required this.id,
    required this.bookingCode,
    required this.customerId,
    required this.status,
    required this.totalAmount,
    required this.currency,
    this.createdAt,
    required this.items,
  });

  factory Booking.fromJson(Map<String, dynamic> json) {
    return Booking(
      id: json['id'] ?? 0,
      bookingCode: json['bookingCode'] ?? '',
      customerId: json['customerId'] ?? 0,
      status: json['status'] ?? 'PENDING',
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'VND',
      createdAt: json['createdAt'],
      items: json['items'] ?? [],
    );
  }
}

class SagaStatus {
  final String bookingCode;
  final String status; // PROCESSING, COMPLETED, COMPENSATED, FAILED
  final String currentStep;
  final String? failureReason;
  final List<SagaStep> steps;

  SagaStatus({
    required this.bookingCode,
    required this.status,
    required this.currentStep,
    this.failureReason,
    required this.steps,
  });

  factory SagaStatus.fromJson(Map<String, dynamic> json) {
    var stepsList = <SagaStep>[];
    if (json['steps'] != null) {
      stepsList = (json['steps'] as List)
          .map((s) => SagaStep.fromJson(s))
          .toList();
    }
    return SagaStatus(
      bookingCode: json['bookingCode'] ?? '',
      status: json['status'] ?? '',
      currentStep: json['currentStep'] ?? '',
      failureReason: json['failureReason'],
      steps: stepsList,
    );
  }
}

class SagaStep {
  final String stepName;
  final String status; // COMPLETED, FAILED, PENDING
  final String? actionType;
  final String? lastError;

  SagaStep({
    required this.stepName,
    required this.status,
    this.actionType,
    this.lastError,
  });

  factory SagaStep.fromJson(Map<String, dynamic> json) {
    return SagaStep(
      stepName: json['stepName'] ?? '',
      status: json['status'] ?? '',
      actionType: json['actionType'],
      lastError: json['lastError'],
    );
  }
}
