import 'package:flutter/material.dart';
import 'package:nomadly/core/constants/app_colors.dart';
import 'package:nomadly/core/constants/app_durations.dart';
import 'package:nomadly/core/constants/app_typography.dart';

enum AppButtonVariant { primary, secondary, text }

class AppButton extends StatefulWidget {
  const AppButton({
    required this.label,
    required this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.isLoading = false,
    this.isExpanded = false,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final bool isLoading;
  final bool isExpanded;

  @override
  State<AppButton> createState() => _AppButtonState();
}

class _AppButtonState extends State<AppButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final isDisabled = widget.onPressed == null || widget.isLoading;

    return GestureDetector(
      onTapDown: isDisabled ? null : (_) => setState(() => _isPressed = true),
      onTapUp: isDisabled ? null : (_) => setState(() => _isPressed = false),
      onTapCancel: isDisabled ? null : () => setState(() => _isPressed = false),
      onTap: isDisabled ? null : widget.onPressed,
      child: AnimatedScale(
        scale: _isPressed ? 0.98 : 1.0,
        duration: AppDurations.fast,
        child: AnimatedOpacity(
          opacity: isDisabled ? 0.5 : 1.0,
          duration: AppDurations.fast,
          child: Container(
            height: 52,
            width: widget.isExpanded ? double.infinity : null,
            padding: const EdgeInsets.symmetric(horizontal: 28),
            decoration: BoxDecoration(
              color: _getBackgroundColor(),
              borderRadius: BorderRadius.circular(12),
              border: _getBorder(),
            ),
            child: Center(
              child: widget.isLoading
                  ? SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation(_getTextColor()),
                      ),
                    )
                  : Text(
                      widget.label,
                      style: AppTypography.label.copyWith(
                        color: _getTextColor(),
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }

  Color _getBackgroundColor() {
    switch (widget.variant) {
      case AppButtonVariant.primary:
        return AppColors.accent;
      case AppButtonVariant.secondary:
        return Colors.transparent;
      case AppButtonVariant.text:
        return Colors.transparent;
    }
  }

  Color _getTextColor() {
    switch (widget.variant) {
      case AppButtonVariant.primary:
        return Colors.white;
      case AppButtonVariant.secondary:
        return AppColors.textPrimary;
      case AppButtonVariant.text:
        return AppColors.textSecondary;
    }
  }

  Border? _getBorder() {
    switch (widget.variant) {
      case AppButtonVariant.primary:
        return null;
      case AppButtonVariant.secondary:
        return Border.all(color: AppColors.border, width: 1.5);
      case AppButtonVariant.text:
        return null;
    }
  }
}
