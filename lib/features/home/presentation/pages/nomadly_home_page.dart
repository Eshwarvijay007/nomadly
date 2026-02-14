// =============================================================================
// NOMADLY HOMEPAGE — Flutter Mobile Recreation (Light Theme)
// =============================================================================
// Pixel-faithful recreation of https://www.nomadly mobile homepage.
// White background, bold black typography, orange accent CTAs.
//
// FONTS: nomadly uses "Swizzy" (custom, medium weight 500) for headings and
// "PP Neue Montreal Mono" for labels/UI. Closest Google Fonts approximations:
//   pubspec.yaml:
//     google_fonts: ^6.1.0
//   Headings: GoogleFonts.spaceGrotesk() (weight 500, tight letter-spacing)
//   Mono labels: GoogleFonts.spaceMono() (weight 400, uppercase, 0.06em spacing)
// =============================================================================

import 'dart:async';
import 'package:flutter/material.dart';

// ---------------------------------------------------------------------------
// COLORS — extracted from nomadly's light mobile design
// ---------------------------------------------------------------------------
// Extracted from nomadly Webflow CSS variables (Samba theme default)
const kBg = Color(0xFFFFFFFF);           // --primary--white
const kSurface = Color(0xFFF5F5F5);      // --grey--50 (whitesmoke)
const kGrey75 = Color(0xFFE9E9E9);       // --grey--75
const kGrey150 = Color(0xFFD9D9D9);      // --grey--150
const kCardBg = Color(0xFFF5F5F5);       // pattern-background
const kText = Color(0xFF141414);          // --primary--black
const kTextSecondary = Color(0xFF737373); // --noir--grey-500
const kTextMuted = Color(0xFFA7A7A7);    // --noir--grey-300
const kGreen = Color(0xFF21935B);         // --samba--green (brand-1)
const kLightGreen = Color(0xFF30A81D);    // --samba--light-green (brand-2)
const kOrange = Color(0xFFFF8400);        // --samba--orange (brand-3)
const kYellow = Color(0xFFFECC33);        // --samba--yellow (brand-4, CTA)
const kAccent = Color(0xFFFF8400);        // orange CTA
const kBorder = Color(0xFFE9E9E9);        // grey-75
const kDarkBg = Color(0xFF141414);        // primary--black
const kGridLine = Color(0xFFE9E9E9);      // grid-paper lines

// ---------------------------------------------------------------------------
// THEME
// ---------------------------------------------------------------------------
final ThemeData nomadlyTheme = ThemeData(
  brightness: Brightness.light,
  scaffoldBackgroundColor: kBg,
  colorScheme: const ColorScheme.light(
    primary: kAccent,
    surface: kSurface,
    onPrimary: Colors.white,
    onSurface: kText,
  ),
  fontFamily: '.SF UI Display',
);

// ---------------------------------------------------------------------------
// ENTRY — uncomment to run standalone
// ---------------------------------------------------------------------------
// void main() => runApp(const NomadlyApp());
// class NomadlyApp extends StatelessWidget {
//   const NomadlyApp({super.key});
//   @override
//   Widget build(BuildContext context) => MaterialApp(
//     title: 'Nomadly', debugShowCheckedModeBanner: false,
//     theme: nomadlyTheme, home: const NomadlyHomePage(),
//   );
// }

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------
class NomadlyHomePage extends StatefulWidget {
  const NomadlyHomePage({super.key});
  @override
  State<NomadlyHomePage> createState() => _NomadlyHomePageState();
}

class _NomadlyHomePageState extends State<NomadlyHomePage>
    with SingleTickerProviderStateMixin {
  late final AnimationController _entranceCtrl;
  late final Animation<double> _fadeIn;
  late final Animation<Offset> _slideUp;

  @override
  void initState() {
    super.initState();
    _entranceCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeIn = CurvedAnimation(parent: _entranceCtrl, curve: Curves.easeOut);
    _slideUp = Tween<Offset>(
      begin: const Offset(0, 0.05),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _entranceCtrl, curve: Curves.easeOutCubic));
    _entranceCtrl.forward();
  }

  @override
  void dispose() {
    _entranceCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBg,
      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _HeaderHeroSection(fadeIn: _fadeIn, slideUp: _slideUp),
              const _SearchShowcaseSection(),
              const _TrustedBySection(),
              const _WhatIsNomadlySection(),
              const _PlatformSection(),
              const _AiToolsSection(),
              const _WorkflowSection(),
              const _NewsletterFooterSection(),
            ],
          ),
        ),
      ),
    );
  }
}

// =============================================================================
// SHARED WIDGETS
// =============================================================================

