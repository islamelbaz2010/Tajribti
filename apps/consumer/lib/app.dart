import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'screens/splash_screen.dart';
import 'screens/phone_screen.dart';
import 'screens/otp_screen.dart';
import 'screens/register_screen.dart';
import 'screens/home_screen.dart';
import 'screens/scanner_screen.dart';
import 'screens/survey_screen.dart';
import 'screens/thank_you_screen.dart';

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (_, __) => const SplashScreen()),
    GoRoute(path: '/phone', builder: (_, __) => const PhoneScreen()),
    GoRoute(
      path: '/otp',
      builder: (_, state) => OtpScreen(phone: state.extra as String),
    ),
    GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
    GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
    GoRoute(
      path: '/scanner',
      builder: (_, state) => ScannerScreen(campaignId: state.extra as String),
    ),
    GoRoute(
      path: '/survey',
      builder: (_, state) {
        final args = state.extra as Map<String, dynamic>;
        return SurveyScreen(
          redemptionId: args['redemptionId'] as String,
          campaignId: args['campaignId'] as String,
          pointsEarned: args['pointsEarned'] as int? ?? 0,
        );
      },
    ),
    GoRoute(
      path: '/thankyou',
      builder: (_, state) => ThankYouScreen(pointsEarned: state.extra as int? ?? 0),
    ),
  ],
);

class TajribtiApp extends StatelessWidget {
  const TajribtiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'تجربتي',
      debugShowCheckedModeBanner: false,
      routerConfig: _router,
      theme: ThemeData(
        colorSchemeSeed: const Color(0xFF1a1a2e),
        useMaterial3: true,
        fontFamily: 'sans-serif',
      ),
    );
  }
}
