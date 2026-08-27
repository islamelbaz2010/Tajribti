import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';

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

  static Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
    String? consumerId,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(kAccessTokenKey, accessToken);
    await prefs.setString(kRefreshTokenKey, refreshToken);
    if (consumerId != null) await prefs.setString(kConsumerIdKey, consumerId);
    authEpoch.value++;
  }

  static Future<String?> getConsumerId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(kConsumerIdKey);
  }

  // A true sign-out: clears the access token, the refresh token, and the
  // stored consumerId. Nothing is kept behind - the next Login on this
  // device requires the account's real email + password again, exactly
  // like signing out of any normal account-based app.
  //
  // This deliberately replaces an earlier design (see git history around
  // commit 3fd6e4a) that kept the refresh token alive across Sign Out so a
  // returning user could skip re-entering a credential. That made sense
  // when phone+OTP was the only account mechanism there was to re-enter,
  // but it amounts to a hidden authenticated session surviving a "true"
  // Logout, which the account model this app now has explicitly rules
  // out: Logout must actually end the session, not just hide it behind a
  // silently-renewable token.
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(kAccessTokenKey);
    await prefs.remove(kRefreshTokenKey);
    await prefs.remove(kConsumerIdKey);
    authEpoch.value++;
  }
}
