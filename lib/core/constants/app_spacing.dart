import 'package:flutter/material.dart';

abstract final class AppSpacing {
  // 8pt grid system
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;
  static const double xxxl = 64;

  // Predefined SizedBoxes for gaps
  static const gapXs = SizedBox(height: xs, width: xs);
  static const gapSm = SizedBox(height: sm, width: sm);
  static const gapMd = SizedBox(height: md, width: md);
  static const gapLg = SizedBox(height: lg, width: lg);
  static const gapXl = SizedBox(height: xl, width: xl);
  static const gapXxl = SizedBox(height: xxl, width: xxl);

  // Vertical gaps
  static const gapVXs = SizedBox(height: xs);
  static const gapVSm = SizedBox(height: sm);
  static const gapVMd = SizedBox(height: md);
  static const gapVLg = SizedBox(height: lg);
  static const gapVXl = SizedBox(height: xl);
  static const gapVXxl = SizedBox(height: xxl);

  // Horizontal gaps
  static const gapHXs = SizedBox(width: xs);
  static const gapHSm = SizedBox(width: sm);
  static const gapHMd = SizedBox(width: md);
  static const gapHLg = SizedBox(width: lg);
  static const gapHXl = SizedBox(width: xl);

  // Screen-level padding
  static const screenPadding = EdgeInsets.symmetric(horizontal: 24, vertical: 16);
  static const screenHorizontal = EdgeInsets.symmetric(horizontal: 24);
  static const cardPadding = EdgeInsets.all(16);
}
