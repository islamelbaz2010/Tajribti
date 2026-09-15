import 'package:flutter/material.dart';
import '../core/constants.dart';

class StarRating extends StatefulWidget {
  final int value;
  final ValueChanged<int> onChanged;

  const StarRating({super.key, required this.value, required this.onChanged});

  @override
  State<StarRating> createState() => _StarRatingState();
}

class _StarRatingState extends State<StarRating> {
  @override
  Widget build(BuildContext context) {
    // Directionality override (DL-129 finding, same defect class fixed in
    // the web consumer journey's StarInput): stars are an unlabeled
    // visual-fill widget with no per-star number to anchor to, so under
    // the ambient RTL Directionality (Arabic mode) Row lays out star 1 on
    // the right and mirrors the fill — a tap intended as a high, mostly-
    // filled rating silently records a low value instead. Forcing ltr here
    // keeps star 1 leftmost and the visible fill consistent with the
    // stored score regardless of the app's current language/direction.
    return Directionality(
      textDirection: TextDirection.ltr,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(5, (i) {
          final filled = i < widget.value;
          return GestureDetector(
            onTap: () => widget.onChanged(i + 1),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6),
              child: Icon(
                filled ? Icons.star_rounded : Icons.star_outline_rounded,
                size: 44,
                color: filled ? kAccent : Colors.grey.shade300,
              ),
            ),
          );
        }),
      ),
    );
  }
}
