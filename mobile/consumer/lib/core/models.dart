import 'dart:convert';

// Mobile Recovery + Current-Backend Alignment (2026-09-15): field
// *semantics* below are re-derived from the actual current Prisma schema
// (api/prisma/schema.prisma) and the actual JSON the current routes
// return — not the retired backend's shape. Two deliberate choices to
// minimize churn across ~10 screen files while staying honest to current
// data:
//   - Field NAMES (productName, brandName, textAr, ...) are kept where
//     practical so existing screen widgets keep compiling unchanged; only
//     fromJson() changes what they are populated from.
//   - rewardPoints / totalPoints are gone entirely (G-M2, 2026-09-21):
//     the current product has no points/rewards system (Benchmark defines
//     none; a historical Rewards Pilot was not carried into this rebuild)
//     and no consumer-visible reward language may remain — the fields and
//     every render site were removed rather than hidden behind a 0.
//   - textAr / optionsAr are populated from the same text/options the
//     current Question model actually stores (single-language — the
//     current schema has no Arabic-translation column for
//     campaign-specific question content). The app's own UI chrome
//     (buttons, labels, static strings) stays Arabic/RTL via l10n.dart;
//     only dynamically-configured campaign content is English-only,
//     because that is genuinely all the current backend provides.
class Campaign {
  final String id;
  final String productName; // Campaign.name (the campaign's own title)
  final String brandName; // Campaign.company.name
  final String description; // Campaign.objective (or product.description if present)
  final String locationName; // no current equivalent — always ''
  final String productImage; // Campaign.product?.imageUrl ?? ''
  // OFD-12 / G-M6 (2026-09-21): campaign media as returned by
  // GET /consumer/campaigns/:id — url already resolved server-side
  // (resolveMediaUrls), order preserved as returned.
  final List<CampaignMedia> media;
  final List<SurveyQuestion> eligibilityQuestions;
  final String status;
  final String? startDate;
  final String? endDate;

  const Campaign({
    required this.id,
    required this.productName,
    required this.brandName,
    required this.description,
    required this.locationName,
    required this.productImage,
    this.media = const [],
    required this.eligibilityQuestions,
    this.status = 'ACTIVE',
    this.startDate,
    this.endDate,
  });

  factory Campaign.fromJson(Map<String, dynamic> json) {
    final company = json['company'] as Map<String, dynamic>?;
    final product = json['product'] as Map<String, dynamic>?;
    final questions = (json['questions'] as List<dynamic>? ?? [])
        .map((q) => SurveyQuestion.fromJson(q as Map<String, dynamic>))
        .toList();
    // G-M6: tolerate malformed media — a non-map item is dropped rather
    // than crashing the whole campaign view.
    final media = (json['media'] as List<dynamic>? ?? [])
        .whereType<Map<String, dynamic>>()
        .map(CampaignMedia.fromJson)
        .toList();
    return Campaign(
      id: json['id'] as String,
      productName: json['name'] as String? ?? '',
      brandName: company?['name'] as String? ?? '',
      description: (product?['description'] as String?) ?? (json['objective'] as String? ?? ''),
      locationName: '',
      productImage: (product?['imageUrl'] as String?) ?? '',
      media: media,
      eligibilityQuestions: questions,
      status: json['status'] as String? ?? 'ACTIVE',
      startDate: json['startDate'] as String?,
      endDate: json['endDate'] as String?,
    );
  }

  // Presentation only — the API remains the real authority on whether a
  // campaign can actually be entered; these only decide what the app
  // shows before that server check is ever reached. Cairo has been a
  // fixed UTC+2 offset with no DST since 2014, so a full IANA timezone
  // package is not needed for this same-calendar-day comparison.
  static DateTime _todayInCairo() {
    final cairoNow = DateTime.now().toUtc().add(const Duration(hours: 2));
    return DateTime(cairoNow.year, cairoNow.month, cairoNow.day);
  }

  bool get isComingSoon {
    if (status != 'ACTIVE' || startDate == null || startDate!.isEmpty) return false;
    try {
      final start = DateTime.parse(startDate!);
      return DateTime(start.year, start.month, start.day).isAfter(_todayInCairo());
    } catch (_) {
      return false;
    }
  }

  bool get hasEnded {
    if (endDate == null || endDate!.isEmpty) return false;
    try {
      final end = DateTime.parse(endDate!);
      return DateTime(end.year, end.month, end.day).isBefore(_todayInCairo());
    } catch (_) {
      return false;
    }
  }
}

