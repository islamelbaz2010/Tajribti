import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/l10n.dart';
import 'screens/splash_screen.dart';
import 'screens/scanner_screen.dart';
import 'screens/campaign_screen.dart';
import 'screens/phone_screen.dart';
import 'screens/otp_screen.dart';
import 'screens/eligibility_screen.dart';
import 'screens/home_screen.dart';
import 'screens/survey_screen.dart';
import 'screens/thank_you_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/activity_screen.dart';
import 'screens/qr_entry_screen.dart';
import 'screens/services_screen.dart';
import 'screens/employee/employee_login_screen.dart';
import 'screens/employee/employee_home_screen.dart';
import 'screens/employee/employee_campaign_detail_screen.dart';
import 'core/models.dart';

// Mobile Recovery + Current-Backend Alignment (2026-09-15): removed
// /auth-choice, /login, /signup — the current Consumer identity is
// phone+OTP only (no email/password account layer exists server-side;
// see core/api_client.dart's header comment). Phone/OTP screens are now
// reached directly from wherever a campaign action first requires
// identity (Campaign Detail / Scanner), matching the current released
// web Consumer flow. /survey and /thankyou no longer thread
// redemptionId/pointsEarned — the current backend has neither concept
// (trial redemption is a status transition keyed by campaignId, and there
// is no points/rewards system).
final _router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (_, __) => const SplashScreen()),
    // FD-M7 (2026-09-21): Android App Link target. The campaign QR encodes
    // https://<api-host>/app/consumer/?qr=<code>; when the verified app is
    // installed, that URL arrives here with the code in the query string.
    // QrEntryScreen resolves it to a campaign (same endpoint the scanner
    // uses) and continues the normal journey; when the app is absent the
    // web Consumer at the same URL remains the fallback.
    GoRoute(
      path: '/app/consumer',
      builder: (_, state) => QrEntryScreen(code: state.uri.queryParameters['qr']),
    ),
    GoRoute(
      path: '/scanner',
      builder: (_, state) => ScannerScreen(verifyCampaignId: state.extra as String?),
    ),
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
    // Mobile Eligibility gap closure (2026-09-20): the eligibility step
    // between OTP/identity and trial redemption — collects the campaign's
    // ELIGIBILITY-stage answers + audience demographics before the server
    // decides eligibility.
    GoRoute(
      path: '/eligibility',
      builder: (_, state) => EligibilityScreen(campaign: state.extra as Campaign?),
    ),
    GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
    GoRoute(
      path: '/survey',
      builder: (_, state) => SurveyScreen(campaignId: state.extra as String),
    ),
    GoRoute(path: '/thankyou', builder: (_, __) => const ThankYouScreen()),
    GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
    GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
    GoRoute(path: '/activity', builder: (_, __) => const ActivityScreen()),
    GoRoute(path: '/services', builder: (_, __) => const ServicesScreen()),

    // Employee Mobile — a separate, additive route branch. Reachable only
    // via Settings' "Company Employee? Sign in" link (moved here after
    // AuthChoiceScreen was removed); never entered from a Consumer route.
    GoRoute(path: '/employee/login', builder: (_, __) => const EmployeeLoginScreen()),
    GoRoute(path: '/employee/home', builder: (_, __) => const EmployeeHomeScreen()),
    GoRoute(
      path: '/employee/campaign',
      builder: (_, state) => EmployeeCampaignDetailScreen(campaign: state.extra as Campaign),
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
              // Mobile Recovery — Visual Identity Alignment (2026-09-15):
              // colorSchemeSeed now derives Material 3's generated palette
              // from the current brand orange (constants.dart's kBrand),
              // not the old dark-navy seed.
              colorSchemeSeed: const Color(0xFFEB6B45),
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
