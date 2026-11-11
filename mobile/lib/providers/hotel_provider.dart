import 'package:flutter/material.dart';
import '../database/database_helper.dart';
import '../models/hotel_model.dart';

class HotelProvider extends ChangeNotifier {
  List<HotelModel> _hotels = [];
  HotelModel? _selectedHotel;
  bool _isLoading = false;

  List<HotelModel> get hotels => _hotels;
  HotelModel? get selectedHotel => _selectedHotel;
  bool get isLoading => _isLoading;

  HotelProvider() {
    loadHotels();
  }

  Future<void> loadHotels() async {
    _isLoading = true;
    notifyListeners();
    try {
      _hotels = await DatabaseHelper.instance.getAllHotels();
    } catch (e) {
      debugPrint('Error loading hotels: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<List<HotelModel>> getHotelsByManager(int managerId) async {
    return await DatabaseHelper.instance.getHotelsByManager(managerId);
  }

  void selectHotel(HotelModel? hotel) {
    if (_selectedHotel?.id == hotel?.id) {
      _selectedHotel = null; // Bỏ chọn
    } else {
      _selectedHotel = hotel;
    }
    notifyListeners();
  }

  void clearSelection() {
    _selectedHotel = null;
    notifyListeners();
  }

  Future<bool> addHotel(HotelModel hotel) async {
    try {
      await DatabaseHelper.instance.insertHotel(hotel);
      await loadHotels();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> updateHotel(HotelModel hotel) async {
    try {
      await DatabaseHelper.instance.updateHotel(hotel);
      await loadHotels();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteHotel(int id) async {
    try {
      await DatabaseHelper.instance.deleteHotel(id);
      await loadHotels();
      return true;
    } catch (e) {
      return false;
    }
  }
}
