import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

const publicSite = fs.readFileSync(path.resolve(__dirname, "../../web/public/index.html"), "utf8");

describe("public website truth gate", () => {
  it("keeps the reconciled package/report claims and removes the stale I→D sample block", () => {
    for (const required of [
      "Four study packages",
      "Essential",
      "Standard",
      "Professional",
      "Custom",
      "Illustrative example — fictional demo data",
      "Evidence coverage",
      "No package promises statistical significance, prediction, or an automated Insight → Decision verdict",
      "No consumer account or app download is required",
    ]) {
      assert.ok(publicSite.includes(required), `missing ${required}`);
    }

    for (const forbidden of [
      "idr-chain",
      "idr-step",
      "Directional support to proceed",
      "Insight → decision</div>",
      "decision-ready report",
      "guaranteed SLA",
      "public pricing",
    ]) {
      assert.equal(publicSite.includes(forbidden), false, `unexpected ${forbidden}`);
    }
  });

  it("keeps the nine public study cards in the approved catalog", () => {
    const cards = publicSite.match(/<div class="study-card" data-study-key=/g) ?? [];
    assert.equal(cards.length, 9);
    assert.ok(publicSite.includes("Available now — every study below runs on the live trial"));
    assert.ok(publicSite.includes("Approved directions — methodology in development, not yet executable"));
  });
});
