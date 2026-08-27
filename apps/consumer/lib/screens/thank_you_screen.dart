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
        backgroundColor: kPrimary,
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
                          color: kSuccess,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.check_rounded, color: Colors.white, size: 60),
                      ),
                    ),
                    const SizedBox(height: 36),
                    Text(
                      s.thankYou,
                      style: const TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      s.feedbackSent,
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.white.withOpacity(0.7),
                      ),
                    ),
                    const SizedBox(height: 40),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 36, vertical: 24),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(24),
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
                              color: Colors.white.withOpacity(0.7),
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
                          backgroundColor: Colors.white,
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
