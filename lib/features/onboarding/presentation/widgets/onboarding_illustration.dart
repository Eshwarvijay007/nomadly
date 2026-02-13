import 'package:flutter/material.dart';
import 'package:nomadly/core/constants/app_colors.dart';

class DiscoverIllustration extends StatelessWidget {
  const DiscoverIllustration({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Background card
          Positioned(
            left: 40,
            top: 40,
            child: _buildCard(
              width: 160,
              height: 200,
              color: AppColors.surfaceAlt,
              rotation: -0.08,
            ),
          ),
          // Middle card
          Positioned(
            right: 50,
            top: 20,
            child: _buildCard(
              width: 140,
              height: 180,
              color: AppColors.accentLight,
              rotation: 0.05,
            ),
          ),
          // Front card
          _buildCard(
            width: 180,
            height: 220,
            color: AppColors.surface,
            rotation: 0,
            showContent: true,
          ),
        ],
      ),
    );
  }

  Widget _buildCard({
    required double width,
    required double height,
    required Color color,
    required double rotation,
    bool showContent = false,
  }) {
    return Transform.rotate(
      angle: rotation,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border, width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 20,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: showContent
            ? Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppColors.accentSecondary,
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Container(
                      width: double.infinity,
                      height: 12,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceAlt,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      width: 100,
                      height: 12,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceAlt,
                        borderRadius: BorderRadius.circular(6),
                      ),
                    ),
                    const Spacer(),
                    SizedBox(
                      height: 24,
                      child: Stack(
                        children: List.generate(
                          3,
                          (index) => Positioned(
                            left: index * 16.0,
                            child: Container(
                              width: 24,
                              height: 24,
                              decoration: BoxDecoration(
                                color: AppColors.accent.withOpacity(0.2 + index * 0.2),
                                shape: BoxShape.circle,
                                border: Border.all(color: AppColors.surface, width: 2),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              )
            : null,
      ),
    );
  }
}

class CuratorsIllustration extends StatelessWidget {
  const CuratorsIllustration({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: 280,
        height: 280,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Curator cards arranged in a staggered layout
            Positioned(
              left: 0,
              top: 60,
              child: _buildCuratorCard(
                avatarColor: AppColors.accent,
                cardCount: 3,
              ),
            ),
            Positioned(
              right: 0,
              top: 20,
              child: _buildCuratorCard(
                avatarColor: AppColors.accentSecondary,
                cardCount: 5,
              ),
            ),
            Positioned(
              left: 60,
              bottom: 20,
              child: _buildCuratorCard(
                avatarColor: const Color(0xFFE879F9),
                cardCount: 4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCuratorCard({
    required Color avatarColor,
    required int cardCount,
  }) {
    return Container(
      width: 140,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: avatarColor.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Container(
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: avatarColor,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Container(
            width: 60,
            height: 10,
            decoration: BoxDecoration(
              color: AppColors.surfaceAlt,
              borderRadius: BorderRadius.circular(5),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceAlt,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '$cardCount lists',
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class SaveIllustration extends StatelessWidget {
  const SaveIllustration({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: 260,
        height: 260,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Grid of saved items
            ...List.generate(6, (index) {
              final row = index ~/ 3;
              final col = index % 3;
              return Positioned(
                left: col * 85.0,
                top: row * 100.0 + 40,
                child: _buildSavedItem(
                  index: index,
                  isBookmarked: index < 4,
                ),
              );
            }),
            // Floating bookmark icon
            Positioned(
              right: 20,
              top: 0,
              child: Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: AppColors.accent,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.accent.withOpacity(0.3),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.bookmark_rounded,
                  color: Colors.white,
                  size: 28,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSavedItem({
    required int index,
    required bool isBookmarked,
  }) {
    final colors = [
      AppColors.accentLight,
      AppColors.accentSecondary,
      const Color(0xFFFCE7F3),
      AppColors.surfaceAlt,
      const Color(0xFFD1FAE5),
      AppColors.border,
    ];

    return Container(
      width: 75,
      height: 90,
      decoration: BoxDecoration(
        color: colors[index % colors.length],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border, width: 1),
      ),
      child: Stack(
        children: [
          if (isBookmarked)
            Positioned(
              right: 6,
              top: 6,
              child: Icon(
                Icons.bookmark,
                size: 16,
                color: AppColors.accent.withOpacity(0.6),
              ),
            ),
          Positioned(
            left: 8,
            bottom: 8,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 40,
                  height: 6,
                  decoration: BoxDecoration(
                    color: AppColors.textPrimary.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  width: 25,
                  height: 6,
                  decoration: BoxDecoration(
                    color: AppColors.textPrimary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
