import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/session.dart';
import '../widgets/lang_toggle.dart';

class PhoneScreen extends StatefulWidget {
  const PhoneScreen({super.key});

  @override
  State<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends State<PhoneScreen> {
  final _controller = TextEditingController(text: '+20');
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _requestOtp() {
    final s = context.l10n;
    final phone = _controller.text.trim();
    if (phone.length < 12) {
      setState(() => _error = s.phoneError);
      return;
    }
    // Challenge → PoW → OTP request happens inside OtpScreen on init.
    context.push('/otp', extra: phone);
  }

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
                            s.phoneCampaignBanner,
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
                  s.phoneSubtitle,
                  style: TextStyle(fontSize: 16, color: Colors.grey.shade600, height: 1.5),
                ),
                const SizedBox(height: 40),
                TextField(
                  controller: _controller,
                  keyboardType: TextInputType.phone,
                  textDirection: TextDirection.ltr,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, letterSpacing: 1),
                  decoration: InputDecoration(
                    labelText: s.phoneLabel,
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide.none,
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: kPrimary, width: 2),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                    errorText: _error,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  s.phoneExample,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade400),
                ),
                const Spacer(),
                SizedBox(
                  width: double.infinity,
                  height: 58,
                  child: ElevatedButton(
                    onPressed: _requestOtp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kPrimary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                    child: Text(
                      s.sendCode,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                    ),
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
