import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/api_client.dart';
import '../core/auth_service.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../core/session.dart';
import '../widgets/lang_toggle.dart';

class CampaignScreen extends StatefulWidget {
  final bool alreadyCompleted;

  const CampaignScreen({super.key, this.alreadyCompleted = false});

  @override
  State<CampaignScreen> createState() => _CampaignScreenState();
}

class _CampaignScreenState extends State<CampaignScreen> {
  Campaign? _campaign;
  bool _loading = true;
  bool _entering = false;
  bool _alreadyCompleted = false;
  // Benchmark Alignment — Audience/Eligibility (2026-09-06, DL-101)
  // Server-confirmed: consumer does not meet this campaign's audience criteria.
  bool _ineligible = false;
  String? _ineligibilityReason;
  String? _error;

  @override
  void initState() {
    super.initState();
    _alreadyCompleted = widget.alreadyCompleted;
    if (_alreadyCompleted) {
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
      // Defense in depth for Rule C (every entry point into a Campaign must
      // agree on participation truth): whoever pushed this route may not have
      // known this campaign was already completed (e.g. a direct QR scan, or
      // any future caller that forgets to pass alreadyCompleted). If the
      // signed-in consumer already has a redemption for this campaign, treat
      // it as completed here too, using the same profile data Home already
      // fetches — no new backend call/endpoint.
      var alreadyCompleted = false;
      var ineligible = false;
      String? ineligibilityReason;
      if (await AuthService.isLoggedIn()) {
        try {
          final profile = await apiClient.getConsumerProfile();
          alreadyCompleted = profile.recentCampaigns.any((r) => r.campaignId == id);
        } catch (_) {}
        // Benchmark Alignment — Audience/Eligibility (2026-09-06, DL-101):
        // Server-side eligibility check, only meaningful for logged-in
        // consumers. Unknown / unauthenticated consumers see the campaign
        // normally and are blocked at the server when they actually try to
        // enter (auth-choice or phone verification happens first anyway).
        if (!alreadyCompleted) {
          try {
            final eligibility = await apiClient.checkEligibility(id);
            if (!eligibility.eligible) {
              ineligible = true;
              ineligibilityReason = eligibility.reason;
            }
          } catch (_) {
            // Non-fatal: if the eligibility endpoint fails, show the campaign
            // normally. The server will still enforce eligibility at entry time.
          }
        }
      }
      setState(() {
        _campaign = campaign;
        _alreadyCompleted = alreadyCompleted;
        _ineligible = ineligible;
        _ineligibilityReason = ineligibilityReason;
        _loading = false;
      });
    } catch (_) {
      setState(() { _error = '_loadFail'; _loading = false; });
    }
  }

