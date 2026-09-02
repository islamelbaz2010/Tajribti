class Campaign {
  final String id;
  final String productName;
  final String brandName;
  final String description;
  final String locationName;
  final String productImage;
  final int rewardPoints;
  final List<SurveyQuestion> surveyQuestions;
  // Campaign lifecycle (draft/active/paused/completed). Discovery (GET
  // /campaigns) and entry (enterCampaignWeb) already enforce this
  // server-side; this field lets Campaign Detail itself show a clear
  // unavailable state instead of a misleading Start Trial for a
  // non-active campaign reached directly (stale QR, bookmarked link).
  final String status;
  // Campaign Scheduling / "Coming Soon" (2026-09-01): startDate/endDate
  // are plain 'YYYY-MM-DD' strings (no time-of-day, matching the existing
  // Postgres `date` column convention already used elsewhere in the
  // product — no new timezone policy introduced). A campaign can be
  // status=active with a future startDate: it's genuinely configured and
  // publicly discoverable, but not yet open for participation — the API
  // (qr.service.ts/auth.service.ts) already enforces this server-side;
  // isComingSoon here only drives the client-side presentation so the
  // consumer sees why the button is disabled instead of a raw API error.
  final String? startDate;
  final String? endDate;

  const Campaign({
    required this.id,
    required this.productName,
    required this.brandName,
    required this.description,
    required this.locationName,
    required this.productImage,
    required this.rewardPoints,
    required this.surveyQuestions,
    this.status = 'active',
    this.startDate,
    this.endDate,
  });

  factory Campaign.fromJson(Map<String, dynamic> json) => Campaign(
        id: json['id'] as String,
        productName: json['productName'] as String,
        brandName: json['brandName'] as String,
        description: json['description'] as String? ?? '',
        locationName: json['locationName'] as String? ?? '',
        productImage: json['productImage'] as String? ?? '',
        rewardPoints: json['rewardPoints'] as int? ?? 0,
        surveyQuestions: (json['surveyQuestions'] as List<dynamic>? ?? [])
            .map((q) => SurveyQuestion.fromJson(q as Map<String, dynamic>))
            .toList(),
        status: json['status'] as String? ?? 'active',
        startDate: json['startDate'] as String?,
        endDate: json['endDate'] as String?,
      );

  // Cross-surface consistency fix (2026-09-02): both getters below used to
  // compare against `DateTime.now()` — the DEVICE's own local clock/
  // timezone, whatever that happens to be set to — with a comment
  // justifying it as matching "the server's UTC-based gate". That was true
  // once, but the server side of this exact comparison was fixed in DL-085
  // the same day these getters were written: `campaign.entity.ts`'s
  // `todayInCairo()` now computes "today" in Africa/Cairo specifically,
  // because a UTC-based gate rejected a same-day Cairo campaign for the
  // first ~2 hours of every Cairo day (a real, reproduced production
  // incident). This getter's own comment was never updated to match, so it
  // silently reintroduced the same class of mismatch one layer up: a
  // consumer whose phone is not set to Cairo time (traveling, a
  // misconfigured clock, or simply a non-Cairo device timezone) could see
  // "Coming Soon" or "Ended" for a campaign the server would actually
  // accept right now — locking them out of the entry button before ever
  // reaching the real, authoritative server check. Fixed the same way the
  // server was: pin to Cairo's calendar date, not the device's own zone.
  // Africa/Cairo has been a fixed UTC+2 offset with no DST since 2014 (the
  // same fact DL-085's server-side fix relies on), so a full IANA timezone
  // package isn't needed here — UTC+2 is exact, not an approximation, and
  // this uses only Dart's built-in DateTime.
  static DateTime _todayInCairo() {
    final cairoNow = DateTime.now().toUtc().add(const Duration(hours: 2));
    return DateTime(cairoNow.year, cairoNow.month, cairoNow.day);
  }

  // Presentation only — the API (isCampaignOpenForParticipation) remains
  // the real authority; this only decides what the app shows before that
  // gate is ever reached.
  bool get isComingSoon {
    if (status != 'active' || startDate == null || startDate!.isEmpty) return false;
    try {
      final start = DateTime.parse(startDate!);
      final startDateOnly = DateTime(start.year, start.month, start.day);
      return startDateOnly.isAfter(_todayInCairo());
    } catch (_) {
      return false;
    }
  }

  // Campaign End-Date Gate (2026-09-01, pass 2): the symmetric mirror of
  // isComingSoon above — status=active but endDate has already passed, so
  // participation is closed even though the campaign is still nominally
  // "active" (no new lifecycle status; see campaign.entity.ts's
  // hasCampaignEnded on the API side, which this presentation-only getter
  // mirrors). endDate is INCLUSIVE — the campaign is still open THROUGH
  // its end date, not before it; only "before today" (Cairo) counts as
  // ended. Presentation only — the API remains the real authority.
  bool get hasEnded {
    if (status != 'active' || endDate == null || endDate!.isEmpty) return false;
    try {
      final end = DateTime.parse(endDate!);
      final endDateOnly = DateTime(end.year, end.month, end.day);
      return endDateOnly.isBefore(_todayInCairo());
    } catch (_) {
      return false;
    }
  }
}

