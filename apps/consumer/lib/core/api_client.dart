import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'auth_service.dart';
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
      onError: (error, handler) async {
        // On 401, attempt a silent token refresh using the stored refresh token.
        // The _retry flag prevents infinite loops if the refresh itself returns 401.
        if (error.response?.statusCode == 401 &&
            error.requestOptions.extra['_retry'] != true) {
          try {
            final prefs = await SharedPreferences.getInstance();
            final storedRefresh = prefs.getString(kRefreshTokenKey);
            if (storedRefresh == null) {
              handler.next(error);
              return;
            }
            final refreshDio = Dio(BaseOptions(baseUrl: kApiBase));
            final res = await refreshDio.post(
              '/auth/refresh',
              data: {'refreshToken': storedRefresh},
            );
            // Unwrap { data: { accessToken, refreshToken } } envelope if present
            final body = (res.data is Map && res.data['data'] != null)
                ? res.data['data'] as Map<String, dynamic>
                : res.data as Map<String, dynamic>;
            final newAccess = body['accessToken'] as String;
            final newRefresh = body['refreshToken'] as String;
            await AuthService.saveTokens(
              accessToken: newAccess,
              refreshToken: newRefresh,
            );
            // Retry the original request with the new access token
            final opts = error.requestOptions;
            opts.headers['Authorization'] = 'Bearer $newAccess';
            opts.extra['_retry'] = true;
            final response = await _dio.fetch(opts);
            handler.resolve(response);
            return;
          } catch (_) {
            // Refresh failed (token expired > 7d or revoked) — pass 401 through to caller
          }
        }
        handler.next(error);
      },
    ));
  }

  // Returns Akedly V1.2 challenge data (challenge, difficulty, challengeToken, turnstile.required, ...).
  // API key never leaves the backend — this calls the Tajribti proxy endpoint.
  Future<Map<String, dynamic>> getChallenge() async {
    final res = await _dio.get('/auth/akedly/challenge');
    return res.data as Map<String, dynamic>;
  }

  // powSolution is required in production (DEMO_MODE=false).
  // Returns transactionReqID and expiresAt in production; just message in demo mode.
  Future<Map<String, dynamic>> requestOtp(
    String phone, {
    Map<String, dynamic>? powSolution,
    String? turnstileToken,
  }) async {
    final data = <String, dynamic>{'phone': phone};
    if (powSolution != null) data['powSolution'] = powSolution;
    if (turnstileToken != null) data['turnstileToken'] = turnstileToken;
    final res = await _dio.post('/auth/otp/request', data: data);
    return res.data as Map<String, dynamic>;
  }

  // transactionReqID comes from the requestOtp response (server-side bound to phone).
  // phone is still sent for backward compat / demo mode; ignored by backend for JWT identity in production.
  Future<Map<String, dynamic>> verifyOtp({
    required String transactionReqID,
    required String code,
    required String phone,
  }) async {
    final res = await _dio.post('/auth/otp/verify', data: {
      'transactionReqID': transactionReqID,
      'code': code,
      'phone': phone,
    });
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

  Future<List<Campaign>> getActiveCampaigns() async {
    final res = await _dio.get('/campaigns');
    final list = res.data as List<dynamic>;
    return list.map((c) => Campaign.fromJson(c as Map<String, dynamic>)).toList();
  }

  Future<ConsumerProfile> getConsumerProfile() async {
    final res = await _dio.get('/auth/me');
    return ConsumerProfile.fromJson(res.data as Map<String, dynamic>);
  }

  Future<Campaign> getCampaignById(String id) async {
    final res = await _dio.get('/campaigns/$id');
    return Campaign.fromJson(res.data as Map<String, dynamic>);
  }

  Future<Campaign> getDemoActiveCampaign() async {
    final res = await _dio.get('/campaigns/demo/active');
    return Campaign.fromJson(res.data as Map<String, dynamic>);
  }

  Future<RedemptionResult> enterCampaign(String campaignId) async {
    final res = await _dio.post('/qr/enter/$campaignId');
    return RedemptionResult.fromJson(res.data as Map<String, dynamic>);
  }

  Future<RedemptionResult> redeemQr(String qrCode, String campaignId) async {
    final res = await _dio.post('/qr/redeem', data: {
      'qrCode': qrCode,
      'campaignId': campaignId,
    });
    return RedemptionResult.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> submitSurvey({
    required String redemptionId,
    required Map<String, dynamic> answers,
  }) async {
    await _dio.post('/survey/submit', data: {
      'redemptionId': redemptionId,
      'answers': answers,
    });
  }
}

final apiClient = ApiClient();
