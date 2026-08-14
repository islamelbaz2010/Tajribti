class JourneySession {
  static String? campaignId;
  static String? redemptionId;
  static int pointsEarned = 0;

  static void start(String id) {
    campaignId = id;
    redemptionId = null;
    pointsEarned = 0;
  }

  static void setRedemption(String id, int points) {
    redemptionId = id;
    pointsEarned = points;
  }

  static bool get hasActiveCampaign => campaignId != null;

  static void clear() {
    campaignId = null;
    redemptionId = null;
    pointsEarned = 0;
  }
}
