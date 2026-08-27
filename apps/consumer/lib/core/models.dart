class Campaign {
  final String id;
  final String productName;
  final String brandName;
  final String description;
  final String locationName;
  final String productImage;
  final int rewardPoints;
  final List<SurveyQuestion> surveyQuestions;

  const Campaign({
    required this.id,
    required this.productName,
    required this.brandName,
    required this.description,
    required this.locationName,
    required this.productImage,
    required this.rewardPoints,
    required this.surveyQuestions,
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
      );
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
