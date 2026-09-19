import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/api_client.dart';
import '../core/auth_service.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../core/session.dart';
import '../widgets/eligibility_form.dart';
import '../widgets/lang_toggle.dart';

// Mobile Eligibility gap closure (2026-09-20): the eligibility step of the
// QR-first consumer journey. Reached from CampaignScreen._start() once the
// consumer is authenticated, or from OtpScreen after a mid-entry OTP verify.
// It loads the campaign bound to JourneySession (set by the QR scan),
// collects demographics + ELIGIBILITY-stage screener answers, submits the
// existing contract (same as web/app/consumer), and lets the SERVER decide
// eligibility — a client boolean is never trusted. ELIGIBLE continues to
// the existing trial redemption; INELIGIBLE shows the existing ineligible
// state and never touches redemption or the survey.
class EligibilityScreen extends StatefulWidget {
  // Optional preloaded campaign — lets widget tests exercise the form
  // without the network fetch. In the app flow it stays null and the
  // campaign is loaded from JourneySession.campaignId.
  final Campaign? campaign;

  const EligibilityScreen({super.key, this.campaign});

  @override
  State<EligibilityScreen> createState() => _EligibilityScreenState();
}

class _EligibilityScreenState extends State<EligibilityScreen> {
  Campaign? _campaign;
  bool _loading = true;
  bool _submitting = false;
  bool _ineligible = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.campaign != null) {
      _campaign = widget.campaign;
      _loading = false;
    } else {
      _load();
    }
  }

  Future<void> _load() async {
    final id = JourneySession.campaignId;
    if (id == null) {
      setState(() { _error = '_noId'; _loading = false; });
      return;
    }
    try {
      final campaign = await apiClient.getCampaignById(id);
      if (!mounted) return;
      setState(() { _campaign = campaign; _loading = false; });
    } catch (_) {
      if (!mounted) return;
      setState(() { _error = '_loadFail'; _loading = false; });
    }
  }

  Future<void> _submit(EligibilityFormData data) async {
    final campaignId = _campaign!.id;
    setState(() { _submitting = true; _error = null; });
    try {
      final result = await apiClient.submitEligibility(
        campaignId: campaignId,
        qrSourceId: JourneySession.qrSourceId,
        age: data.age,
        gender: data.gender,
        city: data.city,
        answers: data.answers,
      );
      if (!mounted) return;
      if (!result.eligible) {
        setState(() { _submitting = false; _ineligible = true; });
        return;
      }
      // Server confirmed ELIGIBLE — the existing trial redemption step.
      await apiClient.redeemTrial(campaignId);
      if (!mounted) return;
      JourneySession.markRedeemed();
      context.go('/survey', extra: campaignId);
    } catch (e) {
      if (!mounted) return;
      if (e is DioException && e.response?.statusCode == 409) {
        context.go('/campaign', extra: true);
        return;
      }
      if (e is DioException && e.response?.statusCode == 401) {
        await AuthService.logout();
        if (!mounted) return;
        context.push('/phone');
        return;
      }
      setState(() { _submitting = false; _error = '_entryFail'; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = context.l10n;

    Widget shell(Widget body) => Directionality(
          textDirection: context.dir,
          child: Scaffold(
            backgroundColor: kBackground,
            appBar: AppBar(
              backgroundColor: kSurface,
              surfaceTintColor: kSurface,
              elevation: 0,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_rounded, color: kPrimary),
                onPressed: () => context.canPop() ? context.pop() : context.go('/campaign'),
              ),
              actions: const [
                Padding(padding: EdgeInsets.only(right: 12), child: Center(child: LangToggle())),
              ],
            ),
            body: SafeArea(child: body),
          ),
        );

    if (_loading) {
      return shell(const Center(child: CircularProgressIndicator(color: kPrimary)));
    }

    if (_error != null || _campaign == null) {
      return shell(Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: kAccent, size: 48),
              const SizedBox(height: 16),
              Text(
                _error == '_noId' ? s.campaignNotFound : s.campaignError,
                style: const TextStyle(color: kAccent, fontSize: 16),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              TextButton(
                onPressed: () => context.go('/home'),
                child: Text(s.backHome, style: const TextStyle(color: kPrimary, fontSize: 16)),
              ),
            ],
          ),
        ),
      ));
    }

    // Server-confirmed ineligible — same state the campaign screen used to
    // show; no redemption or survey is reachable from here.
    if (_ineligible) {
      return shell(Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 90,
                height: 90,
                decoration: BoxDecoration(color: Colors.orange.shade50, shape: BoxShape.circle),
                child: Icon(Icons.person_off_rounded, color: Colors.orange.shade400, size: 40),
              ),
              const SizedBox(height: 24),
              Text(s.notEligibleTitle,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: kPrimary),
                  textAlign: TextAlign.center),
              const SizedBox(height: 10),
              Text(s.notEligibleSub,
                  style: TextStyle(fontSize: 14, color: Colors.grey.shade600, height: 1.5),
                  textAlign: TextAlign.center),
              const SizedBox(height: 32),
              TextButton(
                onPressed: () => context.go('/home'),
                child: Text(s.backHome, style: const TextStyle(color: kPrimary)),
              ),
            ],
          ),
        ),
      ));
    }

    final campaign = _campaign!;
    return shell(SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(24, 8, 24, 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            s.eligibilityTitle,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: kPrimary),
          ),
          const SizedBox(height: 6),
          Text(
            '${campaign.productName} · ${s.eligibilitySub}',
            style: TextStyle(fontSize: 14, color: Colors.grey.shade600, height: 1.5),
          ),
          const SizedBox(height: 24),
          if (_error == '_entryFail') ...[
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: kAccent.withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: kAccent, size: 18),
                  const SizedBox(width: 8),
                  Expanded(child: Text(s.entryError, style: const TextStyle(color: kAccent, fontSize: 13))),
                ],
              ),
            ),
          ],
          EligibilityForm(
            questions: campaign.eligibilityQuestions,
            submitting: _submitting,
            onSubmit: _submit,
          ),
        ],
      ),
    ));
  }
}
