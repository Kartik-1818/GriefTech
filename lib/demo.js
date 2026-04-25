// GriefTech — demo / seed data and helpers (no monetary values, asset types only)

export const CHECKLIST_TEMPLATE = [
  { id: 't01', title: 'Register the death with local municipal authority',
    description: 'Most registrations must be done within 21 days. The hospital usually issues the medical certificate of death — carry it along with the informant\'s ID.',
    deadline_days: 1, priority: 'high', category: 'legal', estimated_time: '30–60 minutes',
    required_docs: ['Medical certificate of death (from hospital)', 'Informant\'s Aadhaar / ID', 'Locality proof'],
    where_to_go: 'Nearest municipal office or panchayat ward office',
    form: null },
  { id: 't02', title: 'Apply for the official Death Certificate',
    description: 'Ask for at least 10 original copies — every claim below needs one.',
    deadline_days: 3, priority: 'high', category: 'legal', estimated_time: '1–2 hours over 1–2 visits',
    required_docs: ['Hospital medical certificate', 'Aadhaar of deceased', 'Aadhaar of informant', 'Registration slip from step 1'],
    where_to_go: 'Registrar of Births and Deaths (your municipality / panchayat)',
    form: 'death_cert_application' },
  { id: 't03', title: 'Notify the bank — freeze and transfer the account',
    description: 'Walk into the home branch with the death certificate. Ask them to freeze debits and start the claim.',
    deadline_days: 7, priority: 'high', category: 'financial', estimated_time: '1 hour',
    required_docs: ['Original death certificate', 'Claimant Aadhaar/PAN', 'Account passbook (if available)'],
    where_to_go: 'Home branch of the deceased\'s bank',
    form: 'bank_transfer_letter' },
  { id: 't04', title: 'File life-insurance claim with policy documents',
    description: 'Most insurers settle within 30 days under IRDAI rules.',
    deadline_days: 15, priority: 'high', category: 'financial', estimated_time: '1–2 hours',
    required_docs: ['Original policy bond', 'Death certificate', 'Nominee KYC', 'Cancelled cheque'],
    where_to_go: 'Branch of the insurer (or upload on insurer portal)',
    form: 'insurance_claim_letter' },
  { id: 't05', title: 'Claim gratuity & leave encashment from the employer',
    description: 'HR must settle gratuity, leave, final salary and group insurance within 30 days of intimation.',
    deadline_days: 22, priority: 'medium', category: 'financial', estimated_time: '1 visit + paperwork',
    required_docs: ['Death certificate', 'Service certificate / employee ID', 'Nominee KYC'],
    where_to_go: 'Last employer\'s HR department',
    form: null },
  { id: 't06', title: 'Submit EPF withdrawal claim (Form 20 / Form 10D)',
    description: 'Form 20 = lump-sum PF balance. Form 10D = monthly family pension under EPS-1995.',
    deadline_days: 30, priority: 'high', category: 'financial', estimated_time: '2 hours',
    required_docs: ['UAN of deceased', 'Death certificate', 'Nominee KYC + cancelled cheque'],
    where_to_go: 'EPFO regional office or unifiedportal-mem.epfindia.gov.in',
    form: 'epf_form_20' },
  { id: 't07', title: 'Transfer mutual funds, demat & shares',
    description: 'Each AMC / broker has a transmission process. With nomination it takes days; without one, a succession certificate is needed.',
    deadline_days: 45, priority: 'medium', category: 'financial', estimated_time: 'Per fund / broker — about 30 minutes each',
    required_docs: ['Death certificate', 'Folio / DP statement', 'Nominee KYC'],
    where_to_go: 'AMC / broker (online transmission portals)',
    form: null },
  { id: 't08', title: 'Apply for Legal Heir / Succession Certificate',
    description: 'Required when there is no will / nomination. Filed in civil court with jurisdiction.',
    deadline_days: 60, priority: 'medium', category: 'legal', estimated_time: '6–12 weeks (court-driven)',
    required_docs: ['Death certificate', 'List of legal heirs', 'Schedule of debts and securities'],
    where_to_go: 'District civil court (or tehsildar for legal-heir certificate)',
    form: 'succession_cert_application' },
  { id: 't09', title: 'Update Aadhaar, PAN, ration & voter records',
    description: 'Surrender the deceased\'s Aadhaar & PAN to prevent misuse. Required before most property mutations.',
    deadline_days: 75, priority: 'low', category: 'personal', estimated_time: '1 hour online',
    required_docs: ['Death certificate', 'Aadhaar / PAN of deceased'],
    where_to_go: 'UIDAI / Income Tax e-portal',
    form: null },
  { id: 't10', title: 'Apply for property mutation / ownership transfer',
    description: 'Mutation updates municipal records so tax bills come in the heir\'s name.',
    deadline_days: 90, priority: 'medium', category: 'legal', estimated_time: '4–6 weeks',
    required_docs: ['Death certificate', 'Will or legal-heir certificate', 'Latest property tax receipt'],
    where_to_go: 'Local revenue office / sub-registrar',
    form: 'property_mutation' }
];

