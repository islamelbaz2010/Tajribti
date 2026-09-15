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

    // SplashScreen schedules a 1.6s navigation Timer (fake-clock, since
    // testWidgets runs in a FakeAsync zone). Advancing past it and then
    // disposing the tree keeps that timer (and HomeScreen's own campaign
    // poll timer once navigation lands there) accounted for — otherwise
    // either is still pending at binding teardown and flutter_test fails
    // the test with "A Timer is still pending".
    await tester.pump(const Duration(milliseconds: 1700));
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pump();
  });

  // Campaign auto-sync (Benchmark §14): HomeScreen must register a
  // WidgetsBindingObserver and a periodic poll timer on init, stop polling
  // when the app backgrounds, and resume without throwing when it comes
  // back to the foreground — this is the mechanism that lets a newly
  // ACTIVE campaign be discovered without a manual pull-to-refresh.
  //
  // getActiveCampaigns()/getParticipations() do fire real ApiClient calls
  // here, but flutter_test overrides HttpOverrides for the whole binding so
  // every HTTP request completes immediately with a synthetic 400 response
  // instead of touching the network or a real timeout Timer — so this needs
  // only ordinary fake-clock pumps, not tester.runAsync().
  testWidgets('HomeScreen survives background/foreground lifecycle transitions without throwing',
      (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const MaterialApp(home: HomeScreen()));
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
    expect(tester.takeException(), isNull);

    // Unmount before the test ends so the periodic Timer is cancelled in
    // dispose() rather than leaking into the next test.
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pump();
    expect(tester.takeException(), isNull);
  });
}
