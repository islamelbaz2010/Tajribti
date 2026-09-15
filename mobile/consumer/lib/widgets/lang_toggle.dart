import 'package:flutter/material.dart';
import '../core/constants.dart';
import '../core/l10n.dart';

class LangToggle extends StatelessWidget {
  final bool light;
  const LangToggle({super.key, this.light = false});

  @override
  Widget build(BuildContext context) {
    final s = context.l10n;
    return GestureDetector(
      onTap: langNotifier.toggle,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: light ? Colors.white.withOpacity(0.15) : kPrimary.withOpacity(0.06),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: light ? Colors.white.withOpacity(0.3) : kPrimary.withOpacity(0.15),
          ),
        ),
        child: Text(
          s.switchToOther,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: light ? Colors.white : kPrimary,
            letterSpacing: 0.5,
          ),
        ),
      ),
    );
  }
}
