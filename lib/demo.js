// GriefTech — demo / seed data and helpers (no monetary values, asset types only)
import { lookupEpfo } from '@/lib/integrations/epfo';
import { lookupIepf } from '@/lib/integrations/iepf';

export const CHECKLIST_TEMPLATE = [
  { id: 't01', titleKey: 't01.title', descKey: 't01.desc',
    deadline_days: 1, priority: 'high', category: 'legal', estimated_time: '30–60 min',
    required_docs: ['Medical certificate of death', 'Informant Aadhaar', 'Locality proof'],
    where_to_go_cat: 'MUNICIPAL', form: null },
  { id: 't02', titleKey: 't02.title', descKey: 't02.desc',
    deadline_days: 3, priority: 'high', category: 'legal', estimated_time: '1–2 hours',
    required_docs: ['Hospital medical certificate', 'Aadhaar of deceased', 'Aadhaar of informant', 'Registration slip from step 1'],
    where_to_go_cat: 'MUNICIPAL', form: 'death_cert_application' },
  { id: 't03', titleKey: 't03.title', descKey: 't03.desc',
    deadline_days: 7, priority: 'high', category: 'financial', estimated_time: '1 hour',
    required_docs: ['Original death certificate', 'Claimant Aadhaar/PAN', 'Account passbook'],
    where_to_go_cat: 'BANK', form: 'bank_transfer_letter' },
  { id: 't04', titleKey: 't04.title', descKey: 't04.desc',
    deadline_days: 15, priority: 'high', category: 'financial', estimated_time: '1–2 hours',
    required_docs: ['Original policy bond', 'Death certificate', 'Nominee KYC', 'Cancelled cheque'],
    where_to_go_cat: 'INSURER', form: 'insurance_claim_letter' },
  { id: 't05', titleKey: 't05.title', descKey: 't05.desc',
    deadline_days: 22, priority: 'medium', category: 'financial', estimated_time: '1 visit',
    required_docs: ['Death certificate', 'Service certificate', 'Nominee KYC'],
    where_to_go_cat: null, form: null },
  { id: 't06', titleKey: 't06.title', descKey: 't06.desc',
    deadline_days: 30, priority: 'high', category: 'financial', estimated_time: '2 hours',
    required_docs: ['UAN of deceased', 'Death certificate', 'Nominee KYC + cancelled cheque'],
    where_to_go_cat: 'EPFO', form: 'epf_form_20' },
  { id: 't07', titleKey: 't07.title', descKey: 't07.desc',
    deadline_days: 45, priority: 'medium', category: 'financial', estimated_time: '~30 min per fund',
    required_docs: ['Death certificate', 'Folio / DP statement', 'Nominee KYC'],
    where_to_go_cat: null, form: null },
  { id: 't08', titleKey: 't08.title', descKey: 't08.desc',
    deadline_days: 60, priority: 'medium', category: 'legal', estimated_time: '6–12 weeks',
    required_docs: ['Death certificate', 'List of legal heirs', 'Schedule of assets'],
    where_to_go_cat: 'CIVIL_COURT', form: 'succession_cert_application' },
  { id: 't09', titleKey: 't09.title', descKey: 't09.desc',
    deadline_days: 75, priority: 'low', category: 'personal', estimated_time: '1 hour online',
    required_docs: ['Death certificate', 'Aadhaar / PAN of deceased'],
    where_to_go_cat: 'AADHAAR_KENDRA', form: null },
  { id: 't10', titleKey: 't10.title', descKey: 't10.desc',
    deadline_days: 90, priority: 'medium', category: 'legal', estimated_time: '4–6 weeks',
    required_docs: ['Death certificate', 'Will / legal-heir certificate', 'Tax receipt'],
    where_to_go_cat: 'SUB_REGISTRAR', form: 'property_mutation' }
];

export function buildChecklist(profile) {
  const base = new Date(profile?.dateOfDeath || Date.now());
  return CHECKLIST_TEMPLATE.map(t => {
    const due = new Date(base);
    due.setDate(due.getDate() + t.deadline_days);
    return { ...t, dueDate: due.toISOString(), status: 'pending' };
  });
}

