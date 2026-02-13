import 'package:flutter/material.dart';
import 'package:nomadly/core/constants/app_colors.dart';
import 'package:nomadly/core/constants/app_durations.dart';
import 'package:nomadly/core/constants/app_spacing.dart';

class AppPageIndicator extends StatelessWidget {
  const AppPageIndicator({
    required this.count,
    required this.currentIndex,
    super.key,
  });

  final int count;
  final int currentIndex;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(count, (index) {
        final isActive = index == currentIndex;
        return AnimatedContainer(
          duration: AppDurations.normal,
          curve: Curves.easeOutCubic,
          margin: EdgeInsets.only(right: index < count - 1 ? AppSpacing.sm : 0),
          width: isActive ? 24 : 8,
          height: 8,
          decoration: BoxDecoration(
            color: isActive ? AppColors.accent : AppColors.border,
            borderRadius: BorderRadius.circular(4),
          ),
        );
      }),
    );
  }
}
