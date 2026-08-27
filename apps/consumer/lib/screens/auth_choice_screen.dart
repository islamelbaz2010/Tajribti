import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/session.dart';
import '../widgets/lang_toggle.dart';

// The account-authentication choice: Log In (existing account, email +
// password) or Create Account (email + password + profile). Reached
// either independently from Home, or from a Campaign's Start Trial when
// no session exists yet - in the latter case JourneySession's
// campaignId is left untouched, so LoginScreen/SignupScreen return to
// that exact Campaign on success instead of Home. Account auth is
// entirely separate from Campaign participation verification (QR +
// phone OTP), which only happens later, inside the Campaign flow.
class AuthChoiceScreen extends StatelessWidget {
  const AuthChoiceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final s = context.l10n;
    return Directionality(
      textDirection: context.dir,
      child: Scaffold(
        backgroundColor: kBackground,
        appBar: AppBar(
          backgroundColor: kBackground,
          elevation: 0,
          leading: context.canPop()
              ? IconButton(
                  icon: Icon(s.isRtl ? Icons.arrow_forward_ios : Icons.arrow_back_ios, color: kPrimary, size: 20),
                  onPressed: () => context.pop(),
                )
              : null,
          actions: const [
            Padding(padding: EdgeInsets.only(right: 12), child: Center(child: LangToggle())),
          ],
        ),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 8),
                if (JourneySession.hasActiveCampaign)
                  Container(
                    margin: const EdgeInsets.only(bottom: 20),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: kPrimary.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: kPrimary.withOpacity(0.1)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle_outline, size: 18, color: kPrimary),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            s.authChoiceCampaignBanner,
                            style: const TextStyle(fontSize: 13, color: kPrimary, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                  ),
                Text(
                  s.welcome,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: kPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  s.authChoiceSubtitle,
                  style: TextStyle(fontSize: 16, color: Colors.grey.shade600, height: 1.5),
                ),
                const Spacer(),
                SizedBox(
                  width: double.infinity,
                  height: 58,
                  child: ElevatedButton(
                    onPressed: () => context.push('/login'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kPrimary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                    child: Text(s.signIn, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(height: 14),
                SizedBox(
                  width: double.infinity,
                  height: 58,
                  child: OutlinedButton(
                    onPressed: () => context.push('/signup'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: kPrimary,
                      side: const BorderSide(color: kPrimary, width: 1.5),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: Text(s.createAccount, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
