import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';
import 'employee_session.dart';
import 'models.dart';

// Employee Mobile (Founder ruling W-1, 2026-09-02): a SEPARATE Dio
// instance from api_client.dart's `apiClient` — reads/writes only the
// employee_* SharedPreferences keys, never the Consumer's `accessToken`.
// Calls only existing, already-employee-aware backend endpoints (the
// server resolves Company scope for a 'brand' or 'employee' JWT
// identically via resolveCompanyId() — see apps/api/src/modules/auth/
// company-scope.util.ts); no new API surface was added for this client.
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
      onResponse: (response, handler) {
        if (response.data is Map && response.data['data'] != null) {
          response.data = response.data['data'];
        }
        handler.next(response);
      },
      onError: (error, handler) async {
        // Same silent-refresh-then-retry shape as api_client.dart's
        // interceptor, scoped to the employee token pair only. A revoked
        // employee's refresh will itself now fail server-side (the
        // employee row is gone — see jwt.strategy.ts), so this cannot
        // resurrect a revoked session.
        if (error.response?.statusCode == 401 &&
            error.requestOptions.extra['_retry'] != true) {
          try {
            final prefs = await SharedPreferences.getInstance();
            final storedRefresh = prefs.getString(kEmployeeRefreshTokenKey);
            if (storedRefresh == null) {
              handler.next(error);
              return;
            }
            final refreshDio = Dio(BaseOptions(baseUrl: kApiBase));
            final res = await refreshDio.post(
              '/auth/refresh',
              data: {'refreshToken': storedRefresh},
            );
            final body = (res.data is Map && res.data['data'] != null)
                ? res.data['data'] as Map<String, dynamic>
                : res.data as Map<String, dynamic>;
            final newAccess = body['accessToken'] as String;
            final newRefresh = body['refreshToken'] as String;
            await prefs.setString(kEmployeeAccessTokenKey, newAccess);
            await prefs.setString(kEmployeeRefreshTokenKey, newRefresh);
            final opts = error.requestOptions;
            opts.headers['Authorization'] = 'Bearer $newAccess';
            opts.extra['_retry'] = true;
            final response = await _dio.fetch(opts);
            handler.resolve(response);
            return;
          } catch (_) {
            // Refresh failed (token expired, or the employee was revoked
            // server-side) — pass 401 through so the UI signs the device out.
          }
        }
        handler.next(error);
      },
    ));
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final res = await _dio.post('/auth/employee/login', data: {
      'email': email,
      'password': password,
    });
    return res.data as Map<String, dynamic>;
  }

  // GET /company/me — identical response for a 'brand' or 'employee'
  // token (resolveCompanyId() on the API side), so this reuses the same
  // endpoint the Company Console's own CompanyProfile page calls.
  Future<Map<String, dynamic>> getCompanyMe() async {
    final res = await _dio.get('/company/me');
    return res.data as Map<String, dynamic>;
  }

  // GET /campaigns/my — the Company's own campaign history, same
  // employee-aware scoping.
  Future<List<Campaign>> getCompanyCampaigns() async {
    final res = await _dio.get('/campaigns/my');
    final list = res.data as List<dynamic>;
    return list.map((c) => Campaign.fromJson(c as Map<String, dynamic>)).toList();
  }

  // GET /analytics/:campaignId/overview — the same summary numbers the
  // Company Console's Overview page shows (redemptions, survey
  // completions, completion rate, purchase intent). Deliberately the only
  // analytics endpoint surfaced on mobile — this is a companion view, not
  // a second full Company Console (Participants/Demographics/Survey
  // Results/AI Insights/Report stay Web-only for V1, per this task's own
  // "does not need to reproduce every Company Web Console feature").
  Future<Map<String, dynamic>> getCampaignOverview(String campaignId) async {
    final res = await _dio.get('/analytics/$campaignId/overview');
    return res.data as Map<String, dynamic>;
  }
}

final employeeApiClient = EmployeeApiClient();