  Future<void> _start() async {
    final scanned = await context.push<bool>('/scanner', extra: JourneySession.campaignId);
    if (scanned != true || !mounted) return;

    final loggedIn = await AuthService.isLoggedIn();
    if (!mounted) return;

    if (!loggedIn) {
      context.push('/auth-choice');
      return;
    }

    setState(() => _entering = true);
    try {
      final result = await apiClient.enterCampaign(JourneySession.campaignId!);
      if (!mounted) return;
      if (result.alreadyCompleted) {
        setState(() { _alreadyCompleted = true; _entering = false; });
        return;
      }
      JourneySession.setRedemption(result.redemptionId, result.pointsEarned);
      context.go('/survey', extra: {
        'redemptionId': result.redemptionId,
        'campaignId': JourneySession.campaignId!,
        'pointsEarned': result.pointsEarned,
      });
    } catch (e) {
      if (!mounted) return;
      if (e is DioException && e.response?.statusCode == 403) {
        setState(() => _entering = false);
        context.push('/phone');
        return;
      }
      if (e is DioException && e.response?.statusCode == 401) {
        await AuthService.logout();
        if (!mounted) return;
        context.push('/auth-choice');
        return;
      }
      // Benchmark Alignment — Eligibility (2026-09-06, DL-101):
      // A 400 from enterCampaign may be an eligibility rejection if the
      // consumer slipped through the pre-check (race, profile update after
      // load, or consumer profile was null at load time). Surface ineligible
      // state cleanly rather than a generic entry error.
      if (e is DioException && e.response?.statusCode == 400) {
        final msg = e.response?.data?['message'] as String? ?? '';
        final eligibilityKeywords = ['eligible', 'audience', 'profile', 'age group'];
        final isEligibilityBlock = eligibilityKeywords.any((kw) => msg.toLowerCase().contains(kw));
        if (isEligibilityBlock) {
          setState(() { _entering = false; _ineligible = true; _ineligibilityReason = msg; });
          return;
        }
      }
      setState(() { _entering = false; _error = '_entryFail'; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = context.l10n;

    if (_loading) {
      return Scaffold(
        backgroundColor: kBackground,
        appBar: AppBar(
          backgroundColor: kSurface,
          surfaceTintColor: kSurface,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded, color: kPrimary),
            onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
          ),
        ),
        body: const Center(child: CircularProgressIndicator(color: kPrimary)),
      );
    }

    String? displayError;
    if (_error == '_noId') displayError = s.campaignNotFound;
    if (_error == '_loadFail') displayError = s.campaignError;
    if (_error == '_entryFail') displayError = s.entryError;

    if (displayError != null && _campaign == null) {
      return Directionality(
        textDirection: context.dir,
        child: Scaffold(
          backgroundColor: kBackground,
          appBar: AppBar(
            // Consumer Experience Polish (2026-09-01): light header
            // replacing the dark-navy one, matching Home.
            backgroundColor: kSurface,
            surfaceTintColor: kSurface,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: kPrimary),
              onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
            ),
            actions: const [
              Padding(padding: EdgeInsets.only(right: 12), child: Center(child: LangToggle())),
            ],
          ),
          body: SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.error_outline, color: kAccent, size: 48),
                    const SizedBox(height: 16),
                    Text(displayError, style: const TextStyle(color: kAccent, fontSize: 16), textAlign: TextAlign.center),
                    const SizedBox(height: 24),
                    TextButton(
                      onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
                      child: Text(s.backHome, style: const TextStyle(color: kPrimary, fontSize: 16)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    if (_alreadyCompleted) {
      return Directionality(
        textDirection: context.dir,
        child: Scaffold(
          backgroundColor: kBackground,
          appBar: AppBar(
            // Consumer Experience Polish (2026-09-01): light header
            // replacing the dark-navy one, matching Home.
            backgroundColor: kSurface,
            surfaceTintColor: kSurface,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: kPrimary),
              onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
            ),
            actions: const [
              Padding(padding: EdgeInsets.only(right: 12), child: Center(child: LangToggle())),
            ],
          ),
          body: SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: const BoxDecoration(
                        color: Color(0xFFD1FAE5),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check_circle_rounded, color: kSuccess, size: 52),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      s.alreadyParticipated,
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: kPrimary),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      s.alreadyParticipatedSub,
                      style: TextStyle(fontSize: 15, color: Colors.grey.shade600, height: 1.5),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 36),
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: () => context.go('/home'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: kBrand,
                          foregroundColor: kPrimary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                        child: Text(s.backHome, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    // Campaign Scheduling / "Coming Soon" (2026-09-01): status=active but
    // startDate is in the future — genuinely configured, publicly
    // discoverable (it's why the consumer reached this screen at all), but
    // not yet open for QR/OTP/survey participation. qr.service.ts/
    // auth.service.ts already enforce this server-side (isCampaignOpenForParticipation);
    // this mirrors that same rule here so the consumer sees why, instead of
    // reaching a Start Trial button that would only fail later. Checked
    // before the generic non-active branch below because isComingSoon
    // implies status IS active.
    if (_campaign != null && _campaign!.isComingSoon) {
      final campaign = _campaign!;
      return Directionality(
        textDirection: context.dir,
        child: Scaffold(
          backgroundColor: kBackground,
          appBar: AppBar(
            // Consumer Experience Polish (2026-09-01): light header
            // replacing the dark-navy one, matching Home.
            backgroundColor: kSurface,
            surfaceTintColor: kSurface,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: kPrimary),
              onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
            ),
            actions: const [
              Padding(padding: EdgeInsets.only(right: 12), child: Center(child: LangToggle())),
            ],
          ),
          body: SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        color: kPrimary.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.schedule_rounded, color: kPrimary, size: 48),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      campaign.productName,
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: kPrimary),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      s.campaignComingSoonTitle,
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: kGold),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      campaign.startDate != null
                          ? s.comingSoonNotice(s.formatShortDate(DateTime.parse(campaign.startDate!)))
                          : s.campaignNotActiveSub,
                      style: TextStyle(fontSize: 15, color: Colors.grey.shade600, height: 1.5),
                      textAlign: TextAlign.center,
                    ),
                    if (campaign.endDate != null) ...[
                      const SizedBox(height: 6),
                      Text(
                        '${s.startsOn(s.formatShortDate(DateTime.parse(campaign.startDate!)))} · ${s.formatShortDate(DateTime.parse(campaign.endDate!))}',
                        style: TextStyle(fontSize: 13, color: Colors.grey.shade500),
                        textAlign: TextAlign.center,
                      ),
                    ],
                    const SizedBox(height: 36),
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: () => context.go('/home'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: kBrand,
                          foregroundColor: kPrimary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                        child: Text(s.backHome, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    // Campaign End-Date Gate (2026-09-01, pass 2): status=active but
    // endDate has already passed — genuinely ran and completed its
    // scheduled window, not paused/draft/archived, so a distinct "ended"
    // state (not the generic campaignNotActive one below) is shown.
    // qr.service.ts/auth.service.ts already enforce this server-side
    // (isCampaignOpenForParticipation + getParticipationBlockedReason);
    // this mirrors it here. Checked before the generic non-active branch
    // below (same reasoning as isComingSoon above it) since hasEnded
    // implies status IS active — and after _alreadyCompleted above, so a
    // consumer who already participated still sees their completed state,
    // not "ended", even once the campaign's window closes.
    if (_campaign != null && _campaign!.hasEnded) {
      final campaign = _campaign!;
      return Directionality(
        textDirection: context.dir,
        child: Scaffold(
          backgroundColor: kBackground,
          appBar: AppBar(
            // Consumer Experience Polish (2026-09-01): light header
            // replacing the dark-navy one, matching Home.
            backgroundColor: kSurface,
            surfaceTintColor: kSurface,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: kPrimary),
              onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
            ),
            actions: const [
              Padding(padding: EdgeInsets.only(right: 12), child: Center(child: LangToggle())),
            ],
          ),
          body: SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade200,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.event_busy_rounded, color: Colors.grey.shade600, size: 48),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      campaign.productName,
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: kPrimary),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      s.campaignEndedTitle,
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.grey.shade600),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      s.campaignEndedSub,
                      style: TextStyle(fontSize: 15, color: Colors.grey.shade600, height: 1.5),
                      textAlign: TextAlign.center,
                    ),
                    if (campaign.endDate != null) ...[
                      const SizedBox(height: 6),
                      Text(
                        s.endedOn(s.formatShortDate(DateTime.parse(campaign.endDate!))),
                        style: TextStyle(fontSize: 13, color: Colors.grey.shade500),
                        textAlign: TextAlign.center,
                      ),
                    ],
                    const SizedBox(height: 36),
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: () => context.go('/home'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: kBrand,
                          foregroundColor: kPrimary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                        child: Text(s.backHome, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    // Benchmark Alignment — Audience/Eligibility (2026-09-06, DL-101):
    // Show a clear ineligibility state when the server confirmed this
    // consumer does not meet the campaign's audience criteria.
    // Placed before the non-active gate because eligibility is a consumer-
    // identity concern, not a campaign-lifecycle concern.
    if (_campaign != null && _ineligible) {
      return Directionality(
        textDirection: context.dir,
        child: Scaffold(
          backgroundColor: kBackground,
          appBar: AppBar(
            backgroundColor: kSurface,
            surfaceTintColor: kSurface,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: kPrimary),
              onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
            ),
            actions: const [
              Padding(padding: EdgeInsets.only(right: 12), child: Center(child: LangToggle())),
            ],
          ),
          body: SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        color: Colors.orange.shade50,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.person_off_rounded, color: Colors.orange.shade400, size: 40),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      s.notEligibleTitle,
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: kPrimary),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 10),
                    Text(
                      _ineligibilityReason ?? s.notEligibleSub,
                      style: TextStyle(fontSize: 14, color: Colors.grey.shade600, height: 1.5),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                    TextButton(
                      onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
                      child: Text(s.backHome, style: const TextStyle(color: kPrimary)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    // Campaign lifecycle: a first-time (not-yet-completed) visitor reaching
    // a non-active campaign directly (stale QR, bookmarked link) must see a
    // clear unavailable state here rather than a Start Trial that would only
    // fail later at QR/entry with a generic error. Discovery (GET /campaigns)
    // and entry (enterCampaignWeb) already enforce this server-side; this
    // mirrors that same rule in Campaign Detail itself. Does not affect
    // already-completed campaigns (handled above) or the active case.
    if (_campaign != null && _campaign!.status != 'active') {
      return Directionality(
        textDirection: context.dir,
        child: Scaffold(
          backgroundColor: kBackground,
          appBar: AppBar(
            // Consumer Experience Polish (2026-09-01): light header
            // replacing the dark-navy one, matching Home.
            backgroundColor: kSurface,
            surfaceTintColor: kSurface,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: kPrimary),
              onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
            ),
            actions: const [
              Padding(padding: EdgeInsets.only(right: 12), child: Center(child: LangToggle())),
            ],
          ),
          body: SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 90,
                      height: 90,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade200,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.info_outline_rounded, color: Colors.grey.shade600, size: 52),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      s.campaignNotActive,
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: kPrimary),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      s.campaignNotActiveSub,
                      style: TextStyle(fontSize: 15, color: Colors.grey.shade600, height: 1.5),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 36),
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: () => context.go('/home'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: kBrand,
                          foregroundColor: kPrimary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 0,
                        ),
                        child: Text(s.backHome, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    }

    final campaign = _campaign!;

    return Directionality(
      textDirection: context.dir,
      child: Scaffold(
        backgroundColor: kBackground,
        body: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Hero Image ────────────────────────────────────────────
                Stack(
                  children: [
                    if (campaign.productImage.isNotEmpty)
                      Image.network(
                        campaign.productImage,
                        width: double.infinity,
                        height: 280,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _BrandBanner(brandName: campaign.brandName),
                      )
                    else
                      _BrandBanner(brandName: campaign.brandName),
                    Positioned(
                      top: 12,
                      left: 12,
                      child: _BackButton(),
                    ),
                    // Consumer Experience Polish (2026-09-01): this overlay
                    // sits on either a real product photo (any color) or
                    // _BrandBanner's now-bright gradient — a plain
                    // light:true toggle (white-on-transparent) had good
                    // contrast on the old dark fallback but not the new
                    // bright one. Wrapping it in the same translucent-black
                    // scrim _BackButton already uses (below) guarantees
                    // contrast against any background, without needing to
                    // track image-load state.
                    const Positioned(
                      top: 12,
                      right: 12,
                      child: _ScrimWrapper(child: LangToggle(light: true)),
                    ),
                  ],
                ),

                // ── Content ───────────────────────────────────────────────
                Container(
                  transform: Matrix4.translationValues(0, -20, 0),
                  decoration: BoxDecoration(
                    color: kBackground,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(24, 8, 24, 40),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // ── Brand & Title ─────────────────────────────────
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: kPrimary.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            campaign.brandName,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: kPrimary,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          campaign.productName,
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.w900,
                            color: kPrimary,
                            height: 1.2,
                          ),
                        ),
                        if (campaign.locationName.isNotEmpty) ...[
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Icon(Icons.location_on_outlined, size: 18, color: Colors.grey.shade400),
                              const SizedBox(width: 6),
                              Text(
                                campaign.locationName,
                                style: TextStyle(fontSize: 14, color: Colors.grey.shade500),
                              ),
                            ],
                          ),
                        ],
                        if (campaign.description.isNotEmpty) ...[
                          const SizedBox(height: 16),
                          Text(
                            campaign.description,
                            style: TextStyle(fontSize: 14, color: Colors.grey.shade700, height: 1.7),
                          ),
                        ],

                        // ── Reward Card ───────────────────────────────────
                        if (campaign.rewardPoints > 0) ...[
                          const SizedBox(height: 20),
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFFFEF3C7), Color(0xFFFEF9C3)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: const Color(0xFFFDE68A)),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: const BoxDecoration(
                                    color: kGold,
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.stars_rounded, color: Colors.white, size: 26),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '${campaign.rewardPoints} ${s.pointsLabel}',
                                        style: const TextStyle(
                                          fontSize: 20,
                                          fontWeight: FontWeight.w900,
                                          color: Color(0xFF92400E),
                                        ),
                                      ),
                                      Text(
                                        s.rewardDetail,
                                        style: const TextStyle(
                                          fontSize: 13,
                                          color: Color(0xFFB45309),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],

                        // ── How it Works ──────────────────────────────────
                        const SizedBox(height: 24),
                        _StepsRow(s: s),

                        // ── Error Message ─────────────────────────────────
                        if (_error == '_entryFail') ...[
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: kAccent.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.error_outline, color: kAccent, size: 18),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(s.entryError, style: const TextStyle(color: kAccent, fontSize: 13)),
                                ),
                              ],
                            ),
                          ),
                        ],

                        // ── CTA Button ────────────────────────────────────
                        const SizedBox(height: 28),
                        SizedBox(
                          width: double.infinity,
                          height: 60,
                          child: ElevatedButton(
                            onPressed: _entering ? null : _start,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: kBrand,
                              foregroundColor: kPrimary,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              elevation: 0,
                            ),
                            child: _entering
                                ? const SizedBox(
                                    width: 24,
                                    height: 24,
                                    child: CircularProgressIndicator(color: kPrimary, strokeWidth: 2),
                                  )
                                : Text(
                                    s.startTrial,
                                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                                  ),
                          ),
                        ),
                      ],
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
}

