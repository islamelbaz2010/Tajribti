import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../core/api_client.dart';
import '../core/auth_service.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/session.dart';
import '../widgets/choice_chip_group.dart';
import '../widgets/lang_toggle.dart';

// Real account creation: email + password + required profile fields
// (including phone, needed later for Campaign participation verification -
// see CampaignVerification on the backend). Independent of Campaigns - no
// campaignId, no QR, no Campaign OTP anywhere in this screen. This is NOT
// the old phone-OTP "isNewUser" flow; it calls POST /auth/signup directly.
class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController(text: '+20');
  String? _ageRange;
  String? _genderLabel;
  String? _cityLabel;
  bool _obscurePassword = true;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  bool _isValidEmail(String email) => RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(email);
  bool _isValidPassword(String pw) => RegExp(r'^(?=.*[A-Za-z])(?=.*\d).{8,}$').hasMatch(pw);
  bool _isValidPhone(String phone) => RegExp(r'^\+?[1-9]\d{6,14}$').hasMatch(phone);

  Future<void> _submit() async {
    final s = context.l10n;
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final confirmPassword = _confirmPasswordController.text;
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();

    if (!_isValidEmail(email)) {
      setState(() => _error = s.invalidEmail);
      return;
    }
    if (!_isValidPassword(password)) {
      setState(() => _error = s.passwordRequirements);
      return;
    }
    if (password != confirmPassword) {
      setState(() => _error = s.passwordMismatch);
      return;
    }
    if (name.isEmpty || _ageRange == null || _genderLabel == null || _cityLabel == null) {
      setState(() => _error = s.fillAll);
      return;
    }
    if (!_isValidPhone(phone)) {
      setState(() => _error = s.phoneError);
      return;
    }

    final genderIdx = s.genders.indexOf(_genderLabel!);
    final cityIdx = s.cities.indexOf(_cityLabel!);

    setState(() { _loading = true; _error = null; });
    try {
      final result = await apiClient.signup(
        email: email,
        password: password,
        name: name,
        ageRange: _ageRange!,
        gender: s.genderValues[genderIdx],
        city: s.cityValues[cityIdx],
        phone: phone,
      );
      await AuthService.saveTokens(
        accessToken: result['accessToken'] as String,
        refreshToken: result['refreshToken'] as String,
        consumerId: result['consumerId'] as String?,
      );
      if (!mounted) return;
      // Preserve Campaign context: if Signup was reached from a Campaign's
      // Start Trial, return to that exact Campaign instead of Home.
      if (JourneySession.hasActiveCampaign) {
        context.go('/campaign');
      } else {
        context.go('/home');
      }
    } catch (e) {
      if (!mounted) return;
      final statusCode = (e is DioException) ? e.response?.statusCode : null;
      final serverMsg = (e is DioException && e.response?.data is Map)
          ? (e.response!.data as Map)['message'] as String?
          : null;
      setState(() {
        if (statusCode == 409 && (serverMsg?.contains('email') ?? false)) {
          _error = s.emailAlreadyExists;
        } else if (statusCode == 409) {
          _error = s.phoneAlreadyExists;
        } else {
          _error = s.signupError;
        }
      });
    } finally {
      if (mounted) setState(() => _loading = false);
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
            padding: const EdgeInsets.fromLTRB(28, 0, 28, 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  s.tellUsAbout,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: kPrimary,
                  ),
                ),
                Text(s.forBetterExp, style: TextStyle(color: Colors.grey.shade500)),
                const SizedBox(height: 28),
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
                ),
                const SizedBox(height: 6),
                Text(s.passwordRequirements, style: TextStyle(fontSize: 12, color: Colors.grey.shade400)),
                const SizedBox(height: 20),
                _Label(s.confirmPasswordLabel),
                const SizedBox(height: 8),
                TextField(
                  controller: _confirmPasswordController,
                  obscureText: _obscurePassword,
                  textDirection: TextDirection.ltr,
                  decoration: _inputDeco('••••••••'),
                ),
                const SizedBox(height: 20),
                _Label(s.nameLabel),
                const SizedBox(height: 8),
                TextField(
                  controller: _nameController,
                  textCapitalization: TextCapitalization.words,
                  decoration: _inputDeco(s.nameHint),
                ),
                const SizedBox(height: 20),
                _Label(s.phoneLabel),
                const SizedBox(height: 8),
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  textDirection: TextDirection.ltr,
                  decoration: _inputDeco(s.phoneExample),
                ),
                const SizedBox(height: 24),
                _Label(s.ageLabel),
                const SizedBox(height: 12),
                ChoiceChipGroup(
                  options: s.ageRanges,
                  selected: _ageRange,
                  onSelected: (v) => setState(() => _ageRange = v),
                ),
                const SizedBox(height: 24),
                _Label(s.genderLabel),
                const SizedBox(height: 12),
                ChoiceChipGroup(
                  options: s.genders,
                  selected: _genderLabel,
                  onSelected: (v) => setState(() => _genderLabel = v),
                ),
                const SizedBox(height: 24),
                _Label(s.cityLabel),
                const SizedBox(height: 12),
                ChoiceChipGroup(
                  options: s.cities,
                  selected: _cityLabel,
                  onSelected: (v) => setState(() => _cityLabel = v),
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
                        : Text(s.createAccount, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(height: 20),
                Center(
                  child: GestureDetector(
                    onTap: () => context.pushReplacement('/login'),
                    child: RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: '${s.alreadyHaveAccount} ',
                            style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                          ),
                          TextSpan(
                            text: s.signIn,
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
