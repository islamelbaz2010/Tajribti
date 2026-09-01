import 'package:flutter/material.dart';

const String kApiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'http://10.0.2.2:3000/api/v1',
);

const Color kPrimary = Color(0xFF1a1a2e);
const Color kAccent = Color(0xFFe94560);
const Color kBackground = Color(0xFFF5F6FA);
const Color kSurface = Color(0xFFFFFFFF);
const Color kGold = Color(0xFFF59E0B);
const Color kSuccess = Color(0xFF10B981);
const Color kCardShadow = Color(0x0D1A1A2E);

// Consumer Experience Polish (2026-09-01): the public marketing site's
// primary brand/CTA accent, reused here so Mobile's primary actions and
// hero surfaces align with the same brand family instead of the dark-navy
// fills previously used for app bars and CTA buttons across Home and
// Campaign Detail. kPrimary is unchanged and still used as the app's ink
// (text/icon) color everywhere it already was — only specific background
// fills move from kPrimary to kBrand.
const Color kBrand = Color(0xFFB2F24D);
const Color kBrandSoft = Color(0xFFEFFAD1);

const String kAccessTokenKey = 'access_token';
const String kRefreshTokenKey = 'refresh_token';
const String kConsumerIdKey = 'consumer_id';
