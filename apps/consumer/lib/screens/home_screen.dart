import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/api_client.dart';
import '../core/auth_service.dart';
import '../core/constants.dart';
import '../core/models.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Campaign? _campaign;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final campaign = await apiClient.getDemoActiveCampaign();
      setState(() { _campaign = campaign; _loading = false; });
    } catch (e) {
      setState(() { _error = 'تعذر تحميل الحملات'; _loading = false; });
    }
  }

  Future<void> _logout() async {
    await AuthService.logout();
    if (!mounted) return;
    context.go('/phone');
  }

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        backgroundColor: kBackground,
        appBar: AppBar(
          backgroundColor: kPrimary,
          title: const Text('تجربتي', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900)),
          actions: [
            IconButton(
              icon: const Icon(Icons.logout, color: Colors.white70),
              onPressed: _logout,
            ),
          ],
          automaticallyImplyLeading: false,
        ),
        body: _loading
            ? const Center(child: CircularProgressIndicator(color: kPrimary))
            : _error != null
                ? Center(child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(_error!, style: const TextStyle(color: kAccent)),
                      const SizedBox(height: 16),
                      TextButton(onPressed: _load, child: const Text('إعادة المحاولة')),
                    ],
                  ))
                : _campaign == null
                    ? const Center(child: Text('لا توجد حملات نشطة حالياً'))
                    : _CampaignCard(campaign: _campaign!),
        floatingActionButton: _campaign != null
            ? FloatingActionButton.extended(
                backgroundColor: kAccent,
                onPressed: () => context.push('/scanner', extra: _campaign!.id),
                icon: const Icon(Icons.qr_code_scanner, color: Colors.white),
                label: const Text('مسح QR', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
              )
            : null,
      ),
    );
  }
}

class _CampaignCard extends StatelessWidget {
  final Campaign campaign;
  const _CampaignCard({required this.campaign});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 8),
          Text('الحملة المتاحة', style: TextStyle(fontSize: 13, color: Colors.grey.shade500, fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 16, offset: const Offset(0, 4))],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                  child: Image.network(
                    campaign.productImage,
                    height: 200,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 200,
                      color: kPrimary,
                      child: const Icon(Icons.image_not_supported, color: Colors.white54, size: 48),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(campaign.productName, style: const TextStyle(
                              fontSize: 22, fontWeight: FontWeight.w900, color: kPrimary,
                            )),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(color: kAccent, borderRadius: BorderRadius.circular(20)),
                            child: Text(
                              '${campaign.rewardPoints} نقطة',
                              style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(campaign.brandName, style: TextStyle(color: Colors.grey.shade500, fontSize: 14)),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          const Icon(Icons.location_on_outlined, size: 16, color: kAccent),
                          const SizedBox(width: 4),
                          Text(campaign.locationName, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(campaign.description, style: TextStyle(color: Colors.grey.shade700, fontSize: 14, height: 1.5)),
                      const SizedBox(height: 20),
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: kPrimary.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.info_outline, size: 18, color: kPrimary),
                            const SizedBox(width: 8),
                            const Expanded(
                              child: Text(
                                'اضغط زر "مسح QR" لمسح الرمز وبدء التجربة',
                                style: TextStyle(fontSize: 13, color: kPrimary),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
