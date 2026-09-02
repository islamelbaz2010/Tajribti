import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants.dart';
import '../../core/employee_api_client.dart';
import '../../core/employee_session.dart';
import '../../core/l10n.dart';
import '../../core/models.dart';
import '../../widgets/lang_toggle.dart';

const Map<String, Color> _statusColor = {
  'active': kSuccess,
  'draft': Colors.grey,
  'paused': kGold,
  'completed': Color(0xFF2563EB),
  'archived': Colors.grey,
};

// Employee Mobile V1 (Founder ruling W-1, 2026-09-02): the Employee's
// landing screen — Company context + the Company's campaigns, exactly the
// "Company/Campaign information already authorized by backend" this task
// requires, not a second full Company Console. Server-side authorization
// (resolveCompanyId()) remains the actual boundary; this screen only
// renders what GET /company/me and GET /campaigns/my already return for
// this employee's token.
class EmployeeHomeScreen extends StatefulWidget {
  const EmployeeHomeScreen({super.key});

  @override
  State<EmployeeHomeScreen> createState() => _EmployeeHomeScreenState();
}

class _EmployeeHomeScreenState extends State<EmployeeHomeScreen> {
  String? _companyName;
  List<Campaign>? _campaigns;
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
      final name = await EmployeeAuthService.getCompanyName();
      final campaigns = await employeeApiClient.getCompanyCampaigns();
      if (!mounted) return;
      setState(() {
        _companyName = name;
        _campaigns = campaigns;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() { _loading = false; _error = true; });
    }
  }

  Future<void> _logout() async {
    await EmployeeAuthService.logout();
    if (!mounted) return;
    context.go('/auth-choice');
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
          automaticallyImplyLeading: false,
          title: Text(
            _companyName?.isNotEmpty == true ? _companyName! : (ar ? 'حساب الموظف' : 'Employee Account'),
            style: const TextStyle(color: kPrimary, fontWeight: FontWeight.w800, fontSize: 18),
          ),
          actions: [
            const Padding(padding: EdgeInsets.only(right: 4), child: Center(child: LangToggle())),
            IconButton(
              icon: const Icon(Icons.logout_rounded, color: kPrimary),
              tooltip: ar ? 'تسجيل الخروج' : 'Sign out',
              onPressed: _logout,
            ),
          ],
        ),
        body: SafeArea(child: _buildBody(ar)),
      ),
    );
  }

  Widget _buildBody(bool ar) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator(color: kPrimary));
    }
    if (_error) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: kAccent, size: 40),
              const SizedBox(height: 12),
              Text(
                ar ? 'تعذر تحميل بيانات الشركة' : 'Could not load Company data',
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
    final campaigns = _campaigns ?? [];
    if (campaigns.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.campaign_outlined, color: Colors.grey.shade400, size: 40),
              const SizedBox(height: 12),
              Text(
                ar ? 'لا توجد حملات لهذه الشركة بعد' : 'No campaigns for this Company yet',
                style: TextStyle(color: Colors.grey.shade500, fontSize: 14),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: campaigns.length,
        itemBuilder: (context, i) {
          final c = campaigns[i];
          final color = _statusColor[c.status] ?? Colors.grey;
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: kSurface,
              borderRadius: BorderRadius.circular(16),
              boxShadow: const [BoxShadow(color: kCardShadow, blurRadius: 12, offset: Offset(0, 4))],
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              title: Text(c.productName, style: const TextStyle(fontWeight: FontWeight.w700, color: kPrimary)),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    c.status.toUpperCase(),
                    style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                  ),
                ),
              ),
              trailing: Icon(ar ? Icons.arrow_back_ios : Icons.arrow_forward_ios, size: 14, color: Colors.grey.shade400),
              onTap: () => context.push('/employee/campaign', extra: c),
            ),
          );
        },
      ),
    );
  }
}
