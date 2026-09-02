import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants.dart';
import '../../core/employee_api_client.dart';
import '../../core/l10n.dart';
import '../../core/models.dart';

// Employee Mobile V1 (Founder ruling W-1, 2026-09-02): a companion
// overview for one campaign — the same summary numbers Overview.tsx shows
// on the Company Console (GET /analytics/:id/overview), not a rebuild of
// Participants/Demographics/Survey Results/AI Insights/Report, which stay
// Web-only for this V1 (see this task's own "does not need to reproduce
// every Company Web Console feature").
class EmployeeCampaignDetailScreen extends StatefulWidget {
  final Campaign campaign;
  const EmployeeCampaignDetailScreen({super.key, required this.campaign});

  @override
  State<EmployeeCampaignDetailScreen> createState() => _EmployeeCampaignDetailScreenState();
}

class _EmployeeCampaignDetailScreenState extends State<EmployeeCampaignDetailScreen> {
  Map<String, dynamic>? _overview;
  bool _loading = true;
  bool _error = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = false; });
    try {
      final overview = await employeeApiClient.getCampaignOverview(widget.campaign.id);
      if (!mounted) return;
      setState(() { _overview = overview; _loading = false; });
    } catch (_) {
      if (!mounted) return;
      setState(() { _loading = false; _error = true; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final ar = LangProvider.isAr(context);
    return Directionality(
      textDirection: ar ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        backgroundColor: kBackground,
        appBar: AppBar(
          backgroundColor: kBackground,
          elevation: 0,
          leading: IconButton(
            icon: Icon(ar ? Icons.arrow_forward_ios : Icons.arrow_back_ios, color: kPrimary, size: 20),
            onPressed: () => context.pop(),
          ),
          title: Text(
            widget.campaign.productName,
            style: const TextStyle(color: kPrimary, fontWeight: FontWeight.w800, fontSize: 16),
            overflow: TextOverflow.ellipsis,
          ),
        ),
        body: SafeArea(child: _buildBody(ar)),
      ),
    );
  }

  Widget _buildBody(bool ar) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: kPrimary));
    }
    if (_error || _overview == null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: kAccent, size: 40),
              const SizedBox(height: 12),
              Text(
                ar ? 'تعذر تحميل بيانات الحملة' : 'Could not load campaign data',
                style: const TextStyle(color: kPrimary, fontSize: 15, fontWeight: FontWeight.w600),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              OutlinedButton(onPressed: _load, child: Text(ar ? 'إعادة المحاولة' : 'Retry')),
            ],
          ),
        ),
      );
    }
    final ov = _overview!;
    final stats = <(String, String)>[
      (ar ? 'إجمالي المشاركات' : 'Redemptions', '${ov['totalRedemptions'] ?? 0}'),
      (ar ? 'الاستبيانات المكتملة' : 'Survey Completions', '${ov['surveyCompletions'] ?? 0}'),
      (ar ? 'نسبة الإتمام' : 'Completion Rate', '${ov['completionRate'] ?? 0}%'),
      (ar ? 'نية الشراء' : 'Purchase Intent', '${ov['purchaseIntentPercent'] ?? 0}%'),
    ];
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(color: kBrandSoft, borderRadius: BorderRadius.circular(6)),
            child: Text(
              widget.campaign.status.toUpperCase(),
              style: const TextStyle(color: kBrand600, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.5),
            ),
          ),
          const SizedBox(height: 20),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.3,
            children: stats.map((s) => _StatCard(label: s.$1, value: s.$2)).toList(),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  const _StatCard({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: kSurface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [BoxShadow(color: kCardShadow, blurRadius: 12, offset: Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(value, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: kPrimary)),
          const SizedBox(height: 6),
          Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade500, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
