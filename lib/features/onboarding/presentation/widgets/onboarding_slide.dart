import 'package:flutter/material.dart';
import 'package:nomadly/core/constants/app_colors.dart';
import 'package:nomadly/core/constants/app_spacing.dart';
import 'package:nomadly/core/constants/app_typography.dart';

class OnboardingSlide extends StatelessWidget {
  const OnboardingSlide({
    required this.illustration,
    required this.headline,
    required this.subtext,
    super.key,
  });

  final Widget illustration;
  final String headline;
  final String subtext;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: AppSpacing.screenHorizontal,
      child: Column(
        children: [
          const Spacer(flex: 2),
          SizedBox(
            height: 280,
            child: illustration,
          ),
          const Spacer(),
          Text(
            headline,
            style: AppTypography.displayLarge,
            textAlign: TextAlign.center,
          ),
          AppSpacing.gapVMd,
          Text(
            subtext,
            style: AppTypography.bodyLarge.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          const Spacer(flex: 2),
        ],
      ),
    );
  }
}