export function buildChecklist(profile) {
  const base = new Date(profile?.dateOfDeath || Date.now());
  return CHECKLIST_TEMPLATE.map(t => {
    const due = new Date(base);
    due.setDate(due.getDate() + t.deadline_days);
    return { ...t, dueDate: due.toISOString(), status: 'pending' };
  });
}

// Asset types only — NO monetary values
export function scanAssets(profile) {
  const a = profile?.assets || {};
  const out = [];
  if (a.uan) {
    out.push({
      id: 'epf', source: 'EPFO',
      type: 'EPF account',
      headline: 'EPF account detected',
      detail: 'A Provident Fund corpus and possible monthly pension can be claimed by the nominee.',
      meaning: 'This is retirement savings the deceased built with their employer. The family is the rightful claimant.',
      next_step: 'Submit Form 20 (lump sum) and Form 10D (monthly pension) with the death certificate.',
      formKey: 'epf_form_20'
    });
  }
  out.push({
    id: 'iepf', source: 'IEPF (Ministry of Corporate Affairs)',
    type: 'Unclaimed dividends / matured shares',
    headline: 'Possible unclaimed dividends found',
    detail: 'Dividends and matured shares unclaimed for 7+ years are transferred to the IEPF authority. Heirs can reclaim them.',
    meaning: 'These are forgotten investments that quietly moved out of the holder\'s demat — they can be brought back.',
    next_step: 'File Form IEPF-5 on iepf.gov.in with the death certificate and shareholding proof.',
    formKey: null
  });
  if (a.policies) {
    out.push({
      id: 'lic', source: 'IRDAI / Insurer',
      type: 'Life-insurance policy',
      headline: 'Insurance policy found',
      detail: 'A life insurance death claim can be filed by the nominee within the stipulated time.',
      meaning: 'This is a payout the deceased planned for the family. IRDAI requires settlement within 30 days.',
      next_step: 'File the nominee claim with the original policy bond and death certificate.',
      formKey: 'insurance_claim_letter'
    });
  }
  if (a.banks) {
    out.push({
      id: 'bank', source: 'RBI DEA Fund / Bank',
      type: 'Bank deposits / FDs',
      headline: 'Bank deposit identified',
      detail: 'If the account has been inoperative for 10+ years, it sits in the RBI DEA Fund and can be claimed.',
      meaning: 'Forgotten savings or fixed deposits in the deceased\'s name — claimable by the legal heir.',
      next_step: 'Visit the home branch with the death certificate, or use udgam.rbi.org.in for inoperative accounts.',
      formKey: 'bank_transfer_letter'
    });
  }
  if (a.property) {
    out.push({
      id: 'prop', source: 'State Revenue Dept.',
      type: 'Property ownership',
      headline: 'Property ownership identified',
      detail: 'Mutation transfers municipal ownership records so tax bills come in the heir\'s name.',
      meaning: 'Without mutation, the heir cannot legally sell, rent or mortgage the property.',
      next_step: 'Apply for mutation at the local revenue office with the death certificate and legal-heir proof.',
      formKey: 'property_mutation'
    });
  }
  if (a.mutualFunds) {
    out.push({
      id: 'mf', source: 'AMCs / Depositories',
      type: 'Mutual funds & shares',
      headline: 'Investments detected',
      detail: 'Mutual fund folios and demat holdings can be transmitted to the nominee or legal heir.',
      meaning: 'Investments that need a transmission request — not a sale.',
      next_step: 'Submit a transmission request to each AMC and depository participant.',
      formKey: null
    });
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

// EPFO mock — "Magic Insight". For demo, any UAN starting with '1' returns success.
export function mockEpfoLookup(uan) {
  if (!uan) return { found: false, reason: 'No UAN provided.' };
  const cleaned = String(uan).replace(/\s+/g, '');
  if (cleaned.length < 10) return { found: false, reason: 'UAN must be 12 digits.' };
  // Deterministic employer from UAN hash
  const employers = [
    'Tata Consultancy Services Ltd.', 'Infosys Ltd.', 'HCL Technologies Ltd.',
    'Reliance Industries Ltd.', 'Larsen & Toubro Ltd.', 'Wipro Ltd.',
    'HDFC Bank Ltd.', 'ICICI Bank Ltd.', 'Maruti Suzuki India Ltd.'
  ];
  const idx = (cleaned.charCodeAt(0) + cleaned.charCodeAt(cleaned.length - 1)) % employers.length;
  return {
    found: true,
    uan: cleaned,
    employer: employers[idx],
    member_id: 'MH/BAN/' + cleaned.slice(-7) + '/000',
    last_contribution: 'March 2025',
    eps_member: true,
    nominee_on_record: cleaned.endsWith('1') ? 'Yes' : 'Pending update',
    actions: [
      { title: 'Submit Form 20 to claim the PF lump-sum', formKey: 'epf_form_20' },
      { title: 'Submit Form 10D to start the family pension', formKey: 'epf_form_10d' }
    ]
  };
}

// "What should I do now?" — deterministic, action-first. Returns 3 immediate steps + 1 warning.
export function panicActions(profile, checklist) {
  const cl = checklist || [];
  const today = new Date();
  const dod = profile?.dateOfDeath ? new Date(profile.dateOfDeath) : today;
  const daysSince = Math.max(0, Math.floor((today - dod) / 86400000));

  const overdue = cl.filter(t => t.status !== 'done' && new Date(t.dueDate) < today);
  const pending = cl.filter(t => t.status !== 'done').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  // Always pick top 3 actionable items, prefer overdue, then highest priority next
  const pool = [...overdue, ...pending.filter(t => !overdue.includes(t))];
  const top3 = pool.slice(0, 3).map(t => ({
    title: t.title,
    plain: simplify(t.description),
    where: t.where_to_go,
    estimated_time: t.estimated_time,
    deadline_days: t.deadline_days,
    priority: t.priority,
    category: t.category
  }));

  // Warning logic
  let warning = null;
  if (overdue.length > 0) {
    warning = `${overdue.length} task${overdue.length > 1 ? 's are' : ' is'} overdue. Late death-registration can need an affidavit and slow every claim down. Start with the oldest one first.`;
  } else if (daysSince <= 2) {
    warning = 'Don\'t lose the hospital-issued medical certificate of death. Take 5 photocopies before you do anything else — every office below will ask for it.';
  } else if (daysSince <= 21) {
    warning = 'You are still inside the 21-day window to register the death without a late-fee affidavit. After 21 days, the process gets slower.';
  } else {
    warning = 'Insurance and EPF claims are time-sensitive. Even a small delay each week pushes settlement by months.';
  }

  return {
    days_since: daysSince,
    actions: top3,
    warning
  };
}

function simplify(text) {
  // Trim long sentences for the panic-mode plain-language summary
  if (!text) return '';
  const s = text.split(/[.—]/)[0].trim();
  return s.length > 0 ? s : text;
}
