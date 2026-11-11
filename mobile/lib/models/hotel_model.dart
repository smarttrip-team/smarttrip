class HotelModel {
  final int? id;
  final int? managerId;
  final String name;
  final String location;
  final double pricePerNight;
  final String imageUrl;
  final int starRating;
  final int totalRooms;

  HotelModel({
    this.id,
    this.managerId,
    required this.name,
    required this.location,
    required this.pricePerNight,
    required this.imageUrl,
    this.starRating = 4,
    this.totalRooms = 50,
  });

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'managerId': managerId,
      'name': name,
      'location': location,
      'pricePerNight': pricePerNight,
      'imageUrl': imageUrl,
      'starRating': starRating,
      'totalRooms': totalRooms,
    };
  }

  factory HotelModel.fromMap(Map<String, dynamic> map) {
    return HotelModel(
      id: map['id'] as int?,
      managerId: map['managerId'] as int?,
      name: map['name'] as String? ?? '',
      location: map['location'] as String? ?? '',
      pricePerNight: (map['pricePerNight'] as num?)?.toDouble() ?? 0.0,
      imageUrl: map['imageUrl'] as String? ?? '',
      starRating: map['starRating'] as int? ?? 4,
      totalRooms: map['totalRooms'] as int? ?? 50,
    );
  }

  HotelModel copyWith({
    int? id,
    int? managerId,
    String? name,
    String? location,
    double? pricePerNight,
    String? imageUrl,
    int? starRating,
    int? totalRooms,
  }) {
    return HotelModel(
      id: id ?? this.id,
      managerId: managerId ?? this.managerId,
      name: name ?? this.name,
      location: location ?? this.location,
      pricePerNight: pricePerNight ?? this.pricePerNight,
      imageUrl: imageUrl ?? this.imageUrl,
      starRating: starRating ?? this.starRating,
      totalRooms: totalRooms ?? this.totalRooms,
    );
  }
}
