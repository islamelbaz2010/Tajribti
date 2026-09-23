// FOUNDER DIRECTION 2026-09-24 — Public Website content management.
// Structured payloads for the fixed public-site sections. This is NOT a
// generic CMS: the key set below is closed, every payload is validated
// against a zod schema before it can be saved as a draft, and only
// PLATFORM_ADMIN may write (route layer). The public site renders the
// `published` payload for each section and falls back to its static
// markup when nothing is published — an unparsed or missing row can
// never blank the homepage.

import { z } from "zod";

export const SITE_SECTION_KEYS = [
  "hero",
  "howItWorks",
  "sectors",
  "studyTypes",
  "sampleReport",
  "cta",
] as const;
export type SiteSectionKey = (typeof SITE_SECTION_KEYS)[number];

const href = z
  .string()
  .min(1)
  .max(500)
  .refine((v) => v.startsWith("/") || v.startsWith("#") || v.startsWith("mailto:") || v.startsWith("https://"), {
    message: "Link target must be an on-site path, anchor, mailto: or https:// URL",
  });
const short = (max = 160) => z.string().min(1).max(max);
const long = (max = 600) => z.string().min(1).max(max);

// Study-type cards are keyed to the cards already defined on the public
// page — content management can rename/relabel/reorder them but cannot
// invent a methodology that is not on this list.
export const STUDY_CARD_KEYS = [
  "post-trial-differentiation",
  "packaging-claims",
  "usage-attitude",
  "concept-test",
  "pricing-perception",
  "packaging-evaluation",
  "ad-message",
  "brand-perception",
  "segmentation",
] as const;

export const SITE_SECTION_SCHEMAS: Record<SiteSectionKey, z.ZodTypeAny> = {
  hero: z.object({
    eyebrow: short(),
    headline: short(220),
    sub: long(),
    primaryCtaLabel: short(60),
    primaryCtaHref: href,
    secondaryCtaLabel: short(60),
    secondaryCtaHref: href,
  }),
  howItWorks: z.object({
    steps: z
      .array(z.object({ title: short(120), text: long(400) }))
      .min(1)
      .max(6),
  }),
  sectors: z.object({
    items: z
      .array(
        z.object({
          name: short(120),
          description: long(300),
          // Either an uploaded SiteMedia id ("media:<id>") or an on-site
          // asset path ("/assets/...") — no remote hotlinking.
          image: z
            .string()
            .min(1)
            .max(500)
            .refine((v) => v.startsWith("media:") || v.startsWith("/"), {
              message: "Image must be a media-library id (media:…) or an on-site path",
            }),
          alt: z.string().max(300).default(""),
          order: z.number().int().min(0).max(99),
          active: z.boolean(),
        })
      )
      .min(1)
      .max(12),
  }),
  studyTypes: z.object({
    items: z
      .array(
        z.object({
          key: z.enum(STUDY_CARD_KEYS),
          title: short(160),
          purpose: long(400),
          statusLabel: short(80),
          order: z.number().int().min(0).max(99),
          active: z.boolean(),
        })
      )
      .min(1)
      .max(STUDY_CARD_KEYS.length)
      .refine((items) => new Set(items.map((i) => i.key)).size === items.length, {
        message: "Each study card may appear at most once",
      }),
  }),
  sampleReport: z.object({
    title: short(160),
    supportingText: long(),
    ctaLabel: short(60),
    ctaHref: href,
  }),
  cta: z.object({
    headline: short(160),
    supportingText: long(),
    ctaLabel: short(60),
    ctaHref: href,
  }),
};

