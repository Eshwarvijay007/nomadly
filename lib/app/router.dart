import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:nomadly/features/explore/presentation/pages/explore_page.dart';
import 'package:nomadly/features/home/presentation/pages/nomadly_home_page.dart';

abstract final class RoutePaths {
  static const home = '/';
  static const explore = '/explore';
  static const signIn = '/sign-in';
}

final appRouter = GoRouter(
  initialLocation: RoutePaths.home,
  routes: [
    GoRoute(
      path: RoutePaths.home,
      pageBuilder: (context, state) => CustomTransitionPage(
        key: state.pageKey,
        child: const NomadlyHomePage(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(
            opacity: CurveTween(curve: Curves.easeOutCubic).animate(animation),
            child: child,
          );
        },
      ),
    ),
    GoRoute(
      path: RoutePaths.explore,
      pageBuilder: (context, state) => CustomTransitionPage(
        key: state.pageKey,
        child: const ExplorePage(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(
            opacity: CurveTween(curve: Curves.easeOutCubic).animate(animation),
            child: child,
          );
        },
      ),
    ),
    GoRoute(
      path: RoutePaths.signIn,
      pageBuilder: (context, state) => CustomTransitionPage(
        key: state.pageKey,
        child: const _PlaceholderPage(title: 'Sign In'),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return FadeTransition(
            opacity: CurveTween(curve: Curves.easeOutCubic).animate(animation),
            child: child,
          );
        },
      ),
    ),
  ],
);

class _PlaceholderPage extends StatelessWidget {
  const _PlaceholderPage({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Text(
          '$title - Coming Soon',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
      ),
    );
  }
}
