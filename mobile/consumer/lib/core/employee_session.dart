import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

// Employee Mobile — a deliberately SEPARATE token space from
// AuthService/kAccessTokenKey (auth_service.dart) — an Employee session
// must never read, overwrite, or be confused with a Consumer session on
// the same device.
const String kEmployeeAccessTokenKey = 'employee_access_token';
const String kEmployeeIdKey = 'employee_id';
const String kEmployeeCompanyIdKey = 'employee_company_id';
const String kEmployeeCompanyNameKey = 'employee_company_name';

class EmployeeAuthService {
  static final authEpoch = ValueNotifier<int>(0);

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(kEmployeeAccessTokenKey) != null;
  }

  static Future<void> saveSession({
    required String token,
    required String employeeId,
    required String companyId,
    required String companyName,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(kEmployeeAccessTokenKey, token);
    await prefs.setString(kEmployeeIdKey, employeeId);
    await prefs.setString(kEmployeeCompanyIdKey, companyId);
    await prefs.setString(kEmployeeCompanyNameKey, companyName);
    authEpoch.value++;
  }

  static Future<String?> getCompanyName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(kEmployeeCompanyNameKey);
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(kEmployeeAccessTokenKey);
    await prefs.remove(kEmployeeIdKey);
    await prefs.remove(kEmployeeCompanyIdKey);
    await prefs.remove(kEmployeeCompanyNameKey);
    authEpoch.value++;
  }
}
