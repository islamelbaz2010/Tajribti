import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/l10n.dart';
import 'screens/splash_screen.dart';
import 'screens/scanner_screen.dart';
import 'screens/campaign_screen.dart';
import 'screens/phone_screen.dart';
import 'screens/otp_screen.dart';
import 'screens/register_screen.dart';
import 'screens/home_screen.dart';
import 'screens/survey_screen.dart';
import 'screens/thank_you_screen.dart';

final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (_, __) => const SplashScreen()),
    GoRoute(path: '/scanner', builder: (_, __) => const ScannerScreen()),
    GoRoute(
      path: '/campaign',
      builder: (_, state) => CampaignScreen(
        alreadyCompleted: state.extra as bool? ?? false,
      ),
    ),
    GoRoute(path: '/phone', builder: (_, __) => const PhoneScreen()),
    GoRoute(
      path: '/otp',
      builder: (_, state) => OtpScreen(phone: state.extra as String),
    ),
    GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
    GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
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

class TajribtiApp extends StatefulWidget {
  const TajribtiApp({super.key});

  @override
  State<TajribtiApp> createState() => _TajribtiAppState();
}

class _TajribtiAppState extends State<TajribtiApp> {
  @override
  void initState() {
    super.initState();
    langNotifier.init().then((_) {
      if (mounted) setState(() {});
    });
    langNotifier.addListener(_onLangChange);
  }

  void _onLangChange() => setState(() {});

  @override
  void dispose() {
    langNotifier.removeListener(_onLangChange);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LangProvider(
      child: ValueListenableBuilder<bool>(
        valueListenable: langNotifier,
        builder: (_, isAr, __) {
          final cairoBase = GoogleFonts.cairoTextTheme();
          return MaterialApp.router(
            title: isAr ? 'تجربتي' : 'Tajribti',
            debugShowCheckedModeBanner: false,
            routerConfig: _router,
            locale: Locale(isAr ? 'ar' : 'en'),
            theme: ThemeData(
              colorSchemeSeed: const Color(0xFF1a1a2e),
              useMaterial3: true,
              textTheme: cairoBase.copyWith(
                displayLarge: cairoBase.displayLarge?.copyWith(fontWeight: FontWeight.w900),
                displayMedium: cairoBase.displayMedium?.copyWith(fontWeight: FontWeight.w900),
                headlineLarge: cairoBase.headlineLarge?.copyWith(fontWeight: FontWeight.w900),
                headlineMedium: cairoBase.headlineMedium?.copyWith(fontWeight: FontWeight.w800),
                bodyLarge: cairoBase.bodyLarge?.copyWith(fontWeight: FontWeight.w500),
              ),
            ),
          );
        },
      ),
    );
  }
}