class _BackButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.canPop() ? context.pop() : context.go('/home'),
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.3),
          shape: BoxShape.circle,
        ),
        child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
      ),
    );
  }
}

// Consumer Experience Polish (2026-09-01): small translucent-black scrim,
// same opacity as _BackButton above, so an overlay reads correctly against
// any hero background (photo or gradient) without needing to know what's
// behind it.
class _ScrimWrapper extends StatelessWidget {
  final Widget child;
  const _ScrimWrapper({required this.child});

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.3),
        borderRadius: BorderRadius.circular(20),
      ),
      child: child,
    );
  }
}

class _BrandBanner extends StatelessWidget {
  final String brandName;
  const _BrandBanner({required this.brandName});

  @override
  Widget build(BuildContext context) {
    // Consumer Visual System (2026-09-02): the brand-gradient fallback this
    // replaced a dark-navy block with (2026-09-01) was itself too bright/
    // dominant — same fix as Home's _ProfileBanner/_HeroBanner/_CardBanner.
    // Light neutral surface, brand identity kept only in the icon badge.
    return Container(
      width: double.infinity,
      height: 280,
      color: kBackground,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: const BoxDecoration(color: kBrandSoft, shape: BoxShape.circle),
              child: const Icon(Icons.inventory_2_rounded, color: kBrand600, size: 28),
            ),
            const SizedBox(height: 14),
            Text(
              brandName,
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w900,
                color: kPrimary,
                letterSpacing: -0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StepsRow extends StatelessWidget {
  final AppStr s;
  const _StepsRow({required this.s});

  @override
  Widget build(BuildContext context) {
    final steps = [
      (Icons.phone_iphone_rounded, s.step1),
      (Icons.quiz_rounded, s.step2),
      (Icons.stars_rounded, s.step3),
    ];
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: kCardShadow,
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            s.howItWorks,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: kPrimary),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              for (int i = 0; i < steps.length; i++) ...[
                Expanded(child: _Step(icon: steps[i].$1, text: steps[i].$2, index: i + 1)),
                if (i < steps.length - 1)
                  Icon(Icons.arrow_forward_rounded, size: 14, color: Colors.grey.shade300),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _Step extends StatelessWidget {
  final IconData icon;
  final String text;
  final int index;
  const _Step({required this.icon, required this.text, required this.index});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: kPrimary.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 18, color: kAccent),
            ),
            Positioned(
              top: 0,
              left: 0,
              child: Container(
                width: 18,
                height: 18,
                decoration: const BoxDecoration(
                  color: kPrimary,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    '$index',
                    style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, color: Colors.white),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          text,
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 10, color: kPrimary, fontWeight: FontWeight.w600, height: 1.3),
        ),
      ],
    );
  }
}
