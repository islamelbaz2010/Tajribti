import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../widgets/lang_toggle.dart';

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
            // ── Hero Card ─────────────────────────────────────────────────
            // Consumer Visual System (2026-09-02): lightened from a dark
            // navy gradient to a white card with a restrained lime accent,
            // matching the rest of the app's light-first system (Home,
            // Campaign, Activity already used it — this screen was the one
            // remaining full-card dark surface).
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: kSurface,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(color: kCardShadow, blurRadius: 16, offset: const Offset(0, 6)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: kBrandSoft,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.auto_awesome_rounded, color: kGold, size: 20),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    s.servicesWhyMatters,
                    style: const TextStyle(color: kPrimary, fontSize: 20, fontWeight: FontWeight.w800, height: 1.3),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    s.servicesTagline,
                    style: const TextStyle(color: kPrimary, fontSize: 14, fontWeight: FontWeight.w700, height: 1.4),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    s.servicesIntro,
                    style: TextStyle(color: kPrimary.withOpacity(0.65), fontSize: 14, height: 1.7),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // ── How it Works ──────────────────────────────────────────────
            _SectionLabel(label: s.servicesHowItWorks),
            const SizedBox(height: 14),
            _StepCard(icon: Icons.explore_rounded, text: s.servicesStepDiscover, number: 1),
            const SizedBox(height: 10),
            _StepCard(icon: Icons.inventory_2_rounded, text: s.servicesStepTry, number: 2),
            const SizedBox(height: 10),
            _StepCard(icon: Icons.rate_review_rounded, text: s.servicesStepShare, number: 3),
            const SizedBox(height: 10),
            _StepCard(icon: Icons.stars_rounded, text: s.servicesStepEarn, number: 4),
            const SizedBox(height: 32),

            // ── Categories ────────────────────────────────────────────────
            _SectionLabel(label: s.servicesCategories),
            const SizedBox(height: 14),
            Container(
              width: double.infinity,
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
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: kPrimary.withOpacity(0.06),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.category_rounded, color: kPrimary, size: 20),
                  ),
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
            const SizedBox(height: 32),

            // ── What Your Feedback Helps Brands Understand ─────────────────
            _SectionLabel(label: s.servicesLearnTitle),
            const SizedBox(height: 14),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(color: kCardShadow, blurRadius: 10, offset: const Offset(0, 2)),
                ],
              ),
              child: Column(
                children: [
                  _LearnRow(text: s.servicesLearnImpressions),
                  _LearnRow(text: s.servicesLearnExperience),
                  _LearnRow(text: s.servicesLearnLikes),
                  _LearnRow(text: s.servicesLearnPurchase),
                  _LearnRow(text: s.servicesLearnImprove, isLast: true),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Text(
              s.servicesFooter,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: Colors.grey.shade400, height: 1.5),
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
          color: Colors.grey.shade400,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}

class _LearnRow extends StatelessWidget {
  final String text;
  final bool isLast;
  const _LearnRow({required this.text, this.isLast = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : Border(bottom: BorderSide(color: Colors.grey.shade100, width: 1)),
      ),
      child: Row(
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: const BoxDecoration(color: kBrand, shape: BoxShape.circle),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: kPrimary),
            ),
          ),
        ],
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
        boxShadow: [
          BoxShadow(
            color: kCardShadow,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: kPrimary,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                '$number',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white),
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
