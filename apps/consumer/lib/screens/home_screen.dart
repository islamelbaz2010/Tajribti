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
        } catch (_) {
          // non-fatal — show campaigns without profile
        }
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
        appBar: AppBar(
          backgroundColor: kPrimary,
          elevation: 0,
          title: Text(
            s.homeTitle,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 20,
            ),
          ),
          automaticallyImplyLeading: false,
          actions: [
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 4),
              child: Center(child: LangToggle(light: true)),
            ),
            IconButton(
              icon: const Icon(Icons.info_outline_rounded, color: Colors.white),
              onPressed: () => context.push('/services'),
              tooltip: s.servicesTitle,
            ),
            if (_loggedIn)
              IconButton(
                icon: const Icon(Icons.person_rounded, color: Colors.white),
                onPressed: () => context.push('/profile'),
                tooltip: s.profileTitle,
              )
            else
              // Account Login, independently reachable from Home — the user
              // must not have to enter a Campaign to find it. Pushes to the
              // same phone/OTP screen used for Campaign participation, but
              // with no active JourneySession campaign, so it reads (and
              // behaves) as plain account sign-in rather than participation
              // verification.
              TextButton(
                onPressed: () => context.push('/phone'),
                child: Text(
                  s.signIn,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                ),
              ),
          ],
        ),
        body: _loading
            ? const Center(child: CircularProgressIndicator(color: kPrimary))
            : RefreshIndicator(
                onRefresh: _load,
                color: kPrimary,
                child: Builder(
                  builder: (context) {
                    final participatedIds = (_loggedIn && _profile != null)
                        ? _profile!.recentCampaigns.map((r) => r.campaignId).toSet()
                        : <String>{};
                    final availableCampaigns = _campaigns
                        .where((c) => !participatedIds.contains(c.id))
                        .toList();
                    return CustomScrollView(
                  slivers: [
                    // ── Profile banner (logged-in only) ──────────────────
                    if (_loggedIn)
                      SliverToBoxAdapter(
                        child: GestureDetector(
                          onTap: () => context.push('/profile'),
                          child: _ProfileBanner(profile: _profile, s: s),
                        ),
                      )
                    // ── Discovery hero (first-time / logged-out only) ────
                    // Home previously jumped straight from the AppBar into
                    // the campaign list with no explanation of what
                    // Tajribti is or why to participate. Shown only when
                    // logged out — a returning user already knows the app,
                    // and the profile banner above already personalizes
                    // their experience instead.
                    else
                      const SliverToBoxAdapter(child: _HeroBanner()),

                    // ── Campaign section header ───────────────────────────
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
                        child: Text(
                          s.availableCampaigns,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: kPrimary,
                          ),
                        ),
                      ),
                    ),

                    // ── Campaign cards (exclude already-participated) ──────
                    if (_error != null)
                      SliverFillRemaining(child: _ErrorState(error: s.loadError, onRetry: _load))
                    else if (availableCampaigns.isEmpty)
                      SliverToBoxAdapter(child: _EmptyState(s: s))
                    else
                      SliverPadding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (_, i) => _CampaignCard(
                              campaign: availableCampaigns[i],
                              s: s,
                              onTap: () => _enterCampaign(availableCampaigns[i].id),
                            ),
                            childCount: availableCampaigns.length,
                          ),
                        ),
                      ),

                    // ── Activity history (logged-in, non-empty) ───────────
                    if (_loggedIn &&
                        _profile != null &&
                        _profile!.recentCampaigns.isNotEmpty) ...[
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(20, 28, 20, 12),
                          child: Row(
                            children: [
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

                    // Standalone Scan QR entry removed from Home: QR now
                    // belongs inside Campaign participation (Campaign
                    // Detail → Start Trial → Scan Campaign QR), not as a
                    // Home-level discovery shortcut. The scanner itself is
                    // unchanged and reused there — see ScannerScreen.
                    const SliverToBoxAdapter(child: SizedBox(height: 24)),
                  ],
                    );
                  },
                ),
              ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile banner
// ─────────────────────────────────────────────────────────────────────────────