/// Fade+slide entrance wrapper with configurable delay.
class _FadeSlideIn extends StatefulWidget {
  const _FadeSlideIn({required this.child, this.delay = Duration.zero});
  final Widget child;
  final Duration delay;
  @override
  State<_FadeSlideIn> createState() => _FadeSlideInState();
}

class _FadeSlideInState extends State<_FadeSlideIn>
    with SingleTickerProviderStateMixin {
  late final AnimationController _c;
  @override
  void initState() {
    super.initState();
    _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    Future.delayed(widget.delay, () { if (mounted) _c.forward(); });
  }
  @override
  void dispose() { _c.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: CurvedAnimation(parent: _c, curve: Curves.easeOut),
      child: SlideTransition(
        position: Tween<Offset>(begin: const Offset(0, 0.03), end: Offset.zero)
            .animate(CurvedAnimation(parent: _c, curve: Curves.easeOutCubic)),
        child: widget.child,
      ),
    );
  }
}

/// Orange filled button matching nomadly CTA style.
class _AccentButton extends StatefulWidget {
  const _AccentButton({required this.label, this.onTap});
  final String label;
  final VoidCallback? onTap;
  @override
  State<_AccentButton> createState() => _AccentButtonState();
}

class _AccentButtonState extends State<_AccentButton> {
  bool _pressed = false;
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) { setState(() => _pressed = false); widget.onTap?.call(); },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.96 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          decoration: BoxDecoration(
            color: kAccent,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Text(
            widget.label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Colors.white,
              letterSpacing: 0.3,
            ),
          ),
        ),
      ),
    );
  }
}

/// Dark outlined button.
class _OutlinedButton extends StatefulWidget {
  const _OutlinedButton({required this.label, this.onTap});
  final String label;
  final VoidCallback? onTap;
  @override
  State<_OutlinedButton> createState() => _OutlinedButtonState();
}

class _OutlinedButtonState extends State<_OutlinedButton> {
  bool _pressed = false;
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) { setState(() => _pressed = false); widget.onTap?.call(); },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedScale(
        scale: _pressed ? 0.96 : 1.0,
        duration: const Duration(milliseconds: 100),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          decoration: BoxDecoration(
            color: kText,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Text(
            widget.label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Colors.white,
              letterSpacing: 0.3,
            ),
          ),
        ),
      ),
    );
  }
}

// Horizontal padding helper
double _hPad(BuildContext context) => MediaQuery.of(context).size.width * 0.05;

// =============================================================================
// SECTION 1 — HEADER + HERO
// =============================================================================
// Nav: "▶ MENU" left (PP Neue Montreal Mono, uppercase, 12px, 0.06em spacing),
// "LOG-IN" + "SIGN-UP" pill right. Hero: "Nomadly" in Swizzy ~120px on mobile,
// weight 500, line-height 86%, letter-spacing -0.02em. Subtitle row with
// "The Creative Sidekick / Made for Art directors. / Built for Storytellers."
// and a round black "SIGN UP NOW" CTA with yellow video thumbnail.

class _HeaderHeroSection extends StatelessWidget {
  const _HeaderHeroSection({required this.fadeIn, required this.slideUp});
  final Animation<double> fadeIn;
  final Animation<Offset> slideUp;

