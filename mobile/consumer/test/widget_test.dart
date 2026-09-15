// Minimal smoke test. Committing this prevents `flutter create` (run in CI
// to generate missing Android platform files) from scaffolding its own
// default counter-app template here, which references a `MyApp` class this
// project doesn't have and fails `flutter analyze`.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:consumer/app.dart';
import 'package:consumer/screens/home_screen.dart';

void main() {
  testWidgets('TajribtiApp builds without crashing', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const TajribtiApp());
    await tester.pump();
    expect(find.byType(TajribtiApp), findsOneWidget);
  });

  // Campaign auto-sync (Benchmark §14): HomeScreen must register a
  // WidgetsBindingObserver and a periodic poll timer on init, stop polling
  // when the app backgrounds, and resume without throwing when it comes
  // back to the foreground — this is the mechanism that lets a newly
  // ACTIVE campaign be discovered without a manual pull-to-refresh.
  //
  // _load()/_silentRefresh() fire a real Dio request with no reachable
  // backend in this test; ApiClient's connect/receive timeouts are real
  // Timers, not fake-clock ones, so this runs under tester.runAsync() (the
  // documented pattern for real async I/O in widget tests) and waits out
  // the real timeout on each attempt rather than racing it — otherwise the
  // test binding's teardown fails with "A Timer is still pending".
  testWidgets('HomeScreen survives background/foreground lifecycle transitions without throwing',
      (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.runAsync(() async {
      await tester.pumpWidget(const MaterialApp(home: HomeScreen()));
      await tester.pump();
      await Future<void>.delayed(const Duration(seconds: 11));
      await tester.pump();
      expect(tester.takeException(), isNull);

      // Background: polling must stop cleanly.
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.paused);
      await tester.pump();
      expect(tester.takeException(), isNull);

      // Foreground again: must trigger an immediate refresh and restart
      // polling without throwing.
      tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
      await tester.pump();
      await Future<void>.delayed(const Duration(seconds: 11));
      await tester.pump();
      expect(tester.takeException(), isNull);

      // Unmount before the test ends so the periodic Timer is cancelled in
      // dispose() rather than leaking into the next test.
      await tester.pumpWidget(const SizedBox.shrink());
      await tester.pump();
      expect(tester.takeException(), isNull);
    });
  });
}
