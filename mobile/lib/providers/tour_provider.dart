import 'package:flutter/material.dart';
import '../database/database_helper.dart';
import '../models/tour_model.dart';

class TourProvider extends ChangeNotifier {
  List<TourModel> _allTours = [];
  List<TourModel> _filteredTours = [];
  String _searchKeyword = '';
  String _selectedCategory = 'Tất cả';
  bool _isLoading = false;

  List<TourModel> get tours => _filteredTours;
  String get searchKeyword => _searchKeyword;
  String get selectedCategory => _selectedCategory;
  bool get isLoading => _isLoading;

  TourProvider() {
    loadTours();
  }

  Future<void> loadTours() async {
    _isLoading = true;
    notifyListeners();
    try {
      _allTours = await DatabaseHelper.instance.getAllTours();
      _applyFilter();
    } catch (e) {
      debugPrint('Error loading tours: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<List<TourModel>> getToursByOperator(int operatorId) async {
    return await DatabaseHelper.instance.getToursByOperator(operatorId);
  }

  Future<TourModel?> getTourById(int id) async {
    return await DatabaseHelper.instance.getTourById(id);
  }

  void searchTours(String keyword) {
    _searchKeyword = keyword.trim().toLowerCase();
    _applyFilter();
  }

  void setCategory(String category) {
    _selectedCategory = category;
    _applyFilter();
  }

  void _applyFilter() {
    _filteredTours = _allTours.where((tour) {
      final matchKeyword = _searchKeyword.isEmpty ||
          tour.title.toLowerCase().contains(_searchKeyword) ||
          tour.destination.toLowerCase().contains(_searchKeyword);

      final matchCategory = _selectedCategory == 'Tất cả' ||
          tour.category == _selectedCategory;

      return matchKeyword && matchCategory;
    }).toList();
    notifyListeners();
  }

  Future<bool> addTour(TourModel tour) async {
    try {
      await DatabaseHelper.instance.insertTour(tour);
      await loadTours();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> updateTour(TourModel tour) async {
    try {
      await DatabaseHelper.instance.updateTour(tour);
      await loadTours();
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> deleteTour(int id) async {
    try {
      await DatabaseHelper.instance.deleteTour(id);
      await loadTours();
      return true;
    } catch (e) {
      return false;
    }
  }
}
