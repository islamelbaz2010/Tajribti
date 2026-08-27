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

const String kAccessTokenKey = 'access_token';
const String kRefreshTokenKey = 'refresh_token';
const String kConsumerIdKey = 'consumer_id';
