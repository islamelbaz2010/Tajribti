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
      setState(() { _campaign = campaign; _loading = false; });
    } catch (_) {
      setState(() { _error = '_loadFail'; _loading = false; });
    }
  }

  Future<void> _start() async {
    final loggedIn = await AuthService.isLoggedIn();
    if (!mounted) return;

    if (!loggedIn) {
      context.push('/phone');
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
      if (e is DioException && e.response?.statusCode == 401) {
        // Refresh token also expired (>7d) — full re-authentication required
        await AuthService.logout();
        if (!mounted) return;
        context.push('/phone');
        return;
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
          backgroundColor: kBackground,
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
            backgroundColor: kBackground,
            elevation: 0,
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
            backgroundColor: kBackground,
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
                      width: 80,
                      height: 80,
                      decoration: const BoxDecoration(
                        color: Color(0xFFf0fdf4),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.check_circle_rounded, color: Color(0xFF15803d), size: 48),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      s.alreadyParticipated,
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: kPrimary),
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
                      height: 54,
                      child: ElevatedButton(
                        onPressed: () => context.go('/home'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: kPrimary,
                          foregroundColor: Colors.white,
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
          child: Stack(
            children: [
              SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (campaign.productImage.isNotEmpty)
                      Stack(
                        children: [
                          Image.network(
                            campaign.productImage,
                            width: double.infinity,
                            height: 240,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => _BrandBanner(brandName: campaign.brandName),
                          ),
                          Positioned(
                            top: 12, left: 12,
                            child: _BackButton(),
                          ),
                          const Positioned(
                            top: 12, right: 12,
                            child: LangToggle(light: true),
                          ),
                        ],
                      )
                    else
                      Stack(
                        children: [
                          _BrandBanner(brandName: campaign.brandName),
                          Positioned(
                            top: 12, left: 12,
                            child: _BackButton(),
                          ),
                          const Positioned(
                            top: 12, right: 12,
                            child: LangToggle(light: true),
                          ),
                        ],
                      ),

                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 24, 24, 40),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            campaign.brandName,
                            style: TextStyle(fontSize: 14, color: Colors.grey.shade500, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            campaign.productName,
                            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: kPrimary, height: 1.2),
                          ),
                          if (campaign.locationName.isNotEmpty) ...[
                            const SizedBox(height: 10),
                            Row(
                              children: [
                                const Icon(Icons.location_on_outlined, size: 16, color: kAccent),
                                const SizedBox(width: 4),
                                Text(
                                  campaign.locationName,
                                  style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                                ),
                              ],
                            ),
                          ],
                          if (campaign.description.isNotEmpty) ...[
                            const SizedBox(height: 16),
                            Text(
                              campaign.description,
                              style: TextStyle(fontSize: 14, color: Colors.grey.shade700, height: 1.6),
                            ),
                          ],
                          if (campaign.rewardPoints > 0) ...[
                            const SizedBox(height: 20),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: const Color(0xFFf0fdf4),
                                border: Border.all(color: const Color(0xFFbbf7d0)),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.stars_rounded, color: Color(0xFF15803d), size: 26),
                                  const SizedBox(width: 8),
                                  Text(
                                    '${campaign.rewardPoints}',
                                    style: const TextStyle(
                                      fontSize: 26, fontWeight: FontWeight.w900,
                                      color: Color(0xFF15803d),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    s.rewardDetail,
                                    style: const TextStyle(fontSize: 14, color: Color(0xFF15803d)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                          const SizedBox(height: 24),
                          _StepsRow(s: s),
                          const SizedBox(height: 32),
                          if (_error == '_entryFail')
                            Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: Text(s.entryError, style: const TextStyle(color: kAccent, fontSize: 14)),
                            ),
                          SizedBox(
                            width: double.infinity,
                            height: 58,
                            child: ElevatedButton(
                              onPressed: _entering ? null : _start,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: kPrimary,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                elevation: 0,
                              ),
                              child: _entering
                                  ? const SizedBox(
                                      width: 24,
                                      height: 24,
                                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                    )
                                  : Text(
                                      s.startTrial,
                                      style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
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
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.35),
          shape: BoxShape.circle,
        ),
        child: const Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
      ),
    );
  }
}

class _BrandBanner extends StatelessWidget {
  final String brandName;
  const _BrandBanner({required this.brandName});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 200,
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
            fontSize: 32,
            fontWeight: FontWeight.w900,
            color: Colors.white,
            letterSpacing: -0.5,
          ),
        ),
      ),
    );
  }
}

// Same circular-badge step treatment as the Home discovery hero
// (HeroStep) - so "how it works" reads as one consistent visual language
// across Home and Campaign Detail rather than two different step styles.
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
        color: kPrimary.withOpacity(0.04),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: kPrimary.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(s.howItWorks, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: kPrimary, letterSpacing: 0.4)),
          const SizedBox(height: 16),
          Row(
            children: [
              for (int i = 0; i < steps.length; i++) ...[
                Expanded(child: _Step(icon: steps[i].$1, text: steps[i].$2)),
                if (i < steps.length - 1) Icon(Icons.arrow_forward_rounded, size: 14, color: kPrimary.withOpacity(0.2)),
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
  const _Step({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: kPrimary.withOpacity(0.08),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, size: 18, color: kAccent),
        ),
        const SizedBox(height: 8),
        Text(
          text,
          textAlign: TextAlign.center,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 11, color: kPrimary, fontWeight: FontWeight.w600, height: 1.3),
        ),
      ],
    );
  }
}
