import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';

// Mobile Recovery + Current-Backend Alignment (2026-09-15): the current
// consumer auth (api/src/routes/consumerAuth.ts) issues a single,
// non-refreshing JWT on OTP verify — { token, consumer: { id, phone, name } }.
// There is no /auth/refresh endpoint and no separate account/profile
// fetch endpoint, so this service now also caches the phone/name returned
// at verify time (the only place that data is ever available) instead of
// re-fetching a profile that no longer exists server-side.
class AuthService {
  // Bumped on every auth-state transition (login, logout). GoRouter's
  // go('/home') does not reliably force HomeScreen's State to be recreated
  // when '/home' is already the base of the stack, so relying on
  // initState() alone to refresh Home's logged-in/out UI right after
  // Logout showed stale personalization until a manual pull-to-refresh.
  // HomeScreen listens to this instead of depending on remounting.
  static final authEpoch = ValueNotifier<int>(0);

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(kAccessTokenKey) != null;
  }

  static Future<void> saveSession({
    required String token,
    required String consumerId,
    required String phone,
    String? name,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(kAccessTokenKey, token);
    await prefs.setString(kConsumerIdKey, consumerId);
    await prefs.setString(kConsumerPhoneKey, phone);
    if (name != null) await prefs.setString(kConsumerNameKey, name);
    authEpoch.value++;
  }

  static Future<String?> getConsumerId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(kConsumerIdKey);
  }

  static Future<String?> getPhone() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(kConsumerPhoneKey);
  }

  static Future<String?> getName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(kConsumerNameKey);
  }

  // A true sign-out: clears the token and the cached identity. The next
  // campaign entry on this device requires phone + OTP again.
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(kAccessTokenKey);
    await prefs.remove(kConsumerIdKey);
    await prefs.remove(kConsumerPhoneKey);
    await prefs.remove(kConsumerNameKey);
    authEpoch.value++;
  }
}
