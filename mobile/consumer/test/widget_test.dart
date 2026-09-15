// Minimal smoke test. Committing this prevents `flutter create` (run in CI
// to generate missing Android platform files) from scaffolding its own
// default counter-app template here, which references a `MyApp` class this
// project doesn't have and fails `flutter analyze`.
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:consumer/app.dart';

void main() {
  testWidgets('TajribtiApp builds without crashing', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const TajribtiApp());
    await tester.pump();
    expect(find.byType(TajribtiApp), findsOneWidget);
  });
}
