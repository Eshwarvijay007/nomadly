import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:nomadly/core/constants/app_colors.dart';
import 'package:nomadly/core/constants/app_durations.dart';
import 'package:nomadly/core/constants/app_spacing.dart';
import 'package:nomadly/core/constants/app_typography.dart';
import 'package:nomadly/core/widgets/app_button.dart';
import 'package:nomadly/core/widgets/app_page_indicator.dart';
import 'package:nomadly/features/onboarding/presentation/widgets/onboarding_illustration.dart';
import 'package:nomadly/features/onboarding/presentation/widgets/onboarding_slide.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage>
    with TickerProviderStateMixin {
  late final PageController _pageController;
  late final AnimationController _fadeController;
  late final Animation<double> _fadeAnimation;

  int _currentPage = 0;
  final int _totalPages = 3;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();

    _fadeController = AnimationController(
      vsync: this,
      duration: AppDurations.slow,
    );

    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOutCubic,
    );

    _fadeController.forward();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  void _onPageChanged(int page) {
    setState(() => _currentPage = page);
  }

  void _nextPage() {
    if (_currentPage < _totalPages - 1) {
      _pageController.nextPage(
        duration: AppDurations.pageTransition,
        curve: Curves.easeOutCubic,
      );
    } else {
      _onGetStarted();
    }
  }

  void _onGetStarted() {
    // Navigate to home or auth screen
    // For now, we'll just show a placeholder
    context.go('/home');
  }

  void _onSignIn() {
    // Navigate to sign in screen
    context.go('/sign-in');
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: Column(
          children: [
            Expanded(
              child: PageView(
                controller: _pageController,
                onPageChanged: _onPageChanged,
                children: const [
                  OnboardingSlide(
                    illustration: DiscoverIllustration(),
                    headline: 'Discover Through People You Trust',
                    subtext:
                        'No algorithms. No noise. Just thoughtful recommendations from real curators.',
                  ),
                  OnboardingSlide(
                    illustration: CuratorsIllustration(),
                    headline: 'Follow Curators, Not Feeds',
                    subtext:
                        'Subscribe to tastemakers who share what they genuinely love—from places to products to experiences.',
                  ),
                  OnboardingSlide(
                    illustration: SaveIllustration(),
                    headline: 'Save What Inspires You',
                    subtext:
                        'Build your personal library of discoveries. Come back to them whenever you\'re ready.',
                  ),
                ],
              ),
            ),
            Padding(
              padding: EdgeInsets.fromLTRB(
                AppSpacing.lg,
                AppSpacing.md,
                AppSpacing.lg,
                bottomPadding + AppSpacing.lg,
              ),
              child: Column(
                children: [
                  AppPageIndicator(
                    count: _totalPages,
                    currentIndex: _currentPage,
                  ),
                  AppSpacing.gapVXl,
                  AppButton(
                    label: _currentPage == _totalPages - 1
                        ? 'Get Started'
                        : 'Continue',
                    onPressed: _nextPage,
                    isExpanded: true,
                  ),
                  if (_currentPage == _totalPages - 1) ...[
                    AppSpacing.gapVMd,
                    GestureDetector(
                      onTap: _onSignIn,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Text.rich(
                          TextSpan(
                            text: 'Already have an account? ',
                            style: AppTypography.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                            ),
                            children: [
                              TextSpan(
                                text: 'Sign in',
                                style: AppTypography.bodyMedium.copyWith(
                                  color: AppColors.accent,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