  @override
  Widget build(BuildContext context) {
    final hp = _hPad(context);
    return FadeTransition(
      opacity: fadeIn,
      child: SlideTransition(
        position: slideUp,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: hp),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              const _NavBar(),
              const SizedBox(height: 16),
              const _HeroTitle(),
              const SizedBox(height: 8),
              const _HeroSubtitleRow(),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

/// Top nav bar — matches nomadly mobile: ▶ MENU | LOG-IN | [SIGN-UP]
class _NavBar extends StatelessWidget {
  const _NavBar();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // ▶ MENU — mono font, uppercase
        GestureDetector(
          onTap: () {},
          child: Row(
            children: [
              // Orange play triangle
              CustomPaint(
                size: const Size(8, 10),
                painter: _TrianglePainter(color: kOrange),
              ),
              const SizedBox(width: 8),
              const Text(
                'MENU',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w400,
                  color: kText,
                  letterSpacing: 0.72, // 0.06em
                  fontFamily: 'Courier',
                ),
              ),
            ],
          ),
        ),
        const Spacer(),
        // LOG-IN
        GestureDetector(
          onTap: () {},
          child: const Padding(
            padding: EdgeInsets.symmetric(vertical: 6),
            child: Text(
              'LOG-IN',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w400,
                color: kText,
                letterSpacing: 0.72,
                fontFamily: 'Courier',
              ),
            ),
          ),
        ),
        const SizedBox(width: 11),
        // SIGN-UP pill — black bg, white text, border-radius 4rem
        GestureDetector(
          onTap: () {},
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
            decoration: BoxDecoration(
              color: kText,
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Text(
              'SIGN-UP',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w400,
                color: Colors.white,
                letterSpacing: 0.72,
                fontFamily: 'Courier',
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Orange play triangle for the MENU button.
class _TrianglePainter extends CustomPainter {
  const _TrianglePainter({required this.color});
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color;
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width, size.height / 2)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Giant "Nomadly" title — Swizzy font approximation.
/// At 390px mobile: ~120px, weight 500, line-height 86%, letter-spacing -0.02em.
class _HeroTitle extends StatelessWidget {
  const _HeroTitle();

  @override
  Widget build(BuildContext context) {
    final screenW = MediaQuery.of(context).size.width;
    // Responsive: scale from ~100px at 320px to ~140px at 430px
    final fontSize = (screenW * 0.38).clamp(110.0, 160.0);
    return FittedBox(
      fit: BoxFit.fitWidth,
      alignment: Alignment.centerLeft,
      child: Text(
        'Nomadly',
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: FontWeight.w900,
          color: kText,
          height: 0.86,
          letterSpacing: fontSize * -0.04,
        ),
      ),
    );
  }
}

/// Subtitle row: left text block + right round CTA badge.
/// "The Creative Sidekick" (body-s, 13px, weight 500)
/// "Made for Art directors." (body-s, with rotating word)
/// "Built for Storytellers." (body-s)
/// Right: round black pill with video circle + "SIGN UP NOW" text.
class _HeroSubtitleRow extends StatefulWidget {
  const _HeroSubtitleRow();
  @override
  State<_HeroSubtitleRow> createState() => _HeroSubtitleRowState();
}

class _HeroSubtitleRowState extends State<_HeroSubtitleRow> {
  static const _roles = ['Art directors.', 'Designers.', 'Agencies.'];
  int _roleIndex = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 2), (_) {
      setState(() => _roleIndex = (_roleIndex + 1) % _roles.length);
    });
  }

  @override
  void dispose() { _timer?.cancel(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        // Left text
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'The Creative Sidekick',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: kText,
                  height: 1.1,
                  letterSpacing: -0.32,
                ),
              ),
              const SizedBox(height: 2),
              // "Made for [rotating role]" with animated crossfade
              Row(
                children: [
                  const Text(
                    'Made for ',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: kText,
                      height: 1.1,
                      letterSpacing: -0.32,
                    ),
                  ),
                  AnimatedSwitcher(
                    duration: const Duration(milliseconds: 400),
                    transitionBuilder: (child, anim) => FadeTransition(
                      opacity: anim,
                      child: SlideTransition(
                        position: Tween<Offset>(
                          begin: const Offset(0, 0.3),
                          end: Offset.zero,
                        ).animate(anim),
                        child: child,
                      ),
                    ),
                    child: Text(
                      _roles[_roleIndex],
                      key: ValueKey(_roleIndex),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: kText,
                        height: 1.1,
                        letterSpacing: -0.32,
                        decoration: TextDecoration.underline,
                        decorationColor: kText,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              const Text(
                'Built for Storytellers.',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: kText,
                  height: 1.1,
                  letterSpacing: -0.32,
                ),
              ),
            ],
          ),
        ),
        // Right: round CTA badge — black pill with yellow circle + text
        GestureDetector(
          onTap: () {},
          child: Container(
            padding: const EdgeInsets.fromLTRB(4, 4, 12, 4),
            decoration: BoxDecoration(
              color: kText,
              borderRadius: BorderRadius.circular(28),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Circular image thumbnail
                Container(
                  width: 40,
                  height: 40,
                  decoration: const BoxDecoration(
                    color: Color(0xFFD4A574),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Icon(Icons.person, size: 20, color: Color(0xFF8B6914)),
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  'SIGN UP NOW',
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w400,
                    color: Colors.white,
                    letterSpacing: 0.54,
                    fontFamily: 'Courier',
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// =============================================================================
// SECTION 1B — SEARCH + IMAGE GRID SHOWCASE
// =============================================================================
// Full-width grid-paper area with scattered image thumbnails above and below
// a centered pill search bar. Matches nomadly's "reflections on the water"
// search demo with images at various sizes/positions on a grid background.

class _SearchShowcaseSection extends StatelessWidget {
  const _SearchShowcaseSection();

  @override
  Widget build(BuildContext context) {
    final w = MediaQuery.of(context).size.width;
    return _FadeSlideIn(
      delay: const Duration(milliseconds: 300),
      child: Container(
        width: double.infinity,
        color: kSurface,
        child: CustomPaint(
          painter: _GridPainter(),
          child: Column(
            children: [
              // Upper scattered images — small, organic placement
              SizedBox(
                height: 180,
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    // Top-left (bleeds off edge)
                    Positioned(left: -30, top: 15, child: _ImgPlaceholder(w: 70, h: 55, color: const Color(0xFF1A2F1A))),
                    // Center — slightly larger, rounded
                    Positioned(left: w * 0.33, top: 50, child: _ImgPlaceholder(w: 80, h: 70, radius: 10, color: const Color(0xFF0D2137))),
                    // Top-right (bleeds off edge)
                    Positioned(right: -15, top: 8, child: _ImgPlaceholder(w: 85, h: 60, color: const Color(0xFF2A3D2A))),
                  ],
                ),
              ),
              // Search bar — white bg, border, pill shape
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Container(
                  height: 52,
                  decoration: BoxDecoration(
                    color: kBg,
                    borderRadius: BorderRadius.circular(100),
                    border: Border.all(color: kGrey75, width: 1),
                  ),
                  padding: const EdgeInsets.only(left: 20, right: 4),
                  child: Row(
                    children: [
                      const Expanded(
                        child: Text(
                          'REFLECTIONS ON THE WATER',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w400,
                            color: kText,
                            letterSpacing: 0.6,
                            fontFamily: 'Courier',
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: kBg,
                          borderRadius: BorderRadius.circular(100),
                          border: Border.all(color: kGrey75, width: 1),
                        ),
                        child: const Text(
                          'SEARCH',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w400,
                            color: kText,
                            letterSpacing: 0.6,
                            fontFamily: 'Courier',
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // Lower scattered images
              SizedBox(
                height: 200,
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    // Bottom-left (bleeds off)
                    Positioned(left: -10, top: 15, child: _ImgPlaceholder(w: 100, h: 120, color: const Color(0xFF1A2A3A))),
                    // Bottom-right small
                    Positioned(right: 15, top: 20, child: _ImgPlaceholder(w: 65, h: 50, color: const Color(0xFF0A2030))),
                    // Bottom-center
                    Positioned(left: w * 0.28, bottom: 15, child: _ImgPlaceholder(w: 90, h: 55, color: const Color(0xFF3A2020))),
                  ],
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

/// Image placeholder with dark tint to simulate water/nature photos.
class _ImgPlaceholder extends StatelessWidget {
  const _ImgPlaceholder({required this.w, required this.h, this.radius = 4, required this.color});
  final double w, h, radius;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: w, height: h,
      decoration: BoxDecoration(
        color: color.withOpacity(0.7),
        borderRadius: BorderRadius.circular(radius),
      ),
    );
  }
}

// =============================================================================
// SECTION 2 — TRUSTED BY THE BRANDS SHAPING CULTURE
// =============================================================================
// Title + horizontally scrolling brand logo strip (text placeholders styled
// like the minimal wordmarks on nomadly).

class _TrustedBySection extends StatelessWidget {
  const _TrustedBySection();

  static const _row1 = [
    'Anomaly', 'Zalando', 'BETC', 'Fortiche', 'Canada', 'Logitech',
    'Partizan', 'Hermès', 'Expedia', 'Caviar', 'Chanel', 'Droga5',
  ];
  static const _row2 = [
    'Buzzman', 'AMI', 'David Martin', 'Skydance', 'DDB', 'Habbar',
    'Dentsu', 'Havas', 'OpenAI', 'Jacquemus', 'Ogilvy', 'Gucci',
  ];
  static const _row3 = [
    'Plarium', 'Pretty Bird', 'Publicis', 'Webedia', 'The Good Co',
    'AKQA', 'Wieden+Kennedy', 'Accenture', 'RIMOWA', 'Jean Paul Gaultier',
  ];

  @override
  Widget build(BuildContext context) {
    final hp = _hPad(context);
    return _FadeSlideIn(
      delay: const Duration(milliseconds: 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: const Text(
              'TRUSTED BY THE BRANDS SHAPING CULTURE',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w400,
                color: kTextSecondary,
                letterSpacing: 0.66,
                fontFamily: 'Courier',
              ),
            ),
          ),
          const SizedBox(height: 32),
          _LogoRow(brands: _row1),
          const SizedBox(height: 8),
          _LogoRow(brands: _row2, reverse: true),
          const SizedBox(height: 8),
          _LogoRow(brands: _row3),
          const SizedBox(height: 48),
        ],
      ),
    );
  }
}

/// Auto-scrolling row of brand wordmarks.
class _LogoRow extends StatefulWidget {
  const _LogoRow({required this.brands, this.reverse = false});
  final List<String> brands;
  final bool reverse;
  @override
  State<_LogoRow> createState() => _LogoRowState();
}

class _LogoRowState extends State<_LogoRow> {
  late final ScrollController _sc;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _sc = ScrollController();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.reverse && _sc.hasClients) {
        _sc.jumpTo(_sc.position.maxScrollExtent);
      }
      _startScroll();
    });
  }

  void _startScroll() {
    _timer = Timer.periodic(const Duration(milliseconds: 30), (_) {
      if (!_sc.hasClients) return;
      final next = _sc.offset + (widget.reverse ? -0.4 : 0.4);
      if (next >= _sc.position.maxScrollExtent || next <= 0) {
        _sc.jumpTo(widget.reverse ? _sc.position.maxScrollExtent : 0);
      } else {
        _sc.jumpTo(next);
      }
    });
  }

  @override
  void dispose() { _timer?.cancel(); _sc.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final items = [...widget.brands, ...widget.brands];
    return SizedBox(
      height: 36,
      child: ListView.separated(
        controller: _sc,
        scrollDirection: Axis.horizontal,
        physics: const NeverScrollableScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 32),
        itemBuilder: (_, i) => Center(
          child: Text(
            items[i],
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: kText.withOpacity(0.7),
              letterSpacing: -0.3,
            ),
          ),
        ),
      ),
    );
  }
}

// =============================================================================
// SECTION 3 — WHAT IS NOMADLY + STATS
// =============================================================================
// "What is Nomadly" label, "A new language of visual expression." heading,
// image grid, then floating pill-shaped stat badges (orange filled for large
// stats, dark outlined for smaller ones), and "Database" description.

class _WhatIsNomadlySection extends StatelessWidget {
  const _WhatIsNomadlySection();

  @override
  Widget build(BuildContext context) {
    final hp = _hPad(context);
    return _FadeSlideIn(
      delay: const Duration(milliseconds: 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image collage placeholder
          Container(
            width: double.infinity,
            height: 200,
            margin: EdgeInsets.symmetric(horizontal: hp),
            decoration: BoxDecoration(
              color: kCardBg,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(
              child: Icon(Icons.collections_outlined, size: 40, color: kBorder),
            ),
          ),
          const SizedBox(height: 20),
          // Stat pills — horizontally scrollable, matching the orange/dark pill style
          SizedBox(
            height: 42,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: EdgeInsets.symmetric(horizontal: hp),
              children: const [
                _StatPill(label: '1.5M stills', filled: true),
                SizedBox(width: 8),
                _StatPill(label: '15K ads', filled: false),
                SizedBox(width: 8),
                _StatPill(label: '400K videos', filled: true),
                SizedBox(width: 8),
                _StatPill(label: '5.8K movies', filled: false),
                SizedBox(width: 8),
                _StatPill(label: '150K animations', filled: true),
                SizedBox(width: 8),
                _StatPill(label: '5.5K music videos', filled: false),
                SizedBox(width: 8),
                _StatPill(label: '2K TV series', filled: false),
              ],
            ),
          ),
          const SizedBox(height: 32),
          // "What is Nomadly" label + heading
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Small diamond icon
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: const Color(0xFF2D8B5E),
                    borderRadius: BorderRadius.circular(6),
                    // Rotated diamond shape
                  ),
                  transform: Matrix4.rotationZ(0.785), // 45 degrees
                  transformAlignment: Alignment.center,
                ),
                const SizedBox(height: 20),
                const Text(
                  'What is Nomadly',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: kTextSecondary,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'A new language\nof visual\nexpression.',
                  style: TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w800,
                    color: kText,
                    height: 1.1,
                    letterSpacing: -1,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Built on the most complete platform for storytelling.',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w400,
                    color: kTextSecondary,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 24),
                // Database card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: kSurface,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Database',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: kText,
                        ),
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Dive into the most complete visual library out there, curated to help you discover the references that shape your creative direction.',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          color: kTextSecondary,
                          height: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 48),
        ],
      ),
    );
  }
}