export function scanAssets(profile) {
  const a = profile?.assets || {};
  const out = [];
  if (a.uan) {
    out.push({ id: 'epf', source: 'EPFO', type: 'EPF account',
      headline: 'EPF account detected',
      detail: 'A Provident Fund corpus and possible monthly pension can be claimed by the nominee.',
      meaning: 'This is retirement savings the deceased built with their employer. The family is the rightful claimant.',
      next_step: 'Submit Form 20 (lump sum) and Form 10D (monthly pension) with the death certificate.',
      formKey: 'epf_form_20' });
  }
  out.push({ id: 'iepf', source: 'IEPF (Ministry of Corporate Affairs)', type: 'Unclaimed dividends / matured shares',
    headline: 'Possible unclaimed dividends found',
    detail: 'Dividends and matured shares unclaimed for 7+ years are transferred to the IEPF authority. Heirs can reclaim them.',
    meaning: 'These are forgotten investments that quietly moved out of the holder\'s demat — they can be brought back.',
    next_step: 'File Form IEPF-5 on iepf.gov.in with the death certificate and shareholding proof.',
    formKey: null });
  if (a.policies) {
    out.push({ id: 'lic', source: 'IRDAI / Insurer', type: 'Life-insurance policy',
      headline: 'Insurance policy found',
      detail: 'A life insurance death claim can be filed by the nominee within the stipulated time.',
      meaning: 'This is a payout the deceased planned for the family. IRDAI requires settlement within 30 days.',
      next_step: 'File the nominee claim with the original policy bond and death certificate.',
      formKey: 'insurance_claim_letter' });
  }
  if (a.banks) {
    out.push({ id: 'bank', source: 'RBI DEA Fund / Bank', type: 'Bank deposits / FDs',
      headline: 'Bank deposit identified',
      detail: 'If the account has been inoperative for 10+ years, it sits in the RBI DEA Fund and can be claimed.',
      meaning: 'Forgotten savings or fixed deposits in the deceased\'s name — claimable by the legal heir.',
      next_step: 'Visit the home branch with the death certificate, or use udgam.rbi.org.in for inoperative accounts.',
      formKey: 'bank_transfer_letter' });
  }
  if (a.property) {
    out.push({ id: 'prop', source: 'State Revenue Dept.', type: 'Property ownership',
      headline: 'Property ownership identified',
      detail: 'Mutation transfers municipal ownership records so tax bills come in the heir\'s name.',
      meaning: 'Without mutation, the heir cannot legally sell, rent or mortgage the property.',
      next_step: 'Apply for mutation at the local revenue office with the death certificate and legal-heir proof.',
      formKey: 'property_mutation' });
  }
  if (a.mutualFunds) {
    out.push({ id: 'mf', source: 'AMCs / Depositories', type: 'Mutual funds & shares',
      headline: 'Investments detected',
      detail: 'Mutual fund folios and demat holdings can be transmitted to the nominee or legal heir.',
      meaning: 'Investments that need a transmission request — not a sale.',
      next_step: 'Submit a transmission request to each AMC and depository participant.',
      formKey: null });
  }
  return out;
}

export const DOC_CATALOG = [
  { key: 'epf_form_20', title: 'EPF Form 20 — Withdrawal Claim', agency: 'EPFO' },
  { key: 'epf_form_10d', title: 'EPF Form 10D — Pension Claim', agency: 'EPFO' },
  { key: 'bank_transfer_letter', title: 'Bank Account Transfer Letter', agency: 'Bank' },
  { key: 'insurance_claim_letter', title: 'Insurance Death-Claim Letter', agency: 'Insurer' },
  { key: 'succession_cert_application', title: 'Succession Certificate Application', agency: 'Civil Court' },
  { key: 'death_cert_application', title: 'Death Certificate Application', agency: 'Municipal Registrar' },
  { key: 'property_mutation', title: 'Property Mutation Request', agency: 'Revenue Dept.' }
];

export async function mockEpfoLookup(uan) { return await lookupEpfo(uan); }
export async function iepfLookup(name, dob) { return await lookupIepf(name, dob); }

export function panicActions(profile, checklist) {
  const cl = checklist || [];
  const today = new Date();
  const dod = profile?.dateOfDeath ? new Date(profile.dateOfDeath) : today;
  const daysSince = Math.max(0, Math.floor((today - dod) / 86400000));

  const overdue = cl.filter(t => t.status !== 'done' && new Date(t.dueDate) < today);
  const pending = cl.filter(t => t.status !== 'done').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const pool = [...overdue, ...pending.filter(t => !overdue.includes(t))];
  const top3 = pool.slice(0, 3).map(t => ({
    id: t.id, titleKey: t.titleKey, descKey: t.descKey,
    where_to_go_cat: t.where_to_go_cat,
    estimated_time: t.estimated_time,
    deadline_days: t.deadline_days,
    priority: t.priority,
    category: t.category
  }));

  let warning = null;
  if (overdue.length > 0) {
    warning = `${overdue.length} task${overdue.length > 1 ? 's are' : ' is'} overdue. Late death-registration can need an affidavit and slow every claim down. Start with the oldest one first.`;
  } else if (daysSince <= 2) {
    warning = 'Don\'t lose the hospital-issued medical certificate of death. Take 5 photocopies before you do anything else.';
  } else if (daysSince <= 21) {
    warning = 'You are still inside the 21-day window to register the death without a late-fee affidavit.';
  } else {
    warning = 'Insurance and EPF claims are time-sensitive. Even a small delay each week pushes settlement by months.';
  }

  return { days_since: daysSince, actions: top3, warning };
}

export function validateAadhaar(a) {
  if (!a) return false;
  const v = String(a).replace(/\s+/g, '');
  return /^\d{12}$/.test(v);
}
export function validatePincode(p) {
  if (!p) return false;
  return /^\d{6}$/.test(String(p).trim());
}
