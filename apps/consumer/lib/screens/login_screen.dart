import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../core/auth_service.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/session.dart';
import '../widgets/lang_toggle.dart';

// Normal account login: email + password. Independent of Campaigns - no
// campaignId, no QR, no Campaign OTP anywhere in this screen. If reached
// while a Campaign is active (Campaign Detail -> Start Trial -> Auth
// Choice -> Log In), JourneySession.campaignId is left untouched, so
// success returns to that exact Campaign (see _onLoginSuccess below) -
// otherwise it returns to Home.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  bool _isValidEmail(String email) => RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(email);

  Future<void> _submit() async {
    final s = context.l10n;
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (!_isValidEmail(email)) {
      setState(() => _error = s.invalidEmail);
      return;
    }
    if (password.isEmpty) {
      setState(() => _error = s.fillAll);
      return;
    }

    setState(() { _loading = true; _error = null; });
    try {
      final result = await apiClient.login(email: email, password: password);
      await AuthService.saveTokens(
        accessToken: result['accessToken'] as String,
        refreshToken: result['refreshToken'] as String,
        consumerId: result['consumerId'] as String?,
      );
      if (!mounted) return;
      _onLoginSuccess();
    } catch (e) {
      if (!mounted) return;
      final statusCode = (e is DioException) ? e.response?.statusCode : null;
      setState(() {
        _error = statusCode == 401 ? s.loginError : s.sendError;
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _onLoginSuccess() {
    // Preserve Campaign context: if Login was reached from a Campaign's
    // Start Trial, return to that exact Campaign instead of Home.
    if (JourneySession.hasActiveCampaign) {
      context.go('/campaign');
    } else {
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = context.l10n;
    return Directionality(
      textDirection: context.dir,
      child: Scaffold(
        backgroundColor: kBackground,
        appBar: AppBar(
          backgroundColor: kBackground,
          elevation: 0,
          leading: context.canPop()
              ? IconButton(
                  icon: Icon(s.isRtl ? Icons.arrow_forward_ios : Icons.arrow_back_ios, color: kPrimary, size: 20),
                  onPressed: () => context.pop(),
                )
              : null,
          actions: const [
            Padding(padding: EdgeInsets.only(right: 12), child: Center(child: LangToggle())),
          ],
        ),
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  s.loginTitle,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: kPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  s.loginSubtitle,
                  style: TextStyle(fontSize: 16, color: Colors.grey.shade600, height: 1.5),
                ),
                const SizedBox(height: 32),
                _Label(s.emailLabel),
                const SizedBox(height: 8),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  textDirection: TextDirection.ltr,
                  decoration: _inputDeco(s.emailHint),
                ),
                const SizedBox(height: 20),
                _Label(s.passwordLabel),
                const SizedBox(height: 8),
                TextField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  textDirection: TextDirection.ltr,
                  decoration: _inputDeco('••••••••').copyWith(
                    suffixIcon: IconButton(
                      icon: Icon(_obscurePassword ? Icons.visibility_off_rounded : Icons.visibility_rounded, color: Colors.grey.shade400),
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                  onSubmitted: (_) => _submit(),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: kAccent.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(_error!, style: const TextStyle(color: kAccent, fontSize: 14)),
                  ),
                ],
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 58,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kPrimary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                    child: _loading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : Text(s.loginTitle, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(height: 20),
                Center(
                  child: GestureDetector(
                    onTap: () => context.pushReplacement('/signup'),
                    child: RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: '${s.dontHaveAccount} ',
                            style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                          ),
                          TextSpan(
                            text: s.createAccount,
                            style: const TextStyle(color: kPrimary, fontSize: 14, fontWeight: FontWeight.w700, decoration: TextDecoration.underline),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDeco(String hint) => InputDecoration(
    hintText: hint,
    filled: true,
    fillColor: Colors.white,
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: const BorderSide(color: kPrimary, width: 2),
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
  );
}

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);

  @override
  Widget build(BuildContext context) => Text(
    text,
    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: kPrimary),
  );
}
