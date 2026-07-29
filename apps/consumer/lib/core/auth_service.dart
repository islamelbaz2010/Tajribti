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

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(kAccessTokenKey);
    await prefs.remove(kRefreshTokenKey);
    await prefs.remove(kConsumerIdKey);
  }
}
