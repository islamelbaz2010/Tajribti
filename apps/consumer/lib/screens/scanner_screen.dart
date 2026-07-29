import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../core/api_client.dart';
import '../core/constants.dart';

class ScannerScreen extends StatefulWidget {
  final String campaignId;
  const ScannerScreen({super.key, required this.campaignId});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final _controller = MobileScannerController();
  bool _processing = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_processing) return;
    final barcode = capture.barcodes.firstOrNull;
    if (barcode == null || barcode.rawValue == null) return;

    setState(() => _processing = true);
    await _controller.stop();

    final raw = barcode.rawValue!;
    String qrCode = raw;

    try {
      final parsed = Map<String, dynamic>.from(
        (raw.startsWith('{')) ? {} : {},
      );
      if (raw.startsWith('{')) {
        final decoded = Uri.decodeComponent(raw);
        qrCode = (decoded.contains('"qr_code"'))
            ? RegExp(r'"qr_code"\s*:\s*"([^"]+)"').firstMatch(decoded)?.group(1) ?? raw
            : raw;
      }
    } catch (_) {}

    try {
      final result = await apiClient.redeemQr(qrCode);
      if (!mounted) return;
      context.go('/survey', extra: {
        'redemptionId': result.redemptionId,
        'campaignId': widget.campaignId,
        'pointsEarned': result.pointsEarned,
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('تعذر المسح. تأكد من صحة الرمز أو الاتصال بالشبكة.'),
          backgroundColor: kAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
      setState(() => _processing = false);
      await _controller.start();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          title: const Text('مسح رمز QR', style: TextStyle(color: Colors.white)),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => context.pop(),
          ),
        ),
        body: Stack(
          children: [
            MobileScanner(
              controller: _controller,
              onDetect: _onDetect,
            ),
            Center(
              child: Container(
                width: 260,
                height: 260,
                decoration: BoxDecoration(
                  border: Border.all(color: kAccent, width: 3),
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            ),
            Positioned(
              bottom: 60,
              left: 0,
              right: 0,
              child: Text(
                'ضع رمز QR داخل الإطار',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
            if (_processing)
              Container(
                color: Colors.black54,
                child: const Center(
                  child: CircularProgressIndicator(color: kAccent),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
