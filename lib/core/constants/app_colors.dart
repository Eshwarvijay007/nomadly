import 'package:flutter/material.dart';

abstract final class AppColors {
  // Surface - Warm off-white for premium feel
  static const background = Color(0xFFFAFAF8);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceAlt = Color(0xFFF5F5F3);

  // Content
  static const textPrimary = Color(0xFF1A1A1A);
  static const textSecondary = Color(0xFF6B7280);
  static const textTertiary = Color(0xFF9CA3AF);

  // Accent - Confident blue
  static const accent = Color(0xFF0671FF);
  static const accentLight = Color(0xFFDBEAFE);

  // Secondary accent - Soft yellow-green for highlights
  static const accentSecondary = Color(0xFFE3F794);

  // Semantic
  static const error = Color(0xFFDC2626);
  static const success = Color(0xFF16A34A);
  static const warning = Color(0xFFF59E0B);

  // Borders & Dividers
  static const border = Color(0xFFE5E7EB);
  static const divider = Color(0xFFF3F4F6);

  // Dark mode
  static const darkBackground = Color(0xFF0F0F0F);
  static const darkSurface = Color(0xFF1A1A1A);
  static const darkSurfaceAlt = Color(0xFF262626);
  static const darkTextPrimary = Color(0xFFF9FAFB);
  static const darkTextSecondary = Color(0xFF9CA3AF);
  static const darkBorder = Color(0xFF374151);
}
