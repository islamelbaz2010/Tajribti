import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/api_client.dart';
import '../core/constants.dart';

class PhoneScreen extends StatefulWidget {
  const PhoneScreen({super.key});

  @override
  State<PhoneScreen> createState() => _PhoneScreenState();
}

class _PhoneScreenState extends State<PhoneScreen> {
  final _controller = TextEditingController(text: '+20');
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _requestOtp() async {
    final phone = _controller.text.trim();
    if (phone.length < 12) {
      setState(() => _error = 'أدخل رقم هاتف مصري صحيح');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      await apiClient.requestOtp(phone);
      if (!mounted) return;
      context.push('/otp', extra: phone);
    } catch (e) {
      setState(() => _error = 'تعذر الإرسال. تحقق من الاتصال.');
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
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 40),
                Text('مرحباً بك', style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w900,
                  color: kPrimary,
                )),
                const SizedBox(height: 8),
                Text(
                  'أدخل رقم هاتفك للبدء',
                  style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
                ),
                const SizedBox(height: 40),
                TextField(
                  controller: _controller,
                  keyboardType: TextInputType.phone,
                  textDirection: TextDirection.ltr,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w600, letterSpacing: 1),
                  decoration: InputDecoration(
                    labelText: 'رقم الهاتف',
                    labelStyle: const TextStyle(fontFamily: 'sans-serif'),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                    errorText: _error,
                  ),
                ),
                const SizedBox(height: 8),
                Text('مثال: +201012345678', style: TextStyle(fontSize: 12, color: Colors.grey.shade400)),
                const Spacer(),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _requestOtp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kPrimary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: _loading
                        ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : const Text('إرسال الرمز', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
