import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';
import 'employee_session.dart';
import 'models.dart';

// Employee Mobile (originally Founder ruling W-1, 2026-09-02) — recovered
// and re-mapped to the CURRENT Company/Employee backend
// (api/src/routes/companyAuth.ts, company.ts). A separate Dio instance
// from api_client.dart's `apiClient`: reads/writes only the employee_*
// SharedPreferences keys, never the Consumer's token.
//
// Endpoint mapping used below (old -> current):
//   POST /auth/employee/login          -> POST /company/auth/login
//   GET  /company/me                   -> GET  /company/profile
//   GET  /campaigns/my                 -> GET  /company/campaigns
//   GET  /analytics/:campaignId/overview -> GET /company/campaigns/:id/live
// No refresh-token endpoint exists on the current backend (signToken()
// issues one non-refreshing JWT, same as Consumer) — the silent-refresh
// interceptor from the old client was removed; a 401 here signs the
// device out of the Employee session, same as Consumer.
class EmployeeApiClient {
  late final Dio _dio;

  EmployeeApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: kApiBase,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString(kEmployeeAccessTokenKey);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ));
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final res = await _dio.post('/company/auth/login', data: {
      'email': email,
      'password': password,
    });
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> getCompanyProfile() async {
    final res = await _dio.get('/company/profile');
    return res.data as Map<String, dynamic>;
  }

  Future<List<Campaign>> getCompanyCampaigns() async {
    final res = await _dio.get('/company/campaigns');
    final list = res.data as List<dynamic>;
    return list.map((c) => Campaign.fromJson(c as Map<String, dynamic>)).toList();
  }

  // The same live-numbers payload the Company Web Console's own Live
  // Results tab calls (funnel, sources, purchaseIntent, satisfaction) —
  // deliberately the only analytics surfaced on mobile, a companion view,
  // not a second full Company Console.
  Future<Map<String, dynamic>> getCampaignLive(String campaignId) async {
    final res = await _dio.get('/company/campaigns/$campaignId/live');
    return res.data as Map<String, dynamic>;
  }
}

final employeeApiClient = EmployeeApiClient();
