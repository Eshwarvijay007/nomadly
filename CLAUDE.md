# CLAUDE.md — Flutter Application Development Guide

> **Role**: You are a Senior Flutter Engineer. Follow these instructions precisely when building, modifying, or reviewing any part of this application. Every decision must be intentional, testable, and production-grade.

---

## 1. PROJECT ARCHITECTURE

### 1.1 Directory Structure (Feature-First)

```
lib/
├── app/
│   ├── app.dart                    # MaterialApp / root widget
│   ├── router.dart                 # GoRouter configuration
│   └── di.dart                     # Dependency injection setup
│
├── core/
│   ├── constants/
│   │   ├── app_colors.dart         # Single source of truth for colors
│   │   ├── app_typography.dart     # TextStyles only
│   │   ├── app_spacing.dart        # EdgeInsets, gaps, paddings
│   │   ├── app_durations.dart      # Animation durations
│   │   └── app_strings.dart        # Static strings (non-i18n)
│   │
│   ├── theme/
│   │   ├── app_theme.dart          # ThemeData factory
│   │   └── theme_extensions.dart   # Custom theme extensions
│   │
│   ├── network/
│   │   ├── api_client.dart         # Dio instance + interceptors
│   │   ├── api_endpoints.dart      # Endpoint constants
│   │   ├── api_exceptions.dart     # Typed exceptions
│   │   └── network_info.dart       # Connectivity checker
│   │
│   ├── errors/
│   │   ├── failures.dart           # Failure sealed classes
│   │   └── error_handler.dart      # Global error mapping
│   │
│   ├── utils/
│   │   ├── extensions/             # Dart extensions
│   │   ├── validators.dart         # Form validators
│   │   ├── logger.dart             # Logging abstraction
│   │   └── debouncer.dart          # Input debouncing
│   │
│   └── widgets/                    # Shared atomic widgets
│       ├── app_button.dart
│       ├── app_text_field.dart
│       ├── app_loading.dart
│       ├── app_error_view.dart
│       └── app_scaffold.dart
│
├── features/
│   └── <feature_name>/
│       ├── data/
│       │   ├── models/             # JSON-serializable DTOs
│       │   ├── datasources/        # Remote + local data sources
│       │   └── repositories/       # Repository implementations
│       │
│       ├── domain/
│       │   ├── entities/           # Pure Dart objects
│       │   ├── repositories/       # Abstract repository contracts
│       │   └── usecases/           # Single-responsibility use cases
│       │
│       └── presentation/
│           ├── bloc/               # OR providers/ OR controllers/
│           ├── pages/              # Full-screen widgets
│           └── widgets/            # Feature-scoped widgets
│
├── l10n/                           # Localization ARB files
│   ├── app_en.arb
│   └── app_<locale>.arb
│
└── main.dart                       # Entry point — minimal
```

### 1.2 Architecture Rules

- **Clean Architecture**: Enforce strict dependency flow → `presentation → domain ← data`
- **Domain layer has ZERO Flutter imports**. Only pure Dart.
- **Data models and domain entities are separate classes**. Never expose JSON annotations to the domain.
- **One use case = one public method** (`call()`). Use cases are injectable classes.
- **Repository pattern is mandatory**. Abstract contract in `domain/`, concrete in `data/`.
- **Never import a feature into another feature directly**. Communicate via shared domain contracts or an event bus.

---

## 2. STATE MANAGEMENT

### 2.1 Recommended: flutter_bloc (Cubit for simple, Bloc for event-driven)

```dart
// ✅ CORRECT: Sealed states with exhaustive pattern matching
sealed class AuthState {
  const AuthState();
}

final class AuthInitial extends AuthState {
  const AuthInitial();
}

final class AuthLoading extends AuthState {
  const AuthLoading();
}

final class AuthAuthenticated extends AuthState {
  final User user;
  const AuthAuthenticated(this.user);
}

final class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
}
```

### 2.2 State Management Rules

- **Use `sealed class` for states** — enables exhaustive switch/when pattern matching.
- **Bloc events are also sealed classes**. Never use strings or enums as events.
- **No business logic in widgets**. Widgets read state; blocs/cubits process logic.
- **Use `BlocListener` for side effects** (navigation, snackbars, dialogs). Never trigger side effects in `BlocBuilder`.
- **Bloc-to-bloc communication**: Use `BlocListener` or stream subscriptions. Never inject one bloc into another.
- **Dispose properly**: `BlocProvider` handles lifecycle. Never manually close blocs provided via `BlocProvider`.

---

## 3. MINIMALISTIC DESIGN SYSTEM

