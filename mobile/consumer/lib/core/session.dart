// Mobile Recovery + Current-Backend Alignment (2026-09-15): the current
// backend has no separate "redemption id" or points concept — trial
// redemption is just a status transition on the Participation row, keyed
// by campaignId + the authenticated consumer (see api/src/routes/
// consumer.ts POST /campaigns/:id/redeem). `redemptionId` is kept only so
// the small number of screens that thread a redemption identifier through
// GoRouter's `extra` keep the same shape; it is always set to the
// campaignId itself, never used as a real separate id server-side.
class JourneySession {
  static String? campaignId;
  static String? qrSourceId;
  static String? redemptionId;

  static void start(String id, {String? qrSourceId}) {
    campaignId = id;
    JourneySession.qrSourceId = qrSourceId;
    redemptionId = null;
  }

  static void markRedeemed() {
    redemptionId = campaignId;
  }

  static bool get hasActiveCampaign => campaignId != null;

  static void clear() {
    campaignId = null;
    qrSourceId = null;
    redemptionId = null;
  }
}