/// Pill-shaped stat badge — orange filled or dark outlined.
class _StatPill extends StatelessWidget {
  const _StatPill({required this.label, this.filled = true});
  final String label;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
      decoration: BoxDecoration(
        color: filled ? kAccent : Colors.transparent,
        borderRadius: BorderRadius.circular(24),
        border: filled ? null : Border.all(color: kText, width: 1.5),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: filled ? Colors.white : kText,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}

// =============================================================================
// SECTION 4 — PLATFORM ("Find your influences")
// =============================================================================
// "Find your influences" heading, "THE PLATFORM" label, search showcase with
// "Nomadly" + query + image grid, then "Search Beautifully. Create Purposefully."
// text block with "learn about pricing" CTA.

class _PlatformSection extends StatelessWidget {
  const _PlatformSection();

  @override
  Widget build(BuildContext context) {
    final hp = _hPad(context);
    return _FadeSlideIn(
      delay: const Duration(milliseconds: 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Find your\ninfluences',
                  style: TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w800,
                    color: kText,
                    height: 1.1,
                    letterSpacing: -1,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'THE PLATFORM',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: kTextSecondary,
                    letterSpacing: 2.5,
                    fontFamily: 'Courier',
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          // Search showcase card with query example
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: Container(
              decoration: BoxDecoration(
                color: kSurface,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  // Mini search bar inside card
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Container(
                      height: 40,
                      decoration: BoxDecoration(
                        color: kBg,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      child: Row(
                        children: [
                          const Text(
                            'Nomadly',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w900,
                              color: kText,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'Dystopian futures',
                              style: TextStyle(
                                fontSize: 12,
                                color: kTextSecondary,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                            decoration: BoxDecoration(
                              color: kBorder,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text('⌘/', style: TextStyle(fontSize: 10, color: kTextSecondary)),
                          ),
                        ],
                      ),
                    ),
                  ),
                  // "SHOWING" label
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'SHOWING 20 ▼ OF 11,286',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w500,
                          color: kTextMuted,
                          letterSpacing: 1.2,
                          fontFamily: 'Courier',
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Image grid placeholder
                  Container(
                    height: 120,
                    margin: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: kCardBg,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Center(
                      child: Icon(Icons.grid_view_rounded, size: 32, color: kBorder),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),
          // "Search Beautifully. Create Purposefully."
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Search\nBeautifully.',
                  style: TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w800,
                    color: kText,
                    height: 1.1,
                    letterSpacing: -1,
                  ),
                ),
                const Text(
                  'Create\nPurposefully.',
                  style: TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w800,
                    color: kTextSecondary,
                    height: 1.1,
                    letterSpacing: -1,
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'For those who sketch with references, speak in moodboards, and shape ideas frame by frame.',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w400,
                    color: kTextSecondary,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 20),
                _OutlinedButton(label: 'learn about pricing', onTap: () {}),
              ],
            ),
          ),
          const SizedBox(height: 56),
        ],
      ),
    );
  }
}

