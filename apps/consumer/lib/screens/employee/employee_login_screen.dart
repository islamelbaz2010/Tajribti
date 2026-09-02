import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../core/constants.dart';
import '../../core/employee_api_client.dart';
import '../../core/employee_session.dart';
import '../../core/l10n.dart';
import '../../widgets/lang_toggle.dart';

// Employee Mobile V1 (Founder ruling W-1, 2026-09-02): a real, separate
// authenticated identity from Consumer — reached only from AuthChoiceScreen's
// small "Company Employee?" link, never mixed into the Consumer login/
// signup screens. Visual language (colors, field/button shapes) matches
// login_screen.dart exactly; the strings are inline-bilingual here rather
// than added to l10n.dart's shared AppStr class, so this feature adds zero
// risk of touching a file every protected Consumer screen also depends on.
class EmployeeLoginScreen extends StatefulWidget {
  const EmployeeLoginScreen({super.key});

  @override
  State<EmployeeLoginScreen> createState() => _EmployeeLoginScreenState();
}

class _EmployeeLoginScreenState extends State<EmployeeLoginScreen> {
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
    final ar = LangProvider.isAr(context);
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (!_isValidEmail(email)) {
      setState(() => _error = ar ? 'أدخل بريد إلكتروني صحيح' : 'Enter a valid email address');
      return;
    }
    if (password.isEmpty) {
      setState(() => _error = ar ? 'يرجى تعبئة جميع الحقول' : 'Please fill in all fields');
      return;
    }

    setState(() { _loading = true; _error = null; });
    try {
      // /auth/employee/login already returns companyId/companyName directly
      // (auth.service.ts's employeeLogin()) — no separate /company/me call
      // needed just to render the Home screen's header.
      final result = await employeeApiClient.login(email: email, password: password);
      await EmployeeAuthService.saveSession(
        accessToken: result['accessToken'] as String,
        refreshToken: result['refreshToken'] as String,
        employeeId: result['employeeId'] as String? ?? '',
        companyId: result['companyId'] as String? ?? '',
        companyName: result['companyName'] as String? ?? '',
      );
      if (!mounted) return;
      context.go('/employee/home');
    } catch (e) {
      if (!mounted) return;
      final statusCode = (e is DioException) ? e.response?.statusCode : null;
      setState(() {
        _error = statusCode == 401
            ? (ar ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password')
            : (ar ? 'تعذر تسجيل الدخول. حاول مرة أخرى.' : 'Could not sign in. Please try again.');
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final ar = LangProvider.isAr(context);
    return Directionality(
      textDirection: ar ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        backgroundColor: kBackground,
        appBar: AppBar(
          backgroundColor: kBackground,
          elevation: 0,
          leading: context.canPop()
              ? IconButton(
                  icon: Icon(ar ? Icons.arrow_forward_ios : Icons.arrow_back_ios, color: kPrimary, size: 20),
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
                  ar ? 'دخول الموظفين' : 'Employee Login',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: kPrimary,
                    fontSize: 28,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  ar
                      ? 'سجّل الدخول بحساب الموظف الخاص بشركتك'
                      : 'Sign in with your Company employee account',
                  style: TextStyle(fontSize: 15, color: Colors.grey.shade500, height: 1.5),
                ),
                const SizedBox(height: 36),
                Text(
                  ar ? 'البريد الإلكتروني' : 'Email',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: kPrimary),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  textDirection: TextDirection.ltr,
                  decoration: _inputDeco('name@company.com'),
                ),
                const SizedBox(height: 22),
                Text(
                  ar ? 'كلمة المرور' : 'Password',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: kPrimary),
                ),
                const SizedBox(height: 10),
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
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: kAccent.withOpacity(0.06),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: kAccent, size: 18),
                        const SizedBox(width: 8),
                        Expanded(child: Text(_error!, style: const TextStyle(color: kAccent, fontSize: 13))),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kBrand,
                      foregroundColor: kPrimary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                    child: _loading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(color: kPrimary, strokeWidth: 2),
                          )
                        : Text(
                            ar ? 'تسجيل الدخول' : 'Sign In',
                            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
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
    hintStyle: TextStyle(color: Colors.grey.shade400),
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
