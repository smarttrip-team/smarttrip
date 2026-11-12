import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../storage/session_storage.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  static String get defaultBaseUrl {
    if (kIsWeb) return 'http://localhost:8080';
    try {
      if (Platform.isAndroid) return 'http://10.0.2.2:8080';
    } catch (_) {}
    return 'http://localhost:8080';
  }

  static String baseUrl = defaultBaseUrl;

  static Future<Map<String, String>> _getHeaders({bool isJson = true}) async {
    final headers = <String, String>{};
    if (isJson) {
      headers['Content-Type'] = 'application/json; charset=utf-8';
    }

    final token = await SessionStorage.getToken();
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    final userId = await SessionStorage.getUserId();
    if (userId != null && userId.isNotEmpty) {
      headers['X-User-Id'] = userId;
    }

    return headers;
  }

  static Future<http.Response> get(String path) async {
    final uri = Uri.parse('$baseUrl$path');
    final headers = await _getHeaders(isJson: false);
    return await http.get(uri, headers: headers);
  }

  static Future<http.Response> post(String path, dynamic body) async {
    final uri = Uri.parse('$baseUrl$path');
    final headers = await _getHeaders(isJson: true);
    return await http.post(
      uri,
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    );
  }

  static Future<http.Response> patch(String path, dynamic body) async {
    final uri = Uri.parse('$baseUrl$path');
    final headers = await _getHeaders(isJson: true);
    return await http.patch(
      uri,
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    );
  }

  static dynamic decode(http.Response response) {
    final bodyString = utf8.decode(response.bodyBytes);
    if (bodyString.isEmpty) return null;
    try {
      return jsonDecode(bodyString);
    } catch (_) {
      return bodyString;
    }
  }
}
