import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/auth_service.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/session.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  Future<void> _confirmSignOut(BuildContext context) async {
    final s = context.l10n;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(s.signOut),
        content: Text(s.signOutConfirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: Text(s.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text(s.signOut, style: const TextStyle(color: kAccent)),
          ),
        ],
      ),
    );
    if (confirmed != true || !context.mounted) return;
    JourneySession.clear();
    await AuthService.logout();
    if (context.mounted) context.go('/home');
  }

  @override
  Widget build(BuildContext context) {
    final s = context.l10n;
    final isAr = LangProvider.isAr(context);
    return Directionality(
      textDirection: context.dir,
      child: Scaffold(
        backgroundColor: kBackground,
        appBar: AppBar(
          backgroundColor: kPrimary,
          elevation: 0,
          title: Text(
            s.settingsTitle,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
          ),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
            onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
          ),
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
          children: [
            _SectionLabel(label: s.languageLabel),
            const SizedBox(height: 10),
            _LanguageTile(
              label: s.arabicLang,
              subtitle: 'العربية',
              selected: isAr,
              onTap: () => langNotifier.setArabic(true),
            ),
            const SizedBox(height: 8),
            _LanguageTile(
              label: s.englishLang,
              subtitle: 'English',
              selected: !isAr,
              onTap: () => langNotifier.setArabic(false),
            ),
            const SizedBox(height: 28),
            _SectionLabel(label: s.accountLabel),
            const SizedBox(height: 10),
            _SettingsTile(
              icon: Icons.logout_rounded,
              label: s.signOut,
              labelColor: kAccent,
              iconColor: kAccent,
              onTap: () => _confirmSignOut(context),
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
      padding: const EdgeInsets.only(left: 4, right: 4, bottom: 2),
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

class _LanguageTile extends StatelessWidget {
  final String label;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;
  const _LanguageTile({
    required this.label,
    required this.subtitle,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? kPrimary.withOpacity(0.06) : Colors.white,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: selected ? kPrimary.withOpacity(0.3) : Colors.grey.shade200,
              width: selected ? 1.5 : 1,
            ),
          ),
          child: Row(
            children: [
              Icon(
                Icons.language_rounded,
                color: selected ? kPrimary : Colors.grey.shade400,
                size: 20,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: selected ? kPrimary : Colors.grey.shade600,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: selected ? kPrimary.withOpacity(0.6) : Colors.grey.shade400,
                      ),
                    ),
                  ],
                ),
              ),
              if (selected)
                const Icon(Icons.check_circle_rounded, color: kPrimary, size: 22)
              else
                Icon(Icons.radio_button_unchecked_rounded, color: Colors.grey.shade300, size: 22),
            ],
          ),
        ),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color? iconColor;
  final Color? labelColor;
  final VoidCallback onTap;
  const _SettingsTile({
    required this.icon,
    required this.label,
    this.iconColor,
    this.labelColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
          child: Row(
            children: [
              Icon(icon, color: iconColor ?? kPrimary, size: 22),
              const SizedBox(width: 14),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: labelColor ?? kPrimary,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
