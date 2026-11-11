class TourModel {
  final int? id;
  final int? operatorId;
  final String title;
  final String destination;
  final String description;
  final double price;
  final String duration;
  final String imageUrl;
  final String category; // 'Biển đảo', 'Vùng cao', 'Nghỉ dưỡng', 'Văn hóa'
  final double rating;

  TourModel({
    this.id,
    this.operatorId,
    required this.title,
    required this.destination,
    required this.description,
    required this.price,
    required this.duration,
    required this.imageUrl,
    required this.category,
    this.rating = 5.0,
  });

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'operatorId': operatorId,
      'title': title,
      'destination': destination,
      'description': description,
      'price': price,
      'duration': duration,
      'imageUrl': imageUrl,
      'category': category,
      'rating': rating,
    };
  }

  factory TourModel.fromMap(Map<String, dynamic> map) {
    return TourModel(
      id: map['id'] as int?,
      operatorId: map['operatorId'] as int?,
      title: map['title'] as String? ?? '',
      destination: map['destination'] as String? ?? '',
      description: map['description'] as String? ?? '',
      price: (map['price'] as num?)?.toDouble() ?? 0.0,
      duration: map['duration'] as String? ?? '',
      imageUrl: map['imageUrl'] as String? ?? '',
      category: map['category'] as String? ?? 'Nghỉ dưỡng',
      rating: (map['rating'] as num?)?.toDouble() ?? 5.0,
    );
  }

  TourModel copyWith({
    int? id,
    int? operatorId,
    String? title,
    String? destination,
    String? description,
    double? price,
    String? duration,
    String? imageUrl,
    String? category,
    double? rating,
  }) {
    return TourModel(
      id: id ?? this.id,
      operatorId: operatorId ?? this.operatorId,
      title: title ?? this.title,
      destination: destination ?? this.destination,
      description: description ?? this.description,
      price: price ?? this.price,
      duration: duration ?? this.duration,
      imageUrl: imageUrl ?? this.imageUrl,
      category: category ?? this.category,
      rating: rating ?? this.rating,
    );
  }
}
