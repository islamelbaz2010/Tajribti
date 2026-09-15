import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/api_client.dart';
import '../core/auth_service.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../core/session.dart';
import '../widgets/lang_toggle.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

// Campaign auto-sync (forensic finding, 2026-09-16): the pre-Benchmark app
// had no polling, lifecycle observer, socket or push mechanism anywhere in
// its mobile or backend code (verified against origin/main:apps/consumer —
// only a manual RefreshIndicator plus a fresh _load() on screen init). Any
// "it just showed up" memory of that app is explained by Home remounting on
// cold start/navigation, not a real live-sync mechanism. The current
// backend has no socket/SSE/push endpoint either (api/src/routes/
// consumer.ts is plain REST), and Benchmark §9 explicitly excludes push
// notifications, so this implements the smallest mechanism that makes
// discovery genuinely automatic while Home is open: lightweight polling,
// paused while backgrounded and refreshed immediately on foreground resume.
const Duration _kCampaignPollInterval = Duration(seconds: 30);

class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  List<Campaign> _campaigns = [];
  // Mobile Recovery + Current-Backend Alignment (2026-09-15): there is no
  // consumer profile endpoint on the current backend (no totalPoints/
  // recentCampaigns bundle). Name is the locally-cached value from the
  // last OTP verify; participation history comes from the real
  // GET /consumer/participations endpoint instead.
  String? _name;
  List<ParticipationRecord> _participations = [];
  bool _loading = true;
  bool _loggedIn = false;
  String? _error;
  Timer? _pollTimer;
  bool _refreshing = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _load();
    _startPolling();
    AuthService.authEpoch.addListener(_onAuthChanged);
  }

  void _onAuthChanged() {
    if (mounted) _load();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _pollTimer?.cancel();
    AuthService.authEpoch.removeListener(_onAuthChanged);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // Foreground resume (Benchmark auto-sync requirement): refresh right
      // away rather than waiting for the next poll tick, then resume polling.
      _silentRefresh();
      _startPolling();
    } else if (state == AppLifecycleState.paused || state == AppLifecycleState.detached) {
      // Stop polling while backgrounded — no point spending battery/network
      // on a screen the user cannot see.
      _pollTimer?.cancel();
    }
  }

  void _startPolling() {
    _pollTimer?.cancel();
    _pollTimer = Timer.periodic(_kCampaignPollInterval, (_) => _silentRefresh());
  }

  // Background refresh used by polling/resume: never shows the full-screen
  // spinner and never surfaces a network error to the user — a missed poll
  // just tries again next tick. `_refreshing` prevents overlapping requests
  // if a poll tick fires while a previous one is still in flight.
  Future<void> _silentRefresh() async {
    if (!mounted || _loading || _refreshing) return;
    _refreshing = true;
    try {
      final loggedIn = await AuthService.isLoggedIn();
      final campaigns = await apiClient.getActiveCampaigns();
      List<ParticipationRecord> participations = _participations;
      if (loggedIn) {
        try {
          participations = await apiClient.getParticipations();
        } catch (_) {
          // keep last-known participations on transient failure
        }
      }
      if (!mounted) return;
      setState(() {
        _loggedIn = loggedIn;
        _campaigns = campaigns;
        _participations = loggedIn ? participations : [];
      });
    } catch (_) {
      // Network interruption during a background poll: leave current state
      // as-is, retry on the next tick.
    } finally {
      _refreshing = false;
    }
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      _loggedIn = await AuthService.isLoggedIn();
      _campaigns = await apiClient.getActiveCampaigns();
      if (_loggedIn) {
        _name = await AuthService.getName();
        try {
          _participations = await apiClient.getParticipations();
        } catch (_) {
          _participations = [];
        }
      } else {
        _name = null;
        _participations = [];
      }
    } catch (_) {
      _error = 'load_fail';
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _enterCampaign(String campaignId) {
    JourneySession.start(campaignId);
    context.push('/campaign');
  }

  void _openCompletedCampaign(String campaignId) {
    JourneySession.start(campaignId);
    context.push('/campaign', extra: true);
  }

  @override
  Widget build(BuildContext context) {
    final s = context.l10n;
    return Directionality(
      textDirection: context.dir,
      child: Scaffold(
        backgroundColor: kBackground,
        body: _loading
            ? const Center(child: CircularProgressIndicator(color: kPrimary))
            : RefreshIndicator(
                onRefresh: _load,
                color: kPrimary,
                child: CustomScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  slivers: [
                    // ── App Bar ──────────────────────────────────────────────
                    SliverAppBar(
                      floating: true,
                      pinned: true,
                      backgroundColor: kSurface,
                      surfaceTintColor: kSurface,
                      elevation: 0,
                      // Consumer Experience Polish (2026-09-01): white/light
                      // header replacing the dark-navy bar, matching the
                      // public website's own light sticky header for brand
                      // consistency. Business logic (auth state, routes)
                      // unchanged — only colors below.
                      bottom: PreferredSize(
                        preferredSize: const Size.fromHeight(1),
                        child: Container(height: 1, color: const Color(0xFFEDEFF5)),
                      ),
                      title: Text(
                        s.homeTitle,
                        style: const TextStyle(
                          color: kPrimary,
                          fontWeight: FontWeight.w900,
                          fontSize: 20,
                          letterSpacing: -0.3,
                        ),
                      ),
                      actions: [
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 4),
                          child: Center(child: LangToggle()),
                        ),
                        IconButton(
                          icon: const Icon(Icons.info_outline_rounded, color: kPrimary),
                          onPressed: () => context.push('/services'),
                        ),
                        if (_loggedIn)
                          IconButton(
                            icon: const Icon(Icons.person_rounded, color: kPrimary),
                            onPressed: () => context.push('/profile'),
                          )
                        else
                          TextButton(
                            onPressed: () => context.push('/auth-choice'),
                            child: Text(
                              s.signIn,
                              style: const TextStyle(color: kPrimary, fontWeight: FontWeight.w700),
                            ),
                          ),
                      ],
                    ),

                    // ── Profile Banner (logged-in) or Hero (logged-out) ─────
                    if (_loggedIn)
                      SliverToBoxAdapter(
                        child: GestureDetector(
                          onTap: () => context.push('/profile'),
                          child: _ProfileBanner(name: _name, s: s),
                        ),
                      )
                    else
                      SliverToBoxAdapter(child: _HeroBanner(s: s)),

                    // ── Campaign Section Header ──────────────────────────────
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(20, 24, 20, 14),
                        child: Row(
                          children: [
                            Container(
                              width: 4,
                              height: 20,
                              decoration: BoxDecoration(
                                color: kAccent,
                                borderRadius: BorderRadius.circular(2),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Text(
                              s.availableCampaigns,
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: kPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // ── Campaign Cards ───────────────────────────────────────
                    if (_error != null)
                      // hasScrollBody: false — the default (true) forces this
                      // sliver's exact height to whatever viewport space is
                      // left below the hero banner/header, which is too
                      // little on short screens and overflows _ErrorState's
                      // content instead of letting the scroll view grow to
                      // fit it (a real bug this fix surfaced, not a
                      // test-only artifact — the same banner+header height
                      // math applies on a real short/landscape screen).
                      SliverFillRemaining(
                        hasScrollBody: false,
                        child: _ErrorState(error: s.loadError, onRetry: _load),
                      )
                    else if (_campaigns.isEmpty)
                      SliverToBoxAdapter(child: _EmptyState(s: s))
                    else
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (_, i) {
                              final alreadyParticipated = _loggedIn &&
                                  _participations.any((r) => r.campaignId == _campaigns[i].id);
                              return _CampaignCard(
                                campaign: _campaigns[i],
                                s: s,
                                alreadyParticipated: alreadyParticipated,
                                // Must match the badge above: a campaign already shown as
                                // "Completed" has to open the same completed state as
                                // My Activity, not re-enter the QR/OTP/Survey flow.
                                onTap: alreadyParticipated
                                    ? () => _openCompletedCampaign(_campaigns[i].id)
                                    : () => _enterCampaign(_campaigns[i].id),
                              );
                            },
                            childCount: _campaigns.length,
                          ),
                        ),
                      ),

                    // ── Activity Preview (logged-in) ─────────────────────────
                    if (_loggedIn && _participations.isNotEmpty) ...[
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(20, 28, 20, 14),
                          child: Row(
                            children: [
                              Container(
                                width: 4,
                                height: 20,
                                decoration: BoxDecoration(
                                  color: kSuccess,
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  s.myActivity,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w800,
                                    color: kPrimary,
                                  ),
                                ),
                              ),
                              TextButton(
                                onPressed: () => context.push('/activity'),
                                style: TextButton.styleFrom(
                                  padding: EdgeInsets.zero,
                                  minimumSize: const Size(0, 0),
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                child: Text(
                                  s.seeAll,
                                  style: const TextStyle(
                                    color: kAccent,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (_, i) => _ActivityTile(
                              record: _participations[i],
                              s: s,
                              onTap: () => _openCompletedCampaign(_participations[i].campaignId),
                            ),
                            childCount: _participations.length,
                          ),
                        ),
                      ),
                    ],

                    // ── Why Your Feedback Matters ────────────────────────────
                    // Consumer Home upgrade (2026-09-02): Home previously
                    // read primarily as a campaign list — this closes the
                    // TRY → TELL → INFORM/EARN loop in plain language,
                    // without turning Home into a marketing/B2B page (one
                    // compact card, three short rows, no fake stats).
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(20, 28, 20, 8),
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: kSurface,
                            borderRadius: BorderRadius.circular(18),
                            boxShadow: [
                              BoxShadow(color: kCardShadow, blurRadius: 12, offset: const Offset(0, 3)),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                s.homeWhyMattersTitle,
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: kPrimary),
                              ),
                              const SizedBox(height: 16),
                              _WhyMattersRow(label: s.homeWhyTryLabel, body: s.homeWhyTryBody, color: kBrand600),
                              const SizedBox(height: 14),
                              _WhyMattersRow(label: s.homeWhyTellLabel, body: s.homeWhyTellBody, color: kGold),
                              const SizedBox(height: 14),
                              _WhyMattersRow(label: s.homeWhyInformLabel, body: s.homeWhyInformBody, color: kSuccess),
                            ],
                          ),
                        ),
                      ),
                    ),

                    const SliverToBoxAdapter(child: SizedBox(height: 24)),
                  ],
                ),
              ),
      ),
    );
  }
}