### 3.1 Design Philosophy

> Less interface, more content. Every pixel must earn its place.

**Core Principles:**
- **Whitespace is a feature** — generous padding, not decoration.
- **One primary action per screen** — reduce cognitive load.
- **Flat hierarchy** — avoid nested cards, shadows-on-shadows, or visual noise.
- **Restrained color palette** — 1 accent color, 2 neutrals, 1 semantic set (error/success/warning).
- **Typography does the heavy lifting** — size and weight create hierarchy, not color or borders.

### 3.2 Color System

```dart
abstract final class AppColors {
  // Surface
  static const background    = Color(0xFFFAFAFA);  // Near-white
  static const surface       = Color(0xFFFFFFFF);  // Pure white
  static const surfaceAlt    = Color(0xFFF5F5F5);  // Subtle distinction

  // Content
  static const textPrimary   = Color(0xFF1A1A1A);  // Near-black — body text
  static const textSecondary = Color(0xFF6B7280);  // Muted — captions
  static const textTertiary  = Color(0xFF9CA3AF);  // Disabled / hints

  // Accent — ONE accent color
  static const accent        = Color(0xFF2563EB);  // Confident blue
  static const accentLight   = Color(0xFFDBEAFE);  // Accent tint for backgrounds

  // Semantic
  static const error         = Color(0xFFDC2626);
  static const success       = Color(0xFF16A34A);
  static const warning       = Color(0xFFF59E0B);

  // Borders & Dividers
  static const border        = Color(0xFFE5E7EB);
  static const divider       = Color(0xFFF3F4F6);

  // Dark mode equivalents — define symmetrically
  static const darkBackground   = Color(0xFF0F0F0F);
  static const darkSurface      = Color(0xFF1A1A1A);
  static const darkTextPrimary  = Color(0xFFF9FAFB);
  static const darkTextSecondary = Color(0xFF9CA3AF);
}
```

### 3.3 Typography Scale

```dart
abstract final class AppTypography {
  static const _fontFamily = 'Inter'; // or 'SF Pro', 'Plus Jakarta Sans'

  // Display — Hero sections only
  static const displayLarge = TextStyle(
    fontFamily: _fontFamily,
    fontSize: 32,
    fontWeight: FontWeight.w700,
    height: 1.2,
    letterSpacing: -0.5,
    color: AppColors.textPrimary,
  );

  // Headings
  static const headingLarge = TextStyle(
    fontFamily: _fontFamily, fontSize: 24, fontWeight: FontWeight.w600, height: 1.3,
    letterSpacing: -0.3, color: AppColors.textPrimary,
  );

  static const headingMedium = TextStyle(
    fontFamily: _fontFamily, fontSize: 20, fontWeight: FontWeight.w600, height: 1.35,
    color: AppColors.textPrimary,
  );

  static const headingSmall = TextStyle(
    fontFamily: _fontFamily, fontSize: 16, fontWeight: FontWeight.w600, height: 1.4,
    color: AppColors.textPrimary,
  );

  // Body
  static const bodyLarge = TextStyle(
    fontFamily: _fontFamily, fontSize: 16, fontWeight: FontWeight.w400, height: 1.5,
    color: AppColors.textPrimary,
  );

  static const bodyMedium = TextStyle(
    fontFamily: _fontFamily, fontSize: 14, fontWeight: FontWeight.w400, height: 1.5,
    color: AppColors.textPrimary,
  );

  // Caption
  static const caption = TextStyle(
    fontFamily: _fontFamily, fontSize: 12, fontWeight: FontWeight.w400, height: 1.4,
    color: AppColors.textSecondary,
  );

  // Label — Buttons, chips, tabs
  static const label = TextStyle(
    fontFamily: _fontFamily, fontSize: 14, fontWeight: FontWeight.w500, height: 1.4,
    letterSpacing: 0.1,
  );
}
```

### 3.4 Spacing System (8pt Grid)

```dart
abstract final class AppSpacing {
  static const double xs   = 4;
  static const double sm   = 8;
  static const double md   = 16;
  static const double lg   = 24;
  static const double xl   = 32;
  static const double xxl  = 48;
  static const double xxxl = 64;

  // Predefined SizedBoxes for gaps (avoid repeated allocations)
  static const gapXs   = SizedBox(height: xs, width: xs);
  static const gapSm   = SizedBox(height: sm, width: sm);
  static const gapMd   = SizedBox(height: md, width: md);
  static const gapLg   = SizedBox(height: lg, width: lg);
  static const gapXl   = SizedBox(height: xl, width: xl);
  static const gapXxl  = SizedBox(height: xxl, width: xxl);

  // Screen-level padding
  static const screenPadding = EdgeInsets.symmetric(horizontal: 20, vertical: 16);
  static const cardPadding   = EdgeInsets.all(16);
}
```

