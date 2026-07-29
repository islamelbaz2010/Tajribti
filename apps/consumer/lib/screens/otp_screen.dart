import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../core/api_client.dart';
import '../core/auth_service.dart';
import '../core/constants.dart';

class OtpScreen extends StatefulWidget {
  final String phone;
  const OtpScreen({super.key, required this.phone});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _controllers = List.generate(6, (_) => TextEditingController());
  final _focusNodes = List.generate(6, (_) => FocusNode());
  bool _loading = false;
  String? _error;

  String get _otp => _controllers.map((c) => c.text).join();

  @override
  void dispose() {
    for (final c in _controllers) c.dispose();
    for (final f in _focusNodes) f.dispose();
    super.dispose();
  }

  void _onDigitChanged(int index, String value) {
    if (value.isNotEmpty && index < 5) {
      _focusNodes[index + 1].requestFocus();
    }
    if (_otp.length == 6) _verify();
  }

  Future<void> _verify() async {
    if (_otp.length < 6) return;
    setState(() { _loading = true; _error = null; });
    try {
      final result = await apiClient.verifyOtp(widget.phone, _otp);
      final accessToken = result['accessToken'] as String;
      final refreshToken = result['refreshToken'] as String;
      final consumerId = result['consumerId'] as String?;
      final isNewUser = result['isNewUser'] as bool? ?? false;
      await AuthService.saveTokens(
        accessToken: accessToken,
        refreshToken: refreshToken,
        consumerId: consumerId,
      );
      if (!mounted) return;
      if (isNewUser) {
        context.go('/register');
      } else {
        context.go('/home');
      }
    } catch (e) {
      setState(() => _error = 'رمز غير صحيح. حاول مجدداً.');
      for (final c in _controllers) c.clear();
      _focusNodes[0].requestFocus();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: kBackground,
        appBar: AppBar(backgroundColor: kBackground, elevation: 0),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('أدخل رمز التحقق', style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w900,
                  color: kPrimary,
                )),
                const SizedBox(height: 8),
                Text(
                  'تم إرسال رمز مكون من 6 أرقام إلى\n${widget.phone}',
                  style: TextStyle(fontSize: 15, color: Colors.grey.shade600, height: 1.5),
                ),
                Text(
                  '(في وضع العرض: استخدم 0000)',
                  style: TextStyle(fontSize: 12, color: kAccent),
                ),
                const SizedBox(height: 40),
                Directionality(
                  textDirection: TextDirection.ltr,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: List.generate(6, (i) => _DigitBox(
                      controller: _controllers[i],
                      focusNode: _focusNodes[i],
                      onChanged: (v) => _onDigitChanged(i, v),
                    )),
                  ),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 16),
                  Text(_error!, style: const TextStyle(color: kAccent, fontSize: 14)),
                ],
                const Spacer(),
                if (_loading)
                  const Center(child: CircularProgressIndicator(color: kPrimary)),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _DigitBox extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final ValueChanged<String> onChanged;

  const _DigitBox({
    required this.controller,
    required this.focusNode,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 46,
      height: 56,
      child: TextField(
        controller: controller,
        focusNode: focusNode,
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 1,
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
        decoration: InputDecoration(
          counterText: '',
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: kPrimary, width: 2),
          ),
        ),
        onChanged: onChanged,
      ),
    );
  }
}
