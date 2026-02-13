import 'package:flutter_test/flutter_test.dart';
import 'package:nomadly/app/app.dart';

void main() {
  testWidgets('App renders onboarding page', (WidgetTester tester) async {
    await tester.pumpWidget(const NomadlyApp());
    await tester.pumpAndSettle();

    expect(find.text('Discover Through People You Trust'), findsOneWidget);
  });
}