### 3.5 Minimalistic Component Rules

```dart
// ✅ BUTTONS — Ghost-style default, filled for primary CTA only
class AppButton extends StatelessWidget {
  // Primary: filled accent, no border-radius > 12
  // Secondary: transparent bg, subtle border
  // Destructive: text-only in error color
  // ALL buttons: height 48, horizontal padding 24, no elevation, no splash
  // Use InkWell with borderRadius, not ElevatedButton (too opinionated)
}

// ✅ INPUT FIELDS — Underline or minimal outline only
// No filled backgrounds. No floating labels (use static above-field labels).
// Border: 1px AppColors.border → AppColors.accent on focus
// Error state: border turns error color + error text below

// ✅ CARDS — No elevation. Use 1px border or subtle background shift.
// border: Border.all(color: AppColors.border, width: 1)
// borderRadius: BorderRadius.circular(12)
// No drop shadows in minimalist design. Flat always.

// ✅ ICONS — Use outlined/light variants. Stroke width 1.5px.
// Prefer Lucide, Phosphor, or Heroicons over Material Icons.
// Size: 20 for inline, 24 for standalone actions.

// ✅ BOTTOM NAV — Max 4 items. Label below icon. No background color shift.
// Active: accent color icon + label. Inactive: textTertiary.

// ✅ APP BAR — Transparent/surface color. No elevation. Title left-aligned.
// Back button: simple arrow icon, no text.

// ✅ LOADING — Skeleton shimmer, not spinners. Use shimmer for content areas.
// For actions (buttons), use a subtle inline progress indicator.

// ✅ EMPTY STATES — Centered illustration (optional), heading + subtext, one CTA.

// ✅ TRANSITIONS — 200-300ms. Use `Curves.easeOutCubic`. No bouncy animations.
```

### 3.6 Dark Mode

- Implement from Day 1. Use `ThemeExtension<T>` for custom colors.
- Never hardcode colors in widgets. Always reference `Theme.of(context)` or extensions.
- Test both themes before any PR.

---

## 4. NAVIGATION

### 4.1 GoRouter Setup

```dart
// Use GoRouter with typed routes (type-safe)
// Shell routes for persistent bottom nav
// Redirect guards for auth state
// Deep link support from day one
```

**Rules:**
- **All route paths are constants** in a `RoutePaths` class.
- **Route names are constants** in a `RouteNames` class.
- **Use `StatefulShellRoute`** for bottom navigation to preserve tab state.
- **Auth redirect**: Single `redirect` callback that checks auth state and routes accordingly.
- **No Navigator.push()** anywhere in the codebase. Only `context.go()` / `context.push()`.

---

## 5. NETWORKING & DATA

### 5.1 API Client

```dart
// Use Dio with interceptors:
// 1. AuthInterceptor — attaches Bearer token
// 2. LoggingInterceptor — logs req/res in debug mode only
// 3. ErrorInterceptor — maps DioException → typed Failure
// 4. RetryInterceptor — retry on 5xx with exponential backoff (max 3)
```

### 5.2 Data Flow

```
Remote API → DTO (fromJson) → Repository → Entity (toDomain) → UseCase → Bloc → UI
```

- **DTOs use `json_serializable`** with `@JsonSerializable(fieldRename: FieldRename.snake)`.
- **Entities are immutable** (`@immutable` annotation + final fields).
- **Use `freezed` for entities** when you need copyWith, equality, and serialization.
- **Use `Either<Failure, T>`** from `fpdart` (or `dartz`) for error handling in repositories. No throwing exceptions across layers.

### 5.3 Local Storage

- **Secure storage**: `flutter_secure_storage` for tokens.
- **Key-value cache**: `shared_preferences` (wrapped in an abstraction).
- **Structured cache**: `drift` (SQLite) for offline-first features.
- **Never access storage directly from UI**. Always go through a repository.

---

## 6. DEPENDENCY INJECTION

### 6.1 Recommended: get_it + injectable

```dart
@module
abstract class RegisterModule {
  @lazySingleton
  Dio get dio => createDio();

  @lazySingleton
  ApiClient get apiClient => ApiClient(dio);
}

@injectable
class AuthRepository implements IAuthRepository {
  final ApiClient _client;
  final SecureStorage _storage;

  AuthRepository(this._client, this._storage);
}
```

