// FOUNDER DIRECTION (2026-09-21 Founder Web Review): Industry must be a
// controlled selection, not free text, and Sub-industry must be a
// dependent selection of the chosen Industry — one canonical taxonomy
// shared by every surface that collects it (Company profile, Ops company
// onboarding). The Benchmark defines no taxonomy, so this list is a
// modest consumer-goods taxonomy consistent with the product's actual
// scope (the study-type categories already cover Food & Beverage,
// Beauty & Personal Care, and Home Care; the rest are adjacent
// consumer-product categories a trial campaign can legitimately cover).
// "Other" is the controlled escape hatch — it keeps the field selectable
// without inventing an enterprise taxonomy.
//
// Canonical source for API + web: GET /api/meta/industries serves this
// list; web surfaces render selects from it, and write validation below
// rejects anything outside it. Legacy rows whose stored industry is not
// in the taxonomy are preserved on read — the UI shows the stored value
// as a non-selectable legacy entry rather than silently rewriting data.

export interface IndustryGroup {
  industry: string;
  subIndustries: string[];
}

export const INDUSTRY_TAXONOMY: IndustryGroup[] = [
  {
    industry: "Food & Beverage",
    subIndustries: [
      "Beverages",
      "Snacks & Confectionery",
      "Dairy & Dairy Alternatives",
      "Packaged & Frozen Foods",
      "Fresh & Perishable Foods",
      "Coffee, Tea & Breakfast",
    ],
  },
  {
    industry: "Beauty & Personal Care",
    subIndustries: [
      "Skincare",
      "Haircare",
      "Color Cosmetics",
      "Personal Hygiene & Care",
      "Fragrance",
    ],
  },
  {
    industry: "Home & Household Care",
    subIndustries: [
      "Laundry Care",
      "Surface & Dish Cleaning",
      "Air & Home Freshening",
      "Paper & Disposables",
    ],
  },
  {
    industry: "Health & Wellness",
    subIndustries: [
      "Vitamins & Supplements",
      "OTC & Personal Health",
      "Sports & Active Nutrition",
    ],
  },
  {
    industry: "Baby & Family Care",
    subIndustries: ["Baby Food & Formula", "Diapers & Wipes", "Child & Family Care"],
  },
  {
    industry: "Pet Care",
    subIndustries: ["Pet Food", "Pet Care & Accessories"],
  },
  {
    industry: "Other",
    subIndustries: ["Other"],
  },
];

export function isValidIndustry(industry: string): boolean {
  return INDUSTRY_TAXONOMY.some((g) => g.industry === industry);
}

export function isValidSubIndustry(industry: string, subIndustry: string): boolean {
  const group = INDUSTRY_TAXONOMY.find((g) => g.industry === industry);
  return Boolean(group && group.subIndustries.includes(subIndustry));
}
