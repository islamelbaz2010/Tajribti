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
    return Row(
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
    );
  }
}
