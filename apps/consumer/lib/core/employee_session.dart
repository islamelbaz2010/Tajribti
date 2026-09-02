import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Employee Mobile (Founder ruling W-1, 2026-09-02): a deliberately
// SEPARATE token space from AuthService/kAccessTokenKey (auth_service.dart)
// — an Employee session must never read, overwrite, or be confused with a
// Consumer session on the same device, mirroring the same separation
// already built into the Dashboard (AdminAuthContext/adminClient.ts use
// their own 'adminAccessToken' key, distinct from the Company Console's
// 'accessToken'). Nothing here touches AuthService or its storage keys.
const String kEmployeeAccessTokenKey = 'employee_access_token';
const String kEmployeeRefreshTokenKey = 'employee_refresh_token';
const String kEmployeeIdKey = 'employee_id';
const String kEmployeeCompanyIdKey = 'employee_company_id';
const String kEmployeeCompanyNameKey = 'employee_company_name';

class EmployeeAuthService {
  // Mirrors AuthService.authEpoch's exact purpose (see that file's own
  // comment) for the Employee Home screen.
  static final authEpoch = ValueNotifier<int>(0);

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(kEmployeeAccessTokenKey) != null;
  }

  static Future<void> saveSession({
    required String accessToken,
    required String refreshToken,
    required String employeeId,
    required String companyId,
    required String companyName,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(kEmployeeAccessTokenKey, accessToken);
    await prefs.setString(kEmployeeRefreshTokenKey, refreshToken);
    await prefs.setString(kEmployeeIdKey, employeeId);
    await prefs.setString(kEmployeeCompanyIdKey, companyId);
    await prefs.setString(kEmployeeCompanyNameKey, companyName);
    authEpoch.value++;
  }

  static Future<String?> getCompanyName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(kEmployeeCompanyNameKey);
  }

  // A true sign-out — same discipline as AuthService.logout(): clears the
  // token pair and identity, nothing kept behind.
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(kEmployeeAccessTokenKey);
    await prefs.remove(kEmployeeRefreshTokenKey);
    await prefs.remove(kEmployeeIdKey);
    await prefs.remove(kEmployeeCompanyIdKey);
    await prefs.remove(kEmployeeCompanyNameKey);
    authEpoch.value++;
  }
}
