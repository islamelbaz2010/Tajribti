import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../core/akedly_pow.dart';
import '../core/api_client.dart';
import '../core/auth_service.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/session.dart';
import '../widgets/lang_toggle.dart';

// Mobile Recovery + Current-Backend Alignment (2026-09-15): rewritten
// against the current phone+OTP contract (api/src/routes/consumerAuth.ts).
// FD-07a (2026-09-21): when reached mid-campaign-entry (JourneySession
// carries a campaignId) the OTP request AND verify are bound to that
// campaign — a fresh code is required for every campaign participation,
// and a code issued for one campaign cannot verify for another. An
// account-level (unscoped) OTP remains for plain sign-in.
// Akedly V1.2 Shield: the client-side PoW contract is now live — this
// screen fetches the challenge via the backend proxy (GET
// /consumer/auth/otp/challenge) and solves it locally (akedly_pow.dart)
// before requesting the OTP. FD-M5: mobile is PoW-only — a
// Turnstile-required pipeline fails into the retryable error path; no
// Turnstile token or WebView is ever used on mobile.
// After verify, this screen hands the journey to /eligibility — the real
// eligibility collection step (screener answers + audience demographics).
// The eligibility -> redeem -> survey sequence itself now lives in
// eligibility_screen.dart, so a consumer who reaches OTP mid-entry still
// doesn't have to press "Start" again.
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
    _requestOtp();
  }

  Future<void> _requestOtp() async {
    setState(() { _error = null; });
    try {
      // Akedly V1.2: the client solves the Shield PoW challenge when the
      // pipeline requires it — the backend only forwards the resulting
      // powSolution. A Turnstile-required pipeline fails into the same
      // retryable error (no widget exists in this build; the current
      // pipeline has Turnstile off).
      Map<String, dynamic>? powSolution;
      final challenge = await apiClient.getOtpChallenge();
      if (challenge['challengeRequired'] == true) {
        final nonce = solvePow(
          challenge['challenge'] as String,
          challenge['difficulty'] as int,
        );
        powSolution = {'challengeToken': challenge['challengeToken'], 'nonce': nonce};
      }
      await apiClient.requestOtp(
        phone: widget.phone,
        campaignId: JourneySession.campaignId,
        powSolution: powSolution,
      );
      _startCountdown();
    } catch (_) {
      if (mounted) setState(() => _error = context.l10n.challengeError);
    }
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
    for (final c in _controllers) c.clear();
    await _requestOtp();
    if (mounted) _focusNodes[0].requestFocus();
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
      final result = await apiClient.verifyOtp(
        phone: widget.phone,
        code: _otp,
        campaignId: JourneySession.campaignId,
      );
      final token = result['token'] as String;
      final consumer = result['consumer'] as Map<String, dynamic>;
      await AuthService.saveSession(
        token: token,
        consumerId: consumer['id'] as String,
        phone: consumer['phone'] as String,
        name: consumer['name'] as String?,
      );
      if (!mounted) return;
      await _completeEntry();
    } catch (e) {
      final statusCode = (e is DioException) ? e.response?.statusCode : null;
      final errorMsg = statusCode == 401 ? context.l10n.otpWrong : context.l10n.otpWrong;
      setState(() => _error = errorMsg);
      for (final c in _controllers) c.clear();
      if (mounted) _focusNodes[0].requestFocus();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  // Continues the QR-first journey for the campaign this OTP verification
  // was reached from: the eligibility step (collection + server decision +
  // redemption) lives on /eligibility now. JourneySession carries the
  // scanned campaign + QR source through, so campaign context is preserved.
  Future<void> _completeEntry() async {
    if (!mounted) return;
    if (JourneySession.campaignId == null) {
      context.go('/home');
      return;
    }
    context.go('/eligibility');
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
            child: _buildOtpState(s),
          ),
        ),
      ),
    );
  }

  Widget _buildOtpState(AppStr s) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          s.otpTitle,
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.w900,
            color: kPrimary,
            fontSize: 28,
          ),
        ),
        const SizedBox(height: 10),
        Text(s.otpSentTo, style: TextStyle(fontSize: 14, color: Colors.grey.shade500)),
        const SizedBox(height: 4),
        Text(
          widget.phone,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: kPrimary),
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
        const SizedBox(height: 24),
        if (_error != null)
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: kAccent.withOpacity(0.06),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline, size: 18, color: kAccent),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(_error!, style: const TextStyle(color: kAccent, fontSize: 13)),
                ),
              ],
            ),
          ),
        const SizedBox(height: 24),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(s.didntReceive, style: TextStyle(fontSize: 13, color: Colors.grey.shade500)),
            if (_canResend)
              GestureDetector(
                onTap: _resend,
                child: Text(s.resend, style: const TextStyle(fontSize: 13, color: kPrimary, fontWeight: FontWeight.w700)),
              )
            else
              Text(s.resendIn(_countdown), style: TextStyle(fontSize: 13, color: Colors.grey.shade400)),
          ],
        ),
        const Spacer(),
        if (_loading)
          Center(
            child: Column(
              children: [
                const CircularProgressIndicator(color: kPrimary, strokeWidth: 2),
                const SizedBox(height: 12),
                Text(s.verifying, style: const TextStyle(color: kPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        const SizedBox(height: 16),
      ],
    );
  }
}

class _DigitBox extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final ValueChanged<String> onChanged;

  const _DigitBox({required this.controller, required this.focusNode, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 48,
      height: 60,
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
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
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
