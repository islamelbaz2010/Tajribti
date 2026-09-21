import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/api_client.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/session.dart';

// FD-M7 (2026-09-21): Android App Link entry point. A campaign QR encodes
// https://<api-host>/app/consumer/?qr=<code>; when the app is installed and
// the domain is verified, the camera/browser delivers that URL here as the
// route /app/consumer?qr=<code>. The code resolves through the SAME public
// endpoint the in-app scanner uses (GET /consumer/qr/:code), preserving QR
// source attribution (JourneySession.qrSourceId), then continues into the
// normal campaign journey — no old /qr/enter or /qr/redeem mechanics.
class QrEntryScreen extends StatefulWidget {
  final String? code;
  const QrEntryScreen({super.key, this.code});

  @override
  State<QrEntryScreen> createState() => _QrEntryScreenState();
}

class _QrEntryScreenState extends State<QrEntryScreen> {
  bool _failed = false;

  @override
  void initState() {
    super.initState();
    _resolve();
  }

  Future<void> _resolve() async {
    final code = widget.code;
    if (code == null || code.isEmpty) {
      if (mounted) context.go('/home');
      return;
    }
    try {
      final resolution = await apiClient.resolveQrCode(code);
      if (!mounted) return;
      JourneySession.start(resolution.campaignId, qrSourceId: resolution.sourceId);
      context.go('/campaign');
    } catch (_) {
      if (mounted) setState(() => _failed = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = context.l10n;
    return Directionality(
      textDirection: context.dir,
      child: Scaffold(
        backgroundColor: kBackground,
        body: SafeArea(
          child: Center(
            child: _failed
                ? Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.error_outline, color: kAccent, size: 48),
                        const SizedBox(height: 16),
                        Text(
                          s.scanError,
                          style: const TextStyle(color: kAccent, fontSize: 16),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 24),
                        TextButton(
                          onPressed: () => context.go('/home'),
                          child: Text(s.backHome, style: const TextStyle(color: kPrimary, fontSize: 16)),
                        ),
                      ],
                    ),
                  )
                : const CircularProgressIndicator(color: kPrimary),
          ),
        ),
      ),
    );
  }
}