class SurveyQuestion {
  final String id;
  final String text;
  final String textAr;
  final String type;
  final List<String> options;
  final List<String> optionsAr;
  final bool required;

  const SurveyQuestion({
    required this.id,
    required this.text,
    required this.textAr,
    required this.type,
    required this.options,
    required this.optionsAr,
    required this.required,
  });

  factory SurveyQuestion.fromJson(Map<String, dynamic> json) => SurveyQuestion(
        id: json['id'] as String,
        text: json['text'] as String,
        textAr: json['textAr'] as String? ?? json['text'] as String,
        type: json['type'] as String,
        options: List<String>.from(json['options'] as List<dynamic>? ?? []),
        optionsAr: List<String>.from(json['optionsAr'] as List<dynamic>? ?? []),
        required: json['required'] as bool? ?? true,
      );
}

class RedemptionResult {
  final String redemptionId;
  final int pointsEarned;
  final bool alreadyCompleted;

  const RedemptionResult({
    required this.redemptionId,
    required this.pointsEarned,
    this.alreadyCompleted = false,
  });

  factory RedemptionResult.fromJson(Map<String, dynamic> json) => RedemptionResult(
        redemptionId: json['redemptionId'] as String? ?? json['id'] as String? ?? '',
        pointsEarned: json['pointsEarned'] as int? ?? json['rewardPoints'] as int? ?? 0,
        alreadyCompleted: json['alreadyCompleted'] as bool? ?? false,
      );
}

class ParticipationRecord {
  final String id;
  final String campaignId;
  final String? productName;
  final String? brandName;
  final int rewardPoints;
  final String? productImage;
  final DateTime redeemedAt;

  const ParticipationRecord({
    required this.id,
    required this.campaignId,
    this.productName,
    this.brandName,
    required this.rewardPoints,
    this.productImage,
    required this.redeemedAt,
  });

  factory ParticipationRecord.fromJson(Map<String, dynamic> json) => ParticipationRecord(
        id: json['id'] as String,
        campaignId: json['campaignId'] as String,
        productName: json['productName'] as String?,
        brandName: json['brandName'] as String?,
        rewardPoints: json['rewardPoints'] as int? ?? 0,
        productImage: json['productImage'] as String?,
        redeemedAt: DateTime.parse(json['redeemedAt'] as String),
      );
}

class ConsumerProfile {
  final String id;
  final String phone;
  final String? email;
  final bool emailVerified;
  final String? name;
  final int totalPoints;
  final List<ParticipationRecord> recentCampaigns;

  const ConsumerProfile({
    required this.id,
    required this.phone,
    this.email,
    this.emailVerified = false,
    this.name,
    required this.totalPoints,
    required this.recentCampaigns,
  });

  factory ConsumerProfile.fromJson(Map<String, dynamic> json) => ConsumerProfile(
        id: json['id'] as String,
        phone: json['phone'] as String,
        email: json['email'] as String?,
        emailVerified: json['emailVerified'] as bool? ?? false,
        name: json['name'] as String?,
        totalPoints: json['totalPoints'] as int? ?? 0,
        recentCampaigns: (json['recentCampaigns'] as List<dynamic>? ?? [])
            .map((r) => ParticipationRecord.fromJson(r as Map<String, dynamic>))
            .toList(),
      );
}