**Rules:**
- **All dependencies are registered at startup** in `di.dart`.
- **Use `@lazySingleton` for services/repositories**. `@singleton` only for truly app-wide state.
- **Use `@injectable` for blocs/cubits** — they get fresh instances per scope.
- **Never use `GetIt.I` directly in widgets**. Use `BlocProvider` or `RepositoryProvider` from `flutter_bloc`.

---

## 7. ERROR HANDLING STRATEGY

```dart
sealed class Failure {
  final String message;
  final int? code;
  const Failure(this.message, {this.code});
}

final class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'No internet connection']);
}

final class ServerFailure extends Failure {
  const ServerFailure(super.message, {super.code});
}

final class CacheFailure extends Failure {
  const CacheFailure([super.message = 'Cache read failed']);
}

final class ValidationFailure extends Failure {
  final Map<String, List<String>> fieldErrors;
  const ValidationFailure(this.fieldErrors, [super.message = 'Validation failed']);
}

final class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure([super.message = 'Session expired']);
}
```

**Rules:**
- Repositories return `Either<Failure, T>`. Never throw.
- Blocs catch failures from use cases and emit error states.
- UI displays errors contextually (inline for forms, toast for actions, full-screen for page loads).
- **Global error boundary**: Wrap `MaterialApp` with a global error widget that catches unhandled exceptions and shows a fallback UI.

---

## 8. TESTING STRATEGY

### 8.1 Test Pyramid

```
                 ┌─────────┐
                 │  E2E    │  ← integration_test/ (critical flows only)
                ┌┴─────────┴┐
                │  Widget   │  ← test/features/*/presentation/
               ┌┴───────────┴┐
               │    Unit     │  ← test/features/*/domain/ + data/
               └─────────────┘
```

### 8.2 Rules

- **Minimum 80% coverage on domain + data layers**.
- **Every bloc gets a dedicated test file** with state transition tests.
- **Use `mocktail`** (not `mockito`) for mocking — no codegen needed.
- **Golden tests** for critical UI components (buttons, cards, screens).
- **Widget tests** use `pumpWidget` with proper `BlocProvider` mocks.
- **Never test implementation details**. Test behavior and outputs.
- **Use `setUpAll` / `tearDownAll`** for expensive setup. Isolate tests.

```dart
// ✅ CORRECT bloc test
blocTest<AuthCubit, AuthState>(
  'emits [AuthLoading, AuthAuthenticated] on successful login',
  build: () {
    when(() => loginUseCase(any())).thenAnswer((_) async => Right(mockUser));
    return AuthCubit(loginUseCase);
  },
  act: (cubit) => cubit.login(email: 'test@test.com', password: '123456'),
  expect: () => [
    const AuthLoading(),
    AuthAuthenticated(mockUser),
  ],
);
```

---

## 9. PERFORMANCE RULES

- **`const` constructors everywhere possible**. Lint rule: `prefer_const_constructors`.
- **Use `const SizedBox`** for gaps (predefined in `AppSpacing`).
- **`RepaintBoundary`** on complex widgets that animate independently.
- **`ListView.builder`** for all dynamic lists. Never `ListView(children: [...])` for 10+ items.
- **Image caching**: Use `cached_network_image`. Set `memCacheWidth`/`memCacheHeight`.
- **Avoid `setState`** in complex widgets. Use bloc/cubit even for local state if it triggers rebuilds.
- **`AutomaticKeepAliveClientMixin`** for tab views that should preserve state.
- **Profile with DevTools** before optimizing. No premature optimization.
- **Tree-shake unused assets**. Run `flutter build --analyze-size` before release.

---

## 10. CODE QUALITY & LINTING

### 10.1 analysis_options.yaml

```yaml
include: package:very_good_analysis/analysis_options.yaml

linter:
  rules:
    prefer_single_quotes: true
    always_use_package_imports: true
    avoid_print: true
    prefer_const_constructors: true
    prefer_const_declarations: true
    sized_box_for_whitespace: true
    use_decorated_box: true
    unnecessary_lambdas: true
    avoid_unnecessary_containers: true
    prefer_final_locals: true
    cascade_invocations: true
    unawaited_futures: true

analyzer:
  errors:
    missing_return: error
    dead_code: warning
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"
```

### 10.2 Commit Conventions

```
feat: add user authentication flow
fix: resolve token refresh race condition
refactor: extract shared form validators
test: add unit tests for AuthRepository
chore: bump dio to 5.4.0
docs: update README with setup instructions
style: apply lint fixes
perf: add RepaintBoundary to chat message list
```

---

## 11. CI/CD & BUILD

### 11.1 Pre-commit Checklist

