import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/api_client.dart';
import '../core/auth_service.dart';
import '../core/constants.dart';
import '../core/models.dart';
import '../core/session.dart';

class CampaignScreen extends StatefulWidget {
  const CampaignScreen({super.key});

  @override
  State<CampaignScreen> createState() => _CampaignScreenState();
}

class _CampaignScreenState extends State<CampaignScreen> {
  Campaign? _campaign;
  bool _loading = true;
  bool _entering = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final id = JourneySession.campaignId;
    if (id == null) {
      setState(() { _error = 'لم يتم التعرف على الحملة'; _loading = false; });
      return;
    }
    try {
      final campaign = await apiClient.getCampaignById(id);
      setState(() { _campaign = campaign; _loading = false; });
    } catch (_) {
      setState(() { _error = 'تعذر تحميل بيانات الحملة'; _loading = false; });
    }
  }

  Future<void> _start() async {
    final loggedIn = await AuthService.isLoggedIn();
    if (!mounted) return;

    if (!loggedIn) {
      context.go('/phone');
      return;
    }

    // Returning authenticated user — enter campaign directly
    setState(() => _entering = true);
    try {
      final result = await apiClient.enterCampaign(JourneySession.campaignId!);
      JourneySession.setRedemption(result.redemptionId, result.pointsEarned);
      if (!mounted) return;
      context.go('/survey', extra: {
        'redemptionId': result.redemptionId,
        'campaignId': JourneySession.campaignId!,
        'pointsEarned': result.pointsEarned,
      });
    } catch (e) {
      if (!mounted) return;
      setState(() { _entering = false; _error = 'تعذر الدخول إلى الحملة. حاول مرة أخرى.'; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        backgroundColor: kBackground,
        body: const Center(child: CircularProgressIndicator(color: kPrimary)),
      );
    }

    if (_error != null && _campaign == null) {
      return Directionality(
        textDirection: TextDirection.rtl,
        child: Scaffold(
          backgroundColor: kBackground,
          body: SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.error_outline, color: kAccent, size: 48),
                    const SizedBox(height: 16),
                    Text(_error!, style: const TextStyle(color: kAccent, fontSize: 16)),
                    const SizedBox(height: 24),
                    TextButton(
                      onPressed: () => context.go('/scanner'),
                      child: const Text('مسح رمز آخر', style: TextStyle(color: kPrimary, fontSize: 16)),
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
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: kBackground,
        body: SafeArea(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Hero image or brand banner
                if (campaign.productImage.isNotEmpty)
                  Image.network(
                    campaign.productImage,
                    width: double.infinity,
                    height: 240,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => _BrandBanner(brandName: campaign.brandName),
                  )
                else
                  _BrandBanner(brandName: campaign.brandName),

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
                              Text(
                                '${campaign.rewardPoints}',
                                style: const TextStyle(
                                  fontSize: 26, fontWeight: FontWeight.w900,
                                  color: Color(0xFF15803d),
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Text(
                                'نقطة مكافأة عند إتمام التجربة',
                                style: TextStyle(fontSize: 14, color: Color(0xFF15803d)),
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 24),
                      _StepsRow(),
                      const SizedBox(height: 32),
                      if (_error != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Text(_error!, style: const TextStyle(color: kAccent, fontSize: 14)),
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
                              : const Text(
                                  'ابدأ التجربة',
                                  style: TextStyle(fontSize: 19, fontWeight: FontWeight.w800),
                                ),
                        ),
                      ),
                    ],
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

class _BrandBanner extends StatelessWidget {
  final String brandName;
  const _BrandBanner({required this.brandName});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 180,
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

class _StepsRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kPrimary.withOpacity(0.04),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kPrimary.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text('كيف يعمل؟', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: kPrimary)),
          SizedBox(height: 10),
          _Step(icon: Icons.phone_iphone_rounded, text: 'سجّل برقم هاتفك'),
          SizedBox(height: 6),
          _Step(icon: Icons.quiz_rounded, text: 'أجب على ٥ أسئلة قصيرة'),
          SizedBox(height: 6),
          _Step(icon: Icons.stars_rounded, text: 'واحصل على نقاطك'),
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
    return Row(
      children: [
        Icon(icon, size: 18, color: kAccent),
        const SizedBox(width: 8),
        Text(text, style: const TextStyle(fontSize: 13, color: kPrimary, fontWeight: FontWeight.w500)),
      ],
    );
  }
}
