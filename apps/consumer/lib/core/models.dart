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

  // Date-only comparison in the device's local time: a campaign starting
  // "tomorrow" should read as Coming Soon to the consumer looking at their
  // own clock, which matters more for this label than exact synchronization
  // with the server's UTC-based gate (the server remains the actual
  // authority — this only affects what the app shows before that gate is
  // even reached).
  bool get isComingSoon {
    if (status != 'active' || startDate == null || startDate!.isEmpty) return false;
    try {
      final start = DateTime.parse(startDate!);
      final today = DateTime.now();
      final todayDateOnly = DateTime(today.year, today.month, today.day);
      return DateTime(start.year, start.month, start.day).isAfter(todayDateOnly);
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