// Defaults mirror the static markup in web/public/index.html so the
// admin editor opens pre-filled with what the site currently shows —
// nothing is invented here beyond what already renders publicly.
export const SITE_SECTION_DEFAULTS: Record<SiteSectionKey, unknown> = {
  hero: {
    eyebrow: "Consumer Intelligence, from a Real Trial",
    headline: "See how consumers actually respond before you decide.",
    sub: "TAJRIBTI puts your product in real consumers' hands, then turns their trial into a structured, evidence-grounded report — ready for a commercial decision.",
    primaryCtaLabel: "Book a demo",
    primaryCtaHref: "#contact",
    secondaryCtaLabel: "See a sample report",
    secondaryCtaHref: "#report",
  },
  howItWorks: {
    steps: [
      { title: "Real consumers try your product", text: "Consumers discover your campaign or scan its QR code, answer eligibility screening, and receive the product to try in real conditions." },
      { title: "Structured feedback after the trial", text: "After trying the product, consumers answer the campaign's survey — ratings, purchase intent, campaign-specific questions and open verbatims." },
      { title: "Evidence becomes a decision-ready report", text: "Every response is persisted and measured live — funnel, purchase intent, audience differences and findings land in a report your team can act on." },
    ],
  },
  sectors: {
    items: [
      { name: "Food & Beverage", description: "Trial-based repeat-purchase and taste/experience response.", image: "/assets/img/product-cans.jpg", alt: "Beverage cans — product trial", order: 0, active: true },
      { name: "Beauty & Personal Care", description: "Did it perform as expected — and would they buy it again.", image: "/assets/img/product-skincare.jpg", alt: "Unbranded amber dropper bottle — personal-care product trial", order: 1, active: true },
      { name: "Home Care / Household", description: "Ease of use and repeat-purchase after real household use.", image: "/assets/img/product-cleaning.jpg", alt: "Unbranded household spray cleaner — a product a consumer can actually trial", order: 2, active: true },
    ],
  },
  studyTypes: {
    items: [
      { key: "post-trial-differentiation", title: "Post-Trial — Differentiation & Appeal", purpose: "How appealing and differentiated is the product after a real trial — and what purchase intent does it generate?", statusLabel: "Available now", order: 0, active: true },
      { key: "packaging-claims", title: "Packaging & Claims Reaction", purpose: "Does the packaging and its claim communicate the intended proposition?", statusLabel: "Available now", order: 1, active: true },
      { key: "usage-attitude", title: "Usage & Attitude", purpose: "How does the category currently behave, and what drives choice within it?", statusLabel: "Available now", order: 2, active: true },
      { key: "concept-test", title: "Concept Testing", purpose: "Is the product or approved concept appealing and differentiated enough to proceed?", statusLabel: "Available now", order: 3, active: true },
      { key: "pricing-perception", title: "Pricing Perception", purpose: "Is the perceived price acceptable for the value delivered?", statusLabel: "Available now", order: 4, active: true },
      { key: "packaging-evaluation", title: "Packaging Evaluation", purpose: "Does the pack attract, communicate, and function in real use?", statusLabel: "Available now", order: 5, active: true },
      { key: "ad-message", title: "Advertising / Message Testing", purpose: "Does the intended message land with consumers after exposure?", statusLabel: "Available now", order: 6, active: true },
      { key: "brand-perception", title: "Brand Perception", purpose: "How is the brand perceived by consumers who tried the product?", statusLabel: "Available now", order: 7, active: true },
      { key: "segmentation", title: "Segmentation", purpose: "Do meaningful audience groups respond differently to this product?", statusLabel: "Available now", order: 8, active: true },
    ],
  },
  sampleReport: {
    title: "A decision-ready report",
    supportingText: "Every number below traces back to a real, persisted trial response — this specific example is fictional demo data used only to show the report's shape.",
    ctaLabel: "See a sample report",
    ctaHref: "#report",
  },
  cta: {
    headline: "Book a demo.",
    supportingText: "Tell us about the product and what you need to learn — we'll walk you through how a TAJRIBTI trial and report would work for it.",
    ctaLabel: "Book a demo",
    ctaHref: "mailto:hello@tajribti.com?subject=Demo%20request",
  },
};

export function isSiteSectionKey(key: string): key is SiteSectionKey {
  return (SITE_SECTION_KEYS as readonly string[]).includes(key);
}
