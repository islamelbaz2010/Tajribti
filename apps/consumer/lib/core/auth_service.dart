import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';

class AuthService {
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
  }

  static Future<String?> getConsumerId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(kConsumerIdKey);
  }

  // Normal sign-out: ends the current session (isLoggedIn() becomes false,
  // so Home/Profile/Activity/Settings all show the logged-out state
  // immediately) but deliberately keeps the long-lived refresh token on
  // this device. That refresh token is a real, server-verified 7-day JWT
  // (JWT_REFRESH_SECRET, checked against the consumer record in
  // auth.service.ts `refresh()`) — the same credential the app already
  // uses to silently renew an expired access token mid-session. Reusing
  // it here means a returning user on the same device can sign back in
  // via tryRestoreSession() below without OTP, without inventing any new
  // auth mechanism or trusting anything client-side.
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(kAccessTokenKey);
  }

  // "Forget this device": the explicit, separate action that actually
  // discards the stored refresh token, so the next sign-in requires a
  // full phone + OTP verification again. Distinct from logout() above —
  // see Settings.
  static Future<void> forgetDevice() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(kAccessTokenKey);
    await prefs.remove(kRefreshTokenKey);
    await prefs.remove(kConsumerIdKey);
  }

  // Silent returning-user re-authentication. Exchanges the stored refresh
  // token for a new access+refresh pair via the existing, already-used
  // POST /auth/refresh endpoint (the same call api_client.dart's 401
  // interceptor already makes reactively) - just invoked proactively here
  // so a returning user can skip the phone/OTP screen entirely. Returns
  // false (and clears the now-known-invalid refresh token) if none is
  // stored, or if the server rejects it (expired past 7 days, revoked, or
  // the consumer record no longer exists) - in that case the normal
  // phone/OTP flow is required, exactly as it already is today.
  static Future<bool> tryRestoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    final storedRefresh = prefs.getString(kRefreshTokenKey);
    if (storedRefresh == null) return false;

    try {
      final dio = Dio(BaseOptions(baseUrl: kApiBase));
      final res = await dio.post('/auth/refresh', data: {'refreshToken': storedRefresh});
      final body = (res.data is Map && res.data['data'] != null)
          ? res.data['data'] as Map<String, dynamic>
          : res.data as Map<String, dynamic>;
      await saveTokens(
        accessToken: body['accessToken'] as String,
        refreshToken: body['refreshToken'] as String,
      );
      return true;
    } catch (_) {
      // Stored refresh token is dead (expired/revoked/consumer gone) -
      // clear it so we don't keep retrying a known-invalid credential.
      await forgetDevice();
      return false;
    }
  }
}
