import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../widgets/lang_toggle.dart';

/// Consumer-facing "About Tajribti / How it works" screen.
/// Static, content-only — no backend dependency. Sourced from the
/// project's mission statement and founder's original product concept.
class ServicesScreen extends StatelessWidget {
  const ServicesScreen({super.key});

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
            s.servicesTitle,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
          ),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
            onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
          ),
          actions: const [
            Padding(
              padding: EdgeInsets.only(right: 12),
              child: Center(child: LangToggle(light: true)),
            ),
          ],
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: kPrimary,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.auto_awesome_rounded, color: Color(0xFFfbbf24), size: 28),
                  const SizedBox(height: 12),
                  Text(
                    s.servicesTagline,
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800, height: 1.3),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    s.servicesIntro,
                    style: TextStyle(color: Colors.white.withOpacity(0.75), fontSize: 14, height: 1.6),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),
            _SectionLabel(label: s.servicesHowItWorks),
            const SizedBox(height: 12),
            _StepCard(icon: Icons.explore_rounded, text: s.servicesStepDiscover, number: 1),
            const SizedBox(height: 10),
            _StepCard(icon: Icons.inventory_2_rounded, text: s.servicesStepTry, number: 2),
            const SizedBox(height: 10),
            _StepCard(icon: Icons.rate_review_rounded, text: s.servicesStepShare, number: 3),
            const SizedBox(height: 10),
            _StepCard(icon: Icons.stars_rounded, text: s.servicesStepEarn, number: 4),
            const SizedBox(height: 28),
            _SectionLabel(label: s.servicesCategories),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.category_rounded, color: kPrimary, size: 22),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      s.servicesCategoriesSub,
                      style: const TextStyle(fontSize: 14, color: kPrimary, height: 1.6, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Text(
              s.servicesFooter,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: Colors.grey.shade500, height: 1.5),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, right: 4),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: Colors.grey.shade500,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}

class _StepCard extends StatelessWidget {
  final IconData icon;
  final String text;
  final int number;
  const _StepCard({required this.icon, required this.text, required this.number});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: kPrimary.withOpacity(0.07),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                '$number',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: kPrimary),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Icon(icon, size: 20, color: kAccent),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: kPrimary, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}
