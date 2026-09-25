import type { Request, Response } from "express";
import QRCode from "qrcode";

// FOUNDER-APPROVED (product evolution 2026-09-20): the normal campaign QR
// flow — a QR/source record IS the QR definition; its image is generated
// on demand as a deterministic PNG of the consumer entry URL (nothing
// stored, so the image always encodes the same entry link the UI
// displays). Shared by the Company and Operations surfaces so both render
// the identical QR for the same source — the Platform Admin flow uses this
// exact same generation path rather than a second QR model. The QR is an
// entry mechanism only; campaign status, dates, eligibility and
// participation rules are enforced downstream by the consumer routes
// exactly as for typed entry.
export async function sendQrPng(
  source: { code: string },
  req: Request,
  res: Response
): Promise<void> {
  const entryUrl = `${req.protocol}://${req.get("host")}/app/consumer/?qr=${encodeURIComponent(source.code)}`;
  const png = await QRCode.toBuffer(entryUrl, { width: 512, margin: 2 });
  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Disposition", `inline; filename="qr-${source.code}.png"`);
  res.send(png);
}
