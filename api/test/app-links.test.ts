import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma, startApi, ApiCall } from "./helpers";

// FD-M7 (2026-09-21): Digital Asset Links for Android App Links. The
// consumer app's manifest declares an autoVerify intent-filter for
// https://<api-host>/app/consumer/*; Android verifies that claim against
// /.well-known/assetlinks.json on this API. The release-cert SHA-256 is an
// environment value (ANDROID_APP_LINKS_SHA256) — unset must serve a valid
// EMPTY statement list so verification fails closed into the web
// fallback, never an error or an invented fingerprint.

let api: ApiCall;
let stopServer: () => Promise<void>;
const OLD_FP = process.env.ANDROID_APP_LINKS_SHA256;

before(async () => {
  ({ api, stop: stopServer } = await startApi());
});

after(async () => {
  if (OLD_FP === undefined) delete process.env.ANDROID_APP_LINKS_SHA256;
  else process.env.ANDROID_APP_LINKS_SHA256 = OLD_FP;
  await stopServer();
  await prisma.$disconnect();
});

describe("FD-M7 Android App Links — Digital Asset Links", () => {
  it("serves an empty statement list when no release fingerprint is configured", async () => {
    delete process.env.ANDROID_APP_LINKS_SHA256;
    const res = await api("/.well-known/assetlinks.json");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
  });

  it("serves the android_app statement for com.tajribti.consumer when configured", async () => {
    process.env.ANDROID_APP_LINKS_SHA256 = "AA:BB:CC";
    const res = await api("/.well-known/assetlinks.json");
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    const stmt = res.body[0];
    assert.deepEqual(stmt.relation, ["delegate_permission/common.handle_all_urls"]);
    assert.equal(stmt.target.namespace, "android_app");
    assert.equal(stmt.target.package_name, "com.tajribti.consumer");
    assert.deepEqual(stmt.target.sha256_cert_fingerprints, ["AA:BB:CC"]);
  });
});
