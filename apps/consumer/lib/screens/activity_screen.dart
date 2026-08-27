import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/api_client.dart';
import '../core/auth_service.dart';
import '../core/constants.dart';
import '../core/l10n.dart';
import '../core/models.dart';
import '../core/session.dart';
import '../widgets/lang_toggle.dart';

class ActivityScreen extends StatefulWidget {
  const ActivityScreen({super.key});

  @override
  State<ActivityScreen> createState() => _ActivityScreenState();
}

class _ActivityScreenState extends State<ActivityScreen> {
  List<ParticipationRecord> _records = [];
  bool _loading = true;
  bool _loggedIn = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    _loggedIn = await AuthService.isLoggedIn();
    if (!_loggedIn) {
      if (mounted) setState(() => _loading = false);
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      final profile = await apiClient.getConsumerProfile();
      if (mounted) setState(() { _records = profile.recentCampaigns; _loading = false; });
    } catch (_) {
      if (mounted) setState(() { _error = 'load_fail'; _loading = false; });
    }
  }

  void _openCompleted(String campaignId) {
    JourneySession.start(campaignId);
    context.push('/campaign', extra: true);
  }

  @override
  Widget build(BuildContext context) {
    final s = context.l10n;
    return Directionality(
      textDirection: context.dir,
      child: Scaffold(
        backgroundColor: kBackground,
        appBar: AppBar(
          backgroundColor: kPrimary,
          elevation: 0,
          title: Text(
            s.myActivityFull,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
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
        body: _loading
            ? const Center(child: CircularProgressIndicator(color: kPrimary))
            : _error != null
                ? _ActivityError(onRetry: _load, s: s)
                : !_loggedIn
                    ? _NotLoggedIn(s: s)
                    : _records.isEmpty
                        ? _ActivityEmpty(s: s)
                        : _ActivityList(records: _records, s: s, onTap: _openCompleted),
      ),
    );
  }
}

class _ActivityList extends StatelessWidget {
  final List<ParticipationRecord> records;
  final AppStr s;
  final void Function(String campaignId) onTap;
  const _ActivityList({required this.records, required this.s, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 40),
      itemCount: records.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (_, i) => _ActivityCard(record: records[i], s: s, onTap: onTap),
    );
  }
}

class _ActivityCard extends StatelessWidget {
  final ParticipationRecord record;
  final AppStr s;
  final void Function(String campaignId) onTap;
  const _ActivityCard({required this.record, required this.s, required this.onTap});

  String _formatDate(DateTime d) {
    const monthsEn = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    const monthsAr = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ];
    final months = s.isRtl ? monthsAr : monthsEn;
    return '${d.day} ${months[d.month - 1]} ${d.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      elevation: 2,
      shadowColor: kPrimary.withOpacity(0.07),
      child: InkWell(
        onTap: () => onTap(record.campaignId),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: kPrimary.withOpacity(0.07),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: record.productImage != null && record.productImage!.isNotEmpty
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          record.productImage!,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              const Icon(Icons.inventory_2_rounded, color: kPrimary, size: 26),
                        ),
                      )
                    : const Icon(Icons.inventory_2_rounded, color: kPrimary, size: 26),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      record.productName ?? '',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: kPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (record.brandName != null && record.brandName!.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        record.brandName!,
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                      ),
                    ],
                    const SizedBox(height: 4),
                    Text(
                      _formatDate(record.redeemedAt),
                      style: TextStyle(fontSize: 11, color: Colors.grey.shade400),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (record.rewardPoints > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFf0fdf4),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFbbf7d0)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.stars_rounded, size: 12, color: Color(0xFF15803d)),
                          const SizedBox(width: 3),
                          Text(
                            '+${record.rewardPoints}',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF15803d),
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFf0fdf4),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.check_rounded, size: 12, color: Color(0xFF15803d)),
                        const SizedBox(width: 3),
                        Text(
                          s.activityCompleted,
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF15803d),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActivityEmpty extends StatelessWidget {
  final AppStr s;
  const _ActivityEmpty({required this.s});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.history_rounded, size: 60, color: Colors.grey.shade300),
            const SizedBox(height: 20),
            Text(
              s.noActivity,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: kPrimary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              s.noActivitySub,
              style: TextStyle(fontSize: 14, color: Colors.grey.shade500, height: 1.5),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _NotLoggedIn extends StatelessWidget {
  final AppStr s;
  const _NotLoggedIn({required this.s});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.person_outline_rounded, size: 60, color: Colors.grey.shade300),
            const SizedBox(height: 20),
            Text(
              s.loginToSeeActivity,
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: kPrimary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.push('/auth-choice'),
              style: ElevatedButton.styleFrom(
                backgroundColor: kPrimary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
              ),
              child: Text(s.signIn, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActivityError extends StatelessWidget {
  final VoidCallback onRetry;
  final AppStr s;
  const _ActivityError({required this.onRetry, required this.s});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off_rounded, size: 48, color: kAccent),
            const SizedBox(height: 16),
            Text(s.loadError, style: const TextStyle(color: kAccent, fontSize: 16)),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: onRetry,
              style: ElevatedButton.styleFrom(
                backgroundColor: kPrimary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: Text(s.retry),
            ),
          ],
        ),
      ),
    );
  }
}
