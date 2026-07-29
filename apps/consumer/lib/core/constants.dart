import 'package:flutter/material.dart';

const String kApiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'http://10.0.2.2:3000/api/v1',
);

const Color kPrimary = Color(0xFF1a1a2e);
const Color kAccent = Color(0xFFe94560);
const Color kBackground = Color(0xFFF5F6FA);
const Color kSurface = Color(0xFFFFFFFF);

const String kAccessTokenKey = 'access_token';
const String kRefreshTokenKey = 'refresh_token';
const String kConsumerIdKey = 'consumer_id';
