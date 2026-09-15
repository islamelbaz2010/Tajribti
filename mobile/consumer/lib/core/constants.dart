import 'package:flutter/material.dart';

// Mobile Recovery + Current-Backend Alignment (2026-09-15): the old
// kApiBase pointed at a retired backend ("/api/v1" on port 3000, with its
// own account/refresh-token/Akedly-challenge contract). The current
// TAJRIBTI Benchmark Edition API has no version prefix, listens on 4000,
// and mounts Consumer/Company/Ops under /api/consumer, /api/company,
// /api/ops respectively (see api/src/server.ts) — those segments are
// added per-client (api_client.dart / employee_api_client.dart), not here.
const String kApiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'http://10.0.2.2:4000/api',
);

// Mobile Recovery — Visual Identity Alignment (2026-09-15): retargeted
// from the app's old dark-navy/lime palette to the exact palette the
// current released public website and Company/Ops web apps use
// (web/public/index.html :root — --ink, --primary, --bg, --primary-ink),
// so mobile reads as the same product, not a separate brand. Semantics of
// each constant (kPrimary = ink/text, kBrand = CTA/background accent,
// kBackground/kSurface = screen/card fill) are unchanged from the
// original app; only the color values move to the current brand.
const Color kPrimary = Color(0xFF241914); // current web --ink
const Color kAccent = Color(0xFFD64545); // error/negative state (distinct from brand orange)
const Color kBackground = Color(0xFFFAF1EB); // current web --bg
const Color kSurface = Color(0xFFFFFFFF);
const Color kGold = Color(0xFFF59E0B);
const Color kSuccess = Color(0xFF10B981);
const Color kCardShadow = Color(0x1A3C1E0A);

const Color kBrand = Color(0xFFEB6B45); // current web --primary (CTA/background accent)
const Color kBrandSoft = Color(0xFFF4E7DC); // current web --bg-alt
const Color kBrand600 = Color(0xFFB74D2C); // current web --primary-ink (darker, text-safe)

const String kAccessTokenKey = 'access_token';
const String kConsumerIdKey = 'consumer_id';
const String kConsumerPhoneKey = 'consumer_phone';
const String kConsumerNameKey = 'consumer_name';