class SurveyQuestion {
  final String id;
  final String text;
  final String textAr; // no current translation column — mirrors text
  final String type; // SINGLE_CHOICE | MULTI_CHOICE | TEXT | RATING_1_5 | PURCHASE_INTENT_1_5
  final List<String> options; // display labels
  final List<String> optionIds; // same order as options — submitted as valueOptions
  final List<String> optionsAr; // no current translation column — mirrors options
  final bool required;

  const SurveyQuestion({
    required this.id,
    required this.text,
    required this.textAr,
    required this.type,
    required this.options,
    required this.optionIds,
    required this.optionsAr,
    required this.required,
  });

  // Question.options is a JSON string of [{id,label}] on the current
  // backend (Prisma column is `String?`, not a JSON column) — dio does
  // not decode it automatically, so it is parsed here.
  factory SurveyQuestion.fromJson(Map<String, dynamic> json) {
    final rawOptions = json['options'];
    List<String> labels = [];
    List<String> ids = [];
    if (rawOptions is String && rawOptions.isNotEmpty) {
      try {
        final decoded = jsonDecode(rawOptions) as List<dynamic>;
        labels = decoded.map((o) => (o is Map ? o['label'] as String? : null) ?? '').toList();
        ids = decoded.map((o) => (o is Map ? o['id'] as String? : null) ?? '').toList();
      } catch (_) {
        labels = [];
        ids = [];
      }
    } else if (rawOptions is List) {
      labels = rawOptions.map((o) => (o is Map ? o['label'] as String? : o?.toString()) ?? '').toList();
      ids = rawOptions.map((o) => (o is Map ? o['id'] as String? : o?.toString()) ?? '').toList();
    }
    final text = json['text'] as String? ?? '';
    return SurveyQuestion(
      id: json['id'] as String,
      text: text,
      textAr: text,
      type: json['type'] as String? ?? 'TEXT',
      options: labels,
      optionIds: ids,
      optionsAr: labels,
      required: json['required'] as bool? ?? true,
    );
  }
}

// CampaignMedia row (OFD-12 / D-5): kind is one of PRODUCT_IMAGE /
// PACKAGING_IMAGE / CAMPAIGN_MEDIA / CREATIVE; url is already resolved
// server-side (signed GET for hosted rows, plain value for URL rows).
// Rendering must still restrict to http(s) — same rule as the web
// consumer — and fail per-item rather than breaking the page.
class CampaignMedia {
  final String url;
  final String? caption;
  final String kind;

  const CampaignMedia({required this.url, this.caption, this.kind = 'CAMPAIGN_MEDIA'});

  factory CampaignMedia.fromJson(Map<String, dynamic> json) => CampaignMedia(
        url: json['url'] as String? ?? '',
        caption: json['caption'] as String?,
        kind: json['kind'] as String? ?? 'CAMPAIGN_MEDIA',
      );
}

class QrResolution {
  final String campaignId;
  final String sourceId;
  final String sourceLabel;

  const QrResolution({required this.campaignId, required this.sourceId, required this.sourceLabel});

  factory QrResolution.fromJson(Map<String, dynamic> json) => QrResolution(
        campaignId: json['campaignId'] as String,
        sourceId: json['sourceId'] as String,
        sourceLabel: json['sourceLabel'] as String? ?? '',
      );
}

class ParticipationRecord {
  final String id;
  final String campaignId;
  final String? productName; // Participation.campaign.name
  final String? brandName; // no current nested company name on this endpoint — null
  final String? productImage; // always null — no current equivalent
  final DateTime redeemedAt;
  final String status;

  const ParticipationRecord({
    required this.id,
    required this.campaignId,
    this.productName,
    this.brandName,
    this.productImage,
    required this.redeemedAt,
    required this.status,
  });

  factory ParticipationRecord.fromJson(Map<String, dynamic> json) {
    final campaign = json['campaign'] as Map<String, dynamic>?;
    return ParticipationRecord(
      id: json['id'] as String,
      campaignId: json['campaignId'] as String,
      productName: campaign?['name'] as String?,
      brandName: null,
      productImage: null,
      redeemedAt: DateTime.parse(json['enteredAt'] as String),
      status: json['status'] as String? ?? campaign?['status'] as String? ?? 'ENTERED',
    );
  }
}

// Benchmark Alignment — Audience/Eligibility. No `reason` field on the
// current POST /eligibility response (it returns eligible + the created
// participation row) — kept nullable only so any pre-existing UI that
// reads it degrades to no message instead of failing to compile/crash.
class EligibilityResult {
  final bool eligible;
  final String? reason;
  const EligibilityResult({required this.eligible, this.reason});
}
