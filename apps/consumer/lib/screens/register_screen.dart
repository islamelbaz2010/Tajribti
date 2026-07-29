import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/api_client.dart';
import '../core/constants.dart';
import '../widgets/choice_chip_group.dart';

const _ageRanges = ['18-24', '25-34', '35-44', '45-54', '55+'];
const _genders = ['ذكر', 'أنثى'];
const _genderValues = ['male', 'female'];
const _cities = ['القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'أخرى'];
const _cityValues = ['Cairo', 'Giza', 'Alexandria', 'Mansoura', 'Other'];

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  String? _ageRange;
  String? _gender;
  String? _city;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_nameController.text.trim().isEmpty || _ageRange == null || _gender == null || _city == null) {
      setState(() => _error = 'يرجى إكمال جميع الحقول');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      final genderIdx = _genders.indexOf(_gender!);
      final cityIdx = _cities.indexOf(_city!);
      await apiClient.register(
        name: _nameController.text.trim(),
        ageRange: _ageRange!,
        gender: _genderValues[genderIdx],
        city: _cityValues[cityIdx],
      );
      if (!mounted) return;
      context.go('/home');
    } catch (e) {
      setState(() => _error = 'تعذر الحفظ. حاول مرة أخرى.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: kBackground,
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 24),
                Text('أخبرنا عن نفسك', style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w900,
                  color: kPrimary,
                )),
                Text('لنوفر لك تجربة مناسبة', style: TextStyle(color: Colors.grey.shade500)),
                const SizedBox(height: 32),
                _Label('الاسم'),
                const SizedBox(height: 8),
                TextField(
                  controller: _nameController,
                  decoration: _inputDeco('اسمك الأول'),
                ),
                const SizedBox(height: 24),
                _Label('الفئة العمرية'),
                const SizedBox(height: 12),
                ChoiceChipGroup(
                  options: _ageRanges,
                  selected: _ageRange,
                  onSelected: (v) => setState(() => _ageRange = v),
                ),
                const SizedBox(height: 24),
                _Label('الجنس'),
                const SizedBox(height: 12),
                ChoiceChipGroup(
                  options: _genders,
                  selected: _gender,
                  onSelected: (v) => setState(() => _gender = v),
                ),
                const SizedBox(height: 24),
                _Label('المدينة'),
                const SizedBox(height: 12),
                ChoiceChipGroup(
                  options: _cities,
                  selected: _city,
                  onSelected: (v) => setState(() => _city = v),
                ),
                if (_error != null) ...[
                  const SizedBox(height: 16),
                  Text(_error!, style: const TextStyle(color: kAccent, fontSize: 14)),
                ],
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kPrimary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: _loading
                        ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('متابعة', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
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
    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
  );
}

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);

  @override
  Widget build(BuildContext context) => Text(
    text,
    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF1a1a2e)),
  );
}
