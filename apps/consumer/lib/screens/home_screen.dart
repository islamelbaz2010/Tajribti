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

class _HomeScreenState extends State<HomeScreen> {
  List<Campaign> _campaigns = [];
  ConsumerProfile? _profile;
  bool _loading = true;
  bool _loggedIn = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
    AuthService.authEpoch.addListener(_onAuthChanged);
  }

  void _onAuthChanged() {
    if (mounted) _load();
  }

  @override
  void dispose() {
    AuthService.authEpoch.removeListener(_onAuthChanged);
    super.dispose();
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
        try {
          _profile = await apiClient.getConsumerProfile();
        } catch (_) {}
      } else {
        _profile = null;
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
                      backgroundColor: kPrimary,
                      elevation: 0,
                      title: Text(
                        s.homeTitle,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 20,
                          letterSpacing: -0.3,
                        ),
                      ),
                      actions: [
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 4),
                          child: Center(child: LangToggle(light: true)),
                        ),
                        IconButton(
                          icon: const Icon(Icons.info_outline_rounded, color: Colors.white),
                          onPressed: () => context.push('/services'),
                        ),
                        if (_loggedIn)
                          IconButton(
                            icon: const Icon(Icons.person_rounded, color: Colors.white),
                            onPressed: () => context.push('/profile'),
                          )
                        else
                          TextButton(
                            onPressed: () => context.push('/auth-choice'),
                            child: Text(
                              s.signIn,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                            ),
                          ),
                      ],
                    ),

                    // ── Profile Banner (logged-in) or Hero (logged-out) ─────
                    if (_loggedIn)
                      SliverToBoxAdapter(
                        child: GestureDetector(
                          onTap: () => context.push('/profile'),
                          child: _ProfileBanner(profile: _profile, s: s),
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
                      SliverFillRemaining(child: _ErrorState(error: s.loadError, onRetry: _load))
                    else if (_campaigns.isEmpty)
                      SliverToBoxAdapter(child: _EmptyState(s: s))
                    else
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (_, i) {
                              final alreadyParticipated = _loggedIn && _profile != null &&
                                  _profile!.recentCampaigns.any((r) => r.campaignId == _campaigns[i].id);
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
                    if (_loggedIn &&
                        _profile != null &&
                        _profile!.recentCampaigns.isNotEmpty) ...[
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
                              record: _profile!.recentCampaigns[i],
                              s: s,
                              onTap: () => _openCompletedCampaign(_profile!.recentCampaigns[i].campaignId),
                            ),
                            childCount: _profile!.recentCampaigns.length,
                          ),
                        ),
                      ),
                    ],

                    const SliverToBoxAdapter(child: SizedBox(height: 24)),
                  ],
                ),
              ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Banner (logged-in)
// ─────────────────────────────────────────────────────────────────────────────

class _ProfileBanner extends StatelessWidget {
  final ConsumerProfile? profile;
  final AppStr s;
  const _ProfileBanner({required this.profile, required this.s});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [kPrimary, Color(0xFF2d3a5c)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white.withOpacity(0.25), width: 2),
            ),
            child: const Icon(Icons.person_rounded, color: Colors.white, size: 26),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  profile?.name != null
                      ? '${s.welcomeBack}، ${profile!.name}'
                      : s.welcomeBack,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.stars_rounded, color: kGold, size: 16),
                    const SizedBox(width: 6),
                    Text(
                      '${profile?.totalPoints ?? 0} ${s.pointsLabel}',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(
              Icons.chevron_right_rounded,
              color: Colors.white.withOpacity(0.7),
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
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [kPrimary, Color(0xFF2d3a5c)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: kPrimary.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.auto_awesome_rounded, color: kGold, size: 18),
          ),
          const SizedBox(height: 16),
          Text(
            s.heroTagline,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w900,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            s.heroSub,
            style: TextStyle(
              color: Colors.white.withOpacity(0.7),
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
                      color: Colors.white.withOpacity(0.2),
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
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.15),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: kGold, size: 18),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white,
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
                          color: (campaign.isComingSoon || campaign.hasEnded) ? Colors.transparent : kPrimary,
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
                            color: campaign.hasEnded
                                ? Colors.grey.shade600
                                : campaign.isComingSoon ? kPrimary : Colors.white,
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
    return Container(
      height: 140,
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [kPrimary, Color(0xFF2d3a5c)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Text(
          brandName,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w900,
            color: Colors.white,
            letterSpacing: -0.5,
          ),
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
                backgroundColor: kPrimary,
                foregroundColor: Colors.white,
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
