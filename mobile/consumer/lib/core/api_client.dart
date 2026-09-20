import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';
import 'models.dart';

// Mobile Recovery + Current-Backend Alignment (2026-09-15): rewritten
// against the CURRENT released API (api/src/routes/consumer.ts +
// consumerAuth.ts), not the retired backend the old app targeted. Removed
// with no current-backend equivalent (reported, not silently dropped):
//   - email/password account signup/login (/auth/signup, /auth/login) —
//     current Consumer identity is phone+OTP only, no account layer.
//   - Akedly PoW/Turnstile challenge (/auth/akedly/challenge) — no proxy
//     endpoint exists server-side; OTP request/verify here match the
//     current backend's plain phone-only contract exactly.
//   - refresh-token flow (/auth/refresh) — signToken() issues one token,
//     there is no refresh endpoint.
//   - consumer profile fetch (/auth/me) — no such endpoint exists;
//     phone/name are cached locally from the OTP-verify response instead
//     (see AuthService.saveSession).
// Endpoint mapping used below (old -> current):
//   POST /auth/otp/request           -> POST /consumer/auth/otp/request
//   POST /auth/otp/verify            -> POST /consumer/auth/otp/verify
//   GET  /campaigns                  -> GET  /consumer/campaigns
//   GET  /campaigns/:id              -> GET  /consumer/campaigns/:id
//   GET  /qr/:code (new; old app had no code-resolution call, it POSTed
//        /qr/enter/:campaignId directly) -> GET /consumer/qr/:code
//   POST /campaigns/:id/eligibility  -> POST /consumer/campaigns/:id/eligibility
//   POST /qr/redeem                  -> POST /consumer/campaigns/:id/redeem
//   GET  /campaigns/:id/survey       -> GET  /consumer/campaigns/:id/survey
//   POST /survey/submit              -> POST /consumer/campaigns/:id/survey
//   (new, no old equivalent)         -> GET  /consumer/participations
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
    ));
  }

  // ── Phone + OTP (the only Consumer auth mechanism in the current product) ──

  // Akedly V1.2 Step 1 — pipeline challenge via the backend proxy (no
  // credentials on the client). Returns the `data` payload:
  // { challengeRequired, challenge?, difficulty?, challengeToken?,
  //   expiresAt?, turnstile: { required, siteKey } }
  Future<Map<String, dynamic>> getOtpChallenge() async {
    final res = await _dio.get('/consumer/auth/otp/challenge');
    return (res.data['data'] ?? <String, dynamic>{}) as Map<String, dynamic>;
  }

  // powSolution/turnstileToken are the client-solved Shield proofs,
  // forwarded by the backend to Akedly unchanged.
  Future<Map<String, dynamic>> requestOtp({
    required String phone,
    Map<String, dynamic>? powSolution,
    String? turnstileToken,
  }) async {
    final res = await _dio.post('/consumer/auth/otp/request', data: {
      'phone': phone,
      if (powSolution != null) 'powSolution': powSolution,
      if (turnstileToken != null) 'turnstileToken': turnstileToken,
    });
    return res.data as Map<String, dynamic>;
  }

  // Returns { token, consumer: { id, phone, name } } — the caller must
  // persist it via AuthService.saveSession (no separate profile endpoint
  // exists to fetch it again later).
  Future<Map<String, dynamic>> verifyOtp({
    required String phone,
    required String code,
    String? name,
  }) async {
    final res = await _dio.post('/consumer/auth/otp/verify', data: {
      'phone': phone,
      'code': code,
      if (name != null) 'name': name,
    });
    return res.data as Map<String, dynamic>;
  }

  Future<List<Campaign>> getActiveCampaigns() async {
    final res = await _dio.get('/consumer/campaigns');
    final list = res.data as List<dynamic>;
    return list.map((c) => Campaign.fromJson(c as Map<String, dynamic>)).toList();
  }

  Future<Campaign> getCampaignById(String id) async {
    final res = await _dio.get('/consumer/campaigns/$id');
    return Campaign.fromJson(res.data as Map<String, dynamic>);
  }

  // Resolves a scanned/entered QR code to its campaign (Benchmark §3
  // QR/source attribution) — public, no consumer auth required.
  Future<QrResolution> resolveQrCode(String code) async {
    final res = await _dio.get('/consumer/qr/$code');
    return QrResolution.fromJson(res.data as Map<String, dynamic>);
  }

  // Records eligibility + demographic snapshot + any screener answers for
  // this campaign. Throws a DioException with statusCode 409 if the
  // consumer has already participated in this campaign — callers should
  // treat that as "already completed", not a hard error.
  Future<EligibilityResult> submitEligibility({
    required String campaignId,
    String? qrSourceId,
    int? age,
    String? gender,
    String? city,
    List<Map<String, dynamic>> answers = const [],
  }) async {
    final res = await _dio.post('/consumer/campaigns/$campaignId/eligibility', data: {
      if (qrSourceId != null) 'qrSourceId': qrSourceId,
      if (age != null) 'age': age,
      if (gender != null) 'gender': gender,
      if (city != null) 'city': city,
      'answers': answers,
    });
    final data = res.data as Map<String, dynamic>;
    return EligibilityResult(eligible: data['eligible'] as bool);
  }

  // Marks the trial redeemed for a campaign the consumer is already
  // ELIGIBLE for (Benchmark §4 CONSUMER "Trial / Redemption"). No QR code
  // or redemption id is passed — the current backend keys this purely by
  // campaignId + the authenticated consumer.
  Future<void> redeemTrial(String campaignId) async {
    await _dio.post('/consumer/campaigns/$campaignId/redeem');
  }

  Future<List<SurveyQuestion>> getSurveyQuestions(String campaignId) async {
    final res = await _dio.get('/consumer/campaigns/$campaignId/survey');
    final list = res.data as List<dynamic>;
    return list.map((q) => SurveyQuestion.fromJson(q as Map<String, dynamic>)).toList();
  }

  Future<void> submitSurvey({
    required String campaignId,
    required List<Map<String, dynamic>> answers,
  }) async {
    await _dio.post('/consumer/campaigns/$campaignId/survey', data: {'answers': answers});
  }

  Future<List<ParticipationRecord>> getParticipations() async {
    final res = await _dio.get('/consumer/participations');
    final list = res.data as List<dynamic>;
    return list.map((p) => ParticipationRecord.fromJson(p as Map<String, dynamic>)).toList();
  }
}

final apiClient = ApiClient();