1. `dart format .` — zero formatting issues
2. `flutter analyze` — zero warnings/errors
3. `flutter test` — all passing
4. No `print()` statements (use `Logger`)
5. No hardcoded strings in UI (use `l10n` or `AppStrings`)
6. No `TODO` without a linked issue

### 11.2 Build Flavors

```
lib/main_dev.dart    → Development (staging API, verbose logs)
lib/main_staging.dart → Staging (staging API, crash reporting)
lib/main_prod.dart   → Production (prod API, obfuscation)
```

Use `--dart-define` or `--flavor` for environment switching. Never use `kDebugMode` to branch API URLs.

---

## 12. KEY PACKAGES (Curated & Version-Pinned)

| Purpose               | Package                     | Notes                            |
|------------------------|-----------------------------|----------------------------------|
| State management       | `flutter_bloc`              | Bloc + Cubit                     |
| Navigation             | `go_router`                 | Declarative, type-safe           |
| DI                     | `get_it` + `injectable`     | Compile-time safe                |
| Networking             | `dio`                       | Interceptors, cancellation       |
| JSON serialization     | `json_serializable`         | With `json_annotation`           |
| Immutable models       | `freezed`                   | copyWith, equality, unions       |
| Functional types       | `fpdart`                    | Either, Option                   |
| Local DB               | `drift`                     | Type-safe SQLite                 |
| Secure storage         | `flutter_secure_storage`    | Keychain / Keystore              |
| Image caching          | `cached_network_image`      | With placeholder/error builders  |
| Testing mocks          | `mocktail`                  | No codegen mocking               |
| Linting                | `very_good_analysis`        | Strict rule set                  |
| Internationalization   | `flutter_localizations`     | ARB-based i18n                   |
| Logging                | `logger`                    | Pretty console output            |
| Connectivity           | `connectivity_plus`         | Network state monitoring         |

---

## 13. GIT WORKFLOW

- **Branch naming**: `feat/auth-login`, `fix/token-refresh`, `refactor/api-client`
- **PR size**: Max 400 lines changed. Split larger work into stacked PRs.
- **PR requires**: 1 approval, all checks passing, no unresolved comments.
- **Squash merge to main**. Keep linear history.
- **Tag releases** with semver: `v1.2.0`

---

## 14. ANTI-PATTERNS — NEVER DO THIS

```dart
// ❌ Business logic in widgets
onPressed: () async {
  final response = await dio.post('/login', data: {...});
  if (response.statusCode == 200) { ... }
}

// ❌ God widgets (500+ lines)
class HomePage extends StatefulWidget { ... } // 800 lines

// ❌ Hardcoded colors
Container(color: Color(0xFF2563EB))

// ❌ Nested BlocBuilders (3+ deep)
BlocBuilder<A, AState>(builder: (_, a) =>
  BlocBuilder<B, BState>(builder: (_, b) =>
    BlocBuilder<C, CState>(builder: (_, c) => ...)))

// ❌ Using context after async gap
onPressed: () async {
  await someAsyncWork();
  Navigator.of(context).pop(); // context may be invalid
}

// ❌ Importing data layer in presentation
import 'package:app/features/auth/data/models/user_dto.dart';

// ❌ Massive build methods
Widget build(BuildContext context) {
  return Column(children: [
    // ... 200 lines of widget tree
  ]);
}
```

### Instead:

```dart
// ✅ Extract widgets: max ~80 lines per build method
// ✅ Use context.read/watch in event handlers safely
// ✅ Use BlocSelector for granular rebuilds
// ✅ Reference theme/colors from Theme.of(context) or AppColors
// ✅ Keep presentation layer importing only domain entities
// ✅ Use mounted check or Bloc for post-async navigation
```

---

## 15. CHECKLIST BEFORE EACH FEATURE

- [ ] Domain entities defined (immutable, no Flutter imports)
- [ ] Repository contract in domain layer
- [ ] DTOs with `fromJson`/`toJson` in data layer
- [ ] Repository implementation with `Either<Failure, T>` returns
- [ ] Use case class with single `call()` method
- [ ] Bloc/Cubit with sealed states
- [ ] UI reads state only via `BlocBuilder`/`BlocSelector`
- [ ] Side effects via `BlocListener`
- [ ] Unit tests for use case + repository + bloc
- [ ] Widget test for page with mocked bloc
- [ ] No hardcoded strings, colors, or magic numbers
- [ ] Responsive on 360px–428px width range (mobile)
- [ ] Dark mode verified
- [ ] `flutter analyze` clean

---

*This document is the source of truth. When in doubt, refer here. When this conflicts with a package's docs, this wins unless there's a documented exception.*