class _ProfileBanner extends StatelessWidget {
  final ConsumerProfile? profile;
  final AppStr s;
  const _ProfileBanner({required this.profile, required this.s});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: kPrimary,
      padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.person_rounded, color: Colors.white70, size: 26),
          ),
          const SizedBox(width: 14),
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
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                if (profile != null)
                  Text(
                    '${profile!.totalPoints} ${s.pointsLabel}',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.65),
                      fontSize: 13,
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Discovery hero — introduces the product before showing the campaign list
// ─────────────────────────────────────────────────────────────────────────────

class _HeroBanner extends StatelessWidget {
  const _HeroBanner();

  @override
  Widget build(BuildContext context) {
    final s = context.l10n;
    final steps = [
      (Icons.explore_rounded, s.heroStepDiscover),
      (Icons.inventory_2_rounded, s.heroStepTry),
      (Icons.rate_review_rounded, s.heroStepShare),
      (Icons.stars_rounded, s.heroStepEarn),
    ];
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 20, 16, 4),
      padding: const EdgeInsets.fromLTRB(22, 26, 22, 22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [kPrimary, Color(0xFF2e3d5e)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            s.heroTagline,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 21,
              fontWeight: FontWeight.w900,
              height: 1.25,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            s.heroSub,
            style: TextStyle(color: Colors.white.withOpacity(0.72), fontSize: 13, height: 1.5),
          ),
          const SizedBox(height: 22),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              for (int i = 0; i < steps.length; i++) ...[
                _HeroStep(icon: steps[i].$1, label: steps[i].$2),
                if (i < steps.length - 1)
                  Icon(Icons.arrow_forward_rounded, size: 14, color: Colors.white.withOpacity(0.3)),
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
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.12),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: const Color(0xFFfbbf24), size: 18),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Campaign card
// ─────────────────────────────────────────────────────────────────────────────

class _CampaignCard extends StatelessWidget {
  final Campaign campaign;
  final AppStr s;
  final VoidCallback onTap;
  const _CampaignCard({required this.campaign, required this.s, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: kPrimary.withOpacity(0.07),
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
          if (campaign.productImage.isNotEmpty)
            Image.network(
              campaign.productImage,
              height: 160,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => _CardBanner(brandName: campaign.brandName),
            )
          else
            _CardBanner(brandName: campaign.brandName),

          // ── Info row ──────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
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
                const SizedBox(height: 3),
                Text(
                  campaign.productName,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: kPrimary,
                    height: 1.2,
                  ),
                ),
                if (campaign.locationName.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.location_on_outlined, size: 14, color: kAccent),
                      const SizedBox(width: 3),
                      Text(
                        campaign.locationName,
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 14),
                Row(
                  children: [
                    if (campaign.rewardPoints > 0) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(0xFFf0fdf4),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFFbbf7d0)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.stars_rounded, size: 14, color: Color(0xFF15803d)),
                            const SizedBox(width: 4),
                            Text(
                              '${campaign.rewardPoints} ${s.pointsLabel}',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF15803d),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Spacer(),
                    ] else
                      const Spacer(),
                    ElevatedButton(
                      onPressed: onTap,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: kPrimary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 0,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: Text(
                        s.startTrialCard,
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
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
      height: 120,
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [kPrimary, Color(0xFF2e3d5e)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Text(
          brandName,
          style: const TextStyle(
            fontSize: 28,
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
// Activity tile
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
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: kPrimary.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: kPrimary.withOpacity(0.07),
              borderRadius: BorderRadius.circular(10),
            ),
            child: record.productImage != null && record.productImage!.isNotEmpty
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.network(
                      record.productImage!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const Icon(Icons.inventory_2_outlined, color: kPrimary, size: 22),
                    ),
                  )
                : const Icon(Icons.inventory_2_outlined, color: kPrimary, size: 22),
          ),
          const SizedBox(width: 12),
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
            Text(
              '+${record.rewardPoints}',
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: Color(0xFF15803d),
              ),
            ),
        ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty and error states
// ─────────────────────────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  final AppStr s;
  const _EmptyState({required this.s});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 40),
      child: Column(
        children: [
          Icon(Icons.campaign_outlined, size: 56, color: Colors.grey.shade300),
          const SizedBox(height: 16),
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
