import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/session.dart';
import '../widgets/lang_toggle.dart';

class ScannerScreen extends StatefulWidget {
  // When set, the scanner is being used as the Campaign-participation
  // verification step (Campaign Detail -> Start Trial -> Scan Campaign QR):
  // a scanned code is only accepted if it resolves to this exact campaign,
  // and a match pops back `true` to the caller instead of navigating to
  // Campaign Detail. When null, the scanner keeps its original
  // discovery-shortcut behavior (scan any campaign's QR to jump straight
  // to its Campaign Detail page).
  final String? verifyCampaignId;
  const ScannerScreen({super.key, this.verifyCampaignId});

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

  String? _parseCampaignId(String raw) {
    final joinMatch = RegExp(r'/join/([0-9a-f-]{36})', caseSensitive: false).firstMatch(raw);
    if (joinMatch != null) return joinMatch.group(1);

    final jsonMatch = RegExp(r'"campaign_id"\s*:\s*"([0-9a-f-]{36})"', caseSensitive: false).firstMatch(raw);
    if (jsonMatch != null) return jsonMatch.group(1);

    final uuidMatch = RegExp(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', caseSensitive: false).hasMatch(raw.trim());
    if (uuidMatch) return raw.trim();

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
      final s = context.l10n;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(s.scanError),
          backgroundColor: kAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
      setState(() => _processing = false);
      await _controller.start();
      return;
    }

    if (widget.verifyCampaignId != null) {
      if (campaignId != widget.verifyCampaignId) {
        if (!mounted) return;
        final s = context.l10n;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(s.scanCampaignMismatch),
            backgroundColor: kAccent,
            behavior: SnackBarBehavior.floating,
          ),
        );
        setState(() => _processing = false);
        await _controller.start();
        return;
      }
      if (!mounted) return;
      context.pop(true);
      return;
    }

    JourneySession.start(campaignId);
    if (!mounted) return;
    context.push('/campaign');
  }

  @override
  Widget build(BuildContext context) {
    final s = context.l10n;
    return Directionality(
      textDirection: context.dir,
      child: Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text(
            s.scanTitle,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
          ),
          leading: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
              onPressed: () => context.canPop() ? context.pop() : context.go('/home'),
            ),
          actions: const [
            Padding(
              padding: EdgeInsets.only(right: 12),
              child: Center(child: LangToggle(light: true)),
            ),
          ],
        ),
        body: Stack(
          children: [
            MobileScanner(controller: _controller, onDetect: _onDetect),

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

            Positioned(
              bottom: 72,
              left: 0,
              right: 0,
              child: Column(
                children: [
                  Text(
                    s.scanHint,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    s.scanSub,
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