// =============================================================================
// SECTION 5 — AI TOOLS
// =============================================================================
// Green accent diamond icon, "AI Tools" label, "Tools to Unlock Creativity."
// heading, dark circular image container with green accent shapes, then
// "Generate & Edit" text, grid-paper "COMBINE IDEAS" mockup card, and
// "Create a magic board" CTA.

class _AiToolsSection extends StatelessWidget {
  const _AiToolsSection();

  @override
  Widget build(BuildContext context) {
    final hp = _hPad(context);
    return _FadeSlideIn(
      delay: const Duration(milliseconds: 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Green diamond icon
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: const Color(0xFF2D8B5E),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  transform: Matrix4.rotationZ(0.785),
                  transformAlignment: Alignment.center,
                ),
                const SizedBox(height: 16),
                const Text(
                  'AI Tools',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: kTextSecondary,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Tools to\nUnlock\nCreativity.',
                  style: TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w800,
                    color: kText,
                    height: 1.1,
                    letterSpacing: -1,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Trained for style, tuned for creators.',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w400,
                    color: kTextSecondary,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),
          // Dark circular image showcase (green accent bg)
          Container(
            width: double.infinity,
            height: 280,
            color: const Color(0xFF2ECC40),
            child: Center(
              child: Container(
                width: 220,
                height: 220,
                decoration: const BoxDecoration(
                  color: kDarkBg,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Container(
                    width: 120,
                    height: 80,
                    decoration: BoxDecoration(
                      color: kCardBg,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Center(
                      child: Icon(Icons.image_outlined, size: 28, color: kTextMuted),
                    ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 28),
          // "Generate & Edit" section
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Generate & Edit',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: kText,
                    height: 1.15,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'An AI built for creators, helping you to transform ideas into artistic visions.',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w400,
                    color: kTextSecondary,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Combine ideas',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w400,
                    color: kTextSecondary,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          // Grid-paper "COMBINE IDEAS" mockup card
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: _GridPaperCard(
              headerLabel: 'COMBINE IDEAS',
              height: 200,
              child: Stack(
                children: [
                  // Decorative shapes (yellow + gray like the screenshot)
                  Positioned(
                    left: 20,
                    bottom: 40,
                    child: Transform.rotate(
                      angle: -0.2,
                      child: Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: const Color(0xFFFDE68A),
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    right: 60,
                    bottom: 30,
                    child: Transform.rotate(
                      angle: 0.3,
                      child: Container(
                        width: 70,
                        height: 70,
                        decoration: BoxDecoration(
                          color: const Color(0xFFE5E5E5),
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          // CTA
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: _AccentButton(label: 'Create a magic board', onTap: () {}),
          ),
          const SizedBox(height: 56),
        ],
      ),
    );
  }
}

/// Grid-paper styled card (like the mockup cards on nomadly with dot grid
/// header bar showing "● ● ●  LABEL  ●").
class _GridPaperCard extends StatelessWidget {
  const _GridPaperCard({
    required this.headerLabel,
    required this.child,
    this.height = 180,
  });
  final String headerLabel;
  final Widget child;
  final double height;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: kBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: kBorder, width: 1),
      ),
      child: Column(
        children: [
          // Header bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: kBorder, width: 1)),
            ),
            child: Row(
              children: [
                // Three dots
                Row(
                  children: List.generate(3, (_) => Padding(
                    padding: const EdgeInsets.only(right: 4),
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: kBorder,
                        shape: BoxShape.circle,
                      ),
                    ),
                  )),
                ),
                const Spacer(),
                Text(
                  headerLabel,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: kTextSecondary,
                    letterSpacing: 2,
                    fontFamily: 'Courier',
                  ),
                ),
                const Spacer(),
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: kText,
                    shape: BoxShape.circle,
                  ),
                ),
              ],
            ),
          ),
          // Grid content area
          SizedBox(
            height: height,
            child: CustomPaint(
              painter: _GridPainter(),
              child: child,
            ),
          ),
        ],
      ),
    );
  }
}

