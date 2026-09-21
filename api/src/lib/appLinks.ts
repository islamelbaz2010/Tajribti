import type { Request, Response } from "express";

// FD-M7 (2026-09-21): Digital Asset Links for Android App Links. The
// consumer app's manifest declares an autoVerify intent-filter for
// https://<api-host>/app/consumer/*; Android verifies that claim against
// /.well-known/assetlinks.json on this API. The release-cert SHA-256 is an
// environment value (ANDROID_APP_LINKS_SHA256) because no release keystore
// exists in-repo — signing is a release gate, not a codebase constant.
// Unset serves an empty statement list: verification simply fails and
// every QR link falls back to the web Consumer — the correct behavior
// until release signing lands.
export function assetLinksHandler(_req: Request, res: Response) {
  const sha256 = (process.env.ANDROID_APP_LINKS_SHA256 ?? "").trim();
  res.json(
    sha256
      ? [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
              namespace: "android_app",
              package_name: "com.tajribti.consumer",
              sha256_cert_fingerprints: [sha256],
            },
          },
        ]
      : []
  );
}
