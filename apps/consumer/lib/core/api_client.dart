import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';
import 'models.dart';

class ApiClient {
  late final Dio _dio;

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: kApiBase,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString(kAccessTokenKey);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onResponse: (response, handler) {
        if (response.data is Map && response.data['data'] != null) {
          response.data = response.data['data'];
        }
        handler.next(response);
      },
    ));
  }

  Future<Map<String, dynamic>> requestOtp(String phone) async {
    final res = await _dio.post('/auth/otp/request', data: {'phone': phone});
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String code) async {
    final res = await _dio.post('/auth/otp/verify', data: {'phone': phone, 'code': code});
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> register({
    required String name,
    required String ageRange,
    required String gender,
    required String city,
  }) async {
    final res = await _dio.post('/auth/register', data: {
      'name': name,
      'ageRange': ageRange,
      'gender': gender,
      'city': city,
    });
    return res.data as Map<String, dynamic>;
  }

  Future<Campaign> getDemoActiveCampaign() async {
    final res = await _dio.get('/campaigns/demo/active');
    return Campaign.fromJson(res.data as Map<String, dynamic>);
  }

  Future<RedemptionResult> redeemQr(String qrCode) async {
    final res = await _dio.post('/qr/redeem', data: {'code': qrCode});
    return RedemptionResult.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> submitSurvey({
    required String redemptionId,
    required String campaignId,
    required Map<String, dynamic> answers,
  }) async {
    await _dio.post('/survey/submit', data: {
      'redemptionId': redemptionId,
      'campaignId': campaignId,
      'answers': answers,
    });
  }
}

final apiClient = ApiClient();
