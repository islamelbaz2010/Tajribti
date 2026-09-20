// B-04 evidence-based load validation for the CURRENT stack (OFD-20).
// Replaces reliance on legacy performance assumptions with a measured run
// against this implementation's QR write path:
//
//   GET  /api/consumer/qr/:code          (read — date gating + resolution)
//   POST /api/consumer/campaigns/:id/eligibility  (write — participation row)
//
// Usage (against a running API seeded with a campaign + QR source):
//   BASE=http://localhost:4000 CAMPAIGN_ID=... QR_CODE=... CONSUMER_TOKEN=... \
//     npx ts-node --transpile-only scripts/load-test-qr.ts [concurrency] [requests]
//
// Read endpoints need no auth. The write path requires a valid consumer JWT
// and unique consumers per request for a true write-path measure — the
// Already-Participated unique constraint (campaignId, consumerId) means one
// token can only write once, so this script reports write latency for the
// first write and 409-rejection latency for repeats. For a full write-path
// load figure, run against a seeded pool of consumer tokens (CONSUMER_TOKENS
// env, comma-separated).

const BASE = process.env.BASE ?? "http://localhost:4000";
const CAMPAIGN_ID = process.env.CAMPAIGN_ID;
const QR_CODE = process.env.QR_CODE;
const TOKENS = (process.env.CONSUMER_TOKENS ?? process.env.CONSUMER_TOKEN ?? "")
  .split(",").map((t) => t.trim()).filter(Boolean);

async function timed(fn: () => Promise<Response>) {
  const t0 = performance.now();
  const res = await fn();
  const ms = performance.now() - t0;
  return { status: res.status, ms };
}

function stats(samples: number[]) {
  const s = [...samples].sort((a, b) => a - b);
  const pct = (p: number) => s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
  return {
    n: s.length,
    min: Number(s[0]?.toFixed(1)),
    p50: Number(pct(50)?.toFixed(1)),
    p95: Number(pct(95)?.toFixed(1)),
    p99: Number(pct(99)?.toFixed(1)),
    max: Number(s[s.length - 1]?.toFixed(1)),
    mean: Number((s.reduce((a, b) => a + b, 0) / s.length).toFixed(1)),
  };
}

async function main() {
  const concurrency = Number(process.argv[2] ?? 20);
  const total = Number(process.argv[3] ?? 500);
  if (!QR_CODE || !CAMPAIGN_ID) {
    console.error("CAMPAIGN_ID and QR_CODE env vars are required.");
    process.exit(1);
  }

  console.log(`B-04 load validation — ${BASE} — ${total} requests @ concurrency ${concurrency}`);

  // 1. QR resolution (public read path)
  const readLat: number[] = [];
  const readErrors: Record<number, number> = {};
  let idx = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (idx++ < total) {
        const r = await timed(() => fetch(`${BASE}/api/consumer/qr/${QR_CODE}`));
        readLat.push(r.ms);
        readErrors[r.status] = (readErrors[r.status] ?? 0) + 1;
      }
    })
  );
  console.log("\nGET /consumer/qr/:code");
  console.log("  latency ms:", JSON.stringify(stats(readLat)));
  console.log("  status:", JSON.stringify(readErrors));

  // 2. Write path — eligibility (one write per consumer token; repeats
  //    exercise the Already-Participated rejection path, also a real load)
  if (!TOKENS.length) {
    console.log("\nPOST /eligibility skipped — no CONSUMER_TOKEN(S) provided.");
    return;
  }
  const writeLat: number[] = [];
  const writeStatus: Record<number, number> = {};
  let wIdx = 0;
  const writeTotal = Math.max(total, TOKENS.length);
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (wIdx++ < writeTotal) {
        const token = TOKENS[wIdx % TOKENS.length];
        const r = await timed(() =>
          fetch(`${BASE}/api/consumer/campaigns/${CAMPAIGN_ID}/eligibility`, {
            method: "POST",
            headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
            body: JSON.stringify({}),
          })
        );
        writeLat.push(r.ms);
        writeStatus[r.status] = (writeStatus[r.status] ?? 0) + 1;
      }
    })
  );
  console.log("\nPOST /consumer/campaigns/:id/eligibility");
  console.log("  latency ms:", JSON.stringify(stats(writeLat)));
  console.log("  status:", JSON.stringify(writeStatus), "(200=write, 409=already-participated)");
  console.log("\nNote: SQLite write throughput is the local-dev ceiling; production Postgres on Railway must be re-measured with this same script before B-04 can be claimed closed.");
}

main().catch((e) => { console.error(e); process.exit(1); });
