import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/constants.dart';
import '../core/l10n.dart';

class ThankYouScreen extends StatefulWidget {
  final int pointsEarned;
  const ThankYouScreen({super.key, required this.pointsEarned});

  @override
  State<ThankYouScreen> createState() => _ThankYouScreenState();
}

class _ThankYouScreenState extends State<ThankYouScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _scaleAnim;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 800));
    _scaleAnim = CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut);
    _fadeAnim = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = context.l10n;
    return Directionality(
      textDirection: context.dir,
      child: Scaffold(
        // Consumer Visual System (2026-09-02): this was the last full-page
        // dark-navy surface left in the participation flow (Try Now →
        // Verify Phone → OTP → Survey were already light) — flagged
        // directly from real-device screenshots. Converted to the same
        // light system as Already Participated (campaign_screen.dart):
        // light background, white reward card, green success circle,
        // gold points, restrained lime CTA. Reward amount/points-earned
        // logic untouched — still the real `widget.pointsEarned` passed
        // in, never hardcoded.
        backgroundColor: kBackground,
        body: SafeArea(
          child: Center(
            child: FadeTransition(
              opacity: _fadeAnim,
              child: Padding(
                padding: const EdgeInsets.all(32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    ScaleTransition(
                      scale: _scaleAnim,
                      child: Container(
                        width: 110,
                        height: 110,
                        decoration: const BoxDecoration(
                          color: Color(0xFFD1FAE5),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.check_rounded, color: kSuccess, size: 60),
                      ),
                    ),
                    const SizedBox(height: 36),
                    Text(
                      s.thankYou,
                      style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        color: kPrimary,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      s.feedbackSent,
                      style: TextStyle(
                        fontSize: 15,
                        color: kPrimary.withOpacity(0.6),
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 32),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 36, vertical: 24),
                      decoration: BoxDecoration(
                        color: kSurface,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(color: kCardShadow, blurRadius: 16, offset: const Offset(0, 6)),
                        ],
                      ),
                      child: Column(
                        children: [
                          Text(
                            '+${widget.pointsEarned}',
                            style: const TextStyle(
                              fontSize: 48,
                              fontWeight: FontWeight.w900,
                              color: kGold,
                            ),
                          ),
                          Text(
                            s.pointsAddedLabel,
                            style: TextStyle(
                              fontSize: 14,
                              color: kPrimary.withOpacity(0.6),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 48),
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
                        child: Text(
                          s.backHome,
                          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