/// Paints a subtle grid-paper pattern.
class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFD0D0D0)
      ..strokeWidth = 1.0;
    const step = 32.0;
    for (double x = 0; x <= size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y <= size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// =============================================================================
// SECTION 6 — WORKFLOW (Preset / Shape Ideas Together / Save-Collaborate-Share)
// =============================================================================
// "Preset Workflow" label, "Shape Ideas Together" heading, dark circular
// collaboration image, grid-paper mockup cards for SAVE / COLLABORATE / SHARE,
// and share UI mockup with user avatars.

class _WorkflowSection extends StatelessWidget {
  const _WorkflowSection();

  @override
  Widget build(BuildContext context) {
    final hp = _hPad(context);
    return _FadeSlideIn(
      delay: const Duration(milliseconds: 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Preset Workflow',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: kTextSecondary,
                    letterSpacing: 0.5,
                  ),
                ),
                SizedBox(height: 12),
                Text(
                  'Shape Ideas\nTogether',
                  style: TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w800,
                    color: kText,
                    height: 1.1,
                    letterSpacing: -1,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'Accelerate your projects and collaborate, all from one place.',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w400,
                    color: kTextSecondary,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          // "Save Collaborate & Share" heading
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: const Text(
              'Save  Collaborate\n& Share',
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: kText,
                height: 1.15,
                letterSpacing: -0.5,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: const Text(
              'Collect the images you love in boards and share them with your team, clients, or the world.',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w400,
                color: kTextSecondary,
                height: 1.5,
              ),
            ),
          ),
          const SizedBox(height: 20),
          // Grid-paper cards: SAVE, COLLABORATE, SHARE
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: _GridPaperCard(
              headerLabel: 'SAVE',
              height: 140,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: kSurface,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: kBorder),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.bookmark_outline, size: 14, color: kTextSecondary),
                      SizedBox(width: 6),
                      Text(
                        'SAVE TO BOARD',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: kTextSecondary,
                          letterSpacing: 1,
                          fontFamily: 'Courier',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: _GridPaperCard(
              headerLabel: 'COLLABORATE',
              height: 180,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Image placeholders
                    Row(
                      children: [
                        Expanded(
                          child: Container(
                            height: 80,
                            decoration: BoxDecoration(
                              color: kCardBg,
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Container(
                            height: 80,
                            decoration: BoxDecoration(
                              color: kCardBg,
                              borderRadius: BorderRadius.circular(6),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Labels
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: kSurface,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Text('SAVE', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: kTextSecondary, letterSpacing: 1)),
                              SizedBox(width: 4),
                              Icon(Icons.bookmark, size: 10, color: kTextSecondary),
                            ],
                          ),
                        ),
                        const Spacer(),
                        const Text('FEMALES', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: kTextSecondary, letterSpacing: 1)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: kSurface,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: const [
                              Text('SAVED TO "THE LOOK"', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: kTextSecondary, letterSpacing: 0.5)),
                              SizedBox(width: 4),
                              Icon(Icons.check_circle, size: 10, color: Color(0xFF2D8B5E)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Share card with collaboration UI mockup
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: kSurface,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Share board mockup
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: kBg,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: kBorder),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Share board with the client',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: kText,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: const [
                            Icon(Icons.mail_outline, size: 14, color: kTextMuted),
                            SizedBox(width: 6),
                            Text(
                              'Invite by email',
                              style: TextStyle(fontSize: 13, color: kTextMuted),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        // Email input mockup
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          decoration: BoxDecoration(
                            color: kSurface,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Expanded(
                                child: Text(
                                  'olivia.rose21@email.com',
                                  style: TextStyle(fontSize: 13, color: kText),
                                ),
                              ),
                              Container(
                                width: 28,
                                height: 28,
                                decoration: const BoxDecoration(
                                  color: kAccent,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.check, size: 16, color: Colors.white),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  // User avatar chips
                  Row(
                    children: [
                      _UserChip(name: 'Olivia', color: const Color(0xFF2ECC40)),
                      const SizedBox(width: 8),
                      _UserChip(name: 'Noah', color: const Color(0xFF3B82F6)),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 56),
        ],
      ),
    );
  }
}

class _UserChip extends StatelessWidget {
  const _UserChip({required this.name, required this.color});
  final String name;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        name,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
    );
  }
}

// =============================================================================
// SECTION 7 — NEWSLETTER + FOOTER
// =============================================================================
// Repeated "Made for Designers." rotating text, newsletter email input with
// subscribe button, "thank you." feedback, then footer with company/social
// links and copyright.

class _NewsletterFooterSection extends StatelessWidget {
  const _NewsletterFooterSection();

  @override
  Widget build(BuildContext context) {
    final hp = _hPad(context);
    return _FadeSlideIn(
      delay: const Duration(milliseconds: 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Repeated hero text
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: const [
                SizedBox(height: 16),
                Text(
                  'Designers.',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: kText,
                    letterSpacing: -0.5,
                  ),
                ),
                SizedBox(height: 48),
              ],
            ),
          ),
          // Newsletter
          Padding(
            padding: EdgeInsets.symmetric(horizontal: hp),
            child: const _NewsletterInput(),
          ),
          const SizedBox(height: 56),
          // Footer
          Container(
            color: kSurface,
            padding: EdgeInsets.symmetric(horizontal: hp, vertical: 32),
            child: const _Footer(),
          ),
        ],
      ),
    );
  }
}

