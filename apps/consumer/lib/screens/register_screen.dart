import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/api_client.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/session.dart';
import '../widgets/choice_chip_group.dart';
import '../widgets/lang_toggle.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  String? _ageRange;
  String? _genderLabel;
  String? _cityLabel;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final s = context.l10n;
    if (_nameController.text.trim().isEmpty || _ageRange == null || _genderLabel == null || _cityLabel == null) {
      setState(() => _error = s.fillAll);
      return;
    }

    final genderIdx = s.genders.indexOf(_genderLabel!);
    final cityIdx = s.cities.indexOf(_cityLabel!);

    setState(() { _loading = true; _error = null; });
    try {
      await apiClient.register(
        name: _nameController.text.trim(),
        ageRange: _ageRange!,
        gender: s.genderValues[genderIdx],
        city: s.cityValues[cityIdx],
      );

      if (JourneySession.hasActiveCampaign) {
        try {
          final entry = await apiClient.enterCampaign(JourneySession.campaignId!);
          if (!mounted) return;
          if (entry.alreadyCompleted) {
            context.go('/campaign', extra: true);
            return;
          }
          JourneySession.setRedemption(entry.redemptionId, entry.pointsEarned);
          context.go('/survey', extra: {
            'redemptionId': entry.redemptionId,
            'campaignId': JourneySession.campaignId!,
            'pointsEarned': entry.pointsEarned,
          });
          return;
        } catch (_) {
          // Campaign entry failed — navigate home without error
        }
      }
      if (!mounted) return;
      context.go('/home');
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = context.l10n.saveError);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
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
          actions: const [
            Padding(padding: EdgeInsets.only(right: 12), child: Center(child: LangToggle())),
          ],
        ),
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(28, 0, 28, 28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: kAccent.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    s.oneMoreStep,
                    style: const TextStyle(fontSize: 12, color: kAccent, fontWeight: FontWeight.w700),
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  s.tellUsAbout,
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: kPrimary,
                  ),
                ),
                Text(
                  s.forBetterExp,
                  style: TextStyle(color: Colors.grey.shade500),
                ),
                const SizedBox(height: 32),
                _Label(s.nameLabel),
                const SizedBox(height: 8),
                TextField(
                  controller: _nameController,
                  textCapitalization: TextCapitalization.words,
                  decoration: _inputDeco(s.nameHint),
                ),
                const SizedBox(height: 24),
                _Label(s.ageLabel),
                const SizedBox(height: 12),
                ChoiceChipGroup(
                  options: s.ageRanges,
                  selected: _ageRange,
                  onSelected: (v) => setState(() => _ageRange = v),
                ),
                const SizedBox(height: 24),
                _Label(s.genderLabel),
                const SizedBox(height: 12),
                ChoiceChipGroup(
                  options: s.genders,
                  selected: _genderLabel,
                  onSelected: (v) => setState(() => _genderLabel = v),
                ),
                const SizedBox(height: 24),
                _Label(s.cityLabel),
                const SizedBox(height: 12),
                ChoiceChipGroup(
                  options: s.cities,
                  selected: _cityLabel,
                  onSelected: (v) => setState(() => _cityLabel = v),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: kAccent.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(_error!, style: const TextStyle(color: kAccent, fontSize: 14)),
                  ),
                ],
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 58,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kPrimary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                    child: _loading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : Text(s.continueBtn, style: const TextStyle(fontSize: 19, fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDeco(String hint) => InputDecoration(
    hintText: hint,
    filled: true,
    fillColor: Colors.white,
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(14),
      borderSide: const BorderSide(color: kPrimary, width: 2),
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
  );
}

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);

  @override
  Widget build(BuildContext context) => Text(
    text,
    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: kPrimary),
  );
}
