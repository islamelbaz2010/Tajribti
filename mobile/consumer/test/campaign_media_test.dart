// G-M6 (2026-09-21): Campaign media contract — GET /consumer/campaigns/:id
// returns `media` rows with server-resolved urls; the model must parse
// them in order and degrade on malformed input instead of crashing.
import 'package:flutter_test/flutter_test.dart';

import 'package:consumer/core/models.dart';

void main() {
  test('Campaign.fromJson parses media in order with captions', () {
    final c = Campaign.fromJson({
      'id': 'c1',
      'name': 'Campaign X',
      'status': 'ACTIVE',
      'company': {'name': 'Co'},
      'media': [
        {'url': 'https://cdn.example/a.png', 'caption': 'Product', 'kind': 'PRODUCT_IMAGE'},
        {'url': 'https://cdn.example/b.png', 'kind': 'CREATIVE'},
      ],
    });
    expect(c.media.length, 2);
    expect(c.media[0].url, 'https://cdn.example/a.png');
    expect(c.media[0].caption, 'Product');
    expect(c.media[0].kind, 'PRODUCT_IMAGE');
    expect(c.media[1].url, 'https://cdn.example/b.png');
    expect(c.media[1].caption, isNull);
  });

  test('Campaign.fromJson tolerates missing and malformed media', () {
    expect(Campaign.fromJson({'id': 'c1', 'name': 'X'}).media, isEmpty);
    final c = Campaign.fromJson({
      'id': 'c1',
      'media': ['not-a-map', {'url': 'https://cdn.example/ok.png'}],
    });
    expect(c.media.length, 1);
    expect(c.media.single.url, 'https://cdn.example/ok.png');
  });

  test('ParticipationRecord exposes real status for resume routing', () {
    // FD-M3: partial participation statuses must survive parsing — the
    // Activity/Campaign resume logic keys off them.
    for (final status in ['ENTERED', 'TRIAL_REDEEMED', 'SURVEY_COMPLETE', 'INELIGIBLE']) {
      final r = ParticipationRecord.fromJson({
        'id': 'p1',
        'campaignId': 'c1',
        'enteredAt': '2026-09-21T10:00:00.000Z',
        'status': status,
        'campaign': {'name': 'C'},
      });
      expect(r.status, status);
    }
  });
}