class _WhyMattersRow extends StatelessWidget {
  final String label;
  final String body;
  final Color color;
  const _WhyMattersRow({required this.label, required this.body, required this.color});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 52,
          alignment: Alignment.centerLeft,
          child: Text(
            label,
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: color, letterSpacing: 0.6),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            body,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: kPrimary, height: 1.4),
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Banner (logged-in)
// ─────────────────────────────────────────────────────────────────────────────

class _ProfileBanner extends StatelessWidget {
  final String? name;
  final AppStr s;
  const _ProfileBanner({required this.name, required this.s});

  @override
  Widget build(BuildContext context) {
    // Consumer Visual System (2026-09-02): the full-bleed lime gradient
    // this replaced a dark-navy card with (2026-09-01) turned out to be its
    // own inconsistency — a large bright-lime surface, exactly what the
    // "too harsh/fluorescent" review named. Converted to a light card
    // (kSurface, same treatment as Profile's header two passes ago) with
    // the brand accent kept only as the restrained avatar ring.
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: kSurface,
        boxShadow: [BoxShadow(color: kCardShadow, blurRadius: 12, offset: const Offset(0, 3))],
      ),
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: kBrandSoft,
              shape: BoxShape.circle,
              border: Border.all(color: kBrand, width: 2),
            ),
            child: const Icon(Icons.person_rounded, color: kPrimary, size: 26),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name != null && name!.isNotEmpty
                      ? '${s.welcomeBack}، $name'
                      : s.welcomeBack,
                  style: const TextStyle(
                    color: kPrimary,
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: kBrandSoft,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(
              Icons.chevron_right_rounded,
              color: kPrimary.withOpacity(0.6),
              size: 20,
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero Banner (logged-out)
// ─────────────────────────────────────────────────────────────────────────────

class _HeroBanner extends StatelessWidget {
  final AppStr s;
  const _HeroBanner({required this.s});

  @override
  Widget build(BuildContext context) {
    final steps = [
      (Icons.explore_rounded, s.heroStepDiscover),
      (Icons.inventory_2_rounded, s.heroStepTry),
      (Icons.rate_review_rounded, s.heroStepShare),
      (Icons.stars_rounded, s.heroStepEarn),
    ];
    // Consumer Visual System (2026-09-02): the bright lime-gradient hero
    // this replaced a dark-navy one with (2026-09-01) is itself the large
    // fluorescent surface the latest review named — first thing a
    // logged-out consumer sees was a full lime wash. Converted to a light
    // card (same family as the About/Profile cards) with the accent kept
    // only in small badges/icon circles.
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
      decoration: BoxDecoration(
        color: kSurface,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: kCardShadow, blurRadius: 16, offset: const Offset(0, 6))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: kBrandSoft,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.auto_awesome_rounded, color: kGold, size: 18),
          ),
          const SizedBox(height: 16),
          Text(
            s.heroTagline,
            style: const TextStyle(
              color: kPrimary,
              fontSize: 22,
              fontWeight: FontWeight.w900,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            s.heroSub,
            style: TextStyle(
              color: kPrimary.withOpacity(0.65),
              fontSize: 13,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              for (int i = 0; i < steps.length; i++) ...[
                _HeroStep(icon: steps[i].$1, label: steps[i].$2),
                if (i < steps.length - 1)
                  Expanded(
                    child: Container(
                      height: 1,
                      color: kPrimary.withOpacity(0.15),
                    ),
                  ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _HeroStep extends StatelessWidget {
  final IconData icon;
  final String label;
  const _HeroStep({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: const BoxDecoration(
            color: kBrandSoft,
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: kGold, size: 18),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: const TextStyle(
            color: kPrimary,
            fontSize: 10,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Campaign Card
// ─────────────────────────────────────────────────────────────────────────────

class _CampaignCard extends StatelessWidget {
  final Campaign campaign;
  final AppStr s;
  final bool alreadyParticipated;
  final VoidCallback onTap;
  const _CampaignCard({
    required this.campaign,
    required this.s,
    this.alreadyParticipated = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: kCardShadow,
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Image or brand gradient ────────────────────────────────────
          Stack(
            children: [
              if (campaign.productImage.isNotEmpty)
                Image.network(
                  campaign.productImage,
                  height: 180,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => _CardBanner(brandName: campaign.brandName),
                )
              else
                _CardBanner(brandName: campaign.brandName),
              if (alreadyParticipated)
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: kSuccess,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.check_rounded, color: Colors.white, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          s.activityCompleted,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else if (campaign.isComingSoon)
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: kPrimary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.schedule_rounded, color: Colors.white, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          s.comingSoon,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              // Campaign End-Date Gate (2026-09-01, pass 2): symmetric with
              // the isComingSoon badge above — status=active but endDate
              // has passed, so participation is closed even though the
              // card is still shown (discovery is unaffected, same as the
              // Coming Soon case; only the entry gate is closed).
              else if (campaign.hasEnded)
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade600,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.event_busy_rounded, color: Colors.white, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          s.ended,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),

          // ── Info section ──────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            campaign.brandName,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey.shade500,
                              letterSpacing: 0.3,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            campaign.productName,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: kPrimary,
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                if (campaign.locationName.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.location_on_outlined, size: 14, color: Colors.grey.shade400),
                      const SizedBox(width: 4),
                      Text(
                        campaign.locationName,
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 12),
                Row(
                  children: [
                    if (campaign.rewardPoints > 0) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.stars_rounded, size: 14, color: kGold),
                            const SizedBox(width: 4),
                            Text(
                              '${campaign.rewardPoints} ${s.pointsLabel}',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFFB45309),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                    ] else
                      const Spacer(),
                    GestureDetector(
                      // Campaign End-Date Gate (2026-09-01, pass 2): same
                      // pattern as isComingSoon above — tapping still
                      // navigates to Campaign Detail (matching the
                      // existing completed-campaign card's behavior),
                      // which shows the dedicated Ended screen with no way
                      // to proceed, rather than disabling the tap here.
                      onTap: onTap,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                        decoration: BoxDecoration(
                          // Consumer Experience Polish (2026-09-01): active
                          // CTA fill moved from dark-navy to the brand
                          // accent (matches the public website's primary
                          // CTA) — Coming Soon/Ended states unchanged
                          // (still an outline, no fill).
                          color: (campaign.isComingSoon || campaign.hasEnded) ? Colors.transparent : kBrand,
                          border: (campaign.isComingSoon || campaign.hasEnded)
                              ? Border.all(color: (campaign.hasEnded ? Colors.grey.shade400 : kPrimary.withOpacity(0.4)))
                              : null,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          campaign.hasEnded
                              ? s.ended
                              : campaign.isComingSoon && campaign.startDate != null
                                  ? s.startsOn(s.formatShortDate(DateTime.parse(campaign.startDate!)))
                                  : s.startTrialCard,
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: campaign.hasEnded ? Colors.grey.shade600 : kPrimary,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CardBanner extends StatelessWidget {
  final String brandName;
  const _CardBanner({required this.brandName});

  @override
  Widget build(BuildContext context) {
    // Consumer Visual System (2026-09-02): the brand-gradient fallback this
    // replaced a dark-navy block with (2026-09-01) was itself too bright/
    // dominant for a campaign card — same fix direction as _ProfileBanner/
    // _HeroBanner above. Light neutral surface, brand identity kept only
    // in the small icon badge — matches the Company Console's own "No
    // product image" light fallback card for cross-platform consistency.
    return Container(
      height: 140,
      width: double.infinity,
      color: kBackground,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: const BoxDecoration(color: kBrandSoft, shape: BoxShape.circle),
              child: const Icon(Icons.inventory_2_rounded, color: kBrand600, size: 20),
            ),
            const SizedBox(height: 10),
            Text(
              brandName,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: kPrimary,
                letterSpacing: -0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity Tile
// ─────────────────────────────────────────────────────────────────────────────

class _ActivityTile extends StatelessWidget {
  final ParticipationRecord record;
  final AppStr s;
  final VoidCallback onTap;
  const _ActivityTile({required this.record, required this.s, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
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
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: const Color(0xFFFEF3C7),
                borderRadius: BorderRadius.circular(12),
              ),
              child: record.productImage != null && record.productImage!.isNotEmpty
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        record.productImage!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Icon(Icons.inventory_2_outlined, color: kGold, size: 22),
                      ),
                    )
                  : const Icon(Icons.inventory_2_outlined, color: kGold, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    record.productName ?? record.campaignId,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: kPrimary,
                    ),
                  ),
                  if (record.brandName != null)
                    Text(
                      record.brandName!,
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                    ),
                ],
              ),
            ),
            if (record.rewardPoints > 0)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFD1FAE5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '+${record.rewardPoints}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: kSuccess,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty and Error States
// ─────────────────────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  final AppStr s;
  const _EmptyState({required this.s});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
      child: Column(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: kPrimary.withOpacity(0.06),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.campaign_outlined, size: 40, color: Colors.grey.shade300),
          ),
          const SizedBox(height: 20),
          Text(
            s.noCampaignsTitle,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: kPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            s.noCampaignsSub,
            style: TextStyle(fontSize: 14, color: Colors.grey.shade500, height: 1.5),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;
  const _ErrorState({required this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off_rounded, size: 48, color: kAccent),
            const SizedBox(height: 16),
            Text(error, style: const TextStyle(color: kAccent, fontSize: 16), textAlign: TextAlign.center),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: onRetry,
              style: ElevatedButton.styleFrom(
                backgroundColor: kBrand,
                foregroundColor: kPrimary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: Text(context.l10n.retry),
            ),
          ],
        ),
      ),
    );
  }
}
