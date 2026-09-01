import { BrandSector, } from '../../entities/brand-account.entity';
import { SurveyQuestion } from '../../entities/campaign.entity';

// Sector -> recommended Consumer Insights Framework (Company Foundation,
// 2026-09-01; extended 2026-09-01, Commercial V1 Completion Sprint).
// Product-authored suggestions, not external research — a starting point
// a Company can accept/edit/add/remove/reorder like any other custom
// question, never silently applied. Ids are namespaced
// (sector_<slug>_<n>) so they can never collide with the reserved core
// ids (q1-q5, see campaign.entity.ts) or get treated as core by
// validateSurveyQuestionEdit.
//
// This pass added one open-ended question per sector after reviewing
// published survey-methodology guidance (a mix of quantitative +
// qualitative questions, balanced non-leading multiple-choice options,
// avoiding double-barreled wording — general principles referenced from
// public writing on survey design by outlets including NN/G, Sogolytics,
// and Kantar/Voxco consumer-research guidance; not a claim of
// endorsement by any of them, and no proprietary methodology copied).
// The existing multiple-choice questions were reviewed against the same
// principles and already have balanced (not all-positive) option sets,
// so were left unchanged — 3 questions per sector, deliberately well
// under the 5-custom-question cap, leaves room for the Company's own
// additions rather than the framework consuming the whole quota.
const SECTOR_FRAMEWORKS: Record<BrandSector, SurveyQuestion[]> = {
  [BrandSector.FMCG]: [
    {
      id: 'sector_fmcg_repurchase',
      text: 'Would you buy this again on your next grocery trip?',
      textAr: 'هل ستشتري هذا المنتج مرة أخرى في زيارتك القادمة للسوبر ماركت؟',
      type: 'multiple_choice',
      options: ['Yes', 'Maybe', 'No'],
      optionsAr: ['نعم', 'ربما', 'لا'],
      required: false,
    },
    {
      id: 'sector_fmcg_price_value',
      text: 'How does the price feel for what you get?',
      textAr: 'كيف تشعر تجاه السعر مقابل ما تحصل عليه؟',
      type: 'multiple_choice',
      options: ['Too expensive', 'Fair', 'Great value'],
      optionsAr: ['مرتفع جداً', 'مناسب', 'قيمة ممتازة'],
      required: false,
    },
    {
      id: 'sector_fmcg_open_feedback',
      text: 'What, if anything, would make you more likely to buy this again?',
      textAr: 'ما الذي قد يجعلك أكثر ميلاً لشراء هذا المنتج مرة أخرى، إن وجد؟',
      type: 'text',
      required: false,
    },
  ],
  [BrandSector.BEAUTY_PERSONAL_CARE]: [
    {
      id: 'sector_beauty_feel',
      text: 'How did this product feel during use?',
      textAr: 'كيف كان إحساسك بالمنتج أثناء الاستخدام؟',
      type: 'multiple_choice',
      options: ['Gentle', 'Normal', 'Irritating'],
      optionsAr: ['لطيف', 'عادي', 'مهيّج'],
      required: false,
    },
    {
      id: 'sector_beauty_routine_fit',
      text: 'How likely are you to make this part of your routine?',
      textAr: 'ما مدى احتمالية أن يصبح هذا المنتج جزءاً من روتينك؟',
      type: 'scale',
      required: false,
    },
    {
      id: 'sector_beauty_open_feedback',
      text: 'What did you notice most about this product?',
      textAr: 'ما الذي لاحظته أكثر في هذا المنتج؟',
      type: 'text',
      required: false,
    },
  ],
  [BrandSector.PHARMA_OTC]: [
    {
      id: 'sector_pharma_relief',
      text: 'Did this product relieve your symptoms as expected?',
      textAr: 'هل خفف هذا المنتج الأعراض كما كنت تتوقع؟',
      type: 'multiple_choice',
      options: ['Yes, fully', 'Partially', 'No'],
      optionsAr: ['نعم تماماً', 'جزئياً', 'لا'],
      required: false,
    },
    {
      id: 'sector_pharma_ask_by_name',
      text: 'Would you ask your pharmacist for this by name next time?',
      textAr: 'هل ستطلب هذا المنتج بالاسم من الصيدلي في المرة القادمة؟',
      type: 'multiple_choice',
      options: ['Yes', 'Maybe', 'No'],
      optionsAr: ['نعم', 'ربما', 'لا'],
      required: false,
    },
    {
      id: 'sector_pharma_open_feedback',
      text: 'Is there anything about this product you’d want the brand to know?',
      textAr: 'هل هناك أي شيء عن هذا المنتج تودّ أن تعرفه العلامة التجارية؟',
      type: 'text',
      required: false,
    },
  ],
};

export function getSectorFramework(sector: BrandSector | null): SurveyQuestion[] {
  if (!sector) return [];
  return SECTOR_FRAMEWORKS[sector] ?? [];
}
