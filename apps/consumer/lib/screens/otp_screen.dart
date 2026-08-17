import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:akedly_shield/akedly_shield.dart';
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

  bool _challengeLoading = false;
  bool _loading = false;
  bool _canResend = false;
  int _countdown = 60;
  String? _error;

  String? _transactionReqID;

  String get _otp => _controllers.map((c) => c.text).join();

  @override
  void initState() {
    super.initState();
    _challengeAndRequest();
  }

  Future<void> _challengeAndRequest() async {
    setState(() {
      _challengeLoading = true;
      _error = null;
      _transactionReqID = null;
    });
    try {
      final challengeData = await apiClient.getChallenge();

      final challenge = challengeData['challenge'] as String;
      final difficulty = challengeData['difficulty'] as int;
      final challengeToken = challengeData['challengeToken'] as String;

      // solvePowInIsolate is exported directly by akedly_shield.
      final nonce = await solvePowInIsolate(challenge, difficulty);

      final result = await apiClient.requestOtp(
        widget.phone,
        powSolution: {
          'challengeToken': challengeToken,
          'nonce': nonce,
        },
      );

      _transactionReqID = result['transactionReqID'] as String?;
      _startCountdown();
    } catch (_) {
      if (mounted) setState(() => _error = context.l10n.challengeError);
    } finally {
      if (mounted) setState(() => _challengeLoading = false);
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
    await _challengeAndRequest();
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

    if (_transactionReqID == null) {
      setState(() => _error = context.l10n.challengeError);
      return;
    }

    setState(() { _loading = true; _error = null; });
    try {
      final result = await apiClient.verifyOtp(
        transactionReqID: _transactionReqID!,
        code: _otp,
        phone: widget.phone,
      );

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
      final statusCode = (e is DioException) ? e.response?.statusCode : null;
      final String errorMsg;
      if (statusCode == 410) {
        errorMsg = context.l10n.otpExpired;
      } else if (statusCode == 401) {
        final bodyMsg = (e is DioException)
            ? (e.response?.data is Map ? e.response!.data['message'] as String? : null)
            : null;
        errorMsg = (bodyMsg?.contains('Too many') ?? false)
            ? context.l10n.otpTooMany
            : context.l10n.otpWrong;
      } else {
        errorMsg = context.l10n.otpWrong;
      }
      setState(() => _error = errorMsg);
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
            child: _challengeLoading
                ? _buildChallengeLoadingState(s)
                : (_transactionReqID == null
                    ? _buildChallengeErrorState(s)
                    : _buildOtpInputState(s)),
          ),
        ),
      ),
    );
  }

  Widget _buildChallengeLoadingState(AppStr s) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: kPrimary),
          const SizedBox(height: 16),
          Text(s.preparingCode, style: const TextStyle(color: kPrimary, fontSize: 15)),
        ],
      ),
    );
  }

  Widget _buildChallengeErrorState(AppStr s) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(s.otpTitle, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900, color: kPrimary)),
        const SizedBox(height: 40),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(color: kAccent.withOpacity(0.08), borderRadius: BorderRadius.circular(10)),
          child: Row(
            children: [
              const Icon(Icons.error_outline, size: 18, color: kAccent),
              const SizedBox(width: 8),
              Expanded(child: Text(_error ?? s.challengeError, style: const TextStyle(color: kAccent, fontSize: 14))),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Center(
          child: GestureDetector(
            onTap: _challengeAndRequest,
            child: Text(s.retry, style: const TextStyle(fontSize: 15, color: kPrimary, fontWeight: FontWeight.w700, decoration: TextDecoration.underline)),
          ),
        ),
      ],
    );
  }

  Widget _buildOtpInputState(AppStr s) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(s.otpTitle, style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900, color: kPrimary)),
        const SizedBox(height: 8),
        Text(s.otpSentTo, style: TextStyle(fontSize: 15, color: Colors.grey.shade600)),
        Text(widget.phone, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: kPrimary, letterSpacing: 1), textDirection: TextDirection.ltr),
        const SizedBox(height: 40),
        Directionality(
          textDirection: TextDirection.ltr,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(6, (i) => _DigitBox(controller: _controllers[i], focusNode: _focusNodes[i], onChanged: (v) => _onDigitChanged(i, v))),
          ),
        ),
        const SizedBox(height: 20),
        if (_error != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(color: kAccent.withOpacity(0.08), borderRadius: BorderRadius.circular(10)),
            child: Row(
              children: [
                const Icon(Icons.error_outline, size: 18, color: kAccent),
                const SizedBox(width: 8),
                Expanded(child: Text(_error!, style: const TextStyle(color: kAccent, fontSize: 14))),
              ],
            ),
          ),
        const SizedBox(height: 24),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(s.didntReceive, style: TextStyle(fontSize: 14, color: Colors.grey.shade500)),
            if (_canResend)
              GestureDetector(
                onTap: _resend,
                child: Text(s.resend, style: const TextStyle(fontSize: 14, color: kPrimary, fontWeight: FontWeight.w700, decoration: TextDecoration.underline)),
              )
            else
              Text(s.resendIn(_countdown), style: TextStyle(fontSize: 14, color: Colors.grey.shade400)),
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
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: kPrimary, width: 2)),
        ),
        onChanged: onChanged,
      ),
    );
  }
}
