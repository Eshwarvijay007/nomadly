import 'package:flutter/material.dart';
import 'package:nomadly/app/router.dart';
import 'package:nomadly/core/theme/app_theme.dart';

class NomadlyApp extends StatelessWidget {
  const NomadlyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Nomadly',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      themeMode: ThemeMode.light,
      routerConfig: appRouter,
    );
  }
}