class _NewsletterInput extends StatefulWidget {
  const _NewsletterInput();
  @override
  State<_NewsletterInput> createState() => _NewsletterInputState();
}

class _NewsletterInputState extends State<_NewsletterInput> {
  final _ctrl = TextEditingController();
  bool _submitted = false;

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return AnimatedCrossFade(
      duration: const Duration(milliseconds: 400),
      crossFadeState: _submitted ? CrossFadeState.showSecond : CrossFadeState.showFirst,
      firstChild: Container(
        height: 48,
        decoration: BoxDecoration(
          color: kSurface,
          borderRadius: BorderRadius.circular(24),
        ),
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _ctrl,
                style: const TextStyle(
                  fontSize: 11,
                  color: kText,
                  letterSpacing: 1.5,
                  fontFamily: 'Courier',
                ),
                decoration: InputDecoration(
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20),
                  hintText: 'ENTER YOUR EMAIL ADDRESS',
                  hintStyle: TextStyle(
                    fontSize: 11,
                    color: kTextMuted,
                    letterSpacing: 1.5,
                    fontFamily: 'Courier',
                    fontWeight: FontWeight.w500,
                  ),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
            ),
            GestureDetector(
              onTap: () {
                if (_ctrl.text.isNotEmpty) setState(() => _submitted = true);
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  color: kText,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: const Text(
                  'SUBSCRIBE',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    letterSpacing: 1.5,
                    fontFamily: 'Courier',
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      secondChild: const Padding(
        padding: EdgeInsets.symmetric(vertical: 12),
        child: Text(
          'thank you.',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            fontStyle: FontStyle.italic,
            color: kTextSecondary,
          ),
        ),
      ),
    );
  }
}

class _Footer extends StatelessWidget {
  const _Footer();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Company
        const Text(
          'company',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: kTextSecondary,
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 12),
        _fLink('App.nomadly'),
        _fLink('Pricing'),
        _fLink('Blog'),
        _fLink('Privacy Policy'),
        _fLink('Terms & Conditions'),
        const SizedBox(height: 24),
        // Social
        const Text(
          'social',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: kTextSecondary,
            letterSpacing: 1,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 20,
          runSpacing: 8,
          children: [
            _fLink('Instagram'),
            _fLink('X'),
            _fLink('LinkedIn'),
            _fLink('TikTok'),
          ],
        ),
        const SizedBox(height: 28),
        Text(
          '© Nomadly, all rights reserved, 2025',
          style: TextStyle(
            fontSize: 11,
            color: kTextMuted,
            letterSpacing: 0.3,
          ),
        ),
      ],
    );
  }

  static Widget _fLink(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: GestureDetector(
        onTap: () {},
        child: Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            color: kText,
            fontWeight: FontWeight.w400,
          ),
        ),
      ),
    );
  }
}
