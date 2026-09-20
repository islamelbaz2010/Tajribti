import 'dart:convert';
import 'package:crypto/crypto.dart';

/// Akedly V1.2 Shield proof-of-work solver (published algorithm): find the
/// nonce such that hex(SHA256("$challenge:$nonce")) starts with `difficulty`
/// zeros. Runs synchronously; at the pipeline's adaptive base difficulty
/// (~3) this is a few thousand hashes — milliseconds. Elevated adaptive
/// difficulty stays within the challenge TTL but blocks the UI thread; the
/// official Shield SDKs offload to an isolate/worker — revisit if pipeline
/// difficulty is ever pinned high.
int solvePow(String challenge, int difficulty) {
  final prefix = '0' * difficulty;
  for (var nonce = 0; nonce < 50000000; nonce++) {
    final digest = sha256.convert(utf8.encode('$challenge:$nonce')).toString();
    if (digest.startsWith(prefix)) return nonce;
  }
  throw StateError('PoW solution not found within budget');
}
