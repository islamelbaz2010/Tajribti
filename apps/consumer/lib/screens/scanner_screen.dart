import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../core/constants.dart';
import '../core/session.dart';

class ScannerScreen extends StatefulWidget {
  const ScannerScreen({super.key});

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

  /// Extract campaignId from whatever the QR contains:
  ///   - URL:  https://.../join/<uuid>
  ///   - JSON: {"campaign_id": "<uuid>", "qr_code": "..."}
  ///   - Raw UUID or tajribti: prefix
  String? _parseCampaignId(String raw) {
    // URL format (real campaigns)
    final joinMatch = RegExp(r'/join/([0-9a-f-]{36})', caseSensitive: false).firstMatch(raw);
    if (joinMatch != null) return joinMatch.group(1);

    // JSON format (demo campaigns)
    final jsonMatch = RegExp(r'"campaign_id"\s*:\s*"([0-9a-f-]{36})"', caseSensitive: false).firstMatch(raw);
    if (jsonMatch != null) return jsonMatch.group(1);

    // Raw UUID
    final uuidMatch = RegExp(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', caseSensitive: false).hasMatch(raw.trim());
    if (uuidMatch) return raw.trim();

    // tajribti: prefix format
    final tajribtiMatch = RegExp(r'tajribti:([0-9a-f-]{36}):').firstMatch(raw);
    if (tajribtiMatch != null) return tajribtiMatch.group(1);

    return null;
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_processing) return;
    final barcode = capture.barcodes.firstOrNull;
    if (barcode?.rawValue == null) return;

    setState(() => _processing = true);
    await _controller.stop();

    final raw = barcode!.rawValue!;
    final campaignId = _parseCampaignId(raw);

    if (campaignId == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('رمز QR غير معروف. تأكد من مسح الرمز الصحيح.'),
          backgroundColor: kAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
      setState(() => _processing = false);
      await _controller.start();
      return;
    }

    JourneySession.start(campaignId);
    if (!mounted) return;
    context.go('/campaign');
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: const Text('مسح رمز QR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          leading: context.canPop()
              ? IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => context.pop(),
                )
              : null,
        ),
        body: Stack(
          children: [
            MobileScanner(controller: _controller, onDetect: _onDetect),

            // Scan frame overlay
            Center(
              child: Container(
                width: 260,
                height: 260,
                decoration: BoxDecoration(
                  border: Border.all(color: kAccent, width: 3),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const _CornerDecorations(),
              ),
            ),

            // Hint text
            Positioned(
              bottom: 72,
              left: 0,
              right: 0,
              child: Column(
                children: [
                  const Text(
                    'ضع رمز QR داخل الإطار',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'سيتم التعرف عليه تلقائياً',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white.withOpacity(0.55), fontSize: 13),
                  ),
                ],
              ),
            ),

            if (_processing)
              Container(
                color: Colors.black54,
                child: const Center(child: CircularProgressIndicator(color: kAccent)),
              ),
          ],
        ),
      ),
    );
  }
}

class _CornerDecorations extends StatelessWidget {
  const _CornerDecorations();

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(top: 0, right: 0, child: _Corner(top: true, right: true)),
        Positioned(top: 0, left: 0, child: _Corner(top: true, right: false)),
        Positioned(bottom: 0, right: 0, child: _Corner(top: false, right: true)),
        Positioned(bottom: 0, left: 0, child: _Corner(top: false, right: false)),
      ],
    );
  }
}

class _Corner extends StatelessWidget {
  final bool top;
  final bool right;
  const _Corner({required this.top, required this.right});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        border: Border(
          top: top ? const BorderSide(color: Colors.white, width: 3) : BorderSide.none,
          bottom: !top ? const BorderSide(color: Colors.white, width: 3) : BorderSide.none,
          right: right ? const BorderSide(color: Colors.white, width: 3) : BorderSide.none,
          left: !right ? const BorderSide(color: Colors.white, width: 3) : BorderSide.none,
        ),
      ),
    );
  }
}
