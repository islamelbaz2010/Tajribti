import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../core/api_client.dart';
import '../core/auth_service.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/session.dart';
import '../widgets/lang_toggle.dart';

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
  bool _canResend = false;
  int _countdown = 60;
  String? _error;

  String get _otp => _controllers.map((c) => c.text).join();

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  void _startCountdown() async {
    setState(() { _canResend = false; _countdown = 60; });
    for (int i = 60; i > 0; i--) {
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return;
      setState(() => _countdown = i - 1);
    }
    if (mounted) setState(() => _canResend = true);
  }

  Future<void> _resend() async {
    if (!_canResend) return;
    setState(() => _error = null);
    try {
      await apiClient.requestOtp(widget.phone);
      for (final c in _controllers) c.clear();
      _focusNodes[0].requestFocus();
      _startCountdown();
    } catch (_) {
      if (mounted) setState(() => _error = context.l10n.resendFailed);
    }
  }

  void _onDigitChanged(int index, String value) {
    if (value.isNotEmpty && index < 5) {
      _focusNodes[index + 1].requestFocus();
    }
    if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
    if (_otp.length == 6) _verify();
  }

  Future<void> _verify() async {
    if (_otp.length < 6 || _loading) return;
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
        return;
      }

      if (JourneySession.hasActiveCampaign) {
        try {
          final entry = await apiClient.enterCampaign(JourneySession.campaignId!);
          JourneySession.setRedemption(entry.redemptionId, entry.pointsEarned);
          if (!mounted) return;
          context.go('/survey', extra: {
            'redemptionId': entry.redemptionId,
            'campaignId': JourneySession.campaignId!,
            'pointsEarned': entry.pointsEarned,
          });
        } catch (_) {
          if (!mounted) return;
          context.go('/home');
        }
      } else {
        context.go('/home');
      }
    } catch (e) {
      setState(() => _error = context.l10n.otpWrong);
      for (final c in _controllers) c.clear();
      if (mounted) _focusNodes[0].requestFocus();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) c.dispose();
    for (final f in _focusNodes) f.dispose();
    super.dispose();
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
          actions: const [
            Padding(padding: EdgeInsets.only(right: 12), child: Center(child: LangToggle())),
          ],
        ),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  s.otpTitle,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: kPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  s.otpSentTo,
                  style: TextStyle(fontSize: 15, color: Colors.grey.shade600),
                ),
                Text(
                  widget.phone,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: kPrimary,
                    letterSpacing: 1,
                  ),
                  textDirection: TextDirection.ltr,
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
                const SizedBox(height: 20),
                if (_error != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: kAccent.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, size: 18, color: kAccent),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(_error!, style: const TextStyle(color: kAccent, fontSize: 14)),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      s.didntReceive,
                      style: TextStyle(fontSize: 14, color: Colors.grey.shade500),
                    ),
                    if (_canResend)
                      GestureDetector(
                        onTap: _resend,
                        child: Text(
                          s.resend,
                          style: const TextStyle(
                            fontSize: 14,
                            color: kPrimary,
                            fontWeight: FontWeight.w700,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      )
                    else
                      Text(
                        s.resendIn(_countdown),
                        style: TextStyle(fontSize: 14, color: Colors.grey.shade400),
                      ),
                  ],
                ),
                const Spacer(),
                if (_loading)
                  Center(
                    child: Column(
                      children: [
                        const CircularProgressIndicator(color: kPrimary),
                        const SizedBox(height: 12),
                        Text(s.verifying, style: const TextStyle(color: kPrimary, fontSize: 14)),
                      ],
                    ),
                  ),
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
      height: 58,
      child: TextField(
        controller: controller,
        focusNode: focusNode,
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 1,
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: kPrimary),
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